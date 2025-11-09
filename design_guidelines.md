# Triponic B2B Platform Design Guidelines

## Design Approach

**Hybrid System-Based Design**: Material Design 3 foundation adapted for travel industry with enterprise professionalism. Drawing inspiration from Linear (clean dashboards), Notion (flexible layouts), and Airbnb (travel aesthetics).

**Core Principle**: Balance enterprise functionality with travel industry visual appeal—professional data interfaces meet inspiring destination content.

---

## Typography System

**Font Families**:
- Primary: Inter (UI, body text, data)
- Accent: DM Sans (headings, hero sections)

**Type Scale**:
- Hero/Landing: text-5xl to text-7xl, font-bold
- Page Headers: text-3xl to text-4xl, font-bold
- Section Headers: text-2xl, font-semibold
- Card Titles: text-lg to text-xl, font-semibold
- Body Text: text-base, font-normal
- Metadata/Labels: text-sm, font-medium
- Captions: text-xs

---

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16** for consistency
- Component padding: p-6 or p-8
- Section spacing: py-12 or py-16
- Card gaps: gap-6
- Element margins: mb-4, mt-8

**Grid System**:
- Dashboard: 12-column responsive grid
- Content areas: max-w-7xl containers
- Forms: max-w-2xl centered
- Sidebars: Fixed 280px (desktop), collapsible (mobile)

**Breakpoints**: Standard Tailwind (sm: 640px, md: 768px, lg: 1024px, xl: 1280px)

---

## Application Architecture

### 1. **Authentication & Onboarding**
- Full-screen centered login with branded hero image background (travel destination)
- Clean auth form overlay with frosted glass effect (backdrop-blur)
- Role selection after authentication (Admin/Agent/Client)

### 2. **Dashboard Layout (Admin/Agent)**

**Sidebar Navigation** (280px fixed):
- Company logo top (h-16)
- Primary nav items with icons
- Role indicator badge
- User profile bottom-pinned

**Main Content Area**:
- Top bar: Breadcrumbs, search, notifications, user menu (h-16)
- Page header with title, actions, tabs (py-8)
- Content grid using dashboard cards

**Dashboard Cards**:
- Elevated cards with rounded-2xl borders
- KPI cards: Grid layout (grid-cols-1 md:grid-cols-2 lg:grid-cols-4)
- Chart cards: Larger, spanning 2 columns where appropriate
- Each card: p-6, shadow-sm, hover:shadow-md transition

### 3. **AI Chatbot Interface**

**Layout**: Full-screen modal or dedicated page
- Fixed header with trip context
- Scrollable message area (flex-1)
- Sticky input at bottom

**Message Bubbles**:
- User messages: Right-aligned, max-w-md
- AI responses: Left-aligned, max-w-2xl
- Generous spacing between messages (space-y-4)

**Trip Summary Cards** (as shown in ChatBot.tsx):
- Large featured card with destination imagery
- 2x2 grid for trip details (duration, budget, travelers, vibe)
- Action buttons full-width at bottom

### 4. **Itinerary Builder/Viewer**

**Hero Section**: 
- Full-width destination hero image (h-96)
- Overlay gradient with trip title, dates
- Action bar with edit, share, save buttons

**Day Navigation**:
- Horizontal scrollable tabs or timeline
- Current day highlighted
- Preview thumbnails for each day

**Day Detail View**:
- Featured image for current day (h-64)
- Three-column layout for activities (Morning/Afternoon/Evening)
- Each activity card: p-6, rounded-xl
- Expandable sections for meals, tips, weather

**Edit Mode**:
- Inline editing with AI assistance chat sidebar (400px)
- Side-by-side: main content | AI suggestions

### 5. **CRM Module**

**Client List View**:
- Table layout with sortable columns
- Search and filter bar (sticky top)
- Client cards as alternative view option
- Pagination at bottom

**Client Detail Page**:
- Two-column layout (8/4 split)
- Left: Contact info, trip history, invoices (tabs)
- Right: Quick actions, notes, activity feed

**Lead Pipeline**:
- Kanban board layout (columns for stages)
- Draggable lead cards
- Each column: min-w-80

### 6. **Invoicing System**

**Invoice List**: Standard table with status badges
**Invoice Detail**: 
- PDF-like preview (max-w-4xl centered)
- Itemized line items table
- Payment status prominent at top
- Action buttons: Send, Download, Record Payment

**Invoice Creation**:
- Step wizard or single-page form
- Client selector (searchable dropdown)
- Line item builder (add/remove rows)
- Real-time total calculation display

### 7. **Client Portal**

**Simplified Navigation**: Horizontal top nav only
- My Trips | Invoices | Messages | Profile

**Trip Gallery**:
- Card grid (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Each trip: Large image, destination, dates, status badge
- CTA button on hover overlay

**Invoice Dashboard**:
- Summary cards: Total owed, paid, pending
- Invoice table with Pay Now buttons
- Payment history timeline

### 8. **Analytics Dashboard**

**KPI Overview**: 
- 4-column metrics cards at top
- Icons representing each metric

**Charts Section**:
- Revenue chart (full width)
- Two-column: Top destinations | Agent performance
- Chart containers: p-8, rounded-2xl

**Data Tables**:
- Sortable, paginated
- Export button top-right
- Row hover states

---

## Component Library

### **Buttons**
- Primary: Solid, rounded-lg, px-6 py-3
- Secondary: Outlined, same dimensions
- Icon buttons: Square, w-10 h-10, rounded-lg
- Floating Action Button (FAB): Fixed bottom-right for quick actions

### **Forms**
- Input fields: h-12, rounded-lg, px-4
- Labels: text-sm, font-medium, mb-2
- Field groups: space-y-4
- Multi-column forms: grid grid-cols-2 gap-6

### **Cards**
- Standard: rounded-2xl, p-6, shadow-sm
- Interactive: hover:shadow-lg, cursor-pointer
- Stat cards: Compact, p-4, with large number display

### **Modals/Dialogs**
- Centered overlay with backdrop-blur
- Max-width constraints (max-w-2xl for forms, max-w-6xl for content)
- Header with close button (sticky)
- Footer with actions (sticky)

### **Navigation**
- Tabs: Underline style for content sections
- Pills: Rounded-full for filters/toggles
- Breadcrumbs: Separator with icons

### **Data Display**
- Tables: Striped rows, sticky header
- Lists: Avatar + content + actions pattern
- Timeline: Vertical line with event cards
- Status badges: Rounded-full, px-3 py-1, text-xs

### **Feedback**
- Toast notifications: Top-right, auto-dismiss
- Loading states: Skeleton screens for cards/tables
- Empty states: Centered icon + message + CTA

---

## Images & Media

**Hero Images**: Required for:
- Landing/marketing pages (h-screen)
- Destination pages (h-96)
- Trip detail headers (h-80)

**Card Images**:
- Aspect ratio 16:9 for trip cards
- Aspect ratio 4:3 for destination thumbnails
- Rounded corners matching card (rounded-t-2xl)

**User Avatars**: Circular, w-10 h-10 (standard), w-16 h-16 (profile pages)

**Image Treatment**: Overlay gradients on hero images for text readability

---

## Responsive Behavior

**Mobile (<768px)**:
- Sidebar becomes bottom nav or hamburger menu
- Multi-column grids stack to single column
- Tables convert to card stacks
- Reduce padding to p-4

**Tablet (768-1024px)**:
- 2-column layouts
- Collapsible sidebar
- Maintain card grids

**Desktop (>1024px)**:
- Full sidebar visible
- 3-4 column layouts
- Multi-panel views

---

## Accessibility

- Maintain WCAG AA contrast
- Focus states: ring-2 ring-offset-2
- Semantic HTML (nav, main, article)
- ARIA labels for icon-only buttons
- Keyboard navigation for modals, dropdowns

---

## Special Interactions

**Minimal Animation**:
- Page transitions: Fade only
- Card hover: Subtle lift (translateY(-2px))
- Loading: Simple spinner
- NO complex scroll animations or parallax

**Drag & Drop**: Only for CRM kanban and itinerary day reordering

**AI Chat**: Typing indicator for AI responses