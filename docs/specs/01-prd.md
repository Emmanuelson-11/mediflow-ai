<!-- Extracted from '1. Product Requirements (PRD).pdf'. The PDF is the source of truth. -->

Product Requirements Document (PRD)
Overview
MediFlow AI is a working prototype of a clinical operations copilot for a fictional
outpatient clinic in Ghana (MediFlow Clinic). It runs entirely on synthetic data and shows,
end to end, how LLMs, RAG, a predictive model and an AI agent work together inside one
product, with a human approving every step that matters.
Product goal
Show a hiring team, in one 3-minute demo, that the builder can design and ship
production-shaped AI features for healthcare: structured LLM output, grounded RAG
with citations, an explained ML model, a tool-using agent with approval gates, and
measured results.
The demo story: one patient, Ama, goes from consultation to signed note, guideline
check, care plan, follow-up booked, plain-English instructions sent, reminder sent, and
NHIS claim checked and paid.
1. Product Requirements (PRD)

Users
Features
Role
What they do in MediFlow
Main screens
Doctor
Generates and approves clinical
notes; checks prescriptions against
guidelines
Consultations, Note review
Nurse
Approves care plans and after-visit
messages; answers clinical
questions from patients
Care plans, Outbox, Nurse
inbox, Alerts
Front desk
Watches upcoming appointments
and risk; marks attendance
Schedule
Billing officer
Reviews, fixes and submits NHIS
claims
Claims queue, Claim detail
Patient (simulated)
Receives reminders and
instructions; replies
Patient chat
Admin (the builder, in
demos)
Ingests documents, runs jobs,
resets demo data, views results
Admin, Results dashboard
ID
Feature
Description
Expected behaviour
F1
Scribe (Module 1)
Turns a consultation
transcript into a structured
clinical note
Masked text goes to the
LLM; a 13-field note comes
back; the doctor edits and
approves
F2
Guideline check
(Module 2)
Compares the prescription
with clinic guidelines
Each drug marked matches /
differs, with citations, before
approval
F3
Ask the guidelines
(Module 2)
Chat over 3 clinic documents
Cited answers; "not covered"
when the documents don't
say
F4
No-show risk
(Module 3)
Scores each appointment's
risk of being missed
High / Medium / Low band
with a one-sentence reason
1. Product Requirements (PRD)

Out of scope for this version
Real patient data, real NHIS submission, and real WhatsApp or SMS (the chat is
simulated).
Audio transcription (transcripts are the input).
Languages other than English.
Readmission prediction and claim-rejection ML.
Real authentication (a role switcher stands in for login).
Success metrics
ID
Feature
Description
Expected behaviour
F5
Patient messenger
(Module 4)
Reminders, after-visit
instructions, replies to
patients
Templates for reminders;
nurse-approved instructions;
clinical questions go to a
nurse; emergencies caught
first
F6
Care coordinator
(Module 5)
Agent that builds each
patient's care plan
Calls modules as tools;
proposes actions; nothing
runs until a nurse approves
F7
Claims checker
(Module 6)
Builds and checks NHIS
claims
Rule and LLM flags, red /
amber / green; officer
submits to simulated NHIS
F8
Results dashboard
One page of evaluation
results across modules
KPIs from every eval script,
latest run, with model and
prompt versions
F9
Demo controls
Make the demo repeatable
Reset data, "run daily job for
date", role switcher
Area
Metric
Target
Scribe
Diagnosis and code match the answer key
≥ 8 of 10 transcripts
RAG
Retrieval hit rate / refusal accuracy
≥ 90% / 5 of 5
Risk model
AUC; beats logistic regression baseline
≥ 0.75; yes
Messenger
Emergency catch rate; clinical questions routed to
a nurse
100%; 100%
1. Product Requirements (PRD)

Area
Metric
Target
Coordinator
Actions executed without approval
0
Claims
Rejection rate before → after
~30% → ≤ 8%
Demo
Ama's full journey runs without manual fixes
Under 3 minutes
1. Product Requirements (PRD)
