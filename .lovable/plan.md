# MEKU Flagship Redesign — Phased Plan

Redesigning every screen in one shot produces regressions, not polish. This plan splits the work into 6 self-contained phases you can approve one at a time. Each phase leaves the app shippable. Branding (logo, mascot, purple identity, wordmark) is preserved throughout — only spacing, hierarchy, motion, and micro-interactions change.

Reference bar: X (density + typographic clarity), Apple (spring physics + materials), Linear (keyboard-grade responsiveness), Arc (soft edges + delight moments).

---

## Phase 1 — Foundations (design tokens + motion primitives)

Where every later phase draws from. No visible screen changes yet, but every screen inherits.

- Consolidate spacing scale (4/8/12/16/20/24/32) and radii (10/14/18/24/999) as CSS vars.
- Type ramp with size-specific tracking (tight on display, `~0` on body, `+0.01em` on captions).
- Motion tokens: `--spring-ui` (bounce 0, duration 0.32s), `--spring-momentum` (bounce 0.18, 0.34s), `--ease-out-strong`, `--ease-emphasized`. Duration scale already exists; align it.
- `Motion` (framer-motion) `MotionConfig` wrapper honoring `prefers-reduced-motion` globally.
- Elevation tokens: `--shadow-1/2/3` + `--shadow-purple` (already present) — rationalized.
- Icon audit: normalize stroke width to 1.75, corner radius, grid.

## Phase 2 — Navigation & Chrome

- `BottomNav`: floating glass pill, active indicator morphs with `layoutId`, haptic on tab change, 44dp targets, safe-area aware.
- `TopBar` / `ScreenHeader`: unify heights, add scroll-edge blur mask (no hard divider), sticky title crossfade on scroll.
- `SideMenu`: sheet with spring open/close, item hover = subtle surface lift.
- Global page transitions: shared-axis fade+slide via `PageTransition`, interruptible.

## Phase 3 — Feed & Post Card (highest-frequency surface)

- `FeedCard`: tighten to X-density baseline, verified name-line alignment, hover row = 4% surface tint.
- `ActionButton` (already unified) → add spring press, count blur-crossfade already in place; ensure equal slots on 320–430px widths.
- Image media: 16px radius, hairline border, tap-to-expand with shared-element transition.
- Skeletons: shimmer-stagger already present; align shapes to real card metrics exactly (avoid layout shift on load).
- Empty state: mascot + one-line copy + primary CTA.

## Phase 4 — Composer & Create flow

- `Create.tsx` + `ComposerSheet`: full-height sheet on mobile, drag-to-dismiss with rubber-banding, character counter as ring meter, media chips with spring insertion.
- Focus-in autofocus + keyboard-aware footer bar (no jump).
- Send button: disabled → enabled transition uses color + subtle scale, never fires animation on keypress.

## Phase 5 — Profile, Wallet, Messages

- `Profile`: hero avatar with parallax on scroll, tabs (Posts/Media/Likes) with underline that springs between items.
- `Wallet`: token rows with tabular-nums, swipe-actions, TokenDetailSheet spring-in, sparkline micro-charts.
- `Chat` / `Inbox`: bubbles with tail, typing indicator, list row press = 96% scale, unread dot pulse (reduced-motion aware).

## Phase 6 — Micro-interactions & polish pass

- Toast system: slide+fade from top with spring, stack of 3 max, swipe to dismiss.
- Dropdowns/popovers: `transform-origin` anchored to trigger (not center).
- Modals/sheets: dim scrim + push parent back (`scale(0.96)` + translateY).
- Bookmark/Like: already Uiverse ports — audit haptic + reduced-motion.
- Full accessibility sweep: focus rings, `prefers-reduced-transparency`, contrast in both themes.
- Frame-by-frame review of top 10 transitions on real device; fix any jank.

---

## Technical notes

- Stack stays: React 18 + Vite + Tailwind + framer-motion + shadcn/Radix. No new heavy deps.
- All colors continue to flow through semantic tokens in `src/index.css`. No hardcoded hex in components.
- Every animation obeys `prefers-reduced-motion` — reduce, don't remove.
- Purple primary (243 hue) and mascot/logo assets untouched.

---

## What I need from you

1. **Approve the phasing** or reorder (e.g. Feed first if that's your priority screen).
2. **Confirm start point** — I recommend Phase 1 + Phase 2 in the next turn (foundations + navigation) since every later phase depends on them.
3. **Any hard "don't touch" list** — screens or components you consider done.

I will not start implementing until you pick a phase to run.
