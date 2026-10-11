<!-- Extracted from '3. App Flow.pdf'. The PDF is the source of truth. -->

App Flow Document
Overview
This document lists every screen in MediFlow, which role uses it, and how the main
journeys move between them. A role switcher in the top bar (demo mode) lets one person
play every role in a demo.
Screen map
Screens
Screen map · 6 roles, 15 screens
Screen
Role
What it shows
Main actions
Consultations
Doctor
Today's 10 transcripts and
their note status
Open, Generate note
Note review
Doctor
Transcript left, editable 13-
field note right, flags in
amber, guideline check panel
Edit, Check guideline,
Regenerate, Approve
3. App Flow

Key user journeys
J1. Doctor documents a visit
1. Consultations → open Ama's transcript → Generate note.
Screen
Role
What it shows
Main actions
Alerts
Nurse
Red emergency alerts from
patient messages
Acknowledge, Open chat
Care plans
Nurse
Plans awaiting approval; each
with flags, proposed actions
and the agent trace
Approve, Edit, Reject,
Approve all
Outbox
Nurse
After-visit messages not sent
through a care plan
(coordinator off)
Edit, Approve and send,
Reject
Nurse inbox
Nurse
Clinical and unclear patient
messages
Reply
Schedule
Front
desk
Upcoming appointments with
risk band, reason, reminder
and confirmation status
Mark Attended / Missed
Claims queue
Billing
Claims sorted red, amber,
green
Open
Claim detail
Billing
Claim lines, flags with
reasons and suggested fixes,
note alongside, NHIS result
Edit, Apply fix, Override with
reason, Submit
Patient chat
Patient
WhatsApp-style chat in a
phone frame; patient picker
Type reply, quick-reply chips
Ask guidelines
All staff
Chat over the 3 clinic
documents with citations
Ask, Open source
Knowledge
base
Admin
The 3 documents, chunk
counts, last ingest
Re-ingest
Results
Admin
KPIs from every eval script,
latest run, model and prompt
versions
Run evals
Demo controls
Admin
Data reset and time controls
Reset demo, Run daily job for
date, Coordinator on/off
3. App Flow

2. Note review: read the draft beside the transcript; fix any amber field.
3. Click Check guideline; read the per-drug result.
4. Approve. The note is final and the coordinator starts.
J2. Nurse approves the care plan
1. Care plans → Ama's plan (flags at the top).
2. Open the trace to see why each action was proposed.
3. Approve all (or edit or reject single actions).
4. Follow-up appears in Schedule; the message appears in Patient chat; the claim appears
in Claims queue.
J3. Patient replies to a reminder
1. Demo controls → Run daily job for 3 days before Ama's follow-up.
2. Patient chat: Ama receives the reminder and replies "2".
3. She is offered 3 slots and picks B; the Schedule updates.
4. She asks "can I stop the tablets?" → hand-off message; it appears in Nurse inbox; the
nurse replies.
J4. Emergency message
1. Patient chat: a patient types "chest pain".
2. The emergency reply appears at once; a red alert appears in Alerts.
J5. Billing officer submits a claim
1. Claims queue → open a red or amber claim.
2. Apply the suggested fix or override with a reason; checks re-run.
3. Submit → the simulated NHIS returns paid or rejected with reasons.
J6. Reviewer checks the results
1. Results → run evals (or read the latest run).
2. See every module's KPIs against targets, plus rejection rate before vs after.
3. App Flow
