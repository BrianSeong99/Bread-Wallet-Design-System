# Screen index

Every screen in `index.html`, grouped by the flow it belongs to, in page order.

**Generated — do not hand-edit.** Regenerate with `node design-system/screens.mjs` after any
change to `index.html`. Serve the site with `python3 -m http.server 4599 --directory design-system`
and find a screen by searching its caption.

Total: **174 screens** across **16 flows**. The *Specifies* column lists the
shipped source each screen's rationale cites, so this reads in both directions: what a screen
documents, and which screens document a given file.

| Flow | Screens |
|---|--:|
| Welcome | 2 |
| Home / Wallet overview | 2 |
| Send → Review → Sign — where the Tier-2 evidence lands | 3 |
| Onboarding | 30 |
| Home & overview | 15 |
| Send flow | 17 |
| Cross-chain send | 8 |
| Contacts | 8 |
| Receive flow | 2 |
| Swap flow | 6 |
| Activity flow | 18 |
| Earn flow gated off | 3 |
| Settings & browser | 17 |
| Security & recovery | 22 |
| dApp browser | 11 |
| Global states | 10 |

---

## Welcome

<sub>section `#screens` · 2 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 1 | Current· live build | shipped | — |
| 2 | Proposed· Crust | shipped | — |

## Home / Wallet overview

<sub>section `#screens` · 2 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 3 | Current· live build (fresh wallet) | shipped | — |
| 4 | Proposed· Crust | shipped | — |

## Send → Review → Sign — where the Tier-2 evidence lands

<sub>section `#screens` · 3 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 5 | 1 · Amount | shipped | — |
| 6 | 2 · Review | shipped | — |
| 7 | 3 · Signing | shipped | — |

## Onboarding

<sub>section `#allscreens` · 30 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 8 | 01 · Splash | shipped | — |
| 9 | 02 · Welcome | shipped | — |
| 10 | 03 · Choose protection | shipped — 1/4 | — |
| 11 | 04 · Passcode create | shipped — 2/4 | — |
| 12 | 05 · Passcode confirm | shipped — 2/4 | — |
| 13 | 05e · Passcode mismatch | bug / proposed — error | — |
| 14 | 04a · Face ID scan | shipped — 2/4 | — |
| 15 | 04b · Face ID success | shipped — 2/4 | — |
| 16 | 04a → 04b · Transition | shipped — live | — |
| 17 | 07c · Biometric failed | shipped — shipped | — |
| 18 | 06 · Choose your Guardian | shipped — 3/4 | — |
| 19 | 06a · What is a Guardian? | gap / sheet — info sheet | — |
| 20 | 06b · Create password | shipped — shipped | — |
| 21 | 06b′ · Password strength — low | shipped — shipped | — |
| 22 | 06c · Set up account recovery | shipped — shipped | — |
| 23 | 07a · Creating wallet | bug / proposed — loading | — |
| 24 | 07b · Wallet ready | shipped — 4/4 | — |
| 25 | 08 · Back up your wallet | gap / sheet — deferrable | — |
| 26 | 08a · Back up later? | gap / sheet — deferral | — |
| 27 | 09 · Verify seed phrase | gap / sheet — deferrable | — |
| 28 | 10 · Import with seed phrase | shipped — shipped | — |
| 29 | 10e · Invalid seed word | shipped — shipped | — |
| 30 | 11 · Import recovery method | shipped — shipped | — |
| 31 | 12 · Unlock | gap / sheet — app-only | — |
| 32 | 12a · Forgot passcode | shipped — shipped | — |
| 33 | E1 · Create password | shipped — 1/3 | — |
| 34 | E2 · Choose your Guardian | shipped — 2/3 | — |
| 35 | E3 · Wallet ready | shipped — 3/3 | — |
| 36 | E4 · Unlock | gap / sheet — app-only | — |
| 37 | E5 · Forgot password | gap / sheet — extension | — |

## Home & overview

<sub>section `#allscreens` · 15 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 38 | Home / Overview | shipped | — |
| 39 | Home · first run | gap / sheet — gap | — |
| 40 | Home · loading | gap / sheet — gap | — |
| 41 | Home · balance hidden | gap / sheet — gap | — |
| 42 | Home · unpriced asset | bug / proposed — bug | — |
| 43 | Home · offline | gap / sheet — banner | — |
| 44 | Home · node unreachable | gap / sheet — banner | — |
| 45 | Home · notes to claim | gap / sheet — gap | — |
| 46 | Notification detail | gap / sheet — gap | — |
| 47 | Accounts · list | bug / proposed — proposed | — |
| 48 | Account sheet | bug / proposed — proposed | — |
| 49 | Token detail · price unavailable | shipped | — |
| 50 | Token detail · loading | bug / proposed — bug | — |
| 51 | Token detail · unpriced | bug / proposed — fork | — |
| 52 | Token detail | shipped | — |

## Send flow

<sub>section `#allscreens` · 17 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 53 | Send · recipient | shipped | — |
| 54 | Send · recipient, filled | shipped | — |
| 55 | Send · recipient, new address | shipped | — |
| 56 | Send · recipient, typing | shipped | — |
| 57 | Send · recipient, invalid | shipped | — |
| 58 | Send · scan | gap / sheet — mobile only | — |
| 59 | Send · scan, detected | gap / sheet — gap | — |
| 60 | Send · scan, unreadable | gap / sheet — gap | — |
| 61 | Send · scan, no code found | gap / sheet — gap | — |
| 62 | Send · amount | shipped — shipped | — |
| 63 | Send · amount, zero | gap / sheet — gap | — |
| 64 | Send · amount, insufficient | gap / sheet — gap | — |
| 65 | Send · amount, max | gap / sheet — proposed | — |
| 66 | Send · token picker | gap / sheet — sheet | — |
| 67 | Send · review | shipped — shipped | — |
| 68 | Send · in progress | shipped | — |
| 69 | Send · success | shipped | — |

## Cross-chain send

<sub>section `#allscreens` · 8 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 70 | Send · recipient, other network | gap / sheet — proposed | — |
| 71 | Send · recipient, unsupported | shipped | — |
| 72 | Send · scan, unsupported network | gap / sheet — gap | — |
| 73 | Send · network | bug / proposed — proposed | — |
| 74 | Send · amount, other chain | bug / proposed — proposed | — |
| 75 | Send · route | gap / sheet — proposed | — |
| 76 | Send · review, other chain | gap / sheet — proposed | — |
| 77 | Send · success, other chain | bug / proposed — bug | — |

## Contacts

<sub>section `#allscreens` · 8 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 78 | Contacts | gap / sheet — sheet | — |
| 79 | Contacts · empty | gap / sheet — sheet | — |
| 80 | Contacts · new | gap / sheet — gap | — |
| 81 | Contacts · row actions | gap / sheet — gap | — |
| 82 | Contacts · delete confirm | gap / sheet — gap | — |
| 83 | Contacts · new, duplicate | gap / sheet — sheet | — |
| 84 | Contacts · no results | bug / proposed — bug | — |
| 85 | Contacts · edit | gap / sheet — gap | — |

## Receive flow

<sub>section `#allscreens` · 2 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 86 | Receive · address copied | bug / proposed — bug | — |
| 87 | Receive | shipped | — |

## Swap flow

<sub>section `#allscreens` · 6 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 88 | Swap · insufficient balance | shipped | — |
| 89 | Swap · fetching price | shipped | — |
| 90 | Swap | shipped | — |
| 91 | Swap · success | shipped | — |
| 92 | Swap · review, submitting | gap / sheet — gap | — |
| 93 | Swap · review | shipped | — |

## Activity flow

<sub>section `#allscreens` · 18 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 94 | Activity | shipped | — |
| 95 | Activity · empty | gap / sheet — gap | — |
| 96 | Activity · loading | gap / sheet — gap | — |
| 97 | Activity · Sent, no matches | bug / proposed — bug | — |
| 98 | Activity · failed transactions | gap / sheet — gap | — |
| 99 | Activity · in progress | gap / sheet — gap | — |
| 100 | Activity · end of list | bug / proposed — bug | — |
| 101 | Transaction detail | shipped | — |
| 102 | Transaction detail · failed | gap / sheet — gap | — |
| 103 | Transaction detail · pending | bug / proposed — bug | — |
| 104 | Claim · in progress | gap / sheet — gap | — |
| 105 | Claim · partial failure | gap / sheet — gap | — |
| 106 | Pending notes · loading | gap / sheet — gap | — |
| 107 | Pending notes · empty | gap / sheet — gap | — |
| 108 | Pending notes · fetch failed | bug / proposed — bug | — |
| 109 | Pending notes · claiming | bug / proposed — bug | — |
| 110 | Pending notes · claim failed | bug / proposed — bug | — |
| 111 | Pending notes | shipped | — |

## Earn flow gated off

<sub>section `#allscreens` · 3 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 112 | Earn · vaults | gap / sheet — gated off | — |
| 113 | Vault detail | gap / sheet — gated off | — |
| 114 | Earn · deposit | gap / sheet — gated off | — |

## Settings & browser

<sub>section `#allscreens` · 17 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 115 | Settings | shipped | — |
| 116 | Settings · general | bug / proposed — bug | — |
| 117 | Settings · general, save failed | gap / sheet — gap | — |
| 118 | Settings · language | bug / proposed — bug | — |
| 119 | Settings · currency | gap / sheet — gap | — |
| 120 | Settings · advanced, key loading | gap / sheet — gap | — |
| 121 | Settings · advanced, key unavailable | gap / sheet — gap | — |
| 122 | Settings · faucet ID | shipped | — |
| 123 | Settings · faucet ID, saved | shipped | — |
| 124 | Settings · faucet ID, rejected | bug / proposed — bug | — |
| 125 | Settings · authorized dApps | shipped | — |
| 126 | Settings · connected dApps | bug / proposed — bug | — |
| 127 | Settings · connected dApps, none | gap / sheet — gap | — |
| 128 | Settings · networks | gap / sheet — gap | — |
| 129 | Settings · networks, confirm switch | gap / sheet — gap | — |
| 130 | Settings · networks, switching | gap / sheet — gap | — |
| 131 | Settings · networks, switch failed | gap / sheet — gap | — |

## Security & recovery

<sub>section `#allscreens` · 22 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 132 | Reveal recovery phrase | shipped | — |
| 133 | Recovery phrase · checking device | bug / proposed — blank frame | — |
| 134 | Recovery phrase · passcode | shipped — sheet | — |
| 135 | Recovery phrase · password | shipped — extension | — |
| 136 | Private key · acknowledge | shipped | — |
| 137 | Private key · revealed | shipped | — |
| 138 | Reveal secret · expired | bug / proposed — bug | — |
| 139 | Guardian keys · revealed | shipped | — |
| 140 | Settings · Keys | gap / sheet — sheet | — |
| 141 | Settings · change passcode | gap / sheet — gap | — |
| 142 | Settings · app lock | gap / sheet — gap | — |
| 143 | Settings · auto-lock | gap / sheet — gap | — |
| 144 | Guardian · rotate review | bug / proposed — specced, never built | — |
| 145 | Guardian · remove | gap / sheet — gap | — |
| 146 | Settings · reset wallet | gap / sheet — gap | — |
| 147 | Reset wallet · confirm | gap / sheet — gap | — |
| 148 | Encrypted file · unlock | gap / sheet — unrouted | — |
| 149 | Encrypted file · name and password | gap / sheet — unrouted | — |
| 150 | Encrypted file · exported | bug / proposed — auto-downloads | — |
| 151 | Settings · About | gap / sheet — gap | — |
| 152 | Account · rename | gap / sheet — gap | — |
| 153 | Account · delete | bug / proposed — no-op backend | — |

## dApp browser

<sub>section `#allscreens` · 11 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 154 | dApp browser | shipped | — |
| 155 | dApp launcher · no recents | gap / sheet — gap | — |
| 156 | dApp · active | bug / proposed — bug | — |
| 157 | dApp · load failed | shipped | — |
| 158 | dApp · switcher | bug / proposed — bug | — |
| 159 | dApp · peek tray | bug / proposed — bug | — |
| 160 | dApp · connect request | shipped | — |
| 161 | dApp · transaction request | bug / proposed — bug | — |
| 162 | dApp · claim note request | gap / sheet — gap | — |
| 163 | dApp · sign message | gap / sheet — gap | — |
| 164 | dApp · private data request | gap / sheet — gap | — |

## Global states

<sub>section `#allscreens` · 10 screens</sub>

| # | Screen | Status | Specifies |
|--:|---|---|---|
| 165 | Lock · probing hardware | gap / sheet — gap | — |
| 166 | Lock · passcode incorrect | bug / proposed — error | — |
| 167 | Lock · rate limited | bug / proposed — bug | — |
| 168 | Lock · resume re-auth | gap / sheet — gap | — |
| 169 | Activity · offline | gap / sheet — gap | — |
| 170 | Notifications · rationale | gap / sheet — gap | — |
| 171 | Camera · permission denied | gap / sheet — gap | — |
| 172 | Toast · link copied | gap / sheet — gap | — |
| 173 | Update required | gap / sheet — gap | — |
| 174 | Reset required | bug / proposed — bug | — |

---

## Reverse index — source file to screens

If one of these files changes, the screens beside it may no longer be true.

| Source | Screens that specify it |
|---|---|
