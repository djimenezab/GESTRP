# Design Guidelines: Occupational Safety Management System

## Design Approach
**Selected Approach:** Design System - Material Design inspired with professional enterprise adaptations
**Justification:** This is a utility-focused, data-intensive application requiring clarity, efficiency, and trust. The interface prioritizes information hierarchy, data entry efficiency, and professional credibility over visual flair.

**Key Design Principles:**
- **Clarity First:** Every element serves a functional purpose in data management
- **Professional Trust:** Visual language conveys reliability and compliance standards
- **Efficient Workflows:** Minimize clicks and cognitive load for frequent data entry tasks
- **Scannable Information:** Easy-to-read tables and cards for quick data review

## Core Design Elements

### A. Color Palette
**Primary Colors (Dark Mode):**
- Primary: 210 75% 50% (Professional blue - safety/trust)
- Primary Hover: 210 75% 45%
- Background: 220 15% 10%
- Surface: 220 15% 15%
- Surface Elevated: 220 15% 18%

**Primary Colors (Light Mode):**
- Primary: 210 85% 45%
- Primary Hover: 210 85% 40%
- Background: 0 0% 98%
- Surface: 0 0% 100%
- Border: 220 15% 88%

**Semantic Colors:**
- Success (Safe/Complete): 142 70% 45%
- Warning (Attention): 38 92% 50%
- Danger (Accident/Critical): 0 72% 51%
- Info: 199 89% 48%

**Text Hierarchy:**
- Primary Text: High contrast (95% opacity)
- Secondary Text: Medium contrast (70% opacity)
- Tertiary/Labels: Lower contrast (50% opacity)

### B. Typography
**Font Stack:** Inter (via Google Fonts CDN) + System fallbacks
- **Display/Headers:** Inter 600-700, tight leading (-0.02em)
- **Body Text:** Inter 400-500, relaxed leading (1.6)
- **Data/Tables:** Inter 400, tabular-nums for alignment
- **Labels/Captions:** Inter 500, uppercase tracking (0.05em) for field labels

**Type Scale:**
- H1: text-3xl (30px) - Page titles
- H2: text-2xl (24px) - Section headers
- H3: text-xl (20px) - Card titles
- Body: text-base (16px) - Primary content
- Small: text-sm (14px) - Secondary info, table data
- Caption: text-xs (12px) - Metadata, timestamps

### C. Layout System
**Spacing Primitives:** Consistent use of 4, 8, 16, 24 units (p-1, p-2, p-4, p-6)
- Component padding: p-6 (cards), p-4 (compact items)
- Section spacing: space-y-8 between major sections
- Form field gaps: gap-6 for vertical stacking, gap-4 for horizontal
- Container max-width: max-w-7xl for dashboard, max-w-4xl for forms

**Grid System:**
- Dashboard: 3-column grid on lg (workers overview cards)
- Detail views: 2-column layout (info panel + data tables)
- Forms: Single column with smart grouping, 2-col for compact fields (DNI/Category)
- Tables: Full-width with sticky headers, alternating row backgrounds

### D. Component Library

**Navigation:**
- Sidebar navigation (persistent) with icons + labels
- Main sections: Trabajadores, EPIs, Cursos, Accidentes, Dashboard
- Active state: Primary color left border (border-l-4) + bg-surface-elevated
- Compact mode toggle for space efficiency

**Cards & Containers:**
- Worker cards: Elevated surface (shadow-lg), rounded-xl, hover:scale-[1.02] transition
- Data panels: Subtle borders, rounded-lg, organized by information type
- Status badges: Rounded-full pills with semantic colors

**Forms:**
- Input fields: Outlined style with focus:ring-2 primary color
- Select dropdowns: Custom styled with chevron icon
- Date pickers: Native HTML5 with consistent styling
- Submit buttons: Full-width on mobile, inline on desktop
- Field groups: Visual separation with subtle backgrounds

**Data Display:**
- Tables: Striped rows, sticky headers, sortable columns with icons
- Timeline view: For accident/course history with connecting lines
- Statistics cards: Large numbers with trend indicators
- Empty states: Friendly messaging with action prompts

**Interactive Elements:**
- Primary buttons: Solid primary color, medium weight text
- Secondary buttons: Outline style, subtle hover background
- Icon buttons: For quick actions (edit, delete) with tooltips
- FABs: For quick "Add" actions on mobile views

### E. Animations
**Minimal & Purposeful:**
- Page transitions: Subtle fade (200ms)
- Card hovers: Scale transform (1.02) with 150ms ease
- Modal/Dialog: Fade + slight scale-up entrance
- Form validation: Shake animation for errors (300ms)
- NO scroll-triggered animations or parallax effects

## Application-Specific Guidelines

**Dashboard Layout:**
- Top stats bar: 4 metric cards (Total workers, Active EPIs, Upcoming courses, Recent accidents)
- Main content: Searchable worker grid/list with category filters
- Quick action buttons: Positioned for frequent tasks (Add worker, Register EPI)

**Worker Detail View:**
- Left panel: Personal info card (photo placeholder, name, category, DNI, birthdate)
- Right panel: Tabbed sections (EPIs entregados | Cursos | Accidentes)
- Each tab shows chronological list with add new button

**Data Entry Forms:**
- Progressive disclosure: Show relevant fields based on selections
- Inline validation: Real-time feedback on DNI format, dates
- Category selector: Large touch-friendly buttons for 7 categories
- Date inputs: Prominent with calendar icon, default to today

**Tables & Lists:**
- EPIs table: Columns for Type, Delivery Date, Status, Actions
- Courses table: Name, Date, Duration, Certificate status
- Accidents table: Date, Severity badge, Description preview, Actions
- All tables: Export to PDF/Excel functionality

**Responsive Behavior:**
- Desktop: Full sidebar + multi-column layouts
- Tablet: Collapsed sidebar icons only, 2-column grids
- Mobile: Bottom navigation bar, single column, swipe-friendly cards

**Trust & Safety Visual Cues:**
- Accident severity: Color-coded badges (green=minor, orange=moderate, red=severe)
- Expired EPIs: Warning indicators with renewal prompts
- Course certifications: Checkmark badges for completed
- Data completeness: Progress indicators for worker profiles