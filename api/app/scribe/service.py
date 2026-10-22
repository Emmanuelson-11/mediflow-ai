import copy
import json
import re

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.core.models import Approval, ScribeNote, Transcript
from app.scribe.data import DEMO_NOTES


def mask_transcript(transcript: Transcript) -> str:
    text = transcript.text
    for value, replacement in (
        (transcript.patient_name, "[PATIENT_1]"),
        (transcript.phone, "[PHONE_1]"),
        (transcript.nhis_number, "[NHIS_1]"),
    ):
        text = text.replace(value, replacement)
    text = re.sub(
        rf"\b{re.escape(str(transcript.patient_id))}\b",
        "[PATIENT_ID_1]",
        text,
    )
    return text


def manual_note() -> dict[str, object]:
    return {
        "chief_complaint": None,
        "history": None,
        "examination": None,
        "diagnosis": None,
        "diagnosis_code": None,
        "medications": [],
        "allergies": None,
        "assessment": None,
        "plan": None,
        "follow_up_date": None,
        "instructions": None,
        "flags": [{"field": "all", "reason": "AI unavailable; complete this note manually."}],
    }


def build_note(transcript: Transcript, *, simulate_failure: bool = False) -> tuple[dict[str, object], str]:
    if simulate_failure:
        return manual_note(), "manual"
    note = copy.deepcopy(DEMO_NOTES[transcript.id])
    note["masked_transcript"] = mask_transcript(transcript)
    return note, "replay"


def generate_note(db: Session, transcript: Transcript, *, simulate_failure: bool = False) -> ScribeNote:
    note_json, generated_by = build_note(transcript, simulate_failure=simulate_failure)
    existing = db.scalar(select(ScribeNote).where(ScribeNote.transcript_id == transcript.id))
    if existing and existing.status == "approved":
        return existing
    note = existing or ScribeNote(id=f"note-{transcript.id}", transcript_id=transcript.id)
    note.status = "draft" if generated_by == "replay" else "needs_attention"
    note.note_json = json.dumps(note_json, sort_keys=True)
    note.generated_by = generated_by
    db.add(note)
    record_audit(
        db,
        actor="AI",
        action="scribe.generated",
        entity="scribe_note",
        entity_id=note.id,
        model="replay" if generated_by == "replay" else None,
        prompt_version="scribe_v1" if generated_by == "replay" else None,
        metadata={"transcript_id": transcript.id, "fallback": generated_by == "manual"},
    )
    db.flush()
    return note


def approve_note(
    db: Session, note: ScribeNote, *, actor: str, edits: dict[str, object] | None = None
) -> tuple[ScribeNote, Approval, bool]:
    if note.status == "approved":
        approval = db.scalar(
            select(Approval)
            .where(Approval.entity == "scribe_note", Approval.entity_id == note.id)
            .order_by(Approval.id.desc())
        )
        if approval is None:
            raise ValueError("Approved note has no approval record")
        return note, approval, True

    payload = json.loads(note.note_json)
    if edits:
        payload.update(edits)
    required = ("diagnosis", "diagnosis_code", "plan")
    if any(not payload.get(field) for field in required):
        raise ValueError("diagnosis, diagnosis_code, and plan are required before approval")
    note.note_json = json.dumps(payload, sort_keys=True)
    note.status = "approved"
    approval = Approval(
        entity="scribe_note",
        entity_id=note.id,
        decision="approved",
        actor=actor,
        reason="Clinician approved the editable draft.",
    )
    db.add(approval)
    record_audit(
        db,
        actor=actor,
        action="scribe_note.approved",
        entity="scribe_note",
        entity_id=note.id,
        metadata={"edited_fields": sorted(edits or {})},
    )
    db.flush()
    return note, approval, False


def follow_up(note: ScribeNote) -> dict[str, object] | None:
    payload = json.loads(note.note_json)
    follow_up_date = payload.get("follow_up_date")
    if not follow_up_date:
        return None
    return {
        "date": follow_up_date,
        "action": "Follow-up appointment",
        "status": "proposed",
        "reason": "Suggested by the clinician's note.",
    }
