# РобоКвест Design Guidelines

## Design Approach
**System**: Material Design principles with educational gaming aesthetic
**Inspiration**: Khan Academy's clarity + Duolingo's playful gamification + Scratch's maker-friendly interface
**Target**: Students aged 10-18, so balance professional structure with engaging, colorful elements

## Typography
- **Primary Font**: 'Inter' or 'Roboto' (Google Fonts) - clean, modern readability
- **Headings**: 600-700 weight, sizes: h1(2.5rem), h2(2rem), h3(1.5rem)
- **Body**: 400 weight, 1rem base, 1.6 line-height for easy reading
- **Code/Technical**: 'Roboto Mono' for Arduino code export and commands

## Layout System
**Spacing Scale**: Use Tailwind units of 2, 4, 6, 8, 12, 16 (p-2, m-4, gap-6, py-8, mb-12, pt-16)
- Consistent rhythm throughout both pages
- Generous padding around interactive zones for touch-friendly targets

## Landing Page Structure

**Hero Section** (60vh):
- Large heading: "РобоКвест — Твоя Виртуальная Лаборатория Робототехники"
- Subtitle explaining concept
- Prominent "Начать" CTA button (large, rounded corners)
- Background: Gradient or subtle tech pattern (circuits, gears) - NO image needed here

**Three Info Sections** (side-by-side on desktop, stacked mobile):
1. "Что это?" - Icon (robot/gear) + title + 2-3 sentence description
2. "Как работает?" - Icon (play/code) + title + step-by-step bullets
3. "Зачем нужен?" - Icon (trophy/star) + title + benefits list

**Registration Modal/Card**:
- Clean white card with subtle shadow
- 3 input fields (username, email, password) with clear labels above
- Full-width button below form
- Soft rounded corners (8px)

## Game Page Structure

**Header Bar** (fixed top):
- Logo/title left
- Progress indicator center (level badges 1-2-3, current highlighted)
- Points counter right (coin icon + number)
- Height: 64px, subtle shadow

**Main Layout** (2-column desktop, stacked mobile):

**Left Column** (40% width):
- **Robot Constructor Card**: Dropdown selectors in vertical stack, "Собрать" button, visual robot preview (simple SVG or text representation)
- **Programming Interface**: Text inputs for commands, "Запустить" button
- **Export Code**: Textarea with monospace font, copy button

**Right Column** (60% width):
- **Simulator Canvas**: 800x400px, bordered, centered, dark background (#1a1a2e or similar for space feel)
- Physics objects rendered as bright colors against dark (robot: blue, obstacles: red, target: green)

**Bottom Section**:
- **Feedback Area**: Alert-style box showing results/errors/tips (success=green, error=red, info=blue borders)
- **Level Cards**: 3 cards in row showing level title, description, lock/unlock status, start button

## Component Design

**Cards**: 
- White background, subtle shadow (0 2px 8px rgba(0,0,0,0.1))
- Rounded corners (12px)
- Internal padding: p-6
- Spacing between cards: gap-6

**Buttons**:
- Primary (CTAs): Bold color, white text, rounded (8px), padding (px-6 py-3)
- Secondary: Outlined style, same dimensions
- Hover: Slight lift effect (transform translateY(-2px))

**Form Inputs**:
- Border: 1px solid light gray
- Rounded: 6px
- Padding: p-3
- Focus state: Border color shift + subtle shadow
- Labels: Above inputs, small text, medium weight

**Icons**: 
- Use Font Awesome or Heroicons (CDN)
- Size: 24-32px for section headers, 16-20px for inline elements
- Robot/gear/trophy/code/play icons throughout

## Gamification Elements

**Progress Badges**:
- Circular indicators, 3 in row
- Locked: Gray outline, lock icon
- Active: Colored fill, number
- Complete: Colored fill, checkmark

**Points Display**:
- Coin/star icon
- Large number (1.25rem)
- Optional: Animate +10 when points added

**Achievement Feedback**:
- Toast notifications or expanding alert boxes
- Success animations (subtle scale pulse)

## Canvas Simulator Visual Treatment
- Dark background (#1a1a2e)
- Bright accent colors for objects (high contrast)
- Grid lines (optional, subtle)
- Play/pause/reset controls below canvas
- Speed/zoom controls if space allows

## Accessibility
- High contrast text (WCAG AA minimum)
- Focus indicators on all interactive elements
- Alt text for all icons
- Clear error messages in forms
- Responsive breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)

## Animation Philosophy
**Minimal, purposeful only**:
- Button hover states
- Points increment animation
- Level unlock reveal
- Success/failure feedback transitions
- NO: Unnecessary scroll effects, parallax, continuous loops

## Images
**No images required** - use SVG icons and CSS styling for visual interest. The simulator canvas provides the main visual focus. If adding decorative elements, use geometric patterns or code-themed illustrations via SVG, not photographs.