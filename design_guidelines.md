# Design Guidelines: Women Empowerment & Career Guidance Platform

## Design Approach

**Selected System**: Material Design-inspired with warm, accessible modifications

**Justification**: This is a utility-focused, information-dense platform requiring trust, clarity, and professional credibility. Users are women in potentially vulnerable career transitions who need reassurance and clear guidance. Material Design provides excellent hierarchy for dashboards, forms, and data-heavy interfaces while maintaining accessibility.

**Key Design Principles**:
- Professional warmth over corporate coldness
- Clear information hierarchy for complex dashboards
- Trust-building through consistent, predictable patterns
- Accessibility-first for diverse user literacy levels
- Cultural sensitivity for Indian context

---

## Typography

**Font Families**:
- **Primary**: Inter (via Google Fonts) - clean, highly legible, professional
- **Accent/Headers**: Poppins (via Google Fonts) - warm, approachable for headlines

**Type Scale**:
- Hero headline: text-5xl md:text-6xl font-bold (Poppins)
- Page titles: text-3xl md:text-4xl font-semibold (Poppins)
- Section headers: text-2xl font-semibold (Poppins)
- Card titles: text-xl font-medium (Inter)
- Body text: text-base leading-relaxed (Inter)
- Small text/captions: text-sm (Inter)
- Button text: text-base font-medium (Inter)

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 6, 8, 12, 16**
- Component padding: p-4, p-6, p-8
- Section spacing: py-12 md:py-16 lg:py-20
- Card gaps: gap-4, gap-6
- Form field spacing: space-y-4

**Container Strategy**:
- Page containers: max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
- Dashboard content: max-w-6xl
- Forms: max-w-md (login/signup), max-w-2xl (complex forms)
- Chat interface: max-w-4xl

**Grid Systems**:
- Dashboard cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Event listings: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Feature sections: grid-cols-1 md:grid-cols-2 lg:grid-cols-4

---

## Component Library

### Navigation
- **Header**: Sticky top navigation with logo left, nav links center, CTA buttons right
- **User menu**: Avatar dropdown with role indicator (User/NGO badge)
- **Mobile**: Hamburger menu with full-screen overlay

### Hero Section (Home Page)
- **Layout**: Two-column (60/40 split) - text left, illustration/image right
- **Height**: min-h-[600px] with natural content flow
- **Image**: Use an empowering illustration of diverse women in professional settings (not a photo - illustration feels more inclusive and aspirational)

### Cards
- **Standard card**: Elevated with subtle shadow, rounded-lg, border, p-6
- **Event card**: Image top, content below, tags/badges for category
- **Dashboard stat card**: Icon + number + label, centered alignment
- **Hover states**: Subtle lift with increased shadow

### Forms
- **Input fields**: Outlined style with labels above, rounded-md, focus:ring-2
- **OTP input**: 6-digit boxes, individual bordered inputs with auto-focus progression
- **Buttons**: Rounded-md, py-3 px-6, shadow-sm
- **File upload**: Dashed border dropzone with icon and instructions

### Chat Interface
- **Layout**: Fixed header, scrollable message area, fixed input at bottom
- **Messages**: Different alignment for user (right, filled) vs AI (left, outlined)
- **Message bubbles**: rounded-2xl with generous padding
- **Input**: Sticky bottom bar with rounded-full input and send button

### Dashboard Components
- **Sidebar**: Fixed left sidebar (hidden on mobile, drawer overlay)
- **Stats overview**: 3-4 card grid at top showing key metrics
- **Quick actions**: Prominent button group for primary tasks
- **Recent activity**: Timeline or list-based feed

### Tables (Event Management)
- **Structure**: Responsive table with alternating row backgrounds
- **Mobile**: Convert to stacked cards on small screens
- **Actions**: Icon buttons in last column (edit, delete, view)

### Roadmap Display
- **Visual**: Vertical timeline with week markers, connected with lines
- **Cards**: Each step as an expandable card with completion checkbox
- **Progress**: Visual progress bar showing overall completion

---

## Images

**Hero Section (Home Page)**:
- Illustration of diverse Indian women in professional/educational settings - working on laptops, attending workshops, collaborative discussions
- Style: Modern, flat illustration with warm tones
- Placement: Right side of hero, taking 40% width on desktop
- Responsive: Moves below text on mobile

**Feature Icons**:
- Use Heroicons (via CDN) for all interface icons
- 24px for inline icons, 48px for feature section icons

**NGO Event Flyers**:
- User-uploaded images displayed in 16:9 aspect ratio cards
- Placeholder: Gradient background with event category icon when no image uploaded

**Trust Indicators**:
- Partner logos section (NGO partners, government schemes) - simple monochrome logos
- No large imagery needed - focus on credibility through text and small logos

---

## Key UI Patterns

**Home Page Structure**:
1. Hero with illustration (min-h-[600px])
2. Features grid (4 columns on desktop)
3. How it works (3-step process with icons)
4. Trust section (testimonials/stats - 2 columns)
5. Dual CTA section (User vs NGO signup)
6. Footer with links and contact

**Authentication Flow**:
- Centered card layout (max-w-md)
- Phone number input with country code dropdown
- OTP entry with 6 individual boxes
- Progress indicator showing "Step 1 of 2"

**Dashboard Layout**:
- Sidebar navigation (240px fixed)
- Top bar with search and profile
- Main content area with page title + breadcrumb
- Content organized in cards with clear sections

**Mobile Considerations**:
- Bottom navigation bar for primary actions (chat, events, profile)
- Collapsible sidebar accessed via hamburger
- Stacked layouts for all multi-column grids
- Touch-friendly targets (min 44px tap targets)

---

## Accessibility & Trust Elements

- High contrast text (WCAG AA minimum)
- Clear focus indicators on all interactive elements
- Privacy/security badges in footer and forms
- Multilingual toggle in header (language selector)
- Help/support chat bubble (fixed bottom-right)
- Consent checkboxes with clear privacy policy links
- Role badges (subtle, non-intrusive) showing User/NGO status