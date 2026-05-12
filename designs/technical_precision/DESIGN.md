---
name: Technical Precision
colors:
  surface: '#f5faff'
  surface-dim: '#d4dbe2'
  surface-bright: '#f5faff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#edf4fb'
  surface-container: '#e8eff6'
  surface-container-high: '#e2e9f0'
  surface-container-highest: '#dce3ea'
  on-surface: '#151c21'
  on-surface-variant: '#44474d'
  inverse-surface: '#2a3137'
  inverse-on-surface: '#ebf2f9'
  outline: '#74777e'
  outline-variant: '#c4c6cd'
  surface-tint: '#4f5f78'
  primary: '#000206'
  on-primary: '#ffffff'
  primary-container: '#0b1d33'
  on-primary-container: '#7586a0'
  inverse-primary: '#b7c7e5'
  secondary: '#006b5b'
  on-secondary: '#ffffff'
  secondary-container: '#71f9dd'
  on-secondary-container: '#007261'
  tertiary: '#000205'
  on-tertiary: '#ffffff'
  tertiary-container: '#0c1d30'
  on-tertiary-container: '#75869d'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#b7c7e5'
  on-primary-fixed: '#0a1c32'
  on-primary-fixed-variant: '#374860'
  secondary-fixed: '#71f9dd'
  secondary-fixed-dim: '#50dcc1'
  on-secondary-fixed: '#00201a'
  on-secondary-fixed-variant: '#005144'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#f5faff'
  on-background: '#151c21'
  surface-variant: '#dce3ea'
typography:
  display-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-md:
    fontFamily: Sora
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  body-sm:
    fontFamily: Sora
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  code-md:
    fontFamily: IBM Plex Mono
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.6'
  label-caps:
    fontFamily: IBM Plex Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 48px
  gutter: 16px
  margin: 24px
---

## Brand & Style
The design system is engineered to evoke a sense of absolute reliability, technical rigor, and financial authority. It targets quantitative analysts and financial engineers who require a high-density environment that prioritizes focus over decoration.

The aesthetic follows a **Corporate Modern** approach with a modular, grid-based structure. It avoids transient trends, instead favoring a timeless, architectural clarity. Every element is intentional, utilizing subtle borders and systematic alignment to create an interface that feels like a professional-grade instrument.

## Colors
This design system utilizes a sophisticated, low-vibrancy palette to ensure long-term readability during complex engineering tasks.

- **Deep Navy:** Used for the primary navigational shell and structural hierarchy, providing a grounded, authoritative frame.
- **Emerald Teal:** Reserved exclusively for primary actions, active states, and successful execution indicators (e.g., "Run" buttons).
- **Steel Gray:** The workhorse for secondary text, supporting icons, and non-interactive UI elements.
- **Mist Silver:** Defines the boundaries of the workspace, used for borders and subtle background divisions.
- **Off White:** The foundational surface for the main workspace, designed to reduce eye strain compared to pure white.

## Typography
The typographic system creates a clear distinction between interface guidance and technical data. 

**Sora** handles all human-centric interface elements, providing a modern and highly legible experience for headings and body copy. **IBM Plex Mono** is employed for the core engineering experience: the code editor, data tables, and technical metadata. This distinction allows users to visually separate "application logic" from "system instructions" instantly.

## Layout & Spacing
The layout uses a **fluid-to-fixed hybrid grid**. Sidebars and utility panels maintain fixed widths (e.g., 280px) to ensure technical tools remain accessible, while the central editor/workspace scales fluidly to maximize data visibility.

A strict 4px baseline grid ensures vertical rhythm. Spacing is kept tight (MD-16px) to maintain the high information density required for IDE environments, ensuring that logic and data remain visible without excessive scrolling.

## Elevation & Depth
Depth in this design system is achieved through **low-contrast outlines** and **tonal layering** rather than heavy shadows.

1.  **Level 0 (Base):** Off White (#F7F9FB) workspace.
2.  **Level 1 (Panels):** Mist Silver (#DCE3EA) 1px borders define separate functional areas.
3.  **Level 2 (Modals/Popovers):** Surface-colored containers with a subtle, 8% opacity Steel Gray shadow (8px blur, 4px offset) to suggest a slight lift from the technical workspace.

This flat, layered approach prevents the UI from feeling "heavy" and ensures that the focus remains on the code and financial models.

## Shapes
The shape language is disciplined and geometric. A **Soft (0.25rem)** corner radius is applied to buttons and input fields to provide a touch of modern approachability without sacrificing the professional, "engineered" feel. 

Larger containers like cards or panels may use a slightly larger radius, but consistent 4px rounding is the standard for interactive components to maintain a crisp visual alignment across the dense grid.

## Components
- **Buttons:** Primary buttons use Emerald Teal with white Sora SemiBold text. Secondary buttons use a Mist Silver border with Deep Navy text.
- **Code Editor:** Utilizes IBM Plex Mono with a custom syntax highlighting theme based on the Deep Navy and Teal palette.
- **Tabs:** Industrial-style tabs with 1px borders. Active tabs are indicated by a 2px Emerald Teal bottom border.
- **Input Fields:** Crisp, 1px Steel Gray borders that transition to Emerald Teal on focus. Use IBM Plex Mono for technical inputs.
- **Cards:** Clean white backgrounds with Mist Silver outlines. Headers within cards should use Sora SemiBold in Deep Navy.
- **Status Indicators:** Small, circular dots using Emerald Teal (Success/Active) or neutral Steel Gray (Inactive).