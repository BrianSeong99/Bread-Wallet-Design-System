# Crust — Bread Wallet Design System (Specification)

> Visual-language definition for Bread Wallet. **Phase: definition only.** No production
> component is refactored by this document. The interactive companion is `index.html`
> (open in a browser; it is built from the tokens below and toggles light/dark).

## Thesis

Self-custody is money most people are afraid to hold. The visual language has one job:
make sovereign, private money feel **calm, legible, and trustworthy** — a well-made
everyday object, not a trading terminal. **The onboarding is the north star:** it is the
most unified, harmonious surface in the app (warm cream ground, rounded Nunito, soft
spot-illustrations, generous space, one orange), and the whole product is derived *from it*
so the app reads as **one warm family throughout**. Precision comes from tabular figures,
clear hierarchy and restraint — not a colder, more technical register.

**One system, three targets.** Bread ships as **iOS**, **Android**, and a **Chrome/Firefox
extension** (plus a Tauri desktop shell) from one React codebase. The visual language is
**identical across all of them**; only rendering mechanics differ (native bottom-nav overlay
on mobile; the extension's ~360–400px popup width; desktop pointer states). Every token,
component and screen applies everywhere.

This is **not a reskin.** The identity is already right (warm paper, graphite ink, one
orange, the playful "toast-B" mark) and a semantic token layer (`components/ui/*`,
`--surface-*`/`--tx-*`/`--status-*`) is already ~40% built. The app feels amateur because
**three half-built visual generations coexist and were never consolidated.** Crust finishes
that migration and enforces one language. Codename "Crust" = the firm, consistent shell that
protects the warm bread inside.

## Principles (each produces concrete decisions)

1. **Finish the system, don't restart it.** Elevate Gen-3 (`components/ui`) to canonical;
   merge Gen-2, retire Gen-1. One Button, one sheet, one header family, one token ramp.
2. **Warm paper, graphite ink, one orange.** One warm-neutral ramp replaces five stray greys.
   Orange is structural (primary action, active state, focus) — never decorative filler.
3. **Numbers are the product — set them in mono.** Balances/amounts/addresses/hashes in
   GeistMono, tabular figures. (GeistMono already ships in `fonts/`, unused.)
4. **Calm by default, warm on arrival.** Illustrated/playful register reserved for onboarding
   & empty states; transactional surfaces are restrained.
5. **Restraint is the aesthetic.** 4 radii, a 4px spacing grid, 2 elevation levels.
6. **Security you can read.** One address-truncation rule, one status color set, copy
   affordances everywhere.

**Not:** Coinbase (navy/electric-blue trading chrome), a neobank template (glassy gradients,
marketing type), a shadcn dashboard (zinc neutrals, generic radius), or an industrial theme.

## Visual DNA — preserved

- Warm paper `#FBFBFB` ground + warm graphite `#3F3F3F` ink (the warm undertone is Bread's temperature).
- Bread orange `#E77537` as the single accent. Devnet keeps the slate-grey `#7286A0` accent as the environment tell.
- Nunito display type + the illustrated toast-B mark for headings/onboarding/empty states.
- The Gen-3 semantic sub-systems (`--surface-balance*`, `--tx-*`, `--status-*`, the card-color picker).

## Foundations (summary — full swatches/specimens live in `index.html`)

- **Color:** `TOKENS.md` is the authority. One accent, one warm-neutral ramp
  (paper→surface→surface-2→surface-3→ink-3→ink-2→ink), a 3-value status set, the kept `tx-*` hues.
- **Type:** **Nunito** (display) · **Inter** (UI/body). Self-hosted (kills the runtime Google-Fonts
  dependency). **Numbers → Nunito** via the single `--num` token (decided): the balance joins the
  onboarding family rather than reading as a code readout — matching Cash App's brand-face-for-balance /
  system-face-for-UI split. **Geist Mono is reserved for addresses, hashes and ids only.** Tabular +
  lining *figures* (`tnum`/`lnum`) still apply — a figure setting, not a monospace font.
  Named scale in `index.html › Typography`.
- **Evidence grading:** see `index.html › Constraints & evidence`. Tier 1 = hard WCAG numbers,
  Tier 2 = peer-reviewed wallet-safety findings (the strongest tier), Tier 3 = expert consensus,
  Tier 4 = **convention, not standard** (our spacing grid and radius scale live here — label them honestly).
- **Spacing:** 4px base; scale 4/8/12/16/20/24/32/40/48; page gutter = 24 (`px-6`).
- **Radius:** `sm 8` (chips/inputs/icon-squares) · `md 12` (cards/rows/menus) · `lg 16`
  (balance hero/sheets/modals) · `full` (buttons/pills/avatars). Retires 7+ others.
- **Elevation:** flat (rule-bordered) · e1 raised (prompts, nav pill) · e2 overlay (sheets, modals,
  balance card). Dark mode uses surface-step + rule contrast, not shadow.
- **Motion — read `src/lib/animation/` first; do not invent these.** Durations
  `fast .18s · normal .28s · slow .42s · extraSlow .6s`. Easings `easeInCubic [.32,0,.67,0]`,
  `easeOutCubic [.16,1,.3,1]` (iOS soft-out), `easeInOut [.65,0,.35,1]`,
  `easeOutBack [.34,1.56,.64,1]`. **Springs are the primary mechanism** — 8 of them, derived
  from UIKit response/dampingRatio (`standard 322/32/1` for screen moves, `sheetPresent
  380/34/1`, `snappy 500/38`, `morph 220/30/1.2`, `pill 320/30`, `magnetic 380/26`,
  `settle 260/30`, `dragRelease 420/40`). All respect `prefers-reduced-motion`.
  *An earlier draft of this file specified `fast 150 / base 200 / spatial 320` and
  `ease-spatial cubic-bezier(.22,1,.36,1)`. None of those exist in the codebase.*
  `--dur-base` / `--dur-spatial` / `--ease-spatial` survive in `index.html` purely as
  aliases onto the real tokens.

## Implementation spec (research-corrected)

**Units — "everything in rem" was wrong.** `rem` alone does *not* deliver iOS Dynamic Type in
WKWebView; the root font-size never changes and Capacitor doesn't wire it up. Android WebView is
the inverse — it applies the OS font scale by default but scales **text only**.

| Category | Unit |
|---|---|
| Font size, line-height (unitless), text-adjacent spacing | `rem` |
| Layout padding, gutters, radii, hairlines | **`px`** |
| Inline icons | `em` |
| Touch targets | `max(44px, …)` |
| Media queries | `rem` |

No `clamp()` fluid type. **Never set `font-size` on `html`** (no `10px` / `62.5%`) — it forecloses
Dynamic Type. Real recipe: inject a clamped (~0.85–1.6) `--font-scale` natively
(`UIFontMetrics` / `Configuration.fontScale`) into `:root{font-size:calc(100% * var(--font-scale,1))}`,
and call `setTextZoom(100)` on Android to avoid double-scaling.

**Viewport:** `width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5,
user-scalable=yes, viewport-fit=cover`. Do **not** copy the Ionic starter's `user-scalable=no` —
WKWebView honours it (unlike Safari), making it a genuine lockout and an AA failure.
Inputs must compute **≥16px** or iOS auto-zooms on focus.

**Bottom action zone:** `padding-bottom: max(16px, env(safe-area-inset-bottom))` — *not* additive
(which wastes 48dp on Android 3-button nav). CTA min-height **52px**. `env()` without a `max()`
floor resolves to **0** on SE and in the extension popup — the flush-to-edge bug.

**Viewports:** reference **iPhone 17 402×874**; must hold **SE 375×667 → Pro Max 440×956**, plus
the **extension popup 360×600 (hardest case — check it first)**.

## Automated review — run this, don't eyeball it

```bash
node design-system/review.mjs              # 49 screens x both themes
node design-system/review.mjs --shot 04    # + PNGs for captions matching "04"
```

Playwright, exits non-zero on any failure. Per screen, in **both themes**, it checks:

| Check | Rule |
|---|---|
| Safe area | nothing interactive within `max(16px, this frame's --safe-bottom)` of the bottom |
| Clipped | nothing outside the frame |
| Overflow | content not taller than the frame |
| Contrast | text 4.5:1 (3:1 large); `currentColor` icons 3:1 |
| Targets | every interactive element >= 44pt |
| Type | nothing below the 11pt floor |

**The harness is necessary, not sufficient — always look at the render.** Every numeric check
can pass while the screen is visibly wrong. Several defects this session were invisible to it and
found only by opening the screenshot:

| Defect | Why no check caught it |
|---|---|
| Account cards merged into one black block in dark | Each card passed contrast individually; *adjacent-card* separation is not a WCAG quantity |
| A permanent "Tap to rename" + blinking caret on the resting state | An editing variant left switched on is valid markup with valid contrast |
| Card colour swatches rendered fully transparent | No text and not marked as indicators, so nothing measured them |

The contacts pass added four more, every check passing while the screen looked broken: a divider
that rendered as a dead gap, a badge that rendered as bare text, an icon plate with no size, and
`Enter Miden Address` broken mid-word across two lines as `Addres` / `s`. The harness has no
opinion about an unstyled element or an ugly line break.

It did catch two things the render made look fine, though: text inputs flex-shrunk from 44pt to
20pt, and content sitting under the home indicator. Neither is visible without measuring. **The two
methods fail in opposite directions, which is the whole argument for running both every time.**

Related blind spot: the harness reads `background-color` and is **blind to `background-image`**, so
gradients, patterns and washes are unverified by it — the wagara pattern's contrast is
hand-computed for that reason. Treat a clean run as "no measurable failure", never as "looks
right".

**Three harness rules learned the hard way.** (1) The theme switch must happen in a
*separate* `evaluate()` call from the measurement — doing both in one synchronous block
yields stale computed styles and fabricates failures. (2) The safe-area floor is **per
frame**: an iPhone reserves 34pt for the home indicator, the extension popup reserves
nothing, so a global 34 produces false positives on every extension screen. (3) **Freeze
all motion before measuring** — `getComputedStyle` returns the *interpolated* value while a
transition runs. `.mseg .seg` is the only component that transitions `background` and
`color`, so flipping `data-theme` started a 280ms colour transition and a 120ms wait read
white-on-`#232323` (15.7:1) as `rgb(187,187,187)` on `rgb(113,113,113)` — 2.54:1. That one
false failure survived three separate investigations, and every other component passed only
because it doesn't transition colour. `prep()` now disables all animation and transition for
the duration of the audit.

This script found two defects that manual screenshot review had missed repeatedly: the
keypad overlapping the home indicator, and the action-bar segments sitting at 38pt against
the 44pt floor (32 instances) — the latter because my hand-written check only looked at
`button,.gh,.azghost` and never included `.seg`.

## Deliverables in this folder

| File | What |
|---|---|
| `index.html` | Interactive site: thesis, audit, foundations, components, patterns, screens (current↔proposed), a11y, migration. |
| `SPEC.md` | This document. |
| `TOKENS.md` | Current-token → canonical-token map (color, type, radius, spacing). |
| `COMPONENTS.md` | Component consolidation map (survive / merge / retire) with file paths. |
| `MIGRATION.md` | Phased, visual-only, behavior-preserving migration plan. |
| `assets/` | Real Bread mark, current-state screenshots, self-hosted GeistMono. |

## Constraints honored

- No changes under `/0xMiden/wallet` (read-only mirror).
- No production component, route, data-flow, or tested behavior changed.
- Nothing committed or pushed without explicit approval.
- No AI attribution in any artifact.

---

## A button label never wraps

**One line. Always.** A label on two lines is a label that is too long, never a button that is
too narrow — the fix is always the words.

Three reasons it is a rule and not a preference:

1. **It changes the button's height**, so the same CTA is a different size on different screens
   for no reason a user can see. The action zone has a fixed geometry; a wrapping label breaks it.
2. **It reads as a sentence, not a command.** "Continue backup" over two lines stops looking like
   something you press.
3. **It is a symptom.** A label that needs two lines is usually describing the flow rather than
   naming the action. `Continue backup` → **`Back up`**. The shorter one is also the better one.

Enforced by `review.mjs` (`wrapped labels`), which counts **text nodes only** over `.btn`,
`.pcta`, `.tokchip`, `.fc` and `.gh` — a segmented chip stacks an icon above its label and a
token chip sits an image beside one, and a naive line count reads those as wraps.

**Baseline size only.** At 200% text a long label *should* wrap rather than clip; that is the
accessible behaviour and the `inflated @200%` check tracks it separately.

---

## Spacing comes from the scale

`--sp-0-5` … `--sp-8` — 2/4/6/8/10/12/14/16/20/24/32px. Tailwind's shape: a 4px base with 2px
half-steps.

**Why it had to be named.** Before this, the system had **35 distinct rem values across 592
spacing declarations** — every pixel from 1 to 16 — against **11** uses of a `--stack` token. That
is a 1px grid, which is another way of saying no grid: every value was arrived at by nudging, and
nothing stopped the next one being 11px.

**Why the migration moved nothing.** The scale was chosen so that ~65% of existing uses already sat
on it *exactly*, and only those were migrated — 359 literals swapped for tokens with the same
computed value. Verified by capturing all **5767 boxes** in the page before and after and diffing
them: 15 differed, by a maximum of **0.02px**, which is subpixel rounding and not movement.

**Why 201 uses are still off it, on purpose.** The residue is odd-pixel values that are load-bearing
in pairs — `.mlist`'s 9px inline padding exists to cancel a 9px negative margin, the selection pip's
offset is half a line-height. Snapping those would break the pairing to satisfy a token, and change
tuned geometry for nothing a user could see. `review.mjs` reports the count (`off-scale space`) so
it stays visible and shrinks rather than quietly growing.

**New spacing uses a token.** If nothing on the scale fits, that is a signal to check whether the
value is really necessary before adding a step.

---

## A fill is decoration; something else is the state

**A selected row is not a filled row.** The fill is how selection *looks*; it is never what makes
selection *knowable*.

The measurement is the whole argument. On the route sheet the selected fill is **1.10:1** against
the sheet in light and **1.24:1** in dark. SC 1.4.11 asks **3:1** of any visual information required
to identify a state, so a row whose only difference is that fill is a row that looks chosen to the
designer and to nobody else. It is easy to ship, because on the machine you designed it on it looks
obvious.

So each container names a carrier that clears the bar **on its own**, and only then is the fill free
to be as quiet as it likes:

| Container | Fill | Carrier | Measured |
|---|---|---|---|
| Row in a list (`.mrow.sel` in `.mlist`) | `surface-2` / `surface-3` | a **pip** at the row's leading edge | 3.02:1 light · 4.21:1 dark |
| Row under a heading (`.netrow.sel` in `.netpick`) | same | the **word** — the chosen row is the only one under *Current* | a label needs no ratio |
| Card (`.mbc` / `.gcard` / `.ropt`) | none | the **ring's presence**, held off the edge by a gap | 3:1 vs the gap, checked by `review.mjs` |

Three corollaries, each learned the hard way:

1. **Selecting a row moves nothing.** A fill needs padding, and a row that gains padding when chosen
   shifts every glyph in it. The selected row pads *inside a matching negative margin*, so the fill
   gains 8px of air on each side while the box stays put. The pip's slot is reserved on every row of
   any list that has a selection, for the same reason.
2. **Paint the mark on a pseudo-element.** An empty span held at `opacity:0` is a real element with a
   real computed colour: the contrast sweep measures it and scores it 1.0:1. A `::before` that is
   simply transparent when unselected has nothing to measure.
3. **One carrier, not two.** Rows used to fill *and* take a 2px inset ring. Doubling a signal is not
   robustness — the fill already said "this one", and the ring was an outlined control in a system
   that rejects them everywhere else. It also made the flush fill look broken: with no inline padding
   the fill ended on the same pixel as the value text, so the corner radius cut across the glyphs and
   the sheet read as clipped when nothing was out of bounds.

**And no selection without something selected.** A highlight on a row in a list that has no chosen
row is decoration impersonating state — the pending-notes row carried `.sel` and `aria-current` while
*Claim all* was the only action available. `.mrow.cur` went the same way: a picker-only fill with zero
usages, describing a distinction the markup had already dropped.

---

## A container's size belongs to the container, not to its contents

**Fixed surfaces stay fixed.** A card, a sheet or a notification does not grow because today's copy
runs three lines instead of two, or because this account holds nine tokens instead of two.

This came up three separate times before it was written down — the Home balance card, the
notification prompt, the token picker — which is what makes it a rule rather than three fixes.

**Why it is not merely tidy.** A surface that resizes moves everything below it. On Home that meant
the assets list sat at a different Y depending on whether the wallet was loading, offline, or had
an unpriced token — five distinct card heights across eight states, so the list moved as conditions
the user did not cause came and went. On a picker it is worse: the sheet is where your thumb
already is, and a list that is short today and tall next month relocates the controls between one
use and the next. **The user pays for the flexibility by re-finding things.**

We were already half-following it, which is the usual tell. `Contacts · picker` is fixed-height
*"so a short list does not make the sheet jump"* — while the token picker, the same component doing
the same job one step earlier in the same flow, sized to its contents.

### How to hold it

| Surface | Rule |
|---|---|
| Cards (`.mbc.hero`) | A `min-height` floor derived from the tallest natural state, with the slack falling where a variable element would sit — so the fixed elements hold their Y. |
| Sheets and pickers | A fixed fraction of the frame, the list scrolling inside. Never fit-to-content. |
| Notifications (`.mprompt`) | One height, body clamped to the line count that fits. |

### When the content genuinely does not fit

**Truncate and provide a route to the whole thing** — never grow the box, and never leave a
sentence cut off with nowhere to go. A clamped body earns a chevron and opens a detail view; the
chevron appears *only* when there is more to read, so it stays an honest signal rather than
decoration.

This is the resolution to a tension worth recording: `.pb`'s clamp was widened from 2 lines to 3
precisely because `connectivityNodeBody` truncated mid-sentence at *"Your balance may be"*. A fixed
height forces the clamp back to 2 — which is only acceptable because the truncation now leads
somewhere.

### The exception

Content that is *itself* the variable thing — a scrolling list's rows, a wrapping address — sizes
naturally **inside** a fixed container. The rule is about the container.

### Corollary — when the content varies, the type fits the box

The rule above says a container holds its size. The address field is the case where that is hard,
because what goes in it genuinely varies: a 48-character Miden address, a 42-character EVM one, a
44-character Solana one, a contact name, or a placeholder.

**So the box is fixed at its tallest configuration and the type steps down to fit it.** Never the
reverse. Concretely:

| Content length | Lines | Size |
|---|--:|---|
| short — placeholder, a name | 1 | largest step |
| medium | 2 | one step down |
| long — a full address | 3 | two steps down |

**Three lines is the maximum**, and the container is always that tall. A short value does not make
the box shrink; it makes the type bigger inside a box that has not moved.

Two things this buys, and the second is the reason for it:

1. The value is as large as it can be at every length, rather than sized for the worst case.
2. **Nothing below the field ever moves.** Today pasting a 48-character address pushes the action
   row, the resolution row and the network list down together — the controls relocate under the
   thumb at the exact moment the user is about to commit money.

**Assign the tiers by measurement, not arithmetic.** Advance width in Geist Mono varies with the
step, and the field is 350pt at the authored frame but narrower at 375 and 360 — a tier boundary
that holds at 402 and breaks at 360 is worse than no tiering, because it reintroduces the shift on
exactly the devices with least room. Measure every supported address length at every shipping
width.

**The floor is legibility, not the type floor.** An address is checked character by character; if
the smallest tier is too small to do that, the answer is fewer characters on screen (truncation
with a route to the whole value), not smaller type.
