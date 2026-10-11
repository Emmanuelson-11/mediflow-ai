<!-- Extracted from '5. Backend Schema.pdf'. The PDF is the source of truth. -->

Backend Schema Document
Overview
All data lives in one PostgreSQL database (with pgvector), 24 tables in total. Each module
owns its tables and only writes to its own; other modules read them or call the owning
module's functions. The patient is the centre: almost every table links back to patients .
Data model
Owner
Table
Key columns
Links to
Core
patients
patient_id (PK), name, sex,
date_of_birth, phone, region,
distance_km, opted_out
—
Core
nhis_membership
patient_id, nhis_number,
valid_from, valid_to
patients
Core
staff_users
user_id (PK), name, role (doctor,
nurse, front_desk, billing, admin)
—
Core
audit_log
id, actor (user or AI), action,
entity, entity_id, model,
prompt_version, created_at
any
M1
transcripts
transcript_id (PK), patient_id,
consultation_date, clinic, text,
answer_key
patients
M1
clinical_notes
id (PK), transcript_id, patient_id,
ai_draft, final_note,
edited_fields, flags, status,
guideline_check, approved_by,
approved_at
transcripts, patients,
staff_users
M2
kb_chunks
chunk_id (PK), document,
section, pages, text, embedding,
doc_version
—
M2
rag_queries
id, source, question,
retrieved_chunks, answer,
citations, refused, latency_ms
kb_chunks
5. Backend Schema

Owner
Table
Key columns
Links to
M3
appointments
appointment_id (PK), patient_id,
date, time, visit_type,
booked_on, source_note_id,
confirmed, rescheduled_from,
reminders_sent, attended
patients, clinical_notes
M3
risk_scores
appointment_id, score, band,
top_factors, explanation,
model_version, scored_at
appointments
M4
messages
id, patient_id, appointment_id,
direction, job, template, body,
status, intent, confidence,
action, approved_by
patients, appointments
M4
nurse_inbox
message_id, status,
answered_by
messages
M4
alerts
message_id, type,
acknowledged_by
messages
M4
clinic_slots
date, time, status
appointments
M5
agent_runs
id (PK), note_id, patient_id,
status, summary, steps_used,
tokens, cost_usd, latency_ms
clinical_notes, patients
M5
agent_steps
run_id, step_no, reasoning_text,
tool_name, tool_input,
tool_output, status
agent_runs
M5
proposed_actions
id (PK), run_id, type, payload,
reason, source, status,
decided_by
agent_runs
M5
plan_flags
run_id, issue, details,
resolved_by
agent_runs
M5
referral_letters
id, patient_id, text,
created_from_action
patients,
proposed_actions
M6
claims
claim_id (PK), note_id,
patient_id, nhis_number,
visit_date, diagnosis_code,
total_ghs, status,
submission_status, mode
clinical_notes, patients
5. Backend Schema

Column details for each module's tables are in that module's architecture doc; this table is
the single map of where everything lives.
Key relationships
One patient has many transcripts, notes, appointments, messages and claims.
One approved note creates at most one agent run, one follow-up appointment and one
claim. This is the backbone of the product.
One agent run has many steps, proposed actions and flags; each approved action
creates exactly one appointment, message, letter or claim.
One appointment has one current risk score and many messages (reminders and
replies).
One claim has many lines, flags and submission attempts.
Access control
Who can see (R) or change (W) each area. Enforced on every endpoint by role.
Owner
Table
Key columns
Links to
M6
claim_lines
claim_id, item_type, item_name,
quantity, unit_price_ghs,
line_total_ghs
claims, tariffs
M6
claim_flags
claim_id, check_id, result,
message, suggested_fix,
citation, override_reason
claims
M6
nhis_submissions
claim_id, attempt, decision,
reasons, amount_paid_ghs
claims
M6
tariffs
item_name (PK), item_type,
unit_price_ghs
—
Area
Doctor
Nurse
Front desk
Billing
Admin
Patients (identity, contact)
R
R
R/W
R
R/W
Transcripts and clinical
notes
R/W
R
—
R (approved
only)
R
Guidelines (ask)
R
R
R
R
R/W
(ingest)
Appointments and risk
R
R
R/W (attendance)
—
R
5. Backend Schema

Rules every agent must follow: no table stores the masking name map; diagnosis and
medicines can only be changed through the Note review screen by a doctor; every write
by AI or a person goes to audit_log .
Area
Doctor
Nurse
Front desk
Billing
Admin
Messages, nurse inbox,
alerts
R
R/W
R (reminders
only)
—
R
Care plans and agent
traces
R
R/W
(approve)
—
—
R
Claims
—
—
—
R/W (submit)
R
Audit log and results
—
—
—
—
R
5. Backend Schema
