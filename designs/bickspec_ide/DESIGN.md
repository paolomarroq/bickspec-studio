---
name: BickSpec IDE
colors:
  surface: '#0e1513'
  surface-dim: '#0e1513'
  surface-bright: '#343b39'
  surface-container-lowest: '#090f0e'
  surface-container-low: '#161d1b'
  surface-container: '#1a211f'
  surface-container-high: '#252b2a'
  surface-container-highest: '#2f3634'
  on-surface: '#dde4e1'
  on-surface-variant: '#bbcac6'
  inverse-surface: '#dde4e1'
  inverse-on-surface: '#2b3230'
  outline: '#859490'
  outline-variant: '#3c4947'
  surface-tint: '#4fdbc8'
  primary: '#4fdbc8'
  on-primary: '#003731'
  primary-container: '#14b8a6'
  on-primary-container: '#00423b'
  inverse-primary: '#006b5f'
  secondary: '#c0c7ce'
  on-secondary: '#2a3137'
  secondary-container: '#40484d'
  on-secondary-container: '#afb6bd'
  tertiary: '#ffb59e'
  on-tertiary: '#5e1800'
  tertiary-container: '#f38764'
  on-tertiary-container: '#6c2106'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#71f8e4'
  primary-fixed-dim: '#4fdbc8'
  on-primary-fixed: '#00201c'
  on-primary-fixed-variant: '#005048'
  secondary-fixed: '#dce3ea'
  secondary-fixed-dim: '#c0c7ce'
  on-secondary-fixed: '#151c21'
  on-secondary-fixed-variant: '#40484d'
  tertiary-fixed: '#ffdbd0'
  tertiary-fixed-dim: '#ffb59e'
  on-tertiary-fixed: '#3a0b00'
  on-tertiary-fixed-variant: '#7c2d11'
  background: '#0e1513'
  on-background: '#dde4e1'
  surface-variant: '#2f3634'
typography:
  h1:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.02em
  h2:
    fontFamily: Sora
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Sora
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.05em
  code-lg:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-md:
    fontFamily: IBM Plex Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-sm:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '450'
    lineHeight: 18px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  panel-gutter: 1px
---

## Brand & Style

This design system is engineered for the high-stakes environment of financial specification. The brand personality is rigorous, authoritative, and highly structured, emphasizing precision over decoration. It targets financial engineers and technical analysts who require a low-fatigue, high-density environment for complex logic drafting.

The visual style is **Minimalist-Technical**. It utilizes a strict structural grid and sharp edges to evoke a sense of architectural stability. There are no gradients or soft shadows; depth is communicated through tonal layering and hair-line borders. The "Spec Grid" identity is maintained through consistent 1px alignment and a focus on monospaced data visualization.

## Colors

The palette is anchored in deep midnight blues to minimize ocular strain during long-form technical work. 

- **Foundational Layers:** The interface moves from `#07111F` (Main Background) to `#0B132B` (Surface) for sidebars and tool windows, peaking at `#111C2E` for modals or active floating panels.
- **Accents:** Teal (`#14B8A6`) is used sparingly for primary actions and active states, doubling as the success indicator to maintain a streamlined color profile.
- **Data Status:** Standard financial alerts use high-visibility Amber (`#F59E0B`) and Red (`#EF4444`) to ensure critical logic errors are immediately distinguishable from the UI chrome.

## Typography

This design system employs a dual-typeface strategy to separate the interface from the content.

- **UI Language:** Sora is used for all navigational elements, buttons, and headers. Its geometric clarity provides a modern, high-tech feel that remains legible at small sizes.
- **Technical Language:** IBM Plex Mono is the workhorse for the IDE's core. It is used for code editing, terminal output, and data tables. The monospaced nature ensures that financial columns and nested logic align perfectly.
- **Information Hierarchy:** Use `label-caps` for panel headers and metadata categories to create a clear visual distinction between labels and dynamic values.

## Layout & Spacing

The layout follows a **Fixed-Panel Grid** system typical of professional IDEs. The screen is divided into functional regions (Sidebar, Editor, Inspector, Console) separated by 1px dividers rather than margins.

- **Density:** Space is optimized for desktop usage. Gaps between elements are tight (8px-16px) to maximize the visible lines of code and data.
- **Vertical Rhythm:** A 4px baseline grid governs all padding and margins to maintain alignment between monospaced text and UI components.
- **Responsiveness:** While desktop-first, the layout uses collapsible sidebars. On smaller viewports, the Inspector and Console panels should prioritize stacking vertically to preserve the horizontal width of the primary Code Editor.

## Elevation & Depth

Depth in this design system is achieved through **Tonal Layering** and **Sharp Containment**.

- **Z-Axis Hierarchy:** The background (`#07111F`) is the furthest layer. Surfaces (`#0B132B`) represent secondary functional areas. Elevated panels (`#111C2E`) are used for active states, context menus, and tooltips.
- **Borders:** Every panel is defined by a 1px border (`#1E293B`). This "Spec Grid" approach ensures structural clarity without the need for shadows.
- **Interaction:** Hover states do not use shadows; instead, they utilize a subtle shift in background color (e.g., from Surface to Elevated) or a border color change to the primary accent.

## Shapes

The shape language is strictly **Sharp (0px)**. 

Every UI component—including buttons, input fields, tabs, and panels—features 90-degree corners. This reinforces the "engineering-focused" aesthetic and allows components to sit flush against one another, maximizing the use of screen real estate and maintaining the integrity of the grid.

## Components

- **Buttons:** Primary buttons use a solid `#14B8A6` background with `#07111F` text. Secondary buttons use a `#1E293B` border with `#F8FAFC` text. All buttons have 0px corner radius.
- **Code Editor:** The editor background is `#07111F`. Line numbers and gutter icons use `#94A3B8`. The active line is highlighted with a subtle `#111C2E` background.
- **Tabs:** Active tabs use a 2px top border of `#14B8A6` and a background of `#0B132B`. Inactive tabs remain flat against the surface.
- **Input Fields:** Background matches the parent panel but uses a `#1E293B` border. Focus state is indicated by a `#14B8A6` border. Use IBM Plex Mono for all numeric financial inputs.
- **Chips/Status:** Status chips use a subtle background tint of their respective status color (at 10% opacity) with a solid 1px border of the same color.
- **Lists/Trees:** For file explorers or symbol trees, use `#14B8A6` for selected item text and a subtle `#111C2E` background for the entire row.