<!-- Extracted from '4. Design Brief.pdf'. The PDF is the source of truth. -->

Design Brief
Overview
MediFlow should look like a calm, trustworthy clinical tool: clear, dense enough for busy
staff, and never decorative. Every screen uses the same colours, type and components
below, so agents building different screens in parallel produce one consistent product.
Brand identity
Name: MediFlow AI. Wordmark in Inter Semibold; a simple teal cross-and-wave mark.
Personality: calm, precise, transparent. The AI always shows its sources and reasons.
Voice in the UI: short, plain labels ("Approve", "Needs attention"), never hype. AI-
generated content is always labelled "AI draft".
Demo label: a thin banner on every screen: "Prototype with synthetic data. Not for
clinical use."
Colour palette
Role
Hex
Use
Primary (teal)
#0F766E
Primary buttons, active nav, links
Primary light
#CCFBF1
Selected rows, AI draft highlight
Ink
#0F172A
Main text
Muted text
#64748B
Secondary text, timestamps
Border
#E2E8F0
Card and table borders
Background
#F8FAFC
Page background
Surface
#FFFFFF
Cards, panels
Success (green)
#15803D
Approved, paid, Low risk, matches guideline
Warning
(amber)
#B45309 on
#FEF3C7
Flags, Medium risk, amber claims, needs
attention
Critical (red)
#B91C1C on
#FEE2E2
Emergencies, High risk, red claims, rejected
Chat outgoing
#DCF8C6
Clinic messages in patient chat
4. Design Brief

Rule: red, amber and green carry meaning only (risk, status, flags). They are never used
for decoration. Status is always shown with a word or icon too, never colour alone.
Typography
Layout
Staff screens: left sidebar navigation (filtered by role), top bar with role switcher and
demo banner, content area max 1280 px.
Side-by-side review screens (Note review, Claim detail, Care plan): source on the left
(transcript or note), editable result on the right, flags pinned at the top of the right
panel.
Patient chat: a phone frame (390 × 780) on the left, the staff console on the right, so
both ends are visible in a demo.
Spacing: 4 px base grid; cards 16 px padding, 12 px radius; tables 44 px rows.
Responsive: staff screens work from 1024 px wide; the patient chat works on phone
widths.
UI components
Role
Hex
Use
Chat incoming
#FFFFFF
Patient messages
Style
Font
Size / weight
Page title (H1)
Inter
24 px / Semibold
Section title (H2)
Inter
18 px / Semibold
Card title (H3)
Inter
15 px / Semibold
Body
Inter
14 px / Regular
Small / labels
Inter
12 px / Medium
Data and codes (ICD-10, IDs, chunk IDs)
JetBrains Mono
13 px / Regular
Component
Look
Where
Primary button
Teal fill, white text, 8 px radius
Approve, Submit, Send
4. Design Brief

Key screen layouts
Component
Look
Where
Secondary
button
White, teal border and text
Regenerate, Check guideline
Danger button
White, red border and text
Reject
Status badge
Pill, tinted background + word
Risk band, claim status, plan
status
Flag banner
Amber or red bar with icon, reason and
fix
Top of review panels
AI draft field
Light teal background until a human
edits or approves it
Note form, messages
Citation chip
Mono text [TG-malaria-03] , opens the
source text
Guideline answers, flags
Trace timeline
Vertical list: step number, reasoning line,
tool, result, time
Care plan detail
Chat bubble
WhatsApp-style, timestamp and ticks
Patient chat
Data table
Sticky header, sortable, row click opens
detail
Queues and lists
Empty state
One sentence and the next action
Every list
Screen
Left
Right
Note
review
Transcript (masked words
underlined)
13-field form, flags on top, guideline
check panel under the medicines
Care plan
Patient summary + plan actions with
Approve / Edit / Reject
Trace timeline
Claim
detail
Approved note
Claim lines, flags with suggested
fixes, NHIS result
Patient
chat
Phone frame
Outbox, Nurse inbox, Alerts tabs
4. Design Brief
