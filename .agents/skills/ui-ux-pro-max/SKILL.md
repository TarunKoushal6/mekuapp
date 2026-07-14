---
name: ui-ux-pro-max
description: "Awwwards-level UX/UI direction. Use when redesigning or polishing screens, picking layout/type/color combinations, or auditing for cheap AI defaults (Inter fonts, purple-on-white gradients, generic hero/nav/footer, meta-labels like 'SECTION 01'). Enforces distinctive typography, gapless bento grids, wide cinematic heros, and premium motion. Source: nextlevelbuilder/ui-ux-pro-max-skill."
---

# UI/UX Pro Max — Distilled

Reference core of the UI/UX Pro Max skill, adapted for Lovable (React + Vite + Tailwind + framer-motion, no Python/CLI runtime).

## The reject list (never ship these)

- Default fonts: **Inter, Poppins, Roboto**. Use Satoshi, Cabinet Grotesk, Outfit, Geist, Sora, DM Serif, Instrument Serif, or existing project fonts.
- Purple / indigo gradients on white as the whole aesthetic. A palette is a commitment, not a fallback.
- Generic hero (H1 + subhead + two CTAs centered on gradient blob).
- Meta labels: "SECTION 01", "QUESTION 05", "ABOUT US" — delete them.
- Invisible button text (light-on-light, dark-on-dark).
- Bento grids with empty cells. Always use `grid-auto-flow: dense` and verify col-span/row-span interlock.
- H1 wrapping to 4+ lines. Widen the container (`max-w-5xl`/`max-w-6xl`) and use `clamp(3rem, 5vw, 5.5rem)`.
- Horizontal scrollbar leaks — wrap page in `overflow-x-hidden w-full max-w-full`.

## AIDA page structure

Every marketing / landing surface:

1. **Attention (Hero)** — cinematic, wide, 2–3 line H1 max.
2. **Interest (Features / Bento)** — dense grid, mathematically perfect.
3. **Desire (Scroll-driven media)** — pinned sections, text-reveals, parallax.
4. **Action (Footer / CTA)** — high-contrast, unambiguous next step.

Section spacing: `py-24 md:py-40`. Sections should feel like distinct chapters, not stacked cards.

## Hero rules

- Container: `max-w-5xl` or `max-w-6xl`, centered or offset. Never narrow.
- H1: 2–3 lines maximum. Font size `clamp(3rem, 5vw, 5.5rem)`.
- Two CTAs max, with correct contrast.
- Layout options (pick one, don't blend):
  - **Cinematic Center** — massive centered text over a full-bleed image with radial dark wash.
  - **Artistic Asymmetry** — text offset left, image overlapping from bottom right.
  - **Editorial Split** — text left, image right, generous negative space.

## Component arsenal

Reach for these before defaulting to "card grid":

- Inline typography images — small pill-shaped images embedded inside massive headings.
- Horizontal accordions that expand on hover.
- Infinite marquee of brand logos or oversized type.
- Overlapping portrait testimonial carousel.
- Bento with mixed spans, `grid-flow-dense`.

## Motion register

Use framer-motion (already installed). Reserve heavy scroll-pinning / scrubbing for a single hero moment per page — not every section. Every interactive element must have a hover/press state; static UI is a failure. Respect `prefers-reduced-motion`.

## Pre-flight checklist (run mentally before writing UI)

1. Which layout archetype am I using, and is it distinct from the last screen I built?
2. Is the H1 guaranteed to flow in ≤3 lines at the chosen `max-w`?
3. Does every bento cell resolve without empty voids?
4. No meta-labels, no invisible buttons, no purple-on-white default gradient.
5. Motion has purpose and matches the component's personality.
6. Page wrapper has `overflow-x-hidden`.

Only after these are satisfied do you write component code.
