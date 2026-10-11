<!-- Extracted from 'MediFlow AI — User Stories.pdf'. The PDF is the source of truth. -->

MediFlow AI — User Stories
How to read this
Every feature in MediFlow is written here as user stories, in the order a patient moves
through the clinic: consultation, guidelines, care plan, follow-up, messages, claim. Each
story has acceptance criteria, which are the checks a coding agent must pass before the
story counts as done.
Format: As a [role], I want [action], so that [benefit].
Roles: Doctor, Nurse, Front desk, Billing officer, Patient, Admin (the builder running demos
and evaluations).
Priority: Must = needed for the demo to work end to end. Should = makes the demo
stronger; build if time allows.
Epic 1: Clinical note (Scribe)
ID
Story
Acceptance criteria
Priority
US-
1.1
As a doctor, I want to see today's
consultations in one list, so that I
know which notes still need
writing.
List shows all transcripts with
patient name, date and note status
(none, draft, needs attention,
approved).
Must
US-
1.2
As a doctor, I want to generate a
draft note from a transcript in one
click, so that I don't write it from
scratch.
Draft appears in under 30 seconds
with all 13 fields; LLM-filled fields
are marked "AI draft".
Must
US-
1.3
As a doctor, I want the transcript
next to the draft, so that I can
check every field against what was
said.
Side-by-side layout; transcript
scrolls independently.
Must
US-
1.4
As a doctor, I want doubtful fields
highlighted with a reason, so that I
know where to look first.
Fields failing validation show in
amber with the reason (e.g. "code
format invalid").
Must
US-
1.5
As a doctor, I want to edit any field
and approve the note, so that the
final record is mine.
Approve is disabled while a
required field is empty; on approve,
status becomes approved and the
edited fields are recorded.
Must
MediFlow AI — User Stories

Epic 2: Guidelines (Protocol assistant)
ID
Story
Acceptance criteria
Priority
US-
1.6
As a doctor, I want to regenerate a
poor draft, so that I don't have to
fix a bad one by hand.
Regenerate re-runs the pipeline
and replaces the unapproved draft.
Should
US-
1.7
As a patient, I want my identity
hidden from the AI service, so that
my details don't leave the clinic.
Text sent to the LLM contains no
real name, phone or NHIS number
(verified in logs); real names
reappear on the review screen.
Must
US-
1.8
As a doctor, I want the note to
open even when the AI fails, so
that I can still work.
On AI failure, the form opens empty
with "AI unavailable, fill manually".
Must
ID
Story
Acceptance criteria
Priority
US-
2.1
As a doctor, I want to check my
prescription against the clinic
guidelines before I approve, so that
I catch mistakes early.
Check guideline marks each drug
as matches, dose differs, not first-
line or not in guideline, with a
citation; the 2 planted mismatches
are flagged.
Must
US-
2.2
As any staff member, I want to ask
the guidelines a question in plain
words, so that I don't have to
search the PDFs.
Answer in under 5 seconds, every
statement cited by document,
section and page.
Must
US-
2.3
As any staff member, I want to
open the source behind a citation,
so that I can trust the answer.
Clicking a citation shows the
original chunk text.
Must
US-
2.4
As any staff member, I want a clear
"not covered" answer when the
guidelines don't say, so that I'm
never given a made-up answer.
All 5 out-of-scope test questions
return the refusal sentence; the
LLM is not called on weak matches.
Must
US-
2.5
As an admin, I want to re-load the
guideline documents with one
click, so that answers stay current.
Re-ingest replaces chunks and
shows the chunk count and time.
Should
MediFlow AI — User Stories

Epic 3: Care plan (Care coordinator)
ID
Story
Acceptance criteria
Priority
US-
3.1
As a nurse, I want a care plan
created automatically when a
doctor approves a note, so that I
don't plan each step by hand.
Approving a note starts a run; the
plan reaches "awaiting approval"
in under 30 seconds.
Must
US-
3.2
As a nurse, I want every proposed
action to show its reason and
source, so that I know why it was
suggested.
Each action shows a reason and a
note field or guideline citation.
Must
US-
3.3
As a nurse, I want to approve, edit
or reject each action, or approve all,
so that nothing happens without
me.
Actions only execute after
approval; rejected actions are
kept with a reason.
Must
US-
3.4
As a nurse, I want disagreements
between the note and the guideline
flagged, so that the agent never
picks a side for the doctor.
The conflict test case shows a flag
at the top and no auto-chosen
date.
Must
US-
3.5
As a nurse, I want to see the agent's
step-by-step trace, so that I can
check its reasoning.
Trace lists every step: reasoning
line, tool, input, result, time.
Must
US-
3.6
As a doctor, I want a referral letter
drafted only when the guideline
calls for it, so that patients aren't
referred needlessly.
Letter drafted for the referral test
case and for no other case.
Should
US-
3.7
As an admin, I want to switch the
coordinator off, so that the clinic
still works if the agent fails.
With the coordinator off, scoring,
messages and claims run on the
direct triggers.
Should
MediFlow AI — User Stories

Epic 4: Appointments and no-show risk
Epic 5: Patient messaging
ID
Story
Acceptance criteria
Priority
US-
4.1
As front desk, I want every new
follow-up to get a no-show risk
score automatically, so that I know
who may not come.
Approved follow-ups are scored
on creation with band High,
Medium or Low.
Must
US-
4.2
As front desk, I want a one-
sentence reason for each risk, so
that I understand and can act on it.
Each score shows a plain sentence
naming only its top 3 factors;
template sentence used if the AI
fails.
Must
US-
4.3
As front desk, I want upcoming
appointments sorted by risk, so
that I focus on the riskiest first.
Schedule sorts by score, highest
first, with reminder and
confirmation status.
Must
US-
4.4
As front desk, I want to mark each
appointment attended or missed,
so that we measure results and
improve the model.
Attended or Missed saves to the
appointment and appears in
results.
Must
US-
4.5
As an admin, I want the model's
quality shown against a simple
baseline, so that I can prove it adds
value.
Model card shows AUC, precision
and recall for both models; the
chosen model beats the baseline.
Must
US-
4.6
As an admin, I want to check that
the model doesn't rely on sex, so
that it's fair.
Model card shows sex near the
bottom of SHAP importance.
Should
ID
Story
Acceptance criteria
Priority
US-
5.1
As a patient at high risk of missing
a visit, I want reminders before my
appointment, so that I don't forget.
High risk: 2 reminders (3 days and 1
day before); Medium: 1; Low: none.
Reminders never mention the
diagnosis.
Must
US-
5.2
As a patient, I want to confirm or
change my appointment by
replying, so that I don't have to call.
"1" confirms; "2" offers 3 free slots;
choosing one rebooks and frees
the old slot.
Must
MediFlow AI — User Stories

Epic 6: NHIS claims
ID
Story
Acceptance criteria
Priority
US-
5.3
As a patient, I want plain-English
instructions after my visit, so that I
know how to take my medicines
and when to come back.
Message covers what was found,
medicines, danger signs and next
visit; readability score ≥ 60.
Must
US-
5.4
As a nurse, I want to approve after-
visit instructions before they're
sent, so that patients only get
correct advice.
Messages wait for approval; any
medicine name, dose or duration
that doesn't match the note blocks
sending.
Must
US-
5.5
As a patient, I want simple
questions (hours, directions, what
to bring) answered quickly, so that
I get help without waiting.
Logistics questions are answered
from the guideline documents;
nothing is invented.
Should
US-
5.6
As a nurse, I want every medical
question sent to me rather than
answered by the AI, so that
patients never get unsafe advice.
All clinical test messages reach the
nurse inbox; the patient gets the
hand-off message.
Must
US-
5.7
As a patient in an emergency, I
want an immediate, clear
instruction, so that I get help fast.
Emergency words trigger the
emergency reply and a red staff
alert without calling the AI; 6 of 6
test emergencies caught.
Must
US-
5.8
As a patient, I want to stop
messages by replying STOP, so that
I control what I receive.
STOP opts the patient out; no
further reminders; START turns
them back on.
Must
US-
5.9
As a patient, I want no messages at
night and not too many in a day, so
that I'm not disturbed.
No sends from 20:00 to 07:00
(except emergency replies);
maximum 2 automated messages a
day.
Should
ID
Story
Acceptance criteria
Priority
US-
6.1
As a billing officer, I want each
claim built automatically from the
approved note, so that I don't re-
type diagnoses and medicines.
Claim lines come from the note;
quantities and prices come only
from the tariff table; totals add up.
Must
MediFlow AI — User Stories

Epic 7: Admin, results and demo
ID
Story
Acceptance criteria
Priority
US-
6.2
As a billing officer, I want claims
sorted red, amber and green, so
that I fix the riskiest first.
Queue orders red (blocking
errors), amber (warnings or AI
queries), then green.
Must
US-
6.3
As a billing officer, I want each
problem explained with a
suggested fix, so that I can correct
it quickly.
Every flag shows the check, a
reason and, where possible, a fix
(e.g. correct code or price).
Must
US-
6.4
As a billing officer, I want the AI to
question drugs that don't fit the
diagnosis or notes that don't
support it, so that I catch errors
rules can't see.
LLM queries cite a guideline
chunk; queries without a citation
are dropped.
Must
US-
6.5
As a billing officer, I want to
override a warning with a written
reason, so that I can submit valid
exceptions.
Amber flags can be overridden
only with a reason, saved with my
name; red flags cannot be
overridden.
Must
US-
6.6
As a billing officer, I want to submit
a clean claim and see the result, so
that I know if it will be paid.
Submit returns paid or rejected
with reasons; rejected claims
return to the queue.
Must
US-
6.7
As a clinic manager, I want to see
the claim rejection rate and amount
paid, so that I know the money
impact.
Results show the rejection rate
before vs after checks, error catch
rate and GH¢ recovered (synthetic
data).
Should
ID
Story
Acceptance criteria
Priority
US-
7.1
As an admin, I want to switch
between roles from the top bar, so
that I can demo every screen
alone.
Role switcher changes the menu
and permissions instantly.
Must
US-
7.2
As an admin, I want to reset all
demo data with one click, so that
every demo starts clean.
Reset rebuilds patients, transcripts,
appointments and claims from the
seeded generators.
Must
MediFlow AI — User Stories

Coverage
48 stories across 7 epics: 39 Must and 9 Should. Ama's full journey (US-1.2 → US-1.5 → US-
2.1 → US-3.1 → US-3.3 → US-4.1 → US-5.1 → US-5.3 → US-6.1 → US-6.6) uses only Must stories,
so the end-to-end demo can be completed before any Should story is started.
ID
Story
Acceptance criteria
Priority
US-
7.3
As an admin, I want to run the
daily job for any date, so that I can
show reminders without waiting
days.
"Run daily job for date" sends the
reminders due on that date.
Must
US-
7.4
As an admin, I want one results
page across all modules, so that a
reviewer sees the evidence in one
place.
Results page shows every KPI
against its target, with model and
prompt versions and run date.
Must
US-
7.5
As a reviewer, I want to see that
every AI action and approval is
logged, so that I trust the system
is auditable.
Audit log lists who or what acted, on
what, with which model and prompt
version.
Should
US-
7.6
As any user, I want a clear notice
that this is a prototype on
synthetic data, so that nobody
mistakes it for a clinical tool.
Banner shows on every screen.
Must
MediFlow AI — User Stories
