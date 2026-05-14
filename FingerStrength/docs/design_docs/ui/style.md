# UI Style Guide — FingerStrength

Goal: Keep the UI clear, minimalistic, and glanceable. Prioritize large numeric readouts, low visual clutter, and accessible contrast.

Principles
- Clarity: prioritize the single most important data on each screen (e.g., "Current Pull" in Live Data).
- Minimalism: avoid decorative elements; use whitespace, typographic hierarchy and subtle color to guide attention.
- Consistency: reuse spacing, type scales, and component styles across screens.
- Accessibility: sufficient contrast, large tappable targets, and alternatives to color-only cues.

Design Tokens (suggested)
- Spacing unit: 8px base (use multiples: 8,16,24,32)
- Corner radius: 8px (controls), 12px (cards)
- Elevation: subtle only; prefer flat surfaces with 1–2px separators
- Typography: Inter or Roboto
  - Display numeric (live): 48–56px, weight 700
  - Heading: 20–24px, weight 600
  - Body: 14–16px, weight 400
  - Small/labels: 12px, weight 400
- Colors (tokens)
  - Background: #FFFFFF
  - Surface/Card: #F7F7F8
  - Text primary: #0F172A (near-black)
  - Text secondary: #6B7280 (muted)
  - Accent / Primary action (green): #16A34A (use for START, SAVE)
  - Success/Left-hand highlight (red): #EF4444 (left-hand cards)
  - Secondary/Right-hand highlight (blue): #2563EB (right-hand cards)
  - Target band (transparent green): rgba(22,163,74,0.12)
- Iconography: simple 2px stroke line icons, rounded caps. Use consistent icon set (Feather / Material). Keep icons monochrome; apply accent color sparingly.

Components & Patterns
- Buttons
  - Primary: filled accent (green), large, 44–56px height, bold label.
  - Secondary: outline or subtle surface-filled, muted text.
  - Ghost: text-only for low-cost actions.
- Cards
  - Use minimal elevation; place key metrics in cards with large numerics and small labels.
  - Provide a small status tag (e.g., "STALE") in uppercase, 10–12px.
- Live numeric readouts
  - Make them the most prominent element; center-left aligned with unit label.
  - Show units (kg) in smaller text to the right or beneath the numeric value.
- Graphs
  - Line stroke: 2px, accent color for data line.
  - Gridlines: either off or very subtle (1px, low-opacity) to reduce clutter.
  - Target band: semi-transparent fill behind the line; do not show heavy borders.
- Layout
  - Use vertical stacking with clear spacing. Keep the top "Now" banner compact but prominent.
  - Bottom navigation: minimal, icon + label only; highlight active tab with accent color and text.

Live Data specific
- Large timer + current pull should be visible without scrolling.
- Target range and progress bars should use the accent band and succinct labels.
- Show "No data" state clearly (muted text + last-known reading). Do not show 0.00 as a valid reading for missing data.

Accessibility
- Contrast: ensure text and important visuals meet WCAG AA for normal text and AAA for critical numeric displays where possible.
- Touch targets: 44px minimum.
- Color: don't rely on color alone—use icons, text, or patterns for status (e.g., arrows, check/close marks).
- Localization: allow flexible layouts (avoid truncation) and RTL support where applicable.

Motion
- Keep motion subtle: durations 120–220ms for transitions; avoid long or distracting animations during effort.

Examples & mapping to mocks
- Home screen: three metric cards (current max, strength index, streak) — large numbers, small labels, primary action as green CTA.
- Live Data: large numeric readout, countdown ring, live graph with target band, split trackers for sets/reps.
- Workout editors: compact forms, grouped sections, consistent steppers and segmented controls.

Notes
- Keep visual language minimal — fewer colors, clear hierarchy, and a single strong accent for actions.
- The style must favor quick glances and robustness under movement (climbers using app mid-workout).

Files referenced (mockups):
- ui/mockup/main/home_screen.png
- ui/mockup/main/profile_screen.png
- ui/mockup/main/workout_library_screen.png
- ui/mockup/main/workout/active_workout_screen.png
- ui/mockup/main/workout/resting_workout_screen.png
- ui/mockup/main/workout/workout_end_screen1.png
- ui/mockup/main/workout/workout_end_screen2.png
- ui/mockup/main/workout/workout_library_interactions_screen.png
- ui/mockup/main/workout/editors/workout_edit_screen.png
- ui/mockup/main/workout/editors/exercise_edit_scree.png

Guidance for developers
- Implement tokens (spacing, colors, typography) as theme variables.
- Keep chart rendering performant; prefer lightweight native-friendly libs.
- Provide a small "design token" JSON file for future UI implementation.