# Crust vs. Toast "feast"

Research note. Every number below was measured from the live site
(`https://toast.app`, Toast Local) via computed styles, or from `design-system/index.html`
directly — nothing here is from memory or from a screenshot.

> Naming check: "TOAST UI" is also NHN's open-source JS component library at `ui.toast.com`,
> which is a completely different thing. This note follows the URL that was given.

## What Toast actually ships

Their design system is called **feast** internally — the class names say so
(`type-feast-display-medium`, `rounded-button`, `gap-xxsmall`, `text-text-default`).
It rides on Tailwind, with a second `ui:`-prefixed layer that looks like a shared
component package.

### Type — 5 sizes, 8 named roles, 2 families

| Role | Family | Size / line |
|---|---|--:|
| `display-medium` | Effra-Medium | 42 / 52 |
| `heading-medium` | Effra-Medium | 30 / 34 |
| `title-medium` | Effra-Medium | 26 / 30 |
| `title-regular` | Effra-Regular | 26 / 30 |
| `body-semi` | Source-Sans-Pro-SemiBold | 16 / 22 |
| `body-regular` | Source-Sans-Pro-Regular | 16 / 22 |
| `subtext-regular` | Source-Sans-Pro-Regular | 14 / 20 |

Effra (Dalton Maag geometric humanist) carries display and headings; Source Sans Pro
carries body and controls. The role name encodes **family + weight**, not size — so
"body-semi" is a decision, and 16px is a consequence.

Weight computes to `400` everywhere because the weight is baked into the font *file*
(`Effra-Medium`, `Source-Sans-Pro-SemiBold` are four separate static files). That is a
legacy static-font pattern, not a virtue — see "don't copy" below.

### Colour — a real two-tier semantic layer

No raw colour ever reaches a component. Every class is `{property}-{role}-{variant}`:

```
bg-surface-default   bg-surface-secondary   bg-bg-subtle   bg-bg-action   bg-bg-action-inverse
text-text-default    text-text-secondary    text-text-action   text-text-default-inverse
border-border-default   border-border-subtle
```

Measured values: page `#F8F5F2` (warm off-white) · cards `#FFFFFF` · ink `#252525` ·
action fill `#2B2E35` (cool near-black) · muted `#847E7A` (warm grey).

### Shape, spacing, buttons

- **Radius:** `800px` on buttons (a full pill — 42 occurrences, the dominant shape),
  `24px` on cards, with 12/16/20 appearing rarely.
- **Button:** 56px tall, `0 24px` padding, no shadow, and a **2px transparent border** so a
  hover/focus border can appear without shifting layout. Worth stealing on its own.
- **Spacing:** t-shirt names — `gap-xxsmall`, `p-xxsmall`, `px-large`.
- **Dark mode:** none. Zero `prefers-color-scheme` rules, no `color-scheme`, no theme class.

## What their mobile app ships

The desktop site is a marketing surface, so it is the weaker comparison for a wallet. Two better
sources: `toast.app` at a 375px viewport, and the App Store screenshots for
[Toast — Local Restaurants](https://apps.apple.com/us/app/toast-local-restaurants/id1362180579)
(4.9★, 157K ratings), which show real in-app screens.

Both agree with the desktop system, which is what makes it a *system* rather than a web quirk:

- **Warm cream ground everywhere.** At mobile width the page is overwhelmingly `#F8F5F2`; white
  cards with a 24px radius lift off it. On desktop this reads as a subtle tint; on a phone it is
  the dominant impression.
- **Full-width near-black pill CTA**, white bold label, ~56pt tall, no shadow.
- **Orange is emphasis, never action.** In the app it appears in a headline word ("Earn Points."),
  the progress-bar fill, and the progress dots. Every button on the screen is near-black or white.
- **Big number + letterspaced micro-label** — a large `30` over a small-caps `TOTAL POINTS`. This
  is directly transferable to a balance readout.
- **Nested radii**: a 24px card containing a ~16px image well.

### Correction, from real screens

Screenshots from an actual account (Profile, You/Past Orders, Wallet, a loyalty detail, Rewards,
Offers, Home, and the `order.toasttab.com` status page) **overturn the background finding above.**

The `#F8F5F2` I measured is the *website*. The native app is **white-grounded** — Profile, Past
Orders, Home and the web order-status page are plainly white. The warm tone is real but it is a
**card and zone fill**, not the page: the `208 / TOTAL POINTS` card, the Balance row, the arc-topped
Wallet header.

So the relationship is the inverse of what the marketing site suggested, and of what was first
built here:

| | website | native app |
|---|---|---|
| page | warm `#F8F5F2` | **white** |
| card | white | **warm** |

Crust now follows the app: `--paper #FFFFFF`, `--surface #F7F4F0`, `--surface-2 #EFEAE4`,
`--surface-3 #E4DED6`. Measuring the wrong surface is an easy mistake to make and a cheap one to
correct — but it is worth noting that the *marketing site of a company is not its product*, and for
a mobile design system the product is the only relevant reference.

### Patterns worth taking from the real screens

- **Big number over a letterspaced uppercase micro-label** — `208` over `TOTAL POINTS`. Appears on
  the loyalty card and again on the rewards list. Directly applicable to a balance.
- **Bottom nav**: a floating white pill, five items, active marked by an **orange icon + orange
  label + a grey pill behind it**. So orange *does* carry state — it is barred from button fills,
  not from the system.
- **Underlined text as the tertiary action** — "Rate", "Offer details", "See terms". No colour, no
  container, just an underline.
- **A yellow attention banner** (`Complete your loyalty profile`) with black text and a black pill
  inside it — an alert colour clearly separated from the brand orange.
- **Segmented progress**: orange fill, rounded, white circular knob at the head.
- **Circular white floating icon buttons** for back / more / bookmark, over content.
- **A curved section divider** — the Wallet header's warm zone ends in an arc rather than a line.

**Two things not to copy.**

1. **Their bordered secondary.** "Use in store", "Details", "Add", the filter chips and the
   time-slot pills are all white with a hairline border, and one card is emphasised with a 2px
   near-black border. The primary-filled + secondary-bordered *pair* is their single most repeated
   action pattern — it is on every screen. It also contradicts this system's standing rule that
   every action is filled or ghost, never outlined. **Open question, not a silent decision.**
2. **The orange chip with small white uppercase text** (`208 POINTS`). That is the 3.00:1 problem
   again at a size where it cannot possibly conform. If we want an orange chip it takes a near-black
   label, exactly as `--on-accent-sm` already does.

---

## The differences that matter

### 1. Toast separates the brand colour from the action colour. Crust does not.

This is the big one, and it is not a matter of taste.

Toast's logo is orange. **Nothing else is.** Every button is near-black `#2B2E35`, which
gives white text **13.6:1**.

Crust makes the brand orange the primary action fill, and pays for it:

> White on `#E77537` is exactly **3.00:1**, which conforms under SC 1.4.3 *only* as large
> text — so every CTA label is pinned at 19px/700 and **the margin is zero**.

That constraint is already visible in the system as scar tissue: a minimum CTA label size, a
separate `--on-accent-sm` near-black for small labels on orange, a third `--accent-ink` for
orange *text*, a fourth `--accent-edge` for rings, and a fifth `--accent-critical`. Five
tokens exist to work around one colour being asked to do a job it cannot do at 3.00:1.

Toast needs none of that, because it never asks orange to carry white text.

**Adopting the split would delete a whole class of constraint** — the CTA label could be
sized for the layout instead of for the contrast floor, and the accent-token family could
collapse from five to about two.

### 2. Crust has no spacing scale. Toast does.

Measured in `index.html`:

| | count |
|---|--:|
| spacing declarations using a `--stack` token | **11** |
| distinct hard-coded `rem` values in spacing | **41** |
| total hard-coded `rem` uses in spacing | **624** |

The top of the distribution is `0.5rem` (72), `0.625rem` (68), `0.875rem` (50), `0.75rem`
(45), `0.375rem` (39) — and a long tail of `0.5625rem`, `0.4375rem`, `0.8125rem`, `0.6875rem`.
Those last four are 9px, 7px, 13px and 11px: values that exist because something needed
nudging once, not because the system has a 7px step.

Crust declares exactly three spacing tokens (`--stack-tight/--stack/--stack-loose`) and then
ignores them 624 times. Toast names its steps and uses them.

This is the gap most worth closing, and unlike the colour question it costs nothing in
design terms — it is pure consolidation.

### 3. Crust's warmth is in the wrong layer

Toast: page `#F8F5F2` (warm), cards `#FFFFFF`. The warmth is the **ground**, and white cards
lift off it.

Crust: page `--paper #FBFBFB` (near-neutral), cards `--surface #FFFFFF`, warm only at
`--surface-2 #F6F4F2`.

So Crust's warm tone — which is within two points of Toast's `#F8F5F2` — only appears
*inside* components, while the page itself is essentially grey-white. The palette is warmer
than the product looks. Swapping paper and surface-2's roles would put the warmth where the
eye actually reads it.

### 4. Type ramp: 9 steps + 4 fit sizes vs. 5 sizes

Crust: 11 / 13 / 15 / 16 / 19 / 20 / 26 / 32 / 72 px, plus a `--fit-1..4` sub-ramp
(72/56/44/32) for fitting addresses and amounts to a fixed box.

Toast: 42 / 30 / 26 / 16 / 14.

Crust has nearly twice the steps for a product with far less content variety. Some of that is
justified — a wallet has a balance moment and an address readout that a restaurant site does
not — but 15px *and* 16px *and* 13px is three body-adjacent sizes doing one job.

Toast's naming is also better: role-first (`body-semi`) rather than size-first (`--t-label`).
A role name survives a redesign; a size name has to be renamed the moment the size changes.

### 5. Where Crust is ahead

Don't flatten these to match:

- **Dark mode.** Toast has none. Crust ships two full themes with every pairing measured.
- **Real font weights.** Toast bakes weight into four static font files. Crust uses actual
  weights (700/800) on two families. Toast's approach is a constraint, not a decision.
- **Touch targets, safe areas, reflow.** Toast Local is a marketing/ordering *website*. Crust
  is a wallet on iOS, Android and an extension, with a 44pt floor, home-indicator insets and a
  320–430px reflow sweep — all enforced by `review.mjs`. There is nothing to learn from a
  desktop site here.
- **Enforcement.** Toast's system is a convention. Crust's is 15 automated checks that fail a
  build. That is the more valuable asset, and it is the reason the colour constraint in §1 is
  *known* rather than merely shipped.

---

## Ranked recommendation, and what has landed

1. ✅ **Split brand from action** (§1) — *done*. New `--action` / `--on-action` / `--action-hover`
   tokens; `.btn-primary` no longer uses `--accent`. Measured: light `#2B2E35` with a white label
   is **13.59:1** (was 3.00:1 with zero margin); dark inverts to `#F5F2EF` with a near-black label
   at **15.56:1**. Dark inverts rather than darkens, because a near-black button on a near-black
   page is not a button — the rule that survives both themes is *the primary action is the
   highest-contrast filled element on the page*.
2. ✅ **Move the warmth to the page ground** (§3) — *done*. `--paper` `#FBFBFB` → `#F8F5F2`, cards
   stay `#FFFFFF`. The neutral ramp was re-pitched to sit under it: `--surface-2` → `#F4F0EB`,
   `--surface-3` → `#EAE5DE`, and `--ink-3` → `#6A6A6A`. That last one was forced: the first
   attempt put `--ink-3` on the new warm fill at **4.34:1**, which the contrast sweep caught 41
   times. Both sides moved so the pass has margin instead of landing on 4.50 exactly.
3. ⬜ **Build the spacing scale** (§2). ~6 named steps, then migrate the 624 uses. Pure cleanup, no
   design risk, and the harness can be taught to fail on a raw `rem` in a spacing property. This is
   the next piece of work.
4. ⬜ **Adopt the 2px transparent border on buttons.** Free; removes hover/focus layout shift.
5. ⬜ **Consolidate the body-adjacent type steps** (§4) and rename the ramp role-first. Do this
   last — it touches the most files for the least user-visible gain.

### Found while doing it

The QR code was painting its modules in `var(--ink)`, which is `#FFFFFF` in dark, on a
`--pure-white` box — so **the QR was invisible in dark mode**. Pre-existing, unrelated to the
palette work, and invisible to every automated check because the sweep measures text and `.nti`
fills, not `background-image` patterns. Now a fixed near-black: a QR is a scannable artifact, not
UI, and a scanner has no theme.
