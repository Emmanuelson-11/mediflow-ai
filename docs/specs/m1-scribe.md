<!-- Extracted from 'MediFlow AI — Module 1 Architecture (Scribe).pdf'. The PDF is the source of truth. -->

MediFlow AI — Module 1 Architecture
(Scribe)
Module 1 turns a consultation transcript into a structured clinical note that only becomes
official after a doctor approves it. Each section below can be handed to a coding agent as-
is.
Flow at a glance
The top row runs automatically; the bottom row is where the doctor takes over. The name
map never leaves our system: it is only used to put real names back after the LLM has
finished.
Components
Seven components run in a fixed order. Each one has one job, one input and one output.
C1. Transcript input
Job: load a consultation for processing.
Input: a transcript file from data/transcripts/ (10 synthetic files for the prototype),
picked from a dropdown on the screen.
Output: the transcript text plus its header: transcript ID, patient ID, patient name,
phone, NHIS number, consultation date, clinic.
C2. Masking (hide identity)
Module 1 flow · 7 components
MediFlow AI — Module 1 Architecture (Scribe)

Job: remove anything that identifies the patient before text leaves our system.
What gets masked: patient name, any other person's name, phone numbers, NHIS
numbers, patient ID.
How: names and IDs come from the transcript header, so we replace those exact
strings. Phone numbers ( 0XX XXX XXXX or +233... ) and NHIS numbers ( NHIS-
XXXXXXXX ) are also caught by pattern matching in case they are spoken in the dialogue.
Replacements: [PATIENT_1] , [PERSON_1] , [PHONE_1] , [NHIS_1] , [PATIENT_ID_1] .
Output: the masked transcript, plus a name map (placeholder → real value). The name
map stays in our system and is never sent to the LLM.
C3. LLM extraction
Job: read the masked transcript and fill the form (see The form).
Input: masked transcript, consultation date, the prompt (see The LLM prompt).
How: call Claude through the provider layer with temperature 0 and the API's tool-use /
JSON schema feature, so the answer is forced into the form's shape.
Output: a filled form as JSON, still containing placeholders.
C4. Validation
Job: check the LLM's answer before anyone sees it.
How: check against the form schema and the rules in Guardrails.
Output: either a valid form, or a form with a list of flagged fields.
C5. Unmasking (put real names back)
Job: replace every placeholder with its real value using the name map.
Check: after replacement, no [...] placeholder may remain. If one does, flag the
field.
Output: the draft note with real names, ready for the doctor.
C6. Doctor review screen
Layout: transcript on the left, editable form on the right. Flagged fields are highlighted
in amber with the reason shown.
Actions: edit any field; Approve (saves as final); Regenerate (runs C2–C5 again).
Rule: Approve stays disabled while any required field is empty.
C7. Storage
Job: save the AI draft, the doctor's final version, and who approved it.
Output: an approved note in the database. This approved note is what Modules 2–6 will
read later.
MediFlow AI — Module 1 Architecture (Scribe)

The form
The note has 13 fields. Identity fields come from the transcript header, not the LLM, so the
AI never handles real names. "Required" means Approve stays disabled until the field is
filled.
Field
Type
Filled by
Required
Example
transcript_id
text
System
(header)
Yes
T001
patient_id
text
System
(header)
Yes
MF-00001
patient_name
text
System
(header)
Yes
Ama Mensah
consultation_date
date
System
(header)
Yes
2026-10-07
chief_complaint
text
LLM
Yes
Fever and
headache for 3
days
symptoms
list of text
LLM
Yes
fever, headache,
body pains, loss of
appetite
vital_signs
temperature_c,
blood_pressure,
pulse_bpm,
weight_kg
LLM
No (null if
not said)
38.9, 120/80, 96, 62
exam_findings
text
LLM
No
Pale conjunctiva,
no neck stiffness
diagnosis
text
LLM
Yes
Uncomplicated
malaria
diagnosis_code
ICD-10 code
LLM
Yes
B54
medications
list of {name, dose,
frequency,
duration_days}
LLM
No
Artemether-
lumefantrine, 4
tablets, twice daily,
3
MediFlow AI — Module 1 Architecture (Scribe)

The LLM prompt
Store this as prompts/scribe_v1.txt . Every saved note records which prompt version
produced it, so changes can be compared later.
You are a clinical documentation assistant for an outpatient clinic in Ghana.
You read a doctor-patient consultation transcript and fill a structured
clinical note using the provided tool.
Rules:
1. Use only information stated in the transcript. Never guess or add facts.
2. If a field is not mentioned in the transcript, return null for it.
3. Keep placeholders such as [PATIENT_1] or [PHONE_1] exactly as written.
4. diagnosis: use the doctor's final diagnosis, not the patient's guess.
5. diagnosis_code: the ICD-10 code that best matches that diagnosis.
6. medications: one entry per drug, with name, dose, frequency and
   duration_days, exactly as the doctor prescribed.
7. follow_up_date: if the doctor says "come back in X days/weeks",
   add that to the consultation date. Otherwise null.
8. The transcript may contain Twi or Pidgin. Write the note in English.
Consultation date: {consultation_date}
Transcript:
{masked_transcript}
The form fields from The form (the LLM-filled ones only) are passed as the tool's JSON
schema, so the model cannot answer in free text.
Guardrails
The rule behind every guardrail: a bad AI answer may slow the doctor down, but it can
never block them or get saved without their approval.
Field
Type
Filled by
Required
Example
follow_up_date
date
LLM (from
"come back
in X days")
No
2026-10-14
flags
list of {field,
reason}
System
(validation)
n/a
{diagnosis_code,
"not a valid ICD-10
format"}
MediFlow AI — Module 1 Architecture (Scribe)

Validation checks (C4)
Bad response handling
1. Broken or incomplete answer: retry once, adding the error message to the prompt
("diagnosis_code was missing, please fill it").
2. Still broken after the retry: stop retrying. Send the draft to the doctor with status
needs_attention and the failed fields highlighted.
3. API error or timeout (30 seconds): retry twice, waiting 2 then 4 seconds. If it still fails,
open the review screen with an empty form and the banner "AI unavailable, fill
manually".
4. Nothing is ever saved as final without the doctor clicking Approve.
Storage, statuses and audit trail
One table, clinical_notes , keeps both the AI's draft and the doctor's final version, so
we can measure how much the doctor had to change.
Check
Rule
If it fails
Schema
Every field present with the right type
Retry
once
Required fields
chief_complaint, symptoms, diagnosis,
diagnosis_code not empty
Retry
once
Code format
diagnosis_code matches ^[A-Z][0-9]{2}(\.
[0-9]{1,2})?$
Flag field
Medications
Each entry has name, dose, frequency,
duration_days
Flag field
Follow-up date
Between consultation date and 90 days after
Flag field
Vital signs range
Temperature 34–43 °C, pulse 30–220 bpm
Flag field
Leftover placeholders (after
C5)
No [...] text remains
Flag field
Column
What it holds
id
Note ID
transcript_id, patient_id
Links to the source
MediFlow AI — Module 1 Architecture (Scribe)

Status flow: a new draft is ready_for_review (all checks passed) or needs_attention
(something flagged). Either becomes approved only when the doctor clicks Approve.
The name map from C2 is never written to this table; it is held only while the note is being
processed.
Tech for the prototype
API endpoints
GET /transcripts : list the 10 transcripts.
POST /notes/draft with a transcript_id: runs C2–C5 and returns the draft with its
status and flags.
PUT /notes/{id} : saves the doctor's edits.
POST /notes/{id}/approve : marks it approved.
Column
What it holds
ai_draft
The form as the AI filled it (JSON, after unmasking)
final_note
The form after doctor edits (JSON)
edited_fields
List of fields the doctor changed
flags
Flags raised by validation
status
ready_for_review , needs_attention or
approved
model, prompt_version
e.g. claude model name, scribe_v1
created_at, approved_at,
approved_by
Timestamps and reviewer name
Part
Choice
Backend
Python, FastAPI, Pydantic (form schema +
validation)
LLM
Anthropic SDK, Claude by default; model name set
in .env so it can be swapped
Database
PostgreSQL (SQLite is fine for day one)
Front end
React page with the review screen
Run
Docker Compose, one command to start
MediFlow AI — Module 1 Architecture (Scribe)

Definition of done
Module 1 is done when all of these work on screen:
Synthetic data prompt
Ten transcripts are enough for the prototype. Each one is generated from an answer key
first, so we can score the AI's note against it. Give this prompt to your coding agent:
Create 10 synthetic outpatient consultation files for a Ghanaian clinic.
Save each as data/transcripts/T001.json to T010.json.
For each file, FIRST write the answer key, THEN write the transcript from it.
Each file is one JSON object with three parts:
1. header:
   transcript_id (T001...), patient_id (MF-00001...),
   patient_name (fake Ghanaian name), phone (fake, format 024 XXX XXXX),
   nhis_number (fake, format NHIS-XXXXXXXX), consultation_date (in 2026),
   clinic (fake clinic name in a Ghanaian town)
2. answer_key (exactly these fields):
   chief_complaint, symptoms (list), vital_signs (temperature_c,
   blood_pressure, pulse_bpm, weight_kg; use null for any not measured),
   exam_findings, diagnosis, diagnosis_code (ICD-10),
   medications (list of name, dose, frequency, duration_days),
   follow_up_date (or null)
3. transcript: doctor-patient dialogue, 20-40 turns, each line starting
   DOCTOR: or PATIENT:
All 10 transcripts load from the dropdown
The masked text sent to the LLM contains no real name, phone or NHIS number (log it
to check)
Each transcript produces a filled form in under 30 seconds
Real names appear correctly on the review screen
A broken field shows in amber with its reason
The doctor can edit, approve, and see the status change to approved
The database shows both the AI draft and the final note, with edited fields listed
AI output matches the answer key on diagnosis and diagnosis code for at least 8 of 10
transcripts
MediFlow AI — Module 1 Architecture (Scribe)

One diagnosis per file:
  T001 uncomplicated malaria, T002 hypertension, T003 type 2 diabetes,
  T004 upper respiratory infection, T005 typhoid fever,
  T006 gastroenteritis, T007 urinary tract infection,
  T008 routine antenatal visit, T009 skin infection, T010 asthma
Realism rules:
- The transcript must contain every fact in the answer key, said
  naturally. Never say the ICD-10 code out loud.
- In 3 files the doctor confirms the patient's phone or NHIS number
  out loud (this tests masking).
- In 2 files the patient uses some Twi or Pidgin phrases.
- In 2 files the patient is vague or corrects themselves.
- In 1 file no vital signs are taken (tests null handling).
- In 1 file the doctor mentions another person by name, e.g. a
  relative (tests masking of other names).
- All names, phone numbers and IDs are fake.
After generating, print a table: transcript_id, diagnosis,
number of turns, which test cases it covers.
When it's done, read 3 of the files yourself. Check that each conversation actually
supports its diagnosis, and that the doctors don't all sound the same.
MediFlow AI — Module 1 Architecture (Scribe)
