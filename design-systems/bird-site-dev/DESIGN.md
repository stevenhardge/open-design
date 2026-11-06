# Bird Site Dev

> Category: Themed & Unique
> Dark research briefing dashboard for civic advocacy. Spacious layout, layered near-black surfaces, single cyan accent, and editorial typography that balances readability with data precision.

## 1. Visual Theme & Atmosphere

A single-theme dark-only research briefing interface designed for policy research and civic advocacy. The visual language communicates authority, clarity, and investigative rigor through generous whitespace and restrained color.

- **Visual style:** editorial research briefing, dark dashboard, spacious and readable
- **Color stance:** dark-only, no light mode — single cyan (`#06b6d4`) accent against layered near-black surfaces
- **Design intent:** Prioritize readability over density. The layout is spacious with generous vertical rhythm. Content sections flow on the page background without card containers — separation comes from spacing and typography hierarchy, not borders. Monospace typography signals "data/metadata" while sans-serif signals "narrative." The only chromatic accent is cyan; status uses subtle tinted badges.

## 2. Color

### Core Palette

- **Page Background:** `#070d14` (hsl 214, 32%, 5%) — deepest surface, main content area
- **Sidebar Background:** `#111723` (hsl 216, 28%, 10%) — slightly lighter than page, creates separation
- **Elevated Surface:** `#1a2233` (hsl 215, 27%, 16%) — used for subtle section differentiation, table header rows, code blocks
- **Primary Accent:** `#06b6d4` (cyan-500) — the single chromatic accent: CTAs, active nav indicator, links, numbered markers, focus rings
- **Primary on dark:** `#070d14` — text on cyan-filled buttons
- **Default Text:** `#e2e8f0` — headings, primary content (high contrast white)
- **Body Text:** `#94a3b8` — paragraph text, descriptions (light gray, slightly muted)
- **Muted Text:** `#64748b` — secondary labels, sidebar inactive items, overlines
- **Border:** `#243044` — subtle borders on cards, table dividers, sidebar section lines
- **Destructive:** `#ef4444` — error and danger states only

### Surface Scale

| Token | Hex | Usage |
|---|---|---|
| `surface-900` | `#0a0e14` | Outermost page shell, alternating section background |
| `surface-800` | `#111723` | Sidebar, content cards on inner pages, mobile header |
| `surface-700` | `#1a2233` | Table header rows, elevated callout blocks, code blocks |
| `surface-600` | `#243044` | Borders, dividers, thin separators |

### Semantic Status Colors

Status badges use a tinted-glass pattern: `bg-{color}-500/20 text-{color}-400 border-{color}-500/30`.

| Status | Color | Example |
|---|---|---|
| Confirmed / verified / positive | Emerald | `bg-emerald-500/20 text-emerald-400` |
| Estimated / warning / likely | Amber | `bg-amber-500/20 text-amber-400` |
| Unknown / unverified | Gray | `bg-gray-500/20 text-gray-400` |
| Negative / cancelled / opponent | Red | `bg-red-500/20 text-red-400` |
| Informational / under review | Blue | `bg-blue-500/20 text-blue-400` |
| Legal | Purple | `bg-purple-500/20 text-purple-400` |

### Usage Rules

- Cyan (`#06b6d4`) is the ONLY chromatic accent on surfaces. It appears on: CTA buttons (filled), active nav indicator (left border bar), links, numbered step markers, focus outlines, source citation markers.
- Surface scale provides depth. Content sections on the homepage sit directly on the page background (`surface-900`) — they do NOT have card borders or backgrounds.
- Inner pages (data tables, detailed views) may use `surface-800` card containers with `surface-600` borders.
- Status colors appear only in compact badges, never as large surface fills.

## 3. Typography

### Font Families

- **Sans (body/UI):** `"Inter", system-ui, sans-serif` — all headings, body text, navigation, buttons
- **Mono (data/metadata):** `"JetBrains Mono", "Fira Code", monospace` — overline labels, numerical data in tables (dollar amounts, counts), dates, section counters

### Type Scale

| Size | Usage |
|---|---|
| 10–11px mono | Overline labels (uppercase, tracked), source names, badge text |
| 12px (xs) | Secondary labels, category tags, sidebar section headers |
| 14px (sm) | Body copy, nav items, table cell text, descriptions |
| 16px (base) | Subheadings within sections |
| 24px (2xl) | Section headings ("Key Research Findings", "Research Areas") |
| 30–36px (3xl–4xl) | Hero heading, bold, white, centered on homepage |

### Weight Usage

- **Bold (700):** Hero heading, section headings, stat values, table header labels
- **Semibold (600):** Subsection titles (e.g., "The Company", "The Atlanta Deployment"), sidebar section labels
- **Medium (500):** Button text, badge labels
- **Normal (400):** Body paragraphs, descriptions, navigation items

### Overline Pattern

Small, uppercase, tracked, muted gray. Appears above hero heading and in metadata contexts:
```
font-size: 10px; font-family: monospace; text-transform: uppercase; letter-spacing: 0.2em; color: #64748b;
```

### Key Typography Observations

- Hero heading is **centered** on the homepage, white, bold, large (30–36px)
- Body paragraphs below headings are `#94a3b8` (light gray), not white — this creates visual hierarchy
- Subheading text (e.g. description under hero) is also `#94a3b8` with generous line-height (~1.7)
- Numerical values in data tables use monospace for column alignment

## 4. Spacing & Grid

### Spacing Philosophy: Spacious, Not Dense

The layout is **generous with whitespace**. Content breathes. This is NOT an information-dense terminal — it's an editorial research briefing.

- **Page padding:** `px-6 lg:px-8` horizontal, `py-8` to `py-16` vertical between sections
- **Hero section:** Extra-generous vertical padding (`py-16 md:py-24`), centered content
- **Content max-width:** `max-w-4xl` for narrative text (centered within the content area), `max-w-7xl` for data tables
- **Section spacing:** Large gaps between content sections (32–48px vertical). Each section is separated by space, not by borders or cards.
- **Paragraph spacing:** `mb-4` between paragraphs, `leading-relaxed` (line-height ~1.7)

### Border Radius

| Value | Usage |
|---|---|
| 10px (lg) | CTA buttons, card containers |
| 6px (sm) | Badges, inputs |
| 4px (xs) | Status badges in tables, inline code |
| full (pill) | Filter pill buttons |

## 5. Layout & Composition

### Sidebar + Content

- **Sidebar:** Fixed left, ~240px wide, full height. Background: `#111723` (surface-800). Visible at `lg` breakpoint, hidden on mobile.
- **Content area:** Offset by sidebar width. Content flows on `#070d14` page background.
- **Mobile:** Sticky top header with hamburger icon → slide-in drawer from left.

### Sidebar Details

- **Title:** "Atlanta ALPR" in bold white at top
- **Navigation items:** Light gray text (`#94a3b8`), regular weight, 14px. Grouped by section.
- **Section labels:** Small uppercase text, slightly bolder or different shade than nav items.
- **Active item:** White text + solid cyan left border bar (3px wide, left edge). Very distinctive.
- **Hover:** Subtle background tint (4% cyan opacity)
- **Footer area:** External links in cyan text at the bottom of the sidebar

### Homepage Layout

The homepage does NOT use card containers. Content flows directly on the page background:

1. **Hero block** — centered heading + description + CTA button. Generous top/bottom padding.
2. **Narrative sections** — subsections with bold white headings, gray body text, flowing one after another with large vertical gaps.
3. **Numbered steps** — vertical timeline with numbered cyan circles connected by a thin vertical line. Numbers in cyan monospace.
4. **Research Areas grid** — a grid of icon cards at the bottom.

### Inner Page Layout

Inner pages (Contracts, Financials, etc.) have:
- Breadcrumbs strip at top
- Page heading + description
- Data tables, charts, or content cards with `surface-800` backgrounds and `surface-600` borders

### Data Tables

- **Header row:** Slightly darker background (`surface-700`), bold white text, left-aligned
- **Data rows:** No alternating colors, no visible row borders. Rows are separated by consistent spacing/padding.
- **Cell text:** `#e2e8f0` for primary values, monospace for dollar amounts
- **Status column:** Compact colored badges (small, rounded, ~4px radius)
- **Source markers:** Small cyan numbered circles (citation references)
- **Hover:** Subtle row highlight on hover

## 6. Components

### Hero CTA Button

- Cyan filled background (`#06b6d4`), dark text, rounded (10px), includes right arrow icon
- Generous padding, prominent size
- Subtle shadow for elevation

### Content Sections (Homepage)

- NO card borders or backgrounds — content sits directly on page background
- Separation via generous vertical spacing (32–48px between sections)
- Section headings: bold, white, 24px. Body text: light gray, 14px.

### Cards (Inner Pages Only)

- Background: `surface-800` with `surface-600` border, rounded-lg
- Padding: `p-5`
- Hover: border lightens one step
- Clickable cards: heading turns cyan on hover

### Callout Blocks

- Left cyan border (3px), subtle cyan-tinted background (`rgba(6, 182, 212, 0.04)`)
- Used for key findings or highlighted quotes

### Status Badges

- Compact: `px-2 py-0.5 rounded text-[10px] font-semibold uppercase`
- Colors follow tinted-glass pattern (20% opacity bg, full color text)
- Three types: status (confirmed/estimated/unknown), confidence (verified/likely/unverified with icons), source (primary/secondary with icons)

### Numbered Timeline Steps

- Circles: `w-10 h-10 rounded-full` with `surface-700` bg and `surface-600` border
- Number inside: cyan monospace text
- Vertical connector: thin 1px line in `surface-600` connecting circles
- Step content: heading + description to the right of each circle

### Footer

- External resource links in cyan text
- Small, muted footer text
- Links to external sites (deflock.org, haveibeenflocked.com, etc.)

## 7. Motion & Interaction

### Transitions

- Color-only transitions (200ms) on links, nav items, card borders
- NO transform animations on cards (no translateY, no scale)
- Nav items: `transition-all` for smooth border + bg + text color changes

### Focus States

- `outline: 2px solid #06b6d4; outline-offset: 2px` on interactive elements
- Consistent cyan focus ring across all buttons and links

### Hover Conventions

- Sidebar nav: subtle 4% cyan bg tint
- Card borders: `surface-600` → `surface-500`
- Card headings: white → cyan
- Links: cyan → lighter cyan or white

## 8. Iconography

**Library:** Lucide React.

| Size | Context |
|---|---|
| 10px | Micro indicators (external link, file) |
| 12px | Badge icons, compact mode |
| 14px | Breadcrumb icons |
| 16px | Nav icons, button icons (standard) |
| 20px | Mobile hamburger, research area cards |

Key icons: Shield (primary source), BookOpen (secondary source), CheckCircle (verified), AlertTriangle (likely), ExternalLink (outbound), Eye (surveillance), Landmark (governance), ChevronRight (expand/nav), Home (dashboard).

## 9. Anti-patterns

- **No light mode.** Every surface is a shade of near-black.
- **No card borders on the homepage.** Content sections flow on the page background with spacing as the separator. Only inner pages use card containers.
- **No information density.** This is a spacious, editorial layout — not a cramped terminal. Generous whitespace is a feature.
- **No serif fonts.** Sans-serif for all UI text; monospace only for data/metadata.
- **No transform animations on cards.** Color-only transitions.
- **No large hero images or background gradients.** The hero section is text-only with generous padding.
- **No color outside the system.** Cyan is the only accent. Status colors only in badges.
- **No zebra striping in tables.** Rows are uniform dark background; separation comes from padding.
- **Do not use cyan for danger/error.** Red is reserved for destructive states.
