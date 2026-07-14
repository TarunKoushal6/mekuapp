---
name: transitions-dev
description: "Production-ready CSS transitions for web apps. Use when adding notification badges, dropdowns, modals, panel reveals, page slides, card resizes, number pop-ins, text/icon swaps, success checks, avatar group hovers, error shakes, input clears, skeleton reveals, shimmer text, sliding tabs, tooltips, staggered text reveals, 3D card tilts, plus-to-menu morphs, or accordions. Every snippet is portable CSS namespaced under `t-*` with semantic custom properties and a `prefers-reduced-motion` guard. Source: Jakubantalik/transitions.dev."
---

# Transitions.dev — Distilled

Twenty-one portable CSS transitions. Copy the snippet, wire the HTML/JSX hooks, done. No framework dep. Install the root tokens once (see `_root.css`), then reach for a transition by matching the visible element first, then the verb.

## Decision rules

- **Small dot floating on top of a trigger** → notification badge
- **Surface grows from its trigger** → menu dropdown (anchored) or modal (centered, unanchored)
- **Surface slides into a region** → panel reveal
- **Two screens, list↔detail or step1↔step2** → page side-by-side
- **Element width/height changes** → card resize
- **In-place text content change** → text states swap
- **Two icons in one slot** → icon swap
- **Number updates** → number pop-in
- **Confirmation / done moment** → success check (pair with icon swap if replacing a spinner)
- **Hovering an item in a horizontal stack** → avatar group hover (distance-falloff lift)
- **Form validation error** → error state shake (auto-revert border + message)
- **Clearing a text field** → input clear with dissolve
- **Placeholder → real content** → skeleton loader and reveal
- **Loading / streaming label that should feel alive** → shimmer text
- **Segmented control / view switcher** → tabs sliding
- **Hover/focus hint over a trigger** → tooltip
- **Stacked headline + supporting line entering** → texts reveal
- **Card that reacts in 3D to the pointer** → card hover tilt
- **Circular trigger that becomes the surface it opens** → plus-to-menu morph
- **Collapsible header + body** → accordion expand (grid-rows technique)

If two fit, prefer the lower-overhead one (card resize > panel reveal, dropdown > modal).

## Install

1. Paste `_root.css` (bundled here) into the app's global stylesheet **once**. It sets `--t-ease-*`, `--t-dur-*`, and the `prefers-reduced-motion` guard.
2. Apply the specific transition by adding its `t-*` class to the element (e.g. `t-menu-dropdown`, `t-modal`, `t-accordion`).
3. Wire the state toggles the snippet documents (usually a `data-open`, `data-state`, or `aria-expanded` attribute).

## Rules that make these feel right

- Never animate `width`/`height` directly if you can help it — use `transform: scale()` + `content-visibility` or the grid-rows trick for accordions.
- Origin matters: dropdowns/tooltips must set `transform-origin` to the trigger edge, not `center`.
- Enter is `ease-out` (fast in, gentle settle). Exit is either the same curve or a snappier `ease-in-out-strong`. Never `ease-in` on enter — it delays the moment users watch.
- Sub-300ms for UI. Longer only for celebratory (success check) or deliberate (modal open) moments.
- Reduced motion: drop transform/blur, keep opacity + color. The guard in `_root.css` handles this globally.

## Reference

Full per-transition docs live at https://transitions.dev/ and in the source repo `skills/transitions-dev/`. This skill body carries the decision rules; consult the site when you need the exact snippet for a specific transition.
