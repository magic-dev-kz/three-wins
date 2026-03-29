# Three Wins — Changelog

## v15.0 (2026-03-29) — Random Win Prompt

### Added
- **Random win prompt** -- if all three win fields are empty and user hasn't typed for 10 seconds, a subtle hint appears: "Need inspiration? Try: [random prompt]"
- 10 built-in prompts (e.g., "What made you laugh today?", "What small win did you have?", "Who made your day better?")
- Hint disappears when user starts typing; reappears after 10s of inactivity if fields remain empty
- Non-intrusive: small text below the form, fades in with CSS transition

### Technical
- Service worker cache bumped to `three-wins-v15`

---

## v14.0 (2026-03-29) — Streak Freeze

### Added
- **Streak freeze** -- "Freeze Streak" button appears when you have an active streak but haven't logged wins today
- Freezing preserves your streak for the day without requiring an entry
- Limited to 1 freeze per calendar month; button hides when used or unavailable
- Frozen dates are stored in localStorage (`threeWins_streakFreezes`)
- Streak calculation treats frozen dates as valid streak days
- Styled as a compact ice-blue pill button below the streak counter

### Technical
- Service worker cache bumped to `three-wins-v14`

---

## v13.0 (2026-03-29) — Win Word Cloud

### Added
- **Win word cloud** -- weekly digest now shows top 5 most frequent words from the week's wins (excluding stopwords); words are sized proportionally to frequency with a gradient gold-to-orange style

### Technical
- Service worker cache bumped to `three-wins-v13`

---

## v12.0 (2026-03-29)

### Added
- **Win streak chime** -- soft C5 sine wave chime (200ms, Web Audio API) plays on save when streak > 3 days
- **Seasonal themes** -- auto-detects season (spring/summer/autumn/winter) and subtly tints accent colors (streak count, feed date markers, done button border)
- **"This time last year"** -- after saving, shows wins from the same date one year ago (if any) in a styled card above the feed

### Technical
- Service worker cache bumped to `three-wins-v12`

---

## v11.0 (2026-03-29)
- Onboarding fire icon larger (80x100) with stronger dual-layer glow
- Feed card left border color now tints by category (`--cat-color`)
- Service worker cache bumped to `three-wins-v11`

---

## v10.0 (2026-03-29)
- Win input placeholders more helpful ("What went well today?", "Another win...", "One more thing...")
- Feed card hover glow stronger for better visual feedback
- Service worker cache bumped to `three-wins-v10`

---

## v9.0 (2026-03-29)
### Visual Overhaul
- **Warm gradient color system** — body uses layered warm radial gradients (fire orange, warm gold, ember) with `background-attachment: fixed`; new CSS variables `--warm-gold: #FFB347`, `--ember`, `--deep-fire`, `--bg-warm-*`, `--shadow-glow-warm`, `--ease-spring-heavy`
- **Custom CSS fire animation** — onboarding fire emoji replaced with pure CSS animated flame (3-layer gradient with flicker keyframes + glow); fire emoji hidden via `display: none`
- **Greeting hero** — time-of-day gradient text greeting ("Good morning / afternoon / evening") with animated `background-size` shimmer; hidden when no entries exist
- **Streak progress ring** — SVG circle with gradient fill (`#FFB347` to `#FF6B35`) showing progress toward next milestone; stroke-dashoffset animated on streak change; hidden when streak is 0
- **Weekly progress dots** — 7 dots (Mon-Sun) with day labels; filled orange for days with entries, gold border for today; updates on save
- **Achievement badges** — 8 SVG icon badges (one per milestone: 7, 14, 21, 30, 60, 90, 100, 365 days); earned badges glow with gradient background and scale on hover with tooltip; locked badges show dashed border at reduced opacity
- **Win entry animations** — `win-slide-in` keyframe with spring curve on new feed entries; `celebration-pulse` ring animation on streak counter after saving
- **Feed card polish** — left border upgraded to warm-gold-to-orange gradient via `border-image`; date headers refined to 11px/700wt with orange underline accent; win text line-height increased to 1.65
- **Typography upgrades** — onboarding title uses animated gradient shift; streak count gradient uses `--warm-gold`; feed fade-in animation enhanced with deeper translate
- **Light mode support** — all new CSS variables (`--warm-gold`, `--ember`, `--deep-fire`, `--bg-warm-*`, `--shadow-glow-warm`, `--progress-ring-track`) added to `[data-theme="light"]`

### Changed
- CSS comment header updated to v9
- SW cache bumped to `three-wins-v9`

## v8.0 (2026-03-29)
### Added
- **Win Templates** — 5 clickable prompt chips above the win inputs: "What went well at work?", "What made you smile?", "What did you learn?", "What are you grateful for?", "What challenge did you overcome?". Clicking fills the first empty input with the prompt text. Chips hidden in saved/readonly state, shown again on edit.
- **Streak Calendar** — monthly calendar view with green-highlighted days that have saved wins. Navigation arrows for previous/next months. Today highlighted with orange border. Future dates dimmed. Re-renders after saving wins.
- **Dark mode toggle** — fixed-position sun/moon button in bottom-right corner. Toggles between dark (default) and light theme. Light theme uses warm beige/cream palette with CSS custom properties. Theme preference persisted in localStorage. Updates meta theme-color for PWA chrome.

### Changed
- CSS comment header updated to v8
- SW cache bumped to `three-wins-v8`

## v7.0 (2026-03-29)
### Added
- **PWA install prompt** — custom banner appears after 3+ visits when the browser fires `beforeinstallprompt`; glassmorphism styling with orange gradient install button; dismissible with localStorage persistence
- **Keyboard shortcut: Enter to save** — pressing Enter in the last win input (Win #3) submits the form and saves all wins, instead of doing nothing
- **Auto-focus first empty win** — on page load (when no entry exists for today), the cursor is placed in the first empty win input field instead of always focusing Win #1

### Changed
- Version bump to v7.0
- CSS comment header updated to v7

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
