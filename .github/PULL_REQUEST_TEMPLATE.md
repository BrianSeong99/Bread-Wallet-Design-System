## What changed

<!-- The design decision, not the diff. What is different on screen, and for whom? -->

## Why

<!-- The measurement or the rule that forced it. "Looks better" is not a reason; "the fill
     measured 1.10:1 against the sheet" is. -->

## Checks

- [ ] `npm run review` exits 0
- [ ] `npm run screens` re-run if screens were added, moved or removed
- [ ] No number in `tools/review-baseline.json` was raised
- [ ] Colour comes from tokens, spacing from `--sp-*` — no raw hex or raw `rem`
- [ ] Verified by measuring, not only by screenshot

## Screens affected

<!-- Caption(s), and whether their status tag (shipped / gap / bug / proposed) is still true. -->
