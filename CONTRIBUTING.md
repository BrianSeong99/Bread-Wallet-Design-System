# Contributing

## Run it

```bash
npm start          # serves site/ at http://localhost:4599
npm run review     # the automated design review, both themes, every screen
npm run screens    # regenerates docs/SCREENS.md
```

`npm run review` needs Playwright's Chromium once:

```bash
npm install && npx playwright install chromium
```

## The one rule

**A change is not done until `npm run review` is green.**

Every check in `tools/review.mjs` exists because it caught something real. They are not style
preferences — each one is a defect class that shipped, or nearly did:

- the 44pt target check measures **both** dimensions, because an icon-only chip passed at 44 tall
  and 43 wide
- the unpaintable-SVG lint exists because two icons shipped invisible: `fill="none"` with no
  stroke paints nothing under a CSS mask, and a contrast check cannot see it, because the
  element's colour is perfectly good whether or not the mask has any coverage
- the structure check exists because an unclosed `<table>` — closed with `</ul>` — put three whole
  sections inside another one, where a `display:none` parent made them unreachable from the nav
  while every other check passed

If a check fires, fix the design. Relaxing the check to make it pass defeats the only thing that
makes this a system rather than a mood board.

## Editing

Everything lives in `site/index.html`: tokens in the `<style>` block, then foundations,
components, and every screen. It is one file on purpose — the alternative is a build step between
you and the thing you are looking at.

- **Colour, spacing, radius and motion come from tokens.** No raw hex in a component, no raw `rem`
  in a spacing property. `--sp-0-5` … `--sp-8` is the scale.
- **Screens are composed from documented components.** If a screen needs something new, add the
  component and its specimen first.
- **A screen's caption carries its status** — `shipped`, `gap`, `bug`, `proposed`. Say which, and
  mean it.

## Verifying a visual change

The harness catches contrast, targets, overflow and reflow. It does not catch "this looks wrong."
For anything structural, measure before and after rather than trusting a screenshot — capture the
geometry of every box, make the change, and diff. That is how the spacing migration was proved to
move nothing: 5767 boxes, max delta 0.02px.

```bash
npm run review:shot "Send · review"   # writes PNGs for screens matching a caption
```

## Commits

Describe the *why*. A commit that says "fix spacing" is worth less than one that says which value
was wrong, what it measured, and what forced the number.
