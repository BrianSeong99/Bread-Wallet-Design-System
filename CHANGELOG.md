# Changelog

A design language changes the way a codebase does, so it is worth recording what moved and what
forced it. Newest first.

## Unreleased

### Repo

- **Laid out as `site/` · `docs/` · `tools/`**, with `npm start | review | screens`, CI on every
  push and pull request, and the system published to GitHub Pages.
- **`AGENTS.md` and two skills** (`crust-screens`, `crust-review`) so an agent working here knows
  the rules, the traps that have already cost time, and that a check is never to be relaxed.
- **CI gates on regression, not on the baseline.** The harness used to exit 1 on a clean run
  because inherited findings counted toward the exit code. Contrast, targets, clipping, wrapped
  labels and structure must now be zero; inherited counts live in `tools/review-baseline.json`
  and may only go down.

### System

- **The primary action is neutral, not the brand.** White on the brand orange measures exactly
  3.00:1 — conforming only as large text, with zero margin, which is why the system had grown five
  accent tokens to work around it. `--action` is 13.59:1 in light and inverts to 15.56:1 in dark.
  Orange keeps the mark, the active tab, the progress fill.
- **White ground, warm cards.** Corrected after checking the real app: `toast.app` is a marketing
  site with a warm page, but the product is white-grounded with warm card fills. `--paper`
  `#FFFFFF`, `--surface` `#F7F4F0`.
- **A spacing scale exists.** `--sp-0-5` … `--sp-8`. 359 literals migrated at identical computed
  values — verified by diffing all 5767 boxes in the page, max delta 0.02px.
- **Selection: a fill is decoration, something else is the state.** The selected fill measures
  1.10:1 against its surround, so each container names a carrier that clears 3:1 alone — a pip in
  a list, a heading word under a group, a ring on a card.
- **Prototype.** A device frame that walks the screens, cloning the same nodes documented under
  All screens so there is no second copy of the UI to drift.

### Fixed

- **The QR was invisible in dark mode.** It painted its modules in `var(--ink)`, which is white in
  dark, on a white card. Now a fixed near-black: a scanner has no theme.
- **Three sections were unreachable from the nav.** An unclosed `<table>` — closed with `</ul>` —
  put constraints, accessibility and migration inside `#allscreens`, whose `display:none` hid them
  whenever another section was selected. An open table makes the parser drop a stray `</section>`.
  The harness could not see it, because it marks every section active for the audit; it now
  asserts section parentage.
- **Receive was specified narrower than it ships**, and its citations pointed at pre-merge line
  numbers.
