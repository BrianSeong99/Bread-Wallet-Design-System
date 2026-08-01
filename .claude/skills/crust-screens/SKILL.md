---
name: crust-screens
description: Use when adding, editing, moving or deleting a screen in the Crust design system (site/index.html) — covers the markup shape, flow grouping, status tags and the counts that must stay true.
---

# Adding or changing a screen

A screen is three things in sequence, inside a flow's `<div class="scrgrid">`:

```html
<div>
  <div class="scrcap"><i></i>Caption <span class="tag merge">gap</span></div>
  <div class="phone"><div class="screen"><div class="notch"></div><div class="mock">
    …
  </div></div></div>
  <div class="scrnote">Why this screen looks like this, citing <code>File.tsx:123</code>.</div>
</div>
```

The caption comes **before** the phone. Screen numbers are injected at runtime in document
order — never hand-number one.

## Status tags say what a screen is

- `<span class="tag survive">shipped</span>` — the app renders this today
- `<span class="tag merge">gap</span>` — the app cannot render this; it is missing
- `<span class="tag retire">bug</span>` — the app renders this wrongly
- `<span class="tag retire">proposed</span>` — this does not exist and is being argued for

Be honest with these. A screen tagged `shipped` that isn't is worse than no screen: someone will
implement against it.

## Counts must stay true

Every flow (`<span class="fn">`) and sub-group (`<span class="gn">`) advertises a count. Adding,
moving or deleting a screen invalidates them, and `npm run review` fails on the mismatch
(`structure`). Update the number in the same edit.

An empty sub-group must be **removed**, not left advertising screens it no longer holds.

## After any change

```bash
npm run review     # must exit 0
npm run screens    # regenerate docs/SCREENS.md
```

## Traps

- **Never `rindex` backwards from a caption to find its markup.** The block boundary is easy to
  get wrong by one element, and doing so has silently overwritten a neighbouring screen.
- **Check the div balance of anything you splice.** An unclosed `<div>` once swallowed 102 screens
  into one group while every visual check stayed green.
- **A variant must follow its base.** When a base screen changes, its `, empty` / `, error` /
  `, loading` siblings usually need the same change — they have been left behind three times.
