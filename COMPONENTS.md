# Component Consolidation Map

Three visual generations coexist, distinguishable by color vocabulary:

- **Gen-3 (newest, canonical)** — `src/components/ui/*` + parts of `src/lib/ui/*`. Semantic
  tokens (`accent-primary`, `text-primary-token`, `surface-*`, `status-*`).
- **Gen-2 (current default)** — `src/components/*`. `primary-500`, `heading-gray`, framer-motion.
- **Gen-1 (legacy)** — `src/app/atoms/*` + old screens. `primary-orange`, raw `gray-XXX`, react-modal, tippy.
- **Bypass** — `src/screens/earn-flow/*`: ad-hoc `<div>`/`<button>` + raw hex, bypassing tokens entirely.

Legend: **SURVIVE** = canonical · **MERGE** = fold into survivor behind its API · **RETIRE** = delete/replace.

## Buttons — 6 impls → 1 + icon
| Impl | File | Verdict |
|---|---|---|
| `Button` (framer, token-based, 59 consumers) | `components/Button.tsx` | **SURVIVE** (canonical) |
| `FormSubmitButton` (`rounded-10`, gradient hover) | `app/atoms/FormSubmitButton.tsx` | **MERGE** → `size`/loading state |
| `FormSecondaryButton` (**outlined** `border-2 border-primary-orange`, `rounded-3xl`) | `app/atoms/FormSecondaryButton.tsx` | **MERGE** → **filled** secondary variant (drop the border + legacy orange) |
| shadcn `button` (cva+Radix, rich variants; bridge only, 3 files) | `lib/ui/button.tsx` | **DECIDE in/out** — don't leave two "the button" |
| `CircleButton` (icon-only) | `components/CircleButton.tsx` | **SURVIVE** (icon standard) |
| ~18 ad-hoc `<button>` (earn-flow, onboarding, `SelectAmount`, `ChooseGuardian`) | screens | **RETIRE** |
| `CleanButton`, `CopyButton` (field utilities) | `app/atoms/*` | SURVIVE (utilities) |

**Design rule — no outlined buttons.** Actions are filled-primary (orange), filled-secondary (`surface-2`), or borderless-ghost (text + accent). Borders are for structural separation (cards/rows/dividers), never tap targets — extends to chips and pills.

**Pattern — InfoSheet is the only "additional info" surface.** Explanatory / utility content
(what a Guardian is, why a fee applies, what an APY risk means, address-format help) always
appears as a **fit-to-content bottom sheet** on the app's single overlay primitive
(`lib/ui/drawer`, vaul). Never an inline card, never a second modal language.

*Why a sheet, specifically:* it overlays the current screen so the thing being explained stays
visible behind it — **context preservation**, which is Benji's tray argument. It is explicitly
**not** justified by reachability; NN/g refutes that rationale for bottom sheets, and citing it
would be folklore.

*When NOT to use it:* a **blocking decision** that must be answered → dialog (not swipe-dismissible).
**Long reference content** → routed page. A **one-line clarification** → inline hint text, no
overlay at all.

*Anatomy (from the shipped `GuardianInfoDrawer`):* 6px accent top border · centred 26px title ·
hero illustration · centred intro · 6px accent rule · divider-separated rows with coloured
circular badges · one full-width dismiss button · `padding-bottom: max(16px, safe-area)`.
Overlay is transparent — no dim scrim — because the sheet does not block the flow.

**Scrim spec — dim is load-bearing, blur is depth.** `rgba(0,0,0,.40)` light / `.55` dark, plus
`backdrop-filter: blur(4px)`. The guidance is **40–60% black** to isolate foreground content, so
the app's own primitive at `bg-black/30` (light) is **below the floor** — `/50` dark is fine.
Keep the blur radius small: large `backdrop-filter` is paint-bound, and it must **never be
animated**. Blur alone is not a substitute — the dim is what guarantees legibility.

**Note the badge contrast trap:** a small glyph on the accent fill must use `--on-accent-sm`
(near-black, 5.78:1). The shipped component uses `text-pure-white` on `primary-500`, which is
**2.9:1 and fails** — the spec here is deliberately stricter than the current implementation.

**Design rule — one action zone.** The primary action sits in a **fixed bottom action zone** — full-width primary, `gutter 24 · bottom max(16px, env(safe-area-inset-bottom))`, CTA min-height 52px — at the **same Y on every screen**, so it never jumps as the user moves between screens (today's builds drift). Scrollable screens use a sticky footer; short screens pin it. Migration: normalize every screen's footer to this zone during the per-screen re-skin.

**Secondary/ghost actions sit directly BENEATH the primary.** This line previously said
"above"; that was wrong and contradicted both `index.html` and all 49 rendered screens.
Beneath is correct for two reasons: it matches the shipped Welcome screen, and on
irreversible actions it is a safety property — an accidental tap at the very bottom edge
hits *Cancel*, never "send funds permanently". The layout-stability worry that motivated
"above" doesn't apply, because the zone's height is fixed by its own padding, not by its
contents.

## Password strength — four tiers, one component

`data-tier="low|medium|strong"` on a `.strength` wrapper drives **both** the filled-segment
count and the label colour; the absent attribute is the empty/default state. Shipped copy:
`low` / `medium` / `veryStrong` ("Very strong!") plus the `8chars1number` hint. Because the
tier is also spelled out in words, colour is never the sole carrier (**SC 1.4.1**, Level A).

Amber is the **new `--warn` token**, *not* `--pend`. Reusing `--pend` failed in dark mode:
`--accent` (hue 21°), `--pend` (15°) and the then-current `--neg` (9°) were all the same
orange at the same lightness (L .300 / .252 / .265), so *low* and *medium* rendered
identically **and both read as brand colour**. Dark `--neg` moved to `#F5736B` (hue 3.5°)
and `--warn` is `#8A5A00` light / `#E8B33F` dark. Pending, warning, error and success are
four distinct meanings — the status set is four values, not three.

No error ring while a password is being typed: incomplete is not invalid, and premature
error styling is its own defect. Rings (`--neg`, 1.5px) are for settled validation
failures only — mismatch, bad seed word.

## Two shipped bugs found in the import path

`src/screens/onboarding/import-wallet-flow/ImportSeedPhrase.tsx`:

1. **`:85` renders `t('importSeedPhraseError')` and that key does not exist in
   `public/_locales/en/en.json`** — the error paragraph resolves to the raw key or to
   nothing.
2. **`:31` `errorsMap` already computes per-word validity** against the word list, but is
   only reduced to a single boolean; the individual fields are never marked.

Net effect today: a mistyped seed word gives a **dead Continue button and no explanation**.
The fix is nearly free since the per-word data already exists — ring the offending field and
name the index in the message ("Word 3 isn't in the Miden word list").

Separately, `VerifySeedPhrase.tsx` has **no error state at all** — no `error`/`invalid`
handling anywhere in the file. A screen whose only job is to catch a mistake currently
cannot tell you that you made one. That needs a new i18n key, so it is a product decision,
not a spec gap.

## Dead onboarding enum members — do not build

| `OnboardingStep` member | Status |
|---|---|
| `SelectWalletType` | Not a screen. `onWelcomeAction` maps `'select-wallet-type'` straight to `{id:'choose-protection'}` (`navigator.tsx:126-132`). |
| `SelectTransactionType` | Component exists (`create-wallet-flow/SelectTransactionType.tsx`) but **routed: 0, navigated-to: 0**. |
| `BiometricSetup` | No component, not routed. |

## Headers — 5 → 2
| Impl | File | Verdict |
|---|---|---|
| `TabHeader` (top-level tab pages, `text-[28px]`) | `components/ui/TabHeader.tsx` | **SURVIVE** (tab pages) |
| `ScreenHeader` (back/close, `text-[1.75rem]`) | `components/ScreenHeader.tsx` | **SURVIVE** (back/close) |
| `NavigationHeader` (centered, `text-xl` medium) | `components/NavigationHeader.tsx` | **MERGE** → ScreenHeader |
| `EarnFlowHeader` (+ inline re-impl in `EarnVaultDetail`) | `screens/earn-flow/components.tsx` | **RETIRE** → TabHeader/ScreenHeader |
| onboarding `Header` (progress dots only) | `screens/onboarding/*` | keep (distinct role) |

Reconcile the three title sizes (1.75rem extrabold / xl medium / 28px bold) into the type scale.

## Navigation & tabs
| Impl | File | Verdict |
|---|---|---|
| `BottomNav` (React, `accent-primary` active) | `components/ui/BottomNav.tsx` | **SURVIVE** (+ native overlay on mobile — keep both renderers) |
| `SegmentedActionBar` (home Send/Receive/Swap) | `components/ui/SegmentedActionBar.tsx` | **SURVIVE** (action bar, not a tab set) |
| `TabPicker` (animated pill, token-based) | `components/TabPicker.tsx` | **SURVIVE** (tabs) |
| `TabSwitcher` (woozie links) | `app/atoms/TabSwitcher.tsx` | **MERGE** → TabPicker |
| `ImportTabSwitcher` (`primary-orange` underline) | `app/atoms/ImportTabSwitcher.tsx` | **RETIRE** |

Factor the shared animated-pill mechanic (TabPicker + SegmentedActionBar) into one primitive.

### The action bar is feature-gated — draw the shipped state, spec the future one

`TabLayout.tsx:103-137` composes it as **overview · send · receive · [earn] · [swap]**, where the
last two are conditional on `isEarnEnabled()` and `isSwapEnabled()` (`src/lib/feature-flags.ts`).
Today those are **false** and **true**, so the shipped bar is **four** segments ending in **Swap**.

An earlier version of these mocks drew Earn and omitted Swap — i.e. it drew the gated-off feature
and left out the enabled one. Corrected: every screen shows the four-segment shipped state, and
only the Earn screens (themselves tagged *gated off*) show the five-segment earn-enabled state.

**Measured constraint for when Earn ships.** Five segments overflow the **360pt extension popup by
9.1pt**. The collapsed chips are already on their 44pt tap-target floor and cannot compress, so the
gap is the only slack: **7px → 4px below 380pt** reclaims 12pt and fits at 312/312 with the smallest
chip at 44.7pt. Verified at 360 / 375 / 402 / 440 × 4 and 5 segments.

Narrowing the page gutter would also have worked, and was rejected: it moves every other component
on the screen to fix one. In the mocks the rule is scoped to `.phone.ext` because a media query
cannot see a fixed-width frame; in production key it off a container query or `isExtension()`.

This defect only appears when the flag flips, so it would have shipped *with* Earn — which is the
argument for specifying gated features rather than deleting them from the system.

## Cards / surfaces
| Impl | File | Verdict |
|---|---|---|
| `BalanceCard` (two-tone, `card-*` tokens, font-fit) | `components/ui/BalanceCard.tsx` | **SURVIVE** (unique hero) — de-hardcode `bg-[#A8BBA3]`, `#FFFFFF4D`, `#F6F4F261`. **Dark mode → near-black** (`#101010`/`#000` + hairline); card colors are light-mode only. |
| `PromptCard` (`bg-surface-input rounded-10`) | `components/ui/PromptCard.tsx` | **SURVIVE** |
| `DetailCard` + `DetailRow` (bordered) | `lib/ui/DetailCard.tsx` | **SURVIVE** — fix hardcoded badge `#CC5200`/`#FFF3EB` |
| `CardItem` vs `ListItem` (near-duplicate rows) | `components/{CardItem,ListItem}.tsx` | **MERGE** ListItem → CardItem |
| earn ad-hoc cards (`rounded-2xl border-[#EFEFF2]`) | `screens/earn-flow/*` | **RETIRE** → CardItem/DetailCard |

## Form fields & amount entry
| Impl | File | Verdict |
|---|---|---|
| `AmountInput` (already shared send+swap) | `components/AmountInput.tsx` | **SURVIVE** (canonical amount) |
| `InputAmount` (centered, fiat toggle — overlaps) | `components/InputAmount.tsx` | **MERGE** → AmountInput (centered/fiat mode) |
| `AssetField` + `PlainAssetInput` (dup BigNumber clamp) | `app/atoms/*` | **MERGE** → one validation hook |
| `FormField` (heavyweight legacy field) | `app/atoms/FormField.tsx` | SURVIVE until form stack modernized |
| `Input` / `CurrencyInput` | `components/Input.tsx` | **MERGE** → FormField or one token-based text field |
| `SearchInput` | `components/ui/SearchInput.tsx` | **SURVIVE** (search) |

## Sheets / modals — 3 libraries → 1
| Impl | File | Verdict |
|---|---|---|
| **vaul** drawer | `lib/ui/drawer.tsx` | **SURVIVE** (all bottom sheets) |
| react-modal `CustomModal`/`ModalWithTitle` | `app/atoms/CustomModal.tsx` | **RETIRE** → vaul dialog mode |
| bespoke `TransactionProgressModal` (14KB, 1 consumer) | `components/TransactionProgressModal.tsx` | **RETIRE** → overlay primitive |
| `lib/ui/dialog.tsx` (constate alert/confirm — *not* shadcn) | `lib/ui/dialog.tsx` | keep as state provider |
| tippy.js | `lib/ui/useTippy.tsx` | keep (tooltips only) |
| @popperjs `Popper` (1 consumer `IconifiedSelect`) | `lib/ui/Popper.tsx` | **MERGE** → drawer/select |

Note: there is **no shadcn Dialog/Sheet** anywhere despite the shadcn button/badge + `tw-animate-css` dep.

## Chips / badges / status — 7 → 2
| Impl | File | Verdict |
|---|---|---|
| `Chip` (interactive filter) | `components/Chip.tsx` | **SURVIVE** (interactive) |
| shadcn `badge` (off-palette tokens) | `lib/ui/badge.tsx` | **MERGE** — remap to `status-*` then canonical static badge |
| `PriceChangeBadge` (hardcoded colors) | `components/explore/PriceChangeBadge.tsx` | **MERGE** → status-* |
| `AccountTypeBadge` (returns `null`) | `app/atoms/AccountTypeBadge.tsx` | **RETIRE** (dead) |
| `OpenInExplorerChip` (numeric-shade prop API) | `app/atoms/OpenInExplorerChip.tsx` | **MERGE** → variant props |
| inline hex pills (balance delta, earn `bg-[#DDD4CE]`) | screens | **RETIRE** → badge primitive |

## List rows
| Impl | File | Verdict |
|---|---|---|
| `AssetListItem` (+ `AssetRow` wrapper) | `components/ui/AssetListItem.tsx` | **SURVIVE** (assets) |
| `ActivityRow` (tx, colored icon square, status dot) | `components/ui/ActivityRow.tsx` | **SURVIVE** (transactions) |
| `DetailRow` ↔ `ReviewRow` (overlapping key/value) | `lib/ui/DetailCard.tsx`, `components/review/ReviewRow.tsx` | **MERGE** → one key/value row |

## Also: duplicate primitive families
- **Checkbox ×3** — `components/Checkbox.tsx`, `app/atoms/Checkbox.tsx`, `app/atoms/FormCheckbox.tsx` → **one** token-based.
- **Toggle ×2** — `components/Toggle.tsx` (`PRIMARY_HEX`), `app/atoms/ToggleSwitch.tsx` (`ACCENT_HEX`) → **one**.

## Priority order (for the migration's P2)
1. Amount entry (`InputAmount → AmountInput`, unify validation).
2. Buttons (`Button` sole source; retire `FormSecondaryButton` + ad-hoc; decide shadcn in/out).
3. Overlays (standardize vaul; retire react-modal + `TransactionProgressModal`).
4. Headers (`NavigationHeader → ScreenHeader`; keep `TabHeader`).
5. Rows/cards (`ListItem → CardItem`, `DetailRow ↔ ReviewRow`).
6. Palette hygiene (remap shadcn badge/button tokens; delete dead `AccountTypeBadge`; de-hardcode earn-flow).

### Action identity — each action glyph keeps its own hue

`send-new.svg` `#91ACC1`, `receive-new.svg` `#99AC94`, `convert.svg` `#BEACD2` (stroke) and
`earn.svg` `#777487` ship their colour **inside the SVG**; they are the same family as the
`--tx-*` activity hues, which is why an Activity row and its action-bar glyph read as the same
thing. `wallet.svg` (Overview) is genuinely `currentColor` and must follow the ink.

Converting all 65 icons to `currentColor` masks for dark-mode adaptivity **flattened those four
to a single ink and destroyed the identity.** Fix keeps the mask — so the hue stays theme-aware —
but tints it per action via `data-act` on the segment:

| Token | Light | Dark | inactive-chip contrast |
|---|---|---|---|
| `--act-send` | `#748A9A` | `#91ACC1` | 3.29 / 5.98 |
| `--act-receive` | `#7C8B78` | `#99AC94` | 3.28 / 5.85 |
| `--act-swap` | `#8F829F` | `#BEACD2` | 3.27 / 6.76 |
| `--act-earn` | `#777487` | `#777487` | 4.13 / 3.12 |

Light values are **darkened** from the shipped pastels: the originals measure **2.37–2.42:1** on
the chip, and a *collapsed* segment is icon-only with no label to fall back on, so SC 1.4.11's
3:1 genuinely applies. Dark keeps the pastels exactly as shipped. **Hue is preserved in both
themes; only lightness moves.** Overview carries no `data-act`, so it stays `currentColor`.

### Earn is hidden here too, mirroring the flag

`isEarnEnabled()` is `false`, so the site defaults to `data-earn="off"` and the three earn
screens are `display:none`. Hidden, **not deleted** — the feature is built and routed, so the
design has to survive until the flag flips. The sidebar control toggles it to review the
earn-enabled product, including the five-segment action bar that exists only in that state.

**The harness audits the flag-ON state**, for two reasons. A hidden `.phone` measures 0×0, so
every check inside it passes vacuously while the summary still counts it as a screen — the first
version of this hid three screens from the audit and still reported "50 screens, 0 failures".
And flag-on is the superset: it is the only state containing the five-segment bar. A zero-sized
frame is now a hard failure that names the frames, verified by forcing the flag off.

## Vertical rhythm lives on the container, not inside components

Measured on Home before the fix, rect-to-rect: **0 / 0 / 20 / 10 / 10 / 0**. `.mpad` was a
flex column with `gap: normal`, so every child invented its own spacing through padding and
margins — the values in play were 2, 4, 6, 9, 10, 11, 13, 16, 20, almost none on the 4px
grid. The action bar, balance card and prompt were literally touching. This is the named
anti-pattern from the UI/UX skill: *"similar UI levels with inconsistent spacing."*

Three tiers, all on the grid, owned by the container:

| Token | Value | Use |
|---|---|---|
| `--stack-tight` | 8px | within a group — section header → search → rows |
| `--stack` | 12px | between stacked components in one group — bar → card → prompt |
| `--stack-loose` | 24px | before a new section |

After: **12 / 12 / 24 / 8 / 12 / 8**. Components no longer carry outer spacing; a component
that needs a different gap expresses it as `calc(tier - var(--stack))`, so the tier stays
visible in the code.

## Bottom nav — Apple Liquid Glass is the foundation

Per HIG, the iOS 26 tab bar "floats above content at the bottom of the screen. Its items rest
on a Liquid Glass background that allows content beneath to peek through." It is a floating
pill inset **21pt** on left, right and bottom, labels **11pt**, and the active tab is
**"a colored glyph plus a highlighted shape."**

**Four layers make the material. CSS can honestly do three:**

| Layer | CSS | Fidelity |
|---|---|---|
| translucency + blur | `backdrop-filter: blur(24px) saturate(180%)` | faithful |
| specular rim | inset hairlines — bright top, dark bottom | approximated |
| adaptivity to content | falls out of the translucency | partly faithful |
| **lensing / refraction** | **nothing** | **CSS cannot do this** |

Real Liquid Glass *bends* the content behind its edges. `backdrop-filter` only blurs — the rim
gradient fakes the read of a curved edge. **On device, use the native material rather than
reproducing it**; this mock is a stand-in for review, not a spec to reimplement in CSS.

The material also only reads **over content**. A translucent bar above empty space is just a
grey panel, which is why the Components section demos it over real rows with one row visibly
blurring through. In the screen mocks the bar sits in flow, so it looks flatter there than it
will on device.

**Motion — the bubble deforms.** It does not rigidly translate: it stretches along travel and
settles (`scale: 1 → 1.09/0.93 → 0.98/1.02 → 1`). That deformation is what separates Liquid
Glass from a segmented control. `scale` is an independent transform property so it composes
with the `translateX` rather than overwriting it. One indicator, positioned by
`translateX(calc(var(--i) * (100% + 6px)))` — `%` resolves against the bubble's own width, so
no measurement is needed and it ports to native as a single number. CSS approximates
`springs.pill` (320/30); the spring is the implementation spec.

**`tabBarMinimizeBehavior`** — on scroll the bar collapses so "only the current tab item
remains visible as a small circular button." Built as the `.mini` variant, demoed, **not on by
default** — and that default is now evidence-backed: Slack ships a Liquid Glass bar and appears
*not* to enable it (diffing their own scrolled vs unscrolled screenshots, the active highlight
is byte-identical at the same coordinates). Available, not idiomatic.

**Labels are settled, and on first-party evidence rather than spec.** Slack: *"we even
experimented with label-less tabs. But we soon realized it came at the expense of two of
Slack's non-negotiables: accessibility and comprehension."* That is a company reporting an
outcome, which outranks both the platform guidance and the Family/Rainbow/Robinhood icon-only
counter-observation.

**Not adopted: a detached circular button beside the capsule.** Slack puts Search outside its
capsule as a floating circle; that is the pattern criticised for failing "to afford itself as a
tab", blurring navigation with action. We have no fourth destination, so there is nothing to
gain.

**Adopted from Slack: drop the bar entirely on full-screen input surfaces.** Their search screen
has no bar at all rather than floating one over the keyboard.

**The active glyph is tinted, per Apple** — but `--accent-ink` (5.55:1 light / 5.86:1 dark),
never the raw brand orange, which measures **2.90:1** on paper. The highlighted shape carries
the rest of the signal.

### Superseded: the neutral-highlight step

An intermediate version made the highlight fully neutral after observing Instagram (grey pill,
filled black glyph, no brand colour in the nav), measuring 9.01:1 / 12.63:1. That is retained
here as the fallback if the tinted glyph ever proves too quiet, and it is still the right
reference for the *shape* and *width* — Instagram's capsule is ~87% of screen width and
translucent, which is what corrected an earlier content-hugging capsule at 63.4%.

### What the accent version cost, for the record

Corrected after seeing Instagram's actual bar. Its active state is a **neutral grey pill with
a filled black glyph, and no brand colour anywhere in the nav**; the capsule is translucent
with content bleeding through, spans ~87% of the width, and is icon-only.

| Treatment | Light | Dark |
|---|---|---|
| accent ink on an opaque accent wash/well | 5.08:1 | 5.86:1 |
| neutral pill + `--ink` | 9.01:1 | 12.63:1 |
| **glass bubble + `--accent-ink`** (current) | **passes, harness-verified** | **passes** |

The *opaque* accent wash needed a theme-dependent fill direction to pass at all — a wash in
light, a recessed well in dark, because any wash in dark dragged the orange to 3.64:1. The
glass bubble avoids that because it is a translucent lens over a translucent bar rather than a
tinted chip, so the composite stays close to the surface in both themes.

**One indicator, translated by index** — `translateX(calc(var(--i) * (100% + 6px)))`, where
`%` resolves against the pill's own width (one item). No measurement, no `layoutId`, and it
ports to native as a single number. CSS approximates `springs.pill` (320/30) with
`--ease-out-cubic`; the spring is the implementation spec.

**Top asset gap — now the highest-value fix.** *Every* reference uses an **outlined → filled
glyph swap** as the primary active signal: both Instagram variants, and Slack's 2023 bar. Our
set ships **one weight per glyph**, so the most widely-used active-state mechanism in the
category is unavailable to us, and the pill is doing work the icon should share. Authoring
filled variants of the three nav glyphs is the single highest-leverage asset task.

**DECIDED — neutral active glyph. No brand colour in the nav.** Among shipping Liquid Glass
adopters the tint is a choice: Slack tints (`#762B7D`), Instagram uses none, and both ship the
same material. Neutral wins on measurement — `--ink` on the bubble is **9.01:1** light /
**12.63:1** dark, against `--accent-ink`'s narrower pass. Apple's HIG does describe "a colored
glyph plus a highlighted shape", so this is a deliberate departure from HIG in favour of the
reference apps and the contrast headroom. The accent stays for CTAs and the balance, where it is
the point rather than decoration.

**Strengthening the active state without a filled glyph.** With the tint gone the first
version left the bubble carrying almost everything, and the ink step between states was only
**1.65:1** (light) / **1.92:1** (dark) — each state legible against its background, but close to
*each other*, which reads as a weak selection. Three fixes, all measured:

| Lever | Before | After |
|---|---|---|
| inactive ink (nav-scoped `--nav-ink-off`) | `--ink-2` — 1.65:1 from active | **`#727272` light / `#989898` dark** — 2.19:1 / 2.88:1 from active, still 4.7:1 on the bar |
| bubble in light | `rgba(255,255,255,.78)` — near-invisible white-on-white | **`rgba(63,63,63,.10)`** — a grey step, like Instagram's, which is *greyer* than its surrounding glass |
| active label weight | 600, never switched | **800** |

The inactive ink is nav-scoped rather than a change to `--ink-2`, so nothing else in the system
dims. `#727272` is close to the floor: at 4.73:1 on the bar it keeps the 11px label compliant
with margin, and going dimmer buys separation at the cost of legibility.

**The weight switch reverses an earlier rule of mine, deliberately.** I had banned
`semibold → bold` on activation because it reflows the label. That was correct when items were
content-sized — the item grew and pushed its siblings. These items are fixed thirds (`flex:1`),
so the label re-renders inside its own centred box and nothing moves. Slack does the same.

Even with all three, an **outlined→filled glyph swap** remains the mechanism every reference
uses and the one we lack. The nav is correct and clearly legible now; filled nav glyphs would
still make it better.

## Prompt card — internal spacing

Was `padding: 11px 4px 11px 13px` with a uniform 11px gap, a 32px icon square holding a 17px
glyph, and a 5px chevron sitting 11px from a 44px dismiss target. Now `padding: 12px`,
`gap: 12px`, a 20px glyph (token size), and **no chevron** — two trailing affordances inside
one thumb-width is the crowding the skill's 8px-between-targets rule exists to prevent. The
dismiss keeps its 44pt target via `margin: -12px -6px -12px 0`, so the hit area overhangs the
padding instead of the padding collapsing to 4px to fit it.

Body clamps at 3 lines because that is what the real 76-character i18n string needs in a
~200pt column. Card height went 86.8pt → 73.3pt.

## Parent-scoped classes are a trap — three promoted to components

The single most expensive class of bug in this system, hit **four separate times**. A rule written
as `.parent .thing{…}` looks like a component and is not one. Reuse it anywhere else and it
silently does nothing — no error, no warning, and the harness passes, because an unstyled element
is rarely a *contrast* or *target* failure. It just looks wrong.

Found while drawing contacts. Three classes I reached for were all parent-scoped:

| Was | Symptom when reused | Now |
|---|---|---|
| `.sheetc .shdiv` | divider invisible — a dead 30px gap in the address book | `.shdiv` + per-shell full-bleed margin |
| `.ropt .rbadge` | the Guardian chip rendered as bare text, no fill | `.rbadge` |
| `.errscr .eic` | icon plate had no size, so the empty state had a stray 20px glyph | `.eic` |

The promotion rule: **two consumers make it a component.** One consumer is a one-off and should
stay scoped. All three had a second real consumer, so all three got promoted, and their original
scoped rules were kept only where they carry genuinely shell-specific geometry — `.shdiv`'s
negative margin has to match its host sheet's padding (`-20px` in `.sheetc`, `-16px` in `.msheet`),
so that part stays scoped while the appearance does not.

Related and already recorded above: the `data-surface` scope trap. Same root cause — a style's
reach is not obvious from the markup that uses it.

## Sheets own the bottom safe inset

`.msheet` now carries `padding-bottom:max(16px,var(--safe-bottom,0px))`, and `.msheet .zone`
zeroes its own bottom padding so the inset is not reserved twice. Before this, any sheet whose
content ran to the bottom edge put that content under the home indicator; only sheets that
happened to end in a `.zone` were safe, which made correctness accidental. Sixteen safe-area
failures across four screens collapsed to zero from this one rule.

## A scroll container must not compress its children

`.mlist` is a flex column. Flex children shrink by default, so a list taller than its sheet
squashed the elements inside it instead of scrolling — text inputs specified at 44pt rendered at
**20pt**, silently breaking the touch-target floor. Fixed with `.mlist>*{flex:none}`.

This is why the target check earns its keep: the CSS said 44, the DOM said 20, and nothing about
the markup hinted at it.

## Text fields are touch targets

`.fld .inp` gained `min-height:44px` (SC 2.5.5). Padding alone had it at ~41pt, and any flex
context could and did take it lower.

## Contacts — one picker, one manager, and no way to use a contact

Two surfaces, deliberately different, drawn as five screens:

- **`Contacts · picker`** — the send-flow sheet. Read-only: no add, no delete, **no search**.
  Fixed height in both states, matching shipped `h-120`, so a short list does not make the sheet
  jump. Trailing `.rtick` marks the current recipient — a shape, not a check character, because a
  10px glyph trips the 11pt type floor.
- **`Address book`** — the settings drawer. Create form always expanded above the list, plus the
  search the picker lacks.

New: `.heroin` (borderless hero input), `.rtick`, `.shlab` / `.shlab.hi`, `.shempty`,
`.btn-primary[disabled]`.

`.heroin` is where the "enforce or update" rule got exercised. Shipped draws the recipient address
at **40px**; 40 is not a step on our nine-step ramp. Adding a tenth step for one screen would
break the ramp's whole purpose, so this **enforces `--t-balance` (32px)** and accepts the 8px
divergence. It also uses Geist Mono, because the system reserves mono for addresses and hashes
while shipped uses the display face here — a deliberate divergence, recorded rather than silent.

The form uses **visible labels** where shipped is placeholder-only. Placeholder-only labels
disappear the moment typing starts and fail SC 3.3.2. Cost of enforcing it: `en.json` has no label
keys, only the placeholder strings `enterUsername` / `enterAddress`, so **two new i18n keys are
required** to ship this. Flagged rather than quietly invented.


---

## Coverage pass — 164 screens

The design system had 60 captioned screens against ~270 distinct states enumerated from the
shipped code. This pass closed the gap for Home, Activity, Receive/claim, Settings and the
dApp browser. Seven components fell out of it, two were deleted again, and one law.

### The negative-margin law

**A negative margin may cancel a parent's padding. It may never outrun it.**

This was caught four separate times in one pass, in code that had shipped and passed review:

| Element | Pull | Parent padding | Overflow |
|---|---|---|---|
| `.mbc .bot .acopy2` | `-0.625rem` | `0.375rem` | 4pt |
| `.mprompt .pdis` | `-0.375rem` | `0.25rem` | 2pt |
| `.shgear` on `.pghead` | `-0.625rem` | `0` | 10pt |
| `.balhide` in `.balrow` *(historical — component deleted)* | `-1rem` | `0` (row has none) | 16pt |

Every one is invisible: an ancestor's `overflow:hidden` clips it. What it costs is real — the
right edge of a 44pt touch target sits outside the box it appears to belong to. When the pull
belongs to a *layout* rather than a button, put it on the layout: `.pghead` carries the pull and
`.pghead .shgear` zeroes it.

**The label-row case, resolved.** `.balhide` is gone and `.bmore` holds that slot, with the pull
split by whose padding it cancels. The button carries the vertical — `-0.625rem` / `-0.6875rem`,
cancelling `.top`'s 10px and 11px **exactly** — and `.balrow.withmore` carries the horizontal,
`-1rem` against `.top`'s 16px. Nothing outruns anything, and the glyph lands 22px from the card's
right edge, the same optical column as `.acopy2` in the row below. `.mshead` took the same
correction: the trailing pull sits on the header and `.mshead .shgear,.mshead .shact` zero it,
after the reflow sweep caught the button's own `-0.625rem` hanging 10pt past the Accounts sheet
header the moment one appeared there.

### New components

- **`.pghead`** — page header, title plus optional trailing gear. Was an inline style repeated on
  seven screens with `padding-right:0`, which is what left `.shgear` nothing to cancel.
- **`.emptyb`** — empty-list block: `.et` title, `.eb` body, one `btn-secondary`. No illustration;
  the app ships no empty-state art and inventing some would be a spec the implementation cannot
  honour. Secondary, not primary — an empty state is usually the normal resting state, not a
  failure to correct.
- **`.mprompt .pcta`** — trailing action inside a prompt, for the connectivity banners and the
  claim prompt. When a dismiss sits beside it the pair is held 8pt apart.
- **`.amt .msk`** — the balance mask. Covers **every** number including the delta and sparkline: a
  visible `+0.32%` beside a masked total leaks the direction and rough size of the move, which
  defeats the point. Its toggle is no longer on the card — see `.shact` below.
- **`.mbc .bmore`** — 44pt trailing control in the balance card's label row, and the card's only
  trailing control on every Home state. Opens the Accounts list, which nothing else on Home
  reaches. Not invented: shipped `BalanceCard.tsx:182-191` already renders it, wired to the
  `AccountsDrawer` at `Explore.tsx:192` — but at `w-5 h-5` = 20pt, under half the 44pt floor, and
  in the bottom strip beside the copy affordance, two targets in one thumb-width. Moving it to the
  label row at 44pt fixes both. It gets its own class rather than a restyled `.pdis`, because
  `.pdis`'s 44pt floor is scoped to `.mprompt`: reusing that name inside `.balrow` inherits the
  colour and none of the geometry, which is exactly how the old `.balhide` shipped as a 33×23
  target.
- **`.shact`** — same geometry as `.shgear`, under an honest name, for sheet-header utilities that
  are not settings. First use: the balance mask on the Accounts sheet. One rule, two names, rather
  than a second class that happens to be identical — a gear-named class doing eye work is how a
  style's reach stops matching its name.
- **`.mbc .bnote` — deleted.** The warn-dotted footnote under the balance is gone from the system,
  CSS and both usages. Both facts it carried are now `.mprompt` cards in the carousel. On the
  unclaimed-note screen it also stopped saying the same 52.50 MIDEN twice in two components.
- **`.mbc .balhide` — deleted.** The eye toggle in the label row is gone; the mask toggle lives in
  the Accounts sheet header as a `.shact`, inside the sheet `.bmore` opens.
- **`.addr2`** — now has a base rule. It was authored only as `.drow .v.addr2`, so every bare
  `<span class="addr2">` outside a detail row silently rendered in the UI face at body size.

### Home has one notification component, not four

Home had four ways to tell you something: the prompt carousel, a banner above the balance card, a
footnote inside it (`.bnote`), and a control bolted to the card's label row. Four placements, four
sets of geometry, and **two of them changed the height of the card to say their piece** — the
banner drew at five different heights across its eight states (138.6 / 141.6 / 150.0 / 155.7 /
178.7pt), so the balance figure and everything below it moved as the wallet loaded, lost the
network, or masked itself. The most-looked-at object in the app may not resize under its own
states.

There is now one, and it is the one the app already ships: `HomePrompts.tsx:47` wraps every notice
in `PromptCarousel`, which renders nothing at zero prompts and a bare slide at one
(`PromptCarousel.tsx:92-93`) — so a single notice is a single card with no dots. Every Home notice
is a `.mprompt` in that slot: unpriced asset, unclaimed notes, offline, node unreachable.
Connectivity copy stays verbatim from `ConnectivityIssueBanner`.

The height half of the fix is `.mbc.hero .top{min-height:7.25rem}` — 116px, the tallest natural top
(label row 23 + amount + delta + the 10/11 padding, measured at 115.63) rounded onto the 4px grid.
A **floor, not a fixed height**: at 200% text the content outgrows it and the card grows. The slack
lands where the delta would be, below the amount, so the number holds the same Y in all eight
states, which now measure 162pt each.

This raises the stakes on `.mprompt .pb`'s 3-line clamp (above): at 2 lines the guardian prompt
lost "Enter its URL to reconnect" and `connectivityNodeBody` stopped at "Your balance may be" —
verbatim i18n strings truncated mid-sentence on what is now Home's *only* notification surface.

### Two priority rules written into CSS

`.mbc .balmain .bl` is `flex:0 0 auto`. A bare flex row shrinks both children proportionally,
which at 320 gave the balance 144pt for 191pt of unbreakable digits — **"$12,480.50" clipped
mid-number by `overflow:hidden`, a wrong number rendered as a plausible one.** The balance is why
the card exists; the sparkline is a garnish on it. The number holds, the chart yields.

A container query would be the better tool for dropping the chart entirely, and it is *not* used:
these are `zoom`-scaled mocks, so a length-based container query does not resolve against the pt
geometry being specified. A rule that reads as spec and behaves as something else is worse than
the residual it would fix.

### Harness change

The reflow sweep no longer flags elements authored to truncate (`overflow:hidden` +
`white-space:nowrap` + `text-overflow:ellipsis`). Those have `scrollWidth > clientWidth` **by
definition** on any string long enough to need the ellipsis — the check was crying wolf on the
exact mechanism that prevents reflow breaks. All three properties must be set, so a container
that merely clips its children is still caught.
