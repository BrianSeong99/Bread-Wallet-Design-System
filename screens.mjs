#!/usr/bin/env node
// Generates SCREENS.md — the index of every screen in index.html, grouped by flow.
//
// This is generated, never hand-edited. The index has to stay true as screens are added, and a
// hand-maintained list of 164 entries is a list that is wrong within a week. Run it after any
// change to index.html:  node design-system/screens.mjs
//
// For each screen it records the caption, its status tag, and — the part that makes this worth
// keeping — every `file.tsx:line` the screen's rationale cites. That turns the index into a map
// in both directions: which screen specifies a given source file, and which source a given
// screen was drawn against.

import { readFileSync, writeFileSync } from 'node:fs';

const SRC = new URL('./index.html', import.meta.url);
const OUT = new URL('./SCREENS.md', import.meta.url);
const html = readFileSync(SRC, 'utf8');

const strip = s => s.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const ents = s => s
  .replace(/&middot;/g, '·').replace(/&rarr;/g, '→').replace(/&prime;/g, '′')
  .replace(/&rsquo;/g, '’').replace(/&mdash;/g, '—').replace(/&ndash;/g, '–')
  .replace(/&hellip;/g, '…').replace(/&amp;/g, '&').replace(/&lsaquo;/g, '‹')
  .replace(/&percnt;/g, '%').replace(/&#8209;/g, '-').replace(/&ctdot;/g, '⋯')
  .replace(/&ldquo;|&rdquo;/g, '"').replace(/&#10005;/g, '×');

// Walk the document once, carrying the current section and h2 as state. Order matters: a screen
// belongs to the last heading above it, which is exactly how a reader scanning the page sees it.
const TOKEN = /<section[^>]*id="([^"]+)"|<h2 class="h">([\s\S]*?)<\/h2>|<div class="(?:scrcap|caphead)">(?:<i><\/i>)?([\s\S]*?)<\/div>|<div class="scrnote">([\s\S]*?)<\/div><\/div>/g;

let section = '(top)', heading = '(ungrouped)', pending = null;
const flows = new Map();

// A screen is filed when its rationale closes OR when the next caption starts, whichever comes
// first. Flushing only on .scrnote silently dropped the four screens that carry none — an index
// that omits what it cannot parse is worse than no index.
const file = s => {
  const key = `${s.section}|${s.heading}`;
  if (!flows.has(key)) flows.set(key, []);
  flows.get(key).push(s);
};

for (const m of html.matchAll(TOKEN)) {
  if (m[1]) { if (pending) { file(pending); pending = null; } section = m[1]; continue; }
  if (m[2]) { if (pending) { file(pending); pending = null; } heading = ents(strip(m[2])); continue; }
  if (m[3]) {
    if (pending) file(pending);
    const raw = m[3];
    const tag = (raw.match(/class="tag (\w+)">([^<]*)</) || [])[2];
    const kind = (raw.match(/class="tag (\w+)"/) || [])[1];
    pending = { caption: ents(strip(raw.replace(/<span class="tag[\s\S]*?<\/span>/g, ''))), tag: tag && ents(tag), kind, section, heading, refs: [] };
    continue;
  }
  if (m[4] && pending) {
    // Citations look like <code>File.tsx:123</code> or <code>a/b.ts:12-19</code>.
    const refs = new Set();
    for (const c of m[4].matchAll(/<code>([\w./-]+\.(?:tsx?|json|css|mjs)):(\d[\d&;a-z–-]*)<\/code>/g)) {
      refs.add(`${c[1]}:${ents(c[2]).replace(/&[a-z]+;/g, '-')}`);
    }
    pending.refs = [...refs];
    file(pending);
    pending = null;
  }
}
if (pending) file(pending);

const all = [...flows.values()].flat();
const STATUS = { survive: 'shipped', merge: 'gap / sheet', retire: 'bug / proposed' };

let md = `# Screen index

Every screen in \`index.html\`, grouped by the flow it belongs to, in page order.

**Generated — do not hand-edit.** Regenerate with \`node design-system/screens.mjs\` after any
change to \`index.html\`. Serve the site with \`python3 -m http.server 4599 --directory design-system\`
and find a screen by searching its caption.

Total: **${all.length} screens** across **${flows.size} flows**. The *Specifies* column lists the
shipped source each screen's rationale cites, so this reads in both directions: what a screen
documents, and which screens document a given file.

| Flow | Screens |
|---|--:|
${[...flows].map(([k, v]) => `| ${k.split('|')[1]} | ${v.length} |`).join('\n')}

---

`;

let n = 0;
for (const [key, screens] of flows) {
  const [sec, head] = key.split('|');
  md += `## ${head}\n\n<sub>section \`#${sec}\` · ${screens.length} screens</sub>\n\n`;
  md += `| # | Screen | Status | Specifies |\n|--:|---|---|---|\n`;
  for (const s of screens) {
    n++;
    const status = s.tag ? `${STATUS[s.kind] ?? s.kind} — ${s.tag}` : 'shipped';
    md += `| ${n} | ${s.caption} | ${status} | ${s.refs.length ? s.refs.map(r => `\`${r}\``).join(' ') : '—'} |\n`;
  }
  md += `\n`;
}

// The reverse index is the reason to generate this at all: it answers "if I change this file,
// which screens are now wrong?" — the question a hand-written list can never answer.
const byFile = new Map();
for (const s of all) for (const r of s.refs) {
  const f = r.split(':')[0];
  if (!byFile.has(f)) byFile.set(f, new Set());
  byFile.get(f).add(s.caption);
}
md += `---\n\n## Reverse index — source file to screens\n\nIf one of these files changes, the screens beside it may no longer be true.\n\n| Source | Screens that specify it |\n|---|---|\n`;
for (const [f, s] of [...byFile].sort((a, b) => b[1].size - a[1].size || a[0].localeCompare(b[0]))) {
  md += `| \`${f}\` | ${[...s].join(' · ')} |\n`;
}

writeFileSync(OUT, md);
console.log(`SCREENS.md — ${all.length} screens, ${flows.size} flows, ${byFile.size} source files referenced`);
