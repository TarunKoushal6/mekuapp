# MEKU Flagship Redesign — 10 Phase Plan

Applying **ui-ux-pro-max** (layout/type discipline, reject list), **taste** (editorial craft, restraint), and **transitions-dev** (21 portable CSS motion snippets) across every phase. Branding (logo, mascot, purple identity, wordmark) preserved throughout.

Reference bar: X (density), Apple (physics), Linear (keyboard-grade speed), Arc (delight).

---

## Phase 1 — Foundations (tokens + motion primitives)

- ✅ Spacing (`--s1..s8`), radii (`--r1..r-pill`), elevation (`--shadow-1/2/3`) tokens
- ✅ Motion primitives lib (`src/lib/motion.ts`) — `springUI`, `springMomentum`, `springSheet`, `easeOutStrong`, `easeEmphasized`, `fadeUp`, `scaleIn`
- ✅ Global `MotionConfig` with `reducedMotion="user"`
- ✅ **Transitions.dev** `_root.css` installed at `src/styles/transitions.css` — all 21 transitions ready via `t-*` classes
- ✅ **Taste** type ramp with size-specific tracking + `.num` tabular-nums helper + `.t-micro` scale
- ✅ **Pro Max** reject list codified in skill (no Inter, no purple-on-white default)

## Phase 2 — Navigation & chrome
- BottomNav: floating glass pill, active indicator via `layoutId`, safe-area
- TopBar / ScreenHeader: unified heights, scroll-edge blur mask
- SideMenu: spring open, hover surface lift
- **Transitions**: `t-page-side-by-side` for route pushes
- **Taste**: single icon family, one stroke width, hairline dividers
- **Pro Max**: overflow-x-hidden guard on shell

## Phase 3 — Feed & Post Card
- FeedCard: X-density baseline, hover 4% surface tint
- ActionButton: spring press, equal slots 320–430px
- **Transitions**: `t-number-pop-in` on counters, `t-icon-swap` for like/save state, `t-skeleton-reveal` on load
- **Taste**: tabular-nums on all counts, single 18px radius family for media
- **Pro Max**: no meta-labels, no invisible buttons

## Phase 4 — Composer & Create flow
- Full-height sheet on mobile, drag-to-dismiss with rubber-banding
- Character counter as ring meter
- Send button: color+scale, never animate on keypress
- **Transitions**: `t-modal` for sheet, `t-plus-menu-morph` on FAB → composer
- **Taste**: one hero moment (the composer surface), everything else recedes
- **Pro Max**: focus-in autofocus, keyboard-safe footer

## Phase 5 — Auth, Onboarding, Intro
- Intro: cinematic hero using mascot as the anchor
- Auth: split editorial layout, oversized wordmark
- **Transitions**: `t-texts-reveal` on hero copy, `t-success-check` on auth success
- **Taste**: editorial type pairing, radial mesh background (no flat purple)
- **Pro Max**: 2-line H1 max, `max-w-5xl`, AIDA on intro

## Phase 6 — Profile
- Hero avatar with scroll parallax
- Tabs: Posts / Media / Likes with springing underline
- **Transitions**: `t-tabs-sliding` for tab switch, `t-card-tilt` on media cards
- **Taste**: 3–5 stat cards max, one accent (verified badge)
- **Pro Max**: bento with `grid-flow-dense` for media grid

## Phase 7 — Wallet & Onchain
- Token rows: tabular-nums, swipe-actions
- TokenDetailSheet spring-in
- Sparkline micro-charts
- **Transitions**: `t-panel-reveal` for detail sheet, `t-number-pop-in` on balances
- **Taste**: hairlines only, no card shadows on rows
- **Pro Max**: no purple gradient on balance — use the actual token colors

## Phase 8 — Messages (Inbox, Chat, NewMessage)
- Bubbles with tail, typing indicator with pulse
- Row press = 96% scale
- **Transitions**: `t-page-side-by-side` for inbox↔chat, `t-shimmer-text` on typing status, `t-avatar-group-hover` on inbox rows
- **Taste**: message time in `.t-micro`, tabular
- **Pro Max**: unread dot color-only in reduced motion

## Phase 9 — Micro-interactions & feedback surfaces
- Toasts: slide+fade from top with spring, stack ≤3, swipe to dismiss
- Dropdowns/popovers: `transform-origin` anchored to trigger
- **Transitions**: `t-tooltip`, `t-menu-dropdown`, `t-modal`, `t-error-state-shake`, `t-accordion`
- **Taste**: no toast for trivial confirmations
- **Pro Max**: every popover has a purpose, no decorative overlays

## Phase 10 — QA, a11y & polish pass
- Full `prefers-reduced-motion` + `prefers-reduced-transparency` + `prefers-contrast` audit
- Focus rings visible in both themes
- Frame-by-frame review of top 10 transitions on real device
- Icon audit: single family, one stroke width
- Copy sweep: kill meta-labels, tighten CTA verbs
- Type contrast check WCAG AA

---

## Ground rules (apply every phase)

- Semantic tokens only — no hex in components
- Every animation obeys `prefers-reduced-motion`
- Purple 243 hue primary and mascot/logo assets untouched
- Every phase leaves the app shippable

## Progress
- [x] Phase 1 — Foundations
- [x] Phase 2 — Navigation
- [x] Phase 3 — Feed
- [ ] Phase 4 — Composer
- [ ] Phase 5 — Auth/Intro
- [ ] Phase 6 — Profile
- [ ] Phase 7 — Wallet
- [ ] Phase 8 — Messages
- [ ] Phase 9 — Micro-interactions
- [ ] Phase 10 — QA polish
