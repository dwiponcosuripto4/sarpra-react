---
name: Institutional Modernity
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#43474e'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#74777f'
  outline-variant: '#c4c6cf'
  surface-tint: '#455f87'
  primary: '#022448'
  on-primary: '#ffffff'
  primary-container: '#1e3a5f'
  on-primary-container: '#8aa4cf'
  inverse-primary: '#adc8f5'
  secondary: '#515f74'
  on-secondary: '#ffffff'
  secondary-container: '#d5e3fc'
  on-secondary-container: '#57657a'
  tertiary: '#002a1a'
  on-tertiary: '#ffffff'
  tertiary-container: '#00422c'
  on-tertiary-container: '#3fb687'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d5e3ff'
  primary-fixed-dim: '#adc8f5'
  on-primary-fixed: '#001c3b'
  on-primary-fixed-variant: '#2d486d'
  secondary-fixed: '#d5e3fc'
  secondary-fixed-dim: '#b9c7df'
  on-secondary-fixed: '#0d1c2e'
  on-secondary-fixed-variant: '#3a485b'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.015em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: -0.01em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-lg: 1rem
  space-xl: 1.5rem
  space-2xl: 2rem
  space-3xl: 3rem
---

## Brand & Style

This design system establishes an authoritative, reliable, and frictionless enterprise administrative platform tailored for facility and infrastructure asset management (Sarana & Prasarana).

### Target Audience & Persona
- Public sector administrators, asset custodians, procurement directors, and maintenance supervisors who require high information density, immediate clarity, and zero cognitive friction during complex administrative workflows.

### Emotional Atmosphere
- **Institutional Confidence:** Authoritative, robust, and rigorously organized.
- **Modern Governance:** Transparent, accountable, clean, and entirely devoid of legacy bureaucracy aesthetic.
- **Operational Calm:** Muted structural tones with targeted visual indicators to prevent cognitive fatigue during extended operational usage.

### Design Movement
**Modern Institutional Minimalism** hybridized with **Precision Data Architecture**:
- Crisp, hyper-aligned grid systems.
- Subdued surface tiers coupled with whisper-soft slate borders (#E2E8F0).
- Restrained visual hierarchy prioritizing typographic clarity, structured metadata, and context-driven status cues.

## Colors

The palette balances institutional gravitas with high-legibility operational indicators.

### Key Tokens & Functional Roles
- **Primary (`#1E3A5F` - Deep Institutional Navy):** Represents core authority and administrative governance. Applied to primary navigational rails, master action buttons, key active states, and dominant brand anchor points.
- **Secondary (`#475569` - Slate):** Supporting operational tone for secondary actions, standard system iconography, column labels, and metadata groupings.
- **Tertiary (`#059669` - Subtle Emerald):** Purpose-built for operational vitality, asset health confirmations, active allocation badges, and successful audit lifecycles.
- **Neutral (`#0F172A` - Slate Black):** Foundation for all typographic hierarchy, high-contrast headings, and high-readability telemetry.
- **Critical Alert / Danger (`#DC2626`):** Dedicated to audit discrepancies, asset write-offs, validation errors, and strict system overrides.
- **Surfaces & Canvases:**
  - Base App Canvas: `#F8FAFC` (Slate 50)
  - Card & Container Surface: `#FFFFFF` (Pure White)
  - Border & Partition Trim: `#E2E8F0` (Slate 200)
  - Subtle Fill/Input Background: `#F1F5F9` (Slate 100)

## Typography

The type system is powered by **Plus Jakarta Sans**, offering geometric precision paired with open, highly legible counters. This balances institutional rigidity with a contemporary human touch.

### Application Rules
- **Display & Headings:** Use tight letter-spacing (`-0.01em` to `-0.02em`) on headline ranks to prevent visual drift on wide monitors.
- **Data & Serial Identifiers:** Asset codes, serial tags, inventory IDs, and fiscal balances must deploy `data-mono` using **JetBrains Mono** to guarantee tabular numerical alignment.
- **Form Labels:** Employ `label-sm` with slight positive tracking (`0.02em`) and semi-bold weight for instantaneous scanning across high-density asset intake sheets.

## Layout & Spacing

The structural layout relies on an anchor-and-canvas paradigm designed to handle multi-pane administrative panels and complex asset inventories.

### Layout Model
- **Admin Shell:** Fixed persistent 260px left navigation bar for primary module switching, collapsible to 64px iconography mode on smaller desktop viewports.
- **Main Workspace Canvas:** Fluid 12-column structural grid with 1.5rem (`gutter`) column separation and 2rem (`margin`) exterior boundaries.
- **Responsive Adaptations:**
  - **Desktop (≥1280px):** Full 12-column layout, multi-column forms (2–3 columns), split-view panels for asset inspection.
  - **Tablet (768px – 1279px):** 8-column layout, left rail collapses to an auto-drawer, secondary analytical panels convert to tabbed overlays.
  - **Mobile (<768px):** 4-column layout with 0.75rem gutters and 1rem canvas margins. Multi-column forms strictly reflow to single-column stacking.

## Elevation & Depth

This design system avoids excessive skeuomorphic shadows or distracting blurs, leaning instead into **architectural tonal layering** and **tactile structural outlines**.

### Depth Hierarchy
- **Level 0 (Canvas Base):** Flat `#F8FAFC`. Zero elevation. Provides the cool, glare-free baseline for extended work sessions.
- **Level 1 (Card & Module Surface):** Solid `#FFFFFF` enclosed by a 1px uniform perimeter of `#E2E8F0`. Layered with an ultra-subtle ambient drop shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Level 2 (Dropdowns, Popovers, & Quick Actions):** Suspended white panels with enhanced crispness: `0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`, bordered by `#CBD5E1`.
- **Level 3 (Modal Dialogs & Asset Review Drawers):** High-priority focus state over a semi-transparent scrim (`rgba(15, 23, 42, 0.45)` with 4px backdrop blur). Elevated using `0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.06)`.

## Shapes

The interface embraces a **Soft (Level 1)** geometric standard. This geometry conveys deliberate engineering, administrative rigor, and institutional stability without feeling outdated or abrasive.

### Application Standards
- **Base Components (Inputs, Buttons, Badges):** 0.25rem (`4px`) corner radius.
- **Containers (Cards, Modal Windows, Data Tables):** 0.5rem (`8px`) corner radius via `rounded-lg`.
- **Complex Floating Panels & Overlays:** 0.75rem (`12px`) corner radius via `rounded-xl`.
- **Status Pills & Count Badges:** Strictly reserved 9999px pill rounding for functional metadata tags only.

## Components

### Buttons
- **Primary Action:** Solid `#1E3A5F` background, `#FFFFFF` text, `4px` corner radius, `0.5rem 1rem` padding. Subtle brightness boost (`#2A4E7F`) on hover with a 150ms cubic-bezier transition.
- **Secondary Action:** Outlined `#E2E8F0` with `#FFFFFF` background and `#475569` text. Hover shifts background to `#F1F5F9` and text to `#1E3A5F`.
- **Destructive Action:** `#DC2626` background with white text for permanent asset deletions or decommission signatures.

### Input Fields & Search Bars
- **Container:** Height `40px`, border `1px solid #E2E8F0`, background `#FFFFFF`, text `#0F172A`, placeholder `#94A3B8`.
- **Affordance & Icons:** Left-aligned contextual icons (e.g., search magnifier, barcode, calendar) sized at 18px in `#64748B`.
- **Focus Micro-interaction:** Transition border color to `#1E3A5F` along with an institutional focus ring: `0 0 0 3px rgba(30, 58, 95, 0.12)`.
- **Error State:** Border shifts to `#DC2626` accompanied by an inline warning indicator and helper text in `data-mono` styling.

### Badges & Operational Chips
- **Asset Status Indicators:** Compact badge layout with 6px circular indicator dot.
  - *Active / Ready:* Emerald-tinted background (`#ECFDF5`), emerald text (`#047857`), emerald dot (`#059669`).
  - *Under Maintenance:* Amber-tinted background (`#FFFBEB`), amber text (`#B45309`), amber dot (`#D97706`).
  - *Decommissioned / Alert:* Red-tinted background (`#FEF2F2`), red text (`#B91C1C`), red dot (`#DC2626`).

### Data Tables (Sarpras Inventory Grid)
- **Header:** Sticky `#F8FAFC` top strip with 1px border-bottom (`#CBD5E1`), typography using `label-sm` in `#475569`, tracking `0.02em`.
- **Rows:** Alternating subtle row hover (`#F8FAFC`). Row height set to a compact 48px to accommodate dense serial number reading.
- **Selection:** Checkbox selection turns the entire row outline to a left-accented `#1E3A5F` 2px border segment.

### Cards & Container Panels
- White background (`#FFFFFF`), enclosed by a fine 1px slate border (`#E2E8F0`), padded with `1.5rem`.
- Distinct header band dividing title metadata from operational telemetry via a hairline border.