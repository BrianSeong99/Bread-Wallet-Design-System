# Crust — the Bread Wallet design system

Crust is the product-wide visual design system for **Bread**, a wallet for the Miden network
that ships as an iOS and Android app (Capacitor), a Chrome and Firefox extension, and a macOS
desktop app (Tauri).

It is a single self-contained page. Open `index.html` — or serve it, which is needed for the
fonts and icons to load:

```bash
python3 -m http.server 4599
# then open http://localhost:4599
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
node review.mjs                  # both themes, every screen
node review.mjs --shot 04        # also write PNGs for screens matching a caption
```

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
index.html        the system — tokens, foundations, components, every screen
review.mjs        the automated review described above
screens.mjs       regenerates the screen index
SPEC.md           principles and the rules, with the reasoning
COMPONENTS.md     component consolidation map
TOAST.md          comparative research
assets/           icons, fonts, reference captures
```

## Credits

Geist Mono is used under the SIL Open Font License. Nunito and Inter load from Google Fonts,
both also OFL.
