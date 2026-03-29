# Three Wins — Changelog

## v6.0 (2026-03-29)
### Win Save Animation
- Card pulse animation (`card-pulse`) triggers on the wins form when saving 3 wins
- "Wins saved!" success toast slides up from the bottom with glassmorphism styling
- Toast auto-dismisses after 2 seconds; orange/gold glow border accent

### Enhanced Streak Flame Glow
- Brighter `glow-pulse-bright` animation on flame glow for streak levels 3, 4, and 5 (streak > 7 days)
- Pseudo-element radial gradient underlight added beneath levels 3 and 4 flames
- Glow scales up 1.2x and brightness increases 1.5x at peak pulse

### Focus-Visible Accessibility
- `:focus-visible` outlines (2px solid orange) on all interactive elements
- Custom ring styles per element type: gold ring for Done/Edit/reflection buttons, white ring for overlay buttons
- Input fields suppress outline in favor of existing focus border styling
- Category pills get an additional `box-shadow` focus ring for clarity

### Monthly Summary Staggered Fade-In
- `stat-count-in` keyframe animation with scale + translateY entrance on each stat card
- Staggered delays: 150ms, 300ms, 450ms for the three stat cards
- Title fades in at 50ms, dismiss button at 550ms for a sequential reveal

### Changed
- SW cache bumped to `three-wins-v7`

## v5.0 (2026-03-29)
### Reflection Prompt
- After saving all 3 wins, an optional "What made today great?" textarea appears (max 200 chars)
- Reflection saved alongside the day's entry in localStorage
- Reflections displayed as italicized quotes in the feed and export
- Character counter with save/skip buttons

### Monthly Summary
- On the 1st of each month, a banner shows last month's recap: total wins, longest streak, most popular category
- Dismissible with "Got it" button; shown once per month via localStorage flag

### Win Sharing
- "Share Today's Wins" button generates a 600x400 Canvas card featuring all 3 wins, category tags, current streak, and "Three Wins" branding
- Web Share API integration with PNG file sharing; fallback to PNG download
- Replaces the old streak-only share card

### Changed
- SW cache bumped to `three-wins-v6`
- Share button now shows when today's entry exists (not only when streak > 0)

## v4.0 (2026-03-29)
### Categories & Tags
- **Optional category pills** under each win input: Work, Health, Relationships, Learning, Creative, Personal
- Toggle-select with colored active state using `color-mix()` for dynamic tinting
- Categories saved per-win in localStorage (backward-compatible with v3 entries)
- **Feed category tags** — colored inline badges shown next to wins in the feed and weekly digest

### Export
- **"Export Wins" button** — downloads a `.txt` file with all wins in `Date | Win 1 | Win 2 | Win 3` format
- Categories appended in brackets when present (e.g., `Finished report [Work]`)
- Button hidden when no entries exist

### Streak Milestones (expanded)
- Added milestones at **21 days** and **90 days** (total: 7, 14, 21, 30, 60, 90, 100, 365)
- **Confetti CSS animation** — 50 pieces with randomized colors, drift, spin, and stagger on milestone overlay
- **Milestone badge** in streak header — shows highest achieved milestone emoji next to the streak count

### Weekly Digest (enhanced)
- **Stats summary** — streak status and most popular category shown at top of digest overlay
- Category tags displayed inline in the digest day entries

### Changed
- SW cache bumped to `three-wins-v5`
- `getAllEntries()` now filters non-date keys to prevent milestone/digest metadata from appearing in feed
- Category pills disable and dim in readonly (saved) state

## v3.0 (2026-03-29)
### Visual redesign — "Glassmorphism & Micro-animations"
- **Google Fonts** — Inter (400-800) integrated via CDN with preconnect
- **Gradient backgrounds** — multi-radial warm gradients on body and onboarding screen
- **Glassmorphism** — `backdrop-filter: blur(16px)` on feed cards, digest cards, onboarding/milestone overlay cards, inputs, and secondary buttons; semi-transparent backgrounds with subtle white-edge borders
- **Soft shadows with colored glow** — new CSS custom properties (`--shadow-soft`, `--shadow-glow-orange`, `--shadow-glow-gold`); orange glow on bullet dots, streak counter drop-shadow, CTA glow
- **Micro-animations** — feed cards lift + scale on hover with glow; buttons hover-lift with spring easing (`--ease-spring`); inputs focus-lift with background brighten; bullet dots scale on card hover; feed fade-in includes scale-up
- **Typography hierarchy** — streak count 56px/800wt/-0.03em; date label 14px uppercase 0.08em tracking; feed dates 12px/600wt; titles 800wt with negative tracking; input 17px base
- **Empty state** — pulsing radial-gradient orb as visual placeholder
- **Note editor polish** — 16px 18px padding, 14px radius, focus background brightening, has-text orange border tint, buttons min-height 52px
- **Mobile polish** — small-phone tweaks for cards/streak/empty-state; desktop enlarged padding
- **No JS changes** — all IDs, data-attributes, aria-attributes preserved

## v2.0 (2026-03-29)
### Added
- **Milestones Celebration** — fullscreen overlay at 7, 14, 30, 60, 100, 365 day streaks with unique emoji and auto-dismiss
- **Weekly Wins Digest** — Sunday summary of all wins for the week with Canvas share card
- **Level 5 Epic Flame** — 6 JS-generated particle spans for maximum streak level
- **Input micro-delight** — subtle scale(1.015) on inputs with text (has-text class)

### Fixed
- `--text-muted` changed from cold #999 to warm #A89080 (campfire aesthetic)
- `--bg-input` darkened for better placeholder contrast
- Spacing: 12px gap between fields, 16px flame-to-streak
- Focus return after milestone/digest overlay dismiss
- `getAllEntries()` and `hasAnyEntry()` wrapped in try/catch
- Day/days pluralization in streak aria-label
- Defensive `[hidden] { display: none !important }` for overlay CSS

### Changed
- SW cache bumped to `three-wins-v4`

## v1.0 (2026-03-29)
- Initial release
- 3 wins per day, streak counter, CSS flame (5 levels)
- Onboarding overlay, share streak card
- PWA (service worker + manifest)
- IntersectionObserver lazy feed
