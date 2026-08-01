---
name: crust-review
description: Use when `npm run review` fails in the Crust design system, to interpret which check fired and fix the design rather than the harness.
---

# Reading a review failure

The harness measures a real browser at two themes and five widths. A failure is a defect, not a
false positive — treat "the check is wrong" as the last hypothesis, after you have measured.

## Hard failures — must be zero

| Check | What it means | Usual fix |
|---|---|---|
| `contrast` | text under 4.5:1 (3:1 if large) on its composited background | darken the ink or lighten the fill; give the pass margin, don't land on 4.50 |
| `icon contrast` | a meaningful icon under 3:1 | use `--accent-edge`, not `--accent` |
| `fill contrast` | a `.nti` state indicator under 3:1 vs its surround | the fill cannot be the state — add a mark that clears the bar |
| `targets < 44pt` | an interactive element under 44 in **either** dimension | `min-width` *and* `min-height` |
| `clipped` / `in safe area` | content outside the frame or under the home indicator | check who is paying the safe-area inset — it is paid **once**, by whatever is last |
| `wrapped labels` | a button label on two lines | shorten the words |
| `structure` | a group count disagrees with its contents, or a section is nested | fix the count; remove empty groups |

## Baselined — may only go down

`inflated @200%`, `reflow breaks`, `unpaintable svg`, `off-scale space` are recorded in
`tools/review-baseline.json`. Exceed one and CI fails naming it. Improve one and lower the file in
the same commit. **Never raise a number there.**

## Before believing a fix worked

Re-run the harness. If the change was structural, diff the geometry too:

```js
// capture every box inside every .phone, before and after; a real fix moves only what it should
document.querySelectorAll('.phone').forEach(ph => { /* rect relative to the frame, ÷ zoom */ });
```

Subpixel deltas (≤0.05px) are `var()` resolution noise. Anything larger moved.
