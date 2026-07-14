---
name: taste
description: "Elite editorial taste and craft direction for premium interfaces. Use when the request calls for 'make it feel more premium', 'add taste', brand identity work, aesthetic refinement, or Awwwards-quality craft. Complements ui-ux-pro-max with a stronger emphasis on restraint, editorial typography, and asset curation. Source: Leonxlnx/taste-skill (gpt-taste)."
---

# Taste — Distilled

Rules for interfaces that read as *crafted*, not *assembled*.

## Restraint over ornament

- Fewer, better cards. 3–5 intentional bento cells beat 8 messy ones.
- One hero moment per screen. Not every section deserves scroll-pin choreography.
- One accent color, used sparingly. Bold accents outperform timid palettes spread evenly.
- Delete before you add. If a section doesn't earn its space, cut it.

## Editorial typography

- Pair a distinctive display face (Instrument Serif, Cabinet Grotesk, Satoshi, DM Serif, Editorial New) with a refined body (Inter Tight, Geist, Manrope, Work Sans).
- Size-specific tracking: display `-0.02em` to `-0.035em`, body near `0`, captions `+0.01em`.
- Line-height inversely tracks size: display `1.02–1.08`, body `1.5–1.6`.
- Weight for hierarchy before size. A 16px Semibold outweighs a 20px Regular.

## Asset discipline

- Use `https://picsum.photos/seed/{keyword}/1920/1080` with keywords that match the vibe.
- Apply CSS filters so photos don't read as stock: `grayscale`, `mix-blend-luminosity`, `contrast-125`, `opacity-90`.
- Backgrounds: deep radial blurs, grainy mesh gradients, subtle noise. Never a flat single color as the whole background.

## Micro-craft checklist

- Tabular-nums on all numeric UI (counters, prices, timestamps).
- Hairlines at `1px` with `hsl(var(--border))`, never `border-gray-200`.
- Corners: pick one radius family and stick to it (10 / 14 / 18 / 24 / 999).
- Shadows are directional (softer at top, denser at bottom); never a symmetric drop shadow.
- Focus rings visible in both themes; never `outline: none` without a replacement.
- Never mix icon families. One stroke width, one grid.

## When to break a rule

Rules exist to prevent generic output. Break them when the break is *intentional* and *earns attention*. A single oversized number in a dense dashboard reads as taste; a random oversized number in a marketing page reads as noise.

## Anti-patterns (immediate rewrite)

- Purple → indigo gradient as the primary aesthetic on white.
- "Modern minimal" claim while shipping Inter + rounded-2xl cards on gray-50.
- Emoji in production UI unless the product's voice is playful and consistent.
- Toast for confirmation of a trivial action (saved a draft, toggled a switch).
- Skeleton shape that doesn't match the loaded content's silhouette.
