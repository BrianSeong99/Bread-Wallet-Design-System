#!/usr/bin/env node
// The binding test — what makes "engineers just use the components" safe to say.
//
// Three claims, each checked against the actual files:
//   1. Every class name the components emit has a rule in styles.css.
//   2. Every var() styles.css consumes is defined in the tokens.
//   3. styles.css is byte-identical to the design-system's components.css (via --check in CI),
//      so the specimen a designer approved and the component an engineer renders cannot differ.
//
// If a component references a class with no rule, it renders unstyled and *looks* like a button
// only by accident. If a rule references an undefined var(), the declaration is invalid at
// computed-value time and the property silently inherits — the exact failure mode that once put
// a black address on a dark surface at 1.48:1.

import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const here = import.meta.dirname;
const styles = readFileSync(join(here, '../styles.css'), 'utf8');
const tokens = readFileSync(join(here, '../../tokens/tokens.css'), 'utf8');

let failures = 0;
const fail = msg => { console.error('  ✗ ' + msg); failures++; };

// -- 1. component class names -> styles.css rules ------------------------------------------------
const src = readdirSync(join(here, '../src')).filter(f => f.endsWith('.tsx'))
  .map(f => readFileSync(join(here, '../src', f), 'utf8')).join('\n');
const emitted = new Set(['btn']);
for (const m of src.matchAll(/'btn-\$\{variant\}'|`btn-\$\{variant\}`/g)) {
  // template — expand from the variant union
  for (const v of src.match(/ButtonVariant = ([^;]+);/)[1].matchAll(/'([\w-]+)'/g)) emitted.add('btn-' + v[1]);
}
for (const m of src.matchAll(/'((?:btn|critical|iconbtn)[\w-]*)'/g)) emitted.add(m[1]);
emitted.delete('btn-${variant}');
for (const cls of emitted) {
  if (!new RegExp(`\\.${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[\\s{,.:\\[]`).test(styles)) {
    fail(`class "${cls}" is emitted by a component but has no rule in styles.css`);
  }
}

// -- 2. styles.css var() uses -> token definitions ----------------------------------------------
const defined = new Set([...tokens.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
const localDefs = new Set([...styles.matchAll(/(--[\w-]+)\s*:/g)].map(m => m[1]));
for (const m of styles.matchAll(/var\(\s*(--[\w-]+)/g)) {
  if (!defined.has(m[1]) && !localDefs.has(m[1])) {
    fail(`styles.css consumes ${m[1]} but the tokens never define it`);
  }
}

if (failures) {
  console.error(`\nbinding test: ${failures} failure(s)`);
  process.exit(1);
}
console.log(`binding test: ${emitted.size} classes bound, all vars resolve`);
