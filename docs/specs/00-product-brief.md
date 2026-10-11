<!-- Extracted from 'Product Brief.pdf'. The PDF is the source of truth. -->

MediFlow AI — Product Brief
The idea
MediFlow AI is an AI copilot for outpatient clinics in Ghana. It writes the clinical note from
the consultation, checks it against the clinic's guidelines, reminds patients who are likely
to miss follow-ups, and catches NHIS claim errors before submission. A clinician approves
every step. It is an AI layer on top of the clinic's existing records system, not a
replacement for it.
The pain point
Clinics lose time, patients and money in three places:
Doctors are stretched thin. Ghana has roughly 1 doctor per 8,000 people, and every
minute spent writing notes is a minute not spent with patients.
Patients don't come back. About 37% of NHIS-insured hypertension and diabetes
patients were lost to follow-up in 2017–2019 NHIA data, often because they didn't know
a follow-up was needed.
Claims lose money. NHIS vetting cuts or queries claims for wrong codes, wrong tariffs,
uncovered drugs and missing details, on top of already slow payments.
Evidence and sources are in the Validation research tab.
Who it is for
Who
What they get
Buyer
Owners and managers of private,
NHIS-accredited clinics and small
hospitals in Ghana
Fewer claim deductions, more
completed follow-ups, more
patients seen per doctor
Users
Doctors, nurses, front desk, billing
officers
Less paperwork; one place to
approve notes, care plans,
messages and claims
Beneficiary
Patients
Clear instructions in plain English
and timely reminders
Showcase
audience
Hiring teams for AI developer roles
in healthcare
Proof of working LLM, RAG, ML
and agent skills on a real problem
Product Brief

What it does
1. Writes the note: consultation transcript → structured note with diagnosis code →
doctor approves.
2. Checks the guidelines: compares each prescription with the clinic's guidelines, with
citations.
3. Plans the next steps: an AI agent proposes the follow-up, patient message and claim; a
nurse approves.
4. Keeps patients coming back: predicts who will miss a follow-up and sends them
reminders; routes clinical questions to a nurse.
5. Cleans the claim: builds the NHIS claim and flags errors before a billing officer submits
it.
What we are trying to achieve
Now (prototype): a working, public demo on synthetic data that proves the build end to
end, and lands interviews for AI developer roles.
Next (product test): interviews with private clinic owners, doctors and billing officers to
confirm the pain and willingness to pay, then a pilot in one clinic.
Goal
Measure
Prototype target
Save doctor time
Notes approved with few
edits
Diagnosis and code correct in ≥ 8 of
10 test cases
Keep patients in
care
No-show prediction quality
AUC ≥ 0.75
Protect clinic
income
Planted claim errors caught
≥ 90%
Stay safe
Actions taken without human
approval
0
Product Brief
