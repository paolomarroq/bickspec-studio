---
name: BickSpec IDE Dark
colors:
  surface: '#0e1513'
  surface-dim: '#0e1513'
  surface-bright: '#343b38'
  surface-container-lowest: '#090f0e'
  surface-container-low: '#161d1b'
  surface-container: '#1a211f'
  surface-container-high: '#252b29'
  surface-container-highest: '#2f3634'
  on-surface: '#dde4e0'
  on-surface-variant: '#bbcac4'
  inverse-surface: '#dde4e0'
  inverse-on-surface: '#2b3230'
  outline: '#85948f'
  outline-variant: '#3c4a46'
  surface-tint: '#50dcc1'
  primary: '#50dcc1'
  on-primary: '#00382f'
  primary-container: '#00b39a'
  on-primary-container: '#003e34'
  inverse-primary: '#006b5b'
  secondary: '#b7c7e5'
  on-secondary: '#213148'
  secondary-container: '#374860'
  on-secondary-container: '#a5b6d3'
  tertiary: '#b9c7df'
  on-tertiary: '#233144'
  tertiary-container: '#92a0b7'
  on-tertiary-container: '#29374a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#71f9dd'
  primary-fixed-dim: '#50dcc1'
  on-primary-fixed: '#00201a'
  on-primary-fixed-variant: '#005144'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#b7c7e5'
  on-secondary-fixed: '#0a1c32'
  on-secondary-fixed-variant: '#374860'
  tertiary-fixed: '#d5e3fc'
  tertiary-fixed-dim: '#b9c7df'
  on-tertiary-fixed: '#0d1c2e'
  on-tertiary-fixed-variant: '#3a485b'
  background: '#0e1513'
  on-background: '#dde4e0'
  surface-variant: '#2f3634'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Sora
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1'
    letterSpacing: 0.05em
  code-md:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  code-sm:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 12px
  margin-safe: 24px
---

## Brand & Style

This design system is engineered for the intersection of high finance and technical rigor. It conveys a sense of "Technical Precision," prioritizing clarity and long-session comfort for developers and financial engineers. The aesthetic follows a **Corporate / Modern** style with a focus on **Minimalism**, stripping away non-functional ornamentation to highlight the logic of the code and the hierarchy of the specification.

The brand persona is authoritative yet accessible—avoiding the intimidating "hacker" tropes of neon-on-black for a more sophisticated, "institutional-grade" atmosphere. It aims to evoke an emotional response of focus, reliability, and cognitive ease.

## Colors

The palette is anchored in a "Deep Navy" ecosystem, intentionally avoiding pure black (#000000) to reduce eye strain and allow for subtle layering through shadow and hue shifts. 

- **Primary Action:** Emerald Teal (#00B39A) is used exclusively for interactive elements, focus states, and primary success indicators. It is the "source of truth" in the UI.
- **Surface Strategy:** Depth is built using incremental shifts in lightness from the base navy. Sidebars use the base #0B1D33, while the main editor uses #14253D to pull the user's focus forward.
- **Text Contrast:** Headings use "Off White" to pierce the dark background, while primary content uses "Mist Silver" to maintain a softer, high-readability contrast ratio that exceeds WCAG AAA standards for long-form reading.

## Typography

This design system employs a dual-font strategy. **Sora** handles all interface elements (menus, buttons, settings), providing a modern, geometric clarity that feels contemporary and tech-forward. **IBM Plex Mono** is reserved strictly for the code editor and terminal, chosen for its exceptional legibility in financial contexts where distinguishing between `0` and `O` or `1` and `l` is critical.

- **Scale:** Larger display sizes are used sparingly for splash screens or major dashboard headings. 
- **Hierarchy:** Most of the IDE operates at the `body-md` (14px) and `label-md` (12px) levels to maximize information density without sacrificing clarity.
- **Letter Spacing:** Labels use a slight positive tracking to ensure readability at small sizes against dark backgrounds.

## Layout & Spacing

The layout is built on a **4px base grid**, ensuring mathematical precision in alignment. The IDE follows a **Flexible Panel Grid** model:
- **Left/Right Rails:** Fixed-width utility bars (activity bar) at 48px-64px.
- **Sidebars:** Collapsible panels with a minimum width of 240px.
- **Main Editor:** A fluid area that expands to occupy all remaining space.
- **Guttering:** 12px internal gutters separate panels to provide clear visual distinction without wasting screen real estate.

On mobile devices, sidebars are converted into full-width drawers, and the activity bar moves to a bottom navigation layout to maintain thumb-reachability.

## Elevation & Depth

To maintain a lightweight feel, this design system avoids heavy drop shadows. Instead, it utilizes **Tonal Layering** and **Low-Contrast Outlines**:

1.  **Level 0 (Base):** Deep Navy (#0B1D33) for the background behind panels and sidebars.
2.  **Level 1 (Surface):** The main editor and active panels (#14253D). These use a 1px solid border (#1E2E46) to define edges.
3.  **Level 2 (Floating):** Tooltips and context menus use a slightly lighter "Overlay" color (#1E2E46) with a very subtle, diffused shadow (0px 4px 20px rgba(0, 0, 0, 0.4)) and a thin Teal-tinted border to indicate interactivity.
4.  **Active State:** The active tab or focused input is highlighted with a 2px "Emerald Teal" underline or border-left, providing an unambiguous focal point.

## Shapes

The shape language is **Soft (0.25rem)**, leaning towards a more squared-off aesthetic to mirror the "Structured by Design" brand philosophy.

- **Standard Elements:** Buttons, input fields, and tags use a 4px (0.25rem) radius.
- **Container Elements:** Large panels and cards use an 8px (0.5rem) radius to feel slightly more approachable.
- **Circular Elements:** Only used for status indicators (online/offline) and user avatars to create a clear visual distinction from functional UI components.

## Components

- **Buttons:** 
  - *Primary:* Solid Emerald Teal with Off White text. No gradients.
  - *Secondary:* Ghost style with 1px Teal border and Mist Silver text.
  - *Icon:* Plain Mist Silver, turning Teal on hover with a subtle background highlight.
- **Input Fields:** Background uses #0B1D33 (darker than the surface) to create an "inset" feel. Border is #1E2E46, turning Teal on focus.
- **Tabs:** Square edges with a 2px bottom accent for active states. Inactive tabs use #94A3B8 (Secondary Text).
- **Chips/Tags:** Used for syntax errors or language versioning. They use high-transparency backgrounds (e.g., Teal at 10% opacity) with solid Teal text to keep the UI lightweight.
- **Scrollbars:** Slim, "charcoal" colored tracks with a subtle Mist Silver thumb that appears only on hover to minimize visual noise.
- **Lists:** Tree views (file explorer) use 8px of horizontal indent per level, with active files highlighted by a full-width background bar in #1E2E46 and Teal left-border.