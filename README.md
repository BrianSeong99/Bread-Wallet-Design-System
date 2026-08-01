# Crust — the Bread Wallet design system

Crust is the product-wide visual design system for **Bread**, a wallet for the Miden network
that ships as an iOS and Android app (Capacitor), a Chrome and Firefox extension, and a macOS
desktop app (Tauri).

It is a single self-contained page. Open `index.html` — or serve it, which is needed for the
fonts and icons to load:

```bash
npm start          # http://localhost:4599
npm run review     # the automated design review
npm run screens    # regenerate docs/SCREENS.md
```

**167 screens** across 16 flows, drawn at true iPhone 17 dimensions (402×874pt), in light and
dark, plus the foundations and component specimens behind them.

## What makes it different from a sticker sheet

Every rule here is enforced, not asserted. `review.mjs` drives the page in a real browser and
fails on:

| | |
|---|---|
| safe area | nothing under the home indicator |
| clipping / overflow | no content escaping its frame |
| text contrast | 4.5:1, or 3:1 for large text |
| icon contrast | 3:1 for anything meaningful |
| non-text indicators | 3:1 for state fills and selection rings |
| touch targets | 44×44pt minimum, **both** dimensions |
| type floor | nothing below 11pt |
| wrapped labels | a button label may never take two lines |
| 200% text | targets survive it; nothing inflates >2.5× |
| reflow | no horizontal overflow at 320/360/375/402/430 |
| unpaintable SVG | icons that render invisible under a CSS mask |
| structure | group counts match their contents; no orphan screens |

```bash
npm run review                       # both themes, every screen
npm run review:shot "Send / review"  # also write PNGs for screens matching a caption
```

It runs in CI on every push and pull request, so the rules below are enforced rather than
remembered.

The checks exist because each one caught something real. The 44pt rule measures both dimensions
because an icon-only chip passed at 44 tall and 43 wide. The unpaintable-SVG lint exists because
two icons shipped invisible — `fill="none"` with no stroke paints nothing under a mask, and a
contrast check cannot see it, because the element's colour is perfectly good whether or not the
mask has any coverage.

## The rules worth stating

- **A button label never wraps.** If it takes two lines the label is too long, never the button
  too narrow. `Continue backup` → `Back up`.
- **A container's size belongs to the container, not its contents.** A card does not grow because
  today's copy runs three lines. When the content genuinely varies, the *type* fits the box.
- **A fill is decoration; something else is the state.** A selected row's fill measures 1.10:1
  against its surround — nowhere near the 3:1 a state indicator needs. So each container names a
  carrier that clears the bar alone: a pip in a list, a heading word under a group, a ring on a
  card.
- **Orange is the brand, not the button.** White on the brand orange is exactly 3.00:1 — passing
  only as large text, with zero margin. The action fill is neutral (13.59:1 light, 15.56:1 dark),
  which frees orange for the mark, the active tab, the progress fill.
- **No outlined buttons.** Every action is filled or ghost. Hairlines are for structure.

`SPEC.md` carries these in full. `COMPONENTS.md` maps each component to what it replaces.
`TOAST.md` is a research note comparing Crust to Toast's system, measured rather than eyeballed.

## Layout

```
site/            the design system itself - one page: tokens, foundations, components, screens
  index.html
  assets/        icons, fonts, reference captures
docs/
  SPEC.md        principles and the rules, with the reasoning behind each
  COMPONENTS.md  component consolidation map
  SCREENS.md     generated index - screen to source file, and back
  TOAST.md       comparative research against Toast's system, measured not eyeballed
tools/
  review.mjs     the automated design review
  screens.mjs    regenerates docs/SCREENS.md
.github/workflows/
  review.yml     runs the review on every push and PR
  pages.yml      publishes site/ to GitHub Pages
```

One page, not a component library. Crust specifies a wallet that ships as Capacitor, a browser
extension and Tauri; there is no shared runtime to publish to, so shipping React packages would
mean maintaining a second implementation that drifts from the first. The page *is* the
specification, and `tools/review.mjs` is what keeps it honest.

## Prototype

The system has a **Prototype** section: one device frame that walks the screens like a clickable
mock-up. It clones the same nodes documented under All screens, so there is no second copy of the
UI to drift, and the hotspots are the mock's own controls - the bottom nav, the action bar, a back
chevron, the primary button. Arrow keys step through a flow, Backspace goes back.

## Credits

Geist Mono is used under the SIL Open Font License. Nunito and Inter load from Google Fonts,
both also OFL.
