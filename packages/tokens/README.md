# @bread/crust-tokens

The Crust design tokens, in the three shapes engineers consume them:

```css
@import '@bread/crust-tokens/tokens.css';   /* the custom properties + both themes */
```

```js
// tailwind.config.js
module.exports = { presets: [require('@bread/crust-tokens/tailwind-preset')] };
// then: className="bg-surface text-ink-2 rounded-md p-3" — all theme-following
```

```js
const tokens = require('@bread/crust-tokens'); // tokens.json — primitive / light / dark scopes
```

**Everything here is generated** from `apps/site/tokens.css` by `tools/build-packages.mjs`. That
file is the designers' surface and the single source of truth; CI fails if this package drifts
from it. To change a token, change it there and regenerate.

Theming: put `data-theme="light"` or `data-theme="dark"` on the root element. The Tailwind colour
classes resolve through `var(--…)`, so they follow whichever theme is active.
