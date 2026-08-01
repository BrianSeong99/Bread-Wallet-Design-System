// Automated design review for the Crust design system.
//
// Catches the classes of defect that eyeballing screenshots misses — the keypad
// overlapping the home indicator is exactly why this exists. Run it after any
// visual change:
//
//   node design-system/review.mjs                 # both themes, all screens
//   node design-system/review.mjs --shot 04       # also write PNGs matching a caption
//
// Checks, per screen, in BOTH themes:
//   1. GEOMETRY  — nothing inside the home-indicator / safe-area band, nothing
//                  clipped by the frame, no overflow
//   2. CONTRAST  — text vs composited background (4.5:1, or 3:1 for large text),
//                  currentColor icons (3:1), .nti non-text indicators (3:1), and the
//                  .sel selection ring vs the colour showing through its offset gap (3:1)
//   3. TARGETS   — every interactive element >= 44x44pt, BOTH dimensions
//   4. TYPE      — nothing below the 11pt Apple floor
//   5. SCALING   — targets survive 200% text (root 16px -> 32px): still 44x44, and nothing
//                  inflating >2.5x, which is what an absolute floor authored in rem does
//   6. REFLOW    — no horizontal overflow at 320 / 360 / 375 / 402 / 430 CSS px frame widths
//
// The theme switch MUST happen in a separate evaluate() call from the measurement —
// doing both in one synchronous block yields stale computed styles and silently
// fabricates failures.
//
// Same trap, second form — and the cause of a false failure that survived three
// investigations. getComputedStyle returns the INTERPOLATED value while a transition is
// running. `.mseg .seg` is the only component that transitions `background` and `color`,
// so flipping data-theme started a 280ms colour transition on it; measuring 120ms later
// read white-on-#232323 (15.7:1) as rgb(187,187,187) on rgb(113,113,113) — 2.54:1.
// Every other component passed simply because it doesn't transition colour.
// prep() therefore disables ALL animation and transition for the duration of the audit,
// which makes both the theme flip and the section reveal resolve instantly.

import { chromium } from 'playwright';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

// Icon PRESENCE lint. The .svgic mask paints the icon's own alpha, so an SVG with
// `fill="none"` and no stroke paints NOTHING -- an invisible icon. The icon-contrast check
// cannot catch it: it measures the element's currentColor against its parent, which is a
// perfectly good ratio whether or not the mask has any coverage. key.svg and search.svg
// were both shipped invisible this way. The app gets away with these files because its
// <Icon> component injects fill/stroke as a prop; a CSS mask uses the raw file.
const lintIcons = dir => {
  const bad = [];
  for (const f of readdirSync(dir).filter(n => n.endsWith('.svg'))) {
    const src = readFileSync(join(dir, f), 'utf8');
    const paints = [...src.matchAll(/(?:fill|stroke)="([^"]+)"/g)].map(m => m[1]);
    if (!paints.some(v => v && v !== 'none')) bad.push(f);
  }
  return bad;
};

const URL = process.env.DS_URL ?? 'http://localhost:4599';
const SHOT = process.argv.includes('--shot') ? process.argv[process.argv.indexOf('--shot') + 1] : null;
const SAFE_BOTTOM = 34; // iPhone 17 home-indicator reserve, in points
const SAFE_TOP = 62;

// Reveal every section and freeze all motion, so every measurement sees the settled
// value instead of a frame partway through a transition or keyframe.
const prep = () => {
  if (!document.getElementById('audit-style')) {
    const st = document.createElement('style');
    st.id = 'audit-style';
    st.textContent = '*,*::before,*::after{animation:none!important;transition:none!important}' +
                     '.section{opacity:1!important}';
    document.head.appendChild(st);
  }
  document.querySelectorAll('.section').forEach(s => s.classList.add('active'));
  // Flows are collapsible <details>. A closed one renders its screens at 0x0, which the hidden-frame
  // check would report as missing screens -- and worse, every other check inside them would
  // vacuously pass. Force them all open for the audit; cleanup does not close them again, because
  // the authored state is open.
  document.querySelectorAll('details').forEach(d => { d.open = true; });
  // Audit with the Earn flag ON. The site mirrors isEarnEnabled()=false, which display:none's
  // the three earn screens -- and a hidden .phone measures 0x0, so every check inside it
  // silently passes while the summary still counts it as a screen. Auditing the flag-on state
  // is also the superset: it includes the five-segment action bar that ONLY exists there.
  document.documentElement.dataset.earn = 'on';
};

const cleanup = () => {
  document.getElementById('audit-style')?.remove();
  document.documentElement.dataset.earn = 'off';   // back to the shipped state
  document.querySelectorAll('.section').forEach(s => s.classList.toggle('active', s.id === 'allscreens'));
};

const probe = () => {
  const parse = c => {
    const m = (c || '').match(/rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)(?:,\s*([\d.]+))?\)/);
    return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] === undefined ? 1 : +m[4] } : null;
  };
  const over = (f, g) => ({ r: f.a * f.r + (1 - f.a) * g.r, g: f.a * f.g + (1 - f.a) * g.g, b: f.a * f.b + (1 - f.a) * g.b, a: 1 });
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };
  const cr = (a, b) => { const L = lum(a), M = lum(b), hi = Math.max(L, M), lo = Math.min(L, M); return (hi + 0.05) / (lo + 0.05); };
  const canvas = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };
  const bgOf = el => {
    let n = el, st = [];
    while (n && n.nodeType === 1) {
      const c = parse(getComputedStyle(n).backgroundColor);
      if (c && c.a > 0) { st.push(c); if (c.a >= 0.99) break; }
      n = n.parentElement;
    }
    let base = { ...canvas, a: 1 };
    for (let i = st.length - 1; i >= 0; i--) base = over(st[i], base);
    return base;
  };

  const out = [];
  const hidden = [];
  document.querySelectorAll('.phone').forEach(ph => {
    const scr = ph.querySelector('.screen');
    if (!scr) return;
    // A zero-sized frame means it is hidden; every check below would vacuously pass.
    // Surface it instead of counting it as a clean screen.
    if (ph.getBoundingClientRect().width < 2) { hidden.push(
      ph.parentElement?.querySelector('.scrcap,.caphead')?.textContent.trim().slice(0, 40) || '?'); return; }
    const zoom = parseFloat(getComputedStyle(ph).zoom) || 1;
    const sr = scr.getBoundingClientRect();
    const pt = v => v / zoom;
    const cap = ph.parentElement?.querySelector('.scrcap,.caphead')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || '?';
    const isSplash = !!scr.querySelector('.splash');
    // Required bottom clearance is per-frame, not global: max(16px gutter, this frame's
    // safe-area inset). An iPhone reserves 34pt for the home indicator; the extension
    // popup reserves nothing, so demanding 34 there would be a false positive.
    const mockEl = scr.querySelector('.mock');
    const safeBottom = mockEl
      ? parseFloat(getComputedStyle(mockEl).getPropertyValue('--safe-bottom')) || 0
      : 0;
    const minBottom = Math.max(16, safeBottom);
    const f = { screen: cap, inSafeArea: [], clipped: [], overflow: false, contrast: [], icons: [], fills: [], rings: [], targets: [], tiny: [], wrapped: [] };

    const body = scr.querySelector('.mock,.mwel');
    if (body && body.scrollHeight > scr.clientHeight + 2) f.overflow = true;

    scr.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const label = (el.textContent || '').trim().slice(0, 16) || el.className?.toString().slice(0, 16) || el.tagName;
      // A BUTTON LABEL MAY NOT WRAP. A label on two lines is a label that is too long, never a
      // button that is too narrow -- the fix is always the words. It also breaks the action
      // zone's fixed height, so the CTA changes size between screens for no reason a user can see.
      // Counted over TEXT NODES ONLY: a segmented chip stacks an icon above its label and a token
      // chip sits an image beside one, and a naive range over the element counts those as lines.
      // Baseline size only -- at 200% text a long label SHOULD wrap rather than clip.
      if (el.matches('.btn,.pcta,.tokchip,.fc,.gh')) {
        const tops = new Set();
        for (const n of el.childNodes) {
          if (n.nodeType !== 3 || !n.textContent.trim()) continue;
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const b of rg.getClientRects()) if (b.height > 1) tops.add(Math.round(b.top / 2));
        }
        if (tops.size > 1) f.wrapped.push({ el: (el.textContent || '').trim().slice(0, 26), lines: tops.size });
      }
      const bottomPt = pt(sr.bottom - r.bottom);
      const topPt = pt(r.top - sr.top);
      // full-bleed art and scrims are meant to reach the frame edge
      const fullBleed = el.matches('.shot,.splash,.splash *') ||
        (cs.position === 'absolute' && parseFloat(cs.inset || '1') === 0);
      const interactive = el.matches('button,a,input,.gh,.azghost,.obback,.seg,.gcard,.ropt,.bk2,.pdis,.acopy2,.aedit,.shgear');
      const leaf = el.children.length === 0;

      // 1. geometry — interactive or leaf content must not sit in the safe-area bands
      if (!isSplash && !fullBleed && (interactive || leaf)) {
        if (bottomPt < minBottom - 0.5) f.inSafeArea.push({ el: label, bottomGapPt: Math.round(bottomPt), needPt: minBottom });
        if (topPt < 0 || bottomPt < 0) f.clipped.push({ el: label, topPt: Math.round(topPt), bottomPt: Math.round(bottomPt) });
      }

      // 3. targets. BOTH dimensions: SC 2.5.5 is 44x44, not 44 tall. This measured height only,
      // and an icon-only .tokchip shipped at 43 wide -- 17pt glyph inside 2 x 13pt padding -- with
      // nothing to catch it, because every target that had ever been too small had been too short.
      if (interactive) {
        const wPt = Math.round(pt(r.width)), hPt = Math.round(pt(r.height));
        if (wPt < 44 || hPt < 44) f.targets.push({ el: label, wPt, hPt });
      }

      // 2 + 4. text
      const own = [...el.childNodes].filter(n => n.nodeType === 3 && n.textContent.trim()).map(n => n.textContent.trim()).join(' ');
      if (own && !isSplash) {
        const fg = parse(cs.color);
        if (fg) {
          const bg = bgOf(el), ratio = cr(over(fg, bg), bg), px = parseFloat(cs.fontSize);
          const large = px >= 24 || (px >= 18.66 && parseInt(cs.fontWeight) >= 700);
          const need = large ? 3 : 4.5;
          if (ratio < need - 0.05) f.contrast.push({ t: own.slice(0, 16), px, ratio: +ratio.toFixed(2), need,
            fg: cs.color, bg: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})`,
            theme: document.documentElement.dataset.theme || '(unset)',
            path: (()=>{const q=[];let n=el;while(n&&n!==document.body&&q.length<6){
              q.unshift(n.tagName.toLowerCase()+(n.className&&typeof n.className==='string'?'.'+n.className.trim().split(/\s+/).join('.'):''));
              n=n.parentElement;}return q.join(' > ');})() });
          if (px < 11) f.tiny.push({ t: own.slice(0, 14), px });
        }
      }
      // 2b. currentColor icons
      if (el.classList?.contains('svgic')) {
        const fg = parse(cs.backgroundColor);
        if (fg) {
          const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
          if (ratio < 2.95) f.icons.push({ ratio: +ratio.toFixed(2) });
        }
      }
      // 2c. meaningful non-text indicators — status dots, bars, any graphic that CARRIES
      // information rather than decorating. 3:1 against its surround (SC 1.4.11).
      // Opt-in by class, deliberately: deciding whether a graphic is load-bearing is the
      // SC 1.4.11 judgement itself, and auto-detecting every filled box would flag every
      // card and surface (which are exempt) and drown the real hits. Until this check
      // existed the harness verified text and icons only, so a status token used as a
      // FILL was never measured at all — the exact hole that let --status-positive ship
      // at 2.19:1 as text while passing as a dot.
      if (el.classList?.contains('nti')) {
        // State can be carried by the border rather than the fill (the Face ID success
        // corners are border-colour only), so fall back to it when the box is transparent.
        let fg = parse(cs.backgroundColor);
        if (!fg || fg.a === 0) fg = parse(cs.borderTopColor);
        if (fg && fg.a > 0) {
          const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
          if (ratio < 2.95) f.fills.push({ el: label, ratio: +ratio.toFixed(2) });
        }
      }
      // 2d. selection ring — the .sel outline is the thing that says "this account", "this
      // guardian", "this recovery option", so it is a meaning-bearing graphical object and
      // SC 1.4.11 wants 3:1 against what it sits against.
      // outline-offset leaves a TRANSPARENT gap, so the ring is judged against whatever is
      // painted BEHIND the element, not against the card it wraps — hence bgOf(el.parentElement),
      // the same composited resolution the text check uses. A hardcoded page colour would be
      // wrong: these cards sit on --paper on a screen, on --surface inside a sheet, and on
      // --surface-2 in a well, and the ring only has to clear 3:1 against the one it is actually on.
      // Threshold is a strict 3.0 here, not the 2.95 the interpolation-prone checks above use:
      // both sides are flat tokens with prep() holding transitions frozen, so there is nothing
      // to round off and a 2.97 ring is a real failure.
      // outline-width is a PRESENCE gate only, never a reported figure: .phone applies
      // zoom:0.5, and Chromium scales and snaps the computed width through it, so the same
      // 3px rule reads "2px" inside a frame and "3px" outside. Colour is not zoom-affected.
      if (el.matches('.mbc.sel,.gcard.sel,.ropt.sel')) {
        if (cs.outlineStyle !== 'none' && (parseFloat(cs.outlineWidth) || 0) > 0) {
          const fg = parse(cs.outlineColor);
          if (fg && fg.a > 0) {
            const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
            if (ratio < 3) f.rings.push({ el: label, ratio: +ratio.toFixed(2),
              ring: cs.outlineColor, gap: `rgb(${Math.round(bg.r)},${Math.round(bg.g)},${Math.round(bg.b)})` });
          }
        }
      }
    });
    out.push(f);
  });

  // Specimens pass. probe() otherwise only walks INSIDE .phone frames, so every declared
  // indicator in the Foundations/Components sections was invisible to the checks above and
  // reported a meaningless 0. Geometry does not apply out here (there is no device frame),
  // so this measures only the declared graphics: .nti fills/borders and .svgic icons.
  const spec = { screen: '· component specimens (outside phone frames)',
                 inSafeArea: [], clipped: [], overflow: false,
                 contrast: [], icons: [], fills: [], rings: [], targets: [], tiny: [], wrapped: [] };
  document.querySelectorAll('.nti,.svgic').forEach(el => {
    if (el.closest('.phone')) return;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const label = el.className?.toString().slice(0, 24) || el.tagName;
    let fg = parse(cs.backgroundColor);
    if (!fg || fg.a === 0) fg = parse(cs.borderTopColor);
    if (!fg || fg.a === 0) return;
    const bg = bgOf(el.parentElement), ratio = cr(over(fg, bg), bg);
    if (ratio < 2.95) (el.classList.contains('svgic') ? spec.icons : spec.fills)
      .push({ el: label, ratio: +ratio.toFixed(2) });
  });
  out.push(spec);
  if (hidden.length) out.push({ screen: `!! ${hidden.length} HIDDEN frame(s) not audited: ${hidden.join(', ')}`,
    inSafeArea: [], clipped: [], overflow: true, contrast: [], icons: [], fills: [], rings: [], targets: [], tiny: [], wrapped: [] });
  return out;
};

// 5. TARGETS AT 200% TEXT.
// The px -> rem conversion has one specific hazard: SC 2.5.5's 44x44 is an ABSOLUTE floor,
// so a `min-height:44px` re-authored as `2.75rem` silently becomes relative — it drops
// under 44 as soon as the user shrinks text, and inflates the layout when they enlarge it.
// Doubling the root exposes the inflation directly, and the shrink direction by proxy:
// anything that grew with the root was relative, so the same rule is undersized at 12px.
// Element selection is character-for-character the one check 3 uses, so the two figures are
// directly comparable, and the same zoom normalisation applies — getBoundingClientRect() IS
// scaled by .phone's zoom (a 44pt button reads 31.7 inside a .72 frame).
const probeTargets = () => {
  const out = [];
  document.querySelectorAll('.phone').forEach(ph => {
    const scr = ph.querySelector('.screen');
    if (!scr) return;
    if (ph.getBoundingClientRect().width < 2) return;
    const zoom = parseFloat(getComputedStyle(ph).zoom) || 1;
    const pt = v => v / zoom;
    const cap = ph.parentElement?.querySelector('.scrcap,.caphead')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || '?';
    const els = [];
    scr.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      if (!el.matches('button,a,input,.gh,.azghost,.obback,.seg,.gcard,.ropt,.bk2,.pdis,.acopy2,.aedit,.shgear')) return;
      els.push({ el: (el.textContent || '').trim().slice(0, 16) || el.className?.toString().slice(0, 16) || el.tagName,
        w: Math.round(pt(r.width)), h: Math.round(pt(r.height)) });
    });
    out.push({ screen: cap, els });
  });
  return out;
};

// Root font size, set in its OWN evaluate() — same rule as the theme flip, for the same
// reason. `.phone` pads with 0.625rem, so doubling the root would also narrow the usable
// screen from 382 to 362px; that padding is review-page bezel chrome, not product, so it is
// pinned to its 16px-root value. Otherwise this check silently conflates "text is bigger"
// with "the viewport shrank 20px", and reports reflow damage as a scaling failure.
const setRoot = px => {
  document.documentElement.style.fontSize = px ? `${px}px` : '';
  let st = document.getElementById('audit-root-px');
  if (px && !st) {
    st = document.createElement('style');
    st.id = 'audit-root-px';
    st.textContent = '.phone{padding:10px}';
    document.head.appendChild(st);
  }
  if (!px) st?.remove();
};

// 6. REFLOW ACROSS DEVICE WIDTHS.
// Every mock is authored at one size (iPhone 17, 402x874). `.phone` is a px width and
// `.screen` derives its height from aspect-ratio, so overriding the frame width genuinely
// re-lays-out the mock rather than scaling it — verified: 402 -> 320 takes the screen's
// inner box from 382 to 300 CSS px. run() asserts that inner box actually moves across the
// sweep, so this can never degrade into a check that passes because nothing reflowed.
// .phone.ext is skipped on purpose: it is the browser-extension popup, a fixed 360px chrome
// surface that never runs on a handset, so squeezing it to 320 measures a device that
// does not exist. Every other frame is a phone and is swept.
const probeReflow = () => {
  const out = [];
  document.querySelectorAll('.phone').forEach(ph => {
    if (ph.classList.contains('ext')) return;
    const scr = ph.querySelector('.screen');
    if (!scr) return;
    if (ph.getBoundingClientRect().width < 2) return;
    const zoom = parseFloat(getComputedStyle(ph).zoom) || 1;
    const pt = v => v / zoom;
    const sr = scr.getBoundingClientRect();
    const cap = ph.parentElement?.querySelector('.scrcap,.caphead')?.textContent.trim().replace(/\s+/g, ' ').slice(0, 40) || '?';
    const bad = [];
    scr.querySelectorAll('*').forEach(el => {
      const r = el.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return;
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden') return;
      const label = (el.textContent || '').trim().slice(0, 16) || el.className?.toString().slice(0, 16) || el.tagName;
      // scrollWidth/clientWidth are NOT scaled by zoom — they report the element's own
      // layout px — whereas getBoundingClientRect() is. Never mix the two into one figure:
      // sw/cw are raw, the past-edge overshoot goes through pt().
      // A deliberate horizontal scroller (.mcar) is content wider than its box BY DESIGN, so
      // it trips the same test. It is still reported — a carousel can break too — but labelled
      // 'scrollable' rather than suppressed, so nobody has to guess which kind of hit it is.
      // An element authored to truncate -- overflow:hidden + white-space:nowrap +
      // text-overflow:ellipsis -- has scrollWidth > clientWidth BY DEFINITION, on every string
      // long enough to need the ellipsis. Flagging it reported a working truncation as a reflow
      // break, which is the check crying wolf on exactly the mechanism that prevents reflow
      // breaks. The exemption is narrow on purpose: all three properties must be set, so an
      // overflow:hidden container that merely clips its children is still caught.
      const truncates = cs.textOverflow === 'ellipsis' && cs.whiteSpace === 'nowrap' && /hidden|clip/.test(cs.overflowX);
      if (truncates) return;
      if (el.clientWidth > 0 && el.scrollWidth > el.clientWidth + 1) bad.push({ el: label, why: /auto|scroll/.test(cs.overflowX) ? 'scrollable' : 'content', sw: el.scrollWidth, cw: el.clientWidth });
      else if (pt(r.right - sr.right) > 1) bad.push({ el: label, why: 'past-edge', byPt: Math.round(pt(r.right - sr.right)) });
    });
    out.push({ screen: cap, innerPt: scr.clientWidth, bad });
  });
  return out;
};

// Frame width override, again in its own evaluate(). Inline width beats the .phone rule;
// clearing it restores the authored 402 with no bookkeeping.
const setFrameWidth = px => {
  document.querySelectorAll('.phone').forEach(ph => {
    if (ph.classList.contains('ext')) return;
    ph.style.width = px ? `${px}px` : '';
  });
};

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1500, height: 1000 }, bypassCSP: true });
  const page = await ctx.newPage();
  // ALWAYS bypass cache. A stale index.html silently reports OLD token values as
  // failures (or hides real ones) — this cost real debugging time.
  await ctx.route('**/*', r => r.continue({ headers: { ...r.request().headers(), 'cache-control': 'no-cache' } }));
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(`${URL}?cb=${Date.now()}`, { waitUntil: 'networkidle' });

  const results = {};
  await page.evaluate(prep);
  for (const theme of ['light', 'dark']) {
    // separate call — see header note about stale computed styles
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, theme);
    await page.waitForTimeout(120);
    results[theme] = await page.evaluate(probe);
  }

  // 5 + 6 are geometry only, so they are theme-independent and run once — but pin the theme
  // anyway, since the loop above leaves it on dark and a fixed starting state keeps the
  // numbers reproducible.
  await page.evaluate(t => { document.documentElement.dataset.theme = t; }, 'light');
  await page.waitForTimeout(120);
  const baseTargets = await page.evaluate(probeTargets);
  await page.evaluate(setRoot, 32);            // separate call — see the setRoot note
  await page.waitForTimeout(120);
  const bigTargets = await page.evaluate(probeTargets);
  await page.evaluate(setRoot, 0);
  await page.waitForTimeout(120);

  const scaled = [];
  bigTargets.forEach((b, i) => {
    const a = baseTargets[i];
    // Paired by index: same selector, same document order, only the root font size moved.
    // If the counts diverge, something other than type changed — drop the growth half
    // rather than compare two different elements.
    const pair = a && a.screen === b.screen && a.els.length === b.els.length;
    const under = [], grown = [];
    b.els.forEach((e, j) => {
      const o = pair ? a.els[j] : null;
      if (e.w < 44 || e.h < 44) under.push({ el: e.el, at200: `${e.w}×${e.h}`, was: o ? `${o.w}×${o.h}` : '?' });
      if (o && o.w > 1 && o.h > 1) {
        const x = Math.max(e.w / o.w, e.h / o.h);
        if (x > 2.5) grown.push({ el: e.el, was: `${o.w}×${o.h}`, at200: `${e.w}×${e.h}`, x: +x.toFixed(1) });
      }
    });
    if (under.length || grown.length) scaled.push({ screen: b.screen, under, grown });
  });

  // Narrowest first, so the first width that produces a hit IS the break point. A screen
  // that also breaks at the authored 402 is flagged as such: that is a pre-existing defect
  // at the design's own size, not something the narrow device caused.
  const WIDTHS = [320, 360, 375, 402, 430];
  const AUTHORED = 402;
  const broke = new Map();
  const innerWidths = new Set();
  for (const w of WIDTHS) {
    await page.evaluate(setFrameWidth, w);     // set here...
    await page.waitForTimeout(120);
    const frames = await page.evaluate(probeReflow);   // ...measure there
    frames.forEach((f, i) => {
      innerWidths.add(f.innerPt);
      if (!f.bad.length) return;
      const rec = broke.get(i) ?? { screen: f.screen, at: w, bad: f.bad, widths: [] };
      rec.widths.push(w);
      broke.set(i, rec);
    });
  }
  await page.evaluate(setFrameWidth, 0);
  // A frame width that does not move the screen's inner box means the mock is pinned deeper
  // in the tree and this check is vacuous. Say so instead of printing a green tick.
  const reflows = innerWidths.size > 1;

  await page.evaluate(cleanup);

  // Structural check. Every other check in here measures paint, and the page's shape can be wrong
  // while every pixel of it is right: a caption outside all its groups, a group still advertising
  // a count for screens that moved away, an empty group promising five screens the reader cannot
  // find. None of that fails a contrast or overflow probe, because each one still renders a
  // perfectly good screen. It has cost real time — an unclosed `.scrgrid` once swallowed 102
  // screens into a single group and the harness stayed green straight through it. Assert the
  // navigation, not just the frames.
  const structure = await page.evaluate(() => {
    const txt = el => (el?.textContent ?? '').trim();
    const out = { stale: [], empty: [], orphan: [] };
    for (const g of document.querySelectorAll('details.grp, details.flow')) {
      const isFlow = g.classList.contains('flow');
      // A flow's own captions are the ones in its groups; counting descendants covers both.
      const n = g.querySelectorAll('.scrcap, .caphead').length;
      const says = Number(txt(g.querySelector(isFlow ? '.fn' : '.gn')));
      const name = txt(g.querySelector(isFlow ? '.h' : '.gt')) || '(unnamed)';
      const where = isFlow ? name : `${txt(g.closest('details.flow')?.querySelector('.h'))} / ${name}`;
      if (!n) out.empty.push(where);
      else if (Number.isFinite(says) && n !== says) out.stale.push(`${where}: says ${says}, has ${n}`);
    }
    for (const c of document.querySelectorAll('.scrcap'))
      if (!c.closest('details.grp')) out.orphan.push(txt(c).slice(0, 44));
    return out;
  });
  const structural = structure.stale.length + structure.empty.length + structure.orphan.length;
  if (structural) {
    console.log(`\n  ✗ STRUCTURE (the index disagrees with the page):`);
    structure.stale.forEach(t => console.log(`      stale count : ${t}`));
    structure.empty.forEach(t => console.log(`      empty group : ${t} — promises screens it does not hold`));
    structure.orphan.forEach(t => console.log(`      orphan      : ${t} — outside every sub-group`));
  }

  const unpaintable = lintIcons('design-system/assets/icons');
  if (unpaintable.length) {
    console.log(`\n  \u2717 UNPAINTABLE ICONS (fill="none", no stroke -> invisible under a mask):`);
    unpaintable.forEach(f => console.log(`      ${f}`));
  }

  let total = 0;
  const tally = { inSafeArea: 0, clipped: 0, overflow: 0, contrast: 0, icons: 0, fills: 0, rings: 0, targets: 0, tiny: 0, wrapped: 0 };
  for (const [theme, screens] of Object.entries(results)) {
    for (const s of screens) {
      const hits = Object.entries(tally).filter(([k]) => k === 'overflow' ? s.overflow : s[k]?.length);
      if (!hits.length) continue;
      total++;
      console.log(`\n  ✗ [${theme}] ${s.screen}`);
      for (const [k] of hits) {
        if (k === 'overflow') { console.log(`      overflow: content taller than the frame`); tally.overflow++; continue; }
        tally[k] += s[k].length;
        console.log(`      ${k}: ${JSON.stringify(s[k].slice(0, 4))}${s[k].length > 4 ? ` +${s[k].length - 4} more` : ''}`);
      }
    }
  }

  const cut = a => `${JSON.stringify(a.slice(0, 4))}${a.length > 4 ? ` +${a.length - 4} more` : ''}`;
  let tallyUnder = 0, tallyGrown = 0;
  for (const s of scaled) {
    console.log(`\n  ✗ [200% text] ${s.screen}`);
    if (s.under.length) { tallyUnder += s.under.length; console.log(`      under 44×44: ${cut(s.under)}`); }
    if (s.grown.length) { tallyGrown += s.grown.length; console.log(`      inflated >2.5×: ${cut(s.grown)}`); }
  }
  if (!reflows) console.log(`\n  ! reflow check INERT — overriding .phone width did not move the screen box`);
  for (const r of [...broke.values()]) {
    console.log(`\n  ✗ [reflow @${r.at}] ${r.screen}${r.widths.includes(AUTHORED) ? `  (also broken at the authored ${AUTHORED})` : ''}`);
    console.log(`      overflow: ${cut(r.bad)}`);
  }

  const screens = results.light.length;
  console.log(`\n${'─'.repeat(64)}`);
  console.log(`  screens checked : ${screens} × 2 themes`);
  console.log(`  failing screens : ${total}`);
  console.log(`  in safe area    : ${tally.inSafeArea}   (content under the home indicator)`);
  console.log(`  clipped         : ${tally.clipped}`);
  console.log(`  overflow        : ${tally.overflow}`);
  console.log(`  contrast        : ${tally.contrast}`);
  console.log(`  icon contrast   : ${tally.icons}`);
  console.log(`  fill contrast   : ${tally.fills}   (.nti indicators vs surround, 3:1)`);
  console.log(`  ring contrast   : ${tally.rings}   (.sel outline vs its gap, 3:1)`);
  console.log(`  targets < 44pt  : ${tally.targets}`);
  console.log(`  text < 11pt     : ${tally.tiny}`);
  console.log(`  wrapped labels  : ${tally.wrapped}   (a button label on two lines)`);
  console.log(`  targets @200%   : ${tallyUnder}   (< 44×44 with the root at 32px)`);
  console.log(`  inflated @200%  : ${tallyGrown}   (grew >2.5× — an absolute floor authored in rem)`);
  console.log(`  reflow breaks   : ${broke.size}   (screens overflowing at ${WIDTHS.join('/')}${reflows ? '' : ' — CHECK INERT'})`);
  console.log(`  unpaintable svg : ${unpaintable.length}   (invisible under a CSS mask)`);
  console.log(`  structure       : ${structural}   (stale/empty group counts, orphan screens)`);
  if (errors.length) console.log(`  console errors  : ${errors.length} → ${errors[0]}`);
  console.log(`${'─'.repeat(64)}`);

  if (SHOT) {
    await page.evaluate(t => { document.documentElement.dataset.theme = t; }, 'light');
    await page.evaluate(prep);
    const n = await page.evaluate(q => {
      const m = [...document.querySelectorAll('.phone')].filter(p =>
        (p.parentElement?.querySelector('.scrcap,.caphead')?.textContent || '').includes(q));
      m.forEach((p, i) => p.setAttribute('data-shot', i));
      return m.length;
    }, SHOT);
    for (let i = 0; i < n; i++) {
      await page.locator(`[data-shot="${i}"]`).screenshot({ path: `/tmp/ds-${SHOT}-${i}.png` });
    }
    console.log(`  wrote ${n} screenshot(s) to /tmp/ds-${SHOT}-*.png`);
  }

  await browser.close();
  process.exit(total || unpaintable.length || scaled.length || broke.size || structural || !reflows ? 1 : 0);
};

run().catch(e => { console.error(e); process.exit(2); });
