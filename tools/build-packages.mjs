#!/usr/bin/env node
// Projects the designer-owned sources in apps/site into the engineer-facing packages.
//
//   node tools/build-packages.mjs           # regenerate packages/tokens + packages/react/styles.css
//   node tools/build-packages.mjs --check   # exit 1 if the committed projections have drifted
//
// The direction is one-way and it matters. Designers iterate on apps/site — the page they can see,
// gated by tools/review.mjs. Engineers consume packages/ — which are PROJECTIONS of those same
// files, never hand-edited. CI runs --check on every push, so a token edited in the package
// instead of the source, or a source edit that forgot to regenerate, fails the build. That is the
// whole mechanism keeping the two audiences on one system.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(import.meta.dirname, '..');
const SITE = join(ROOT, 'apps/site');
const CHECK = process.argv.includes('--check');

const tokensCss = readFileSync(join(SITE, 'tokens.css'), 'utf8');
const componentsCss = readFileSync(join(SITE, 'components.css'), 'utf8');

// ---- tokens.json — every custom property, per scope --------------------------------------------
const scopes = {};
const blockRe = /(:root|\[data-theme="(?:light|dark)"\])\s*\{/g;
let m;
while ((m = blockRe.exec(tokensCss))) {
  let d = 1, j = blockRe.lastIndex;
  while (d) { d += (tokensCss[j] === '{') - (tokensCss[j] === '}'); j++; }
  const body = tokensCss.slice(blockRe.lastIndex, j - 1).replace(/\/\*(?:[^*]|\*(?!\/))*\*\//g, '');
  const scope = m[1] === ':root' ? 'primitive' : m[1].includes('light') ? 'light' : 'dark';
  scopes[scope] ??= {};
  for (const p of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    scopes[scope][p[1]] = p[2].replace(/\s+/g, ' ').trim();
  }
}

// ---- Tailwind preset — semantic names resolved through the runtime vars ------------------------
// Colours point at var(--x) rather than hex, so a class like text-ink-2 follows the theme the way
// every token consumer must. Spacing, radius and type map their own scales.
const themeVars = { ...scopes.light };
const colors = Object.fromEntries(Object.keys(themeVars).map(k => [k.slice(2), `var(${k})`]));
const pick = prefix => Object.fromEntries(
  Object.keys(scopes.primitive ?? {}).filter(k => k.startsWith(prefix))
    .map(k => [k.slice(prefix.length), `var(${k})`]));
const preset = {
  theme: {
    extend: {
      colors,
      spacing: pick('--sp-'),
      borderRadius: pick('--radius-'),
      fontSize: pick('--t-'),
    },
  },
};

const OUT = {
  'packages/tokens/tokens.css': tokensCss,
  'packages/tokens/tokens.json': JSON.stringify(scopes, null, 2) + '\n',
  'packages/tokens/tailwind.preset.cjs':
    '// Generated from apps/site/tokens.css by tools/build-packages.mjs — do not hand-edit.\n' +
    '// Colours resolve through CSS custom properties so Tailwind classes follow the active theme.\n' +
    'module.exports = ' + JSON.stringify(preset, null, 2) + ';\n',
  'packages/react/styles.css': componentsCss,
};

let drift = [];
for (const [rel, content] of Object.entries(OUT)) {
  const path = join(ROOT, rel);
  if (CHECK) {
    let current = null;
    try { current = readFileSync(path, 'utf8'); } catch {}
    if (current !== content) drift.push(rel);
  } else {
    mkdirSync(join(path, '..'), { recursive: true });
    writeFileSync(path, content);
    console.log('wrote', rel);
  }
}
if (CHECK) {
  if (drift.length) {
    console.error('DRIFT — regenerate with `node tools/build-packages.mjs` and commit:');
    drift.forEach(f => console.error('  ' + f));
    process.exit(1);
  }
  console.log('projections in sync with apps/site');
}
