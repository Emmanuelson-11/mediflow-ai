import json
import os

os.environ["DATABASE_URL"] = "sqlite://"

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.core.models import Approval, Base, ScribeNote, Transcript
from app.scribe.data import TRANSCRIPTS
from app.scribe.service import approve_note, build_note, generate_note, mask_transcript


def session() -> Session:
    engine = create_engine("sqlite://")
    Base.metadata.create_all(engine)
    return Session(engine)


def transcript() -> Transcript:
    return Transcript(**TRANSCRIPTS[0].__dict__)


def test_masking_hides_identity_before_replay():
    row = transcript()
    masked = mask_transcript(row)
    assert row.patient_name not in masked
    assert row.phone not in masked
    assert row.nhis_number not in masked
    assert "[PATIENT_1]" in masked


def test_manual_fallback_is_editable_and_explicit():
    note, generated_by = build_note(transcript(), simulate_failure=True)
    assert generated_by == "manual"
    assert note["diagnosis"] is None
    assert note["flags"][0]["reason"].startswith("AI unavailable")


def test_approval_is_idempotent_and_auditable():
    db = session()
    row = transcript()
    db.add(row)
    note = generate_note(db, row)
    db.commit()

    approved, first, already = approve_note(db, note, actor="doctor")
    db.commit()
    assert approved.status == "approved"
    assert already is False

    same, second, already = approve_note(db, note, actor="doctor")
    assert already is True
    assert second.id == first.id
    assert db.scalars(select(Approval)).all()
    assert json.loads(same.note_json)["diagnosis_code"] == "J06.9"
