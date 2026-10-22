import json

from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.approvals import decide
from app.core.audit import record_audit
from app.core.config import get_settings
from app.core.db import SessionLocal, get_db
from app.core.llm import LLMClient
from app.core.models import AuditLog, Patient, ScribeNote, Transcript
from app.scribe.service import approve_note, follow_up, generate_note

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")


class ApprovalRequest(BaseModel):
    entity: str
    entity_id: str
    decision: str
    reason: str | None = None


class NoteUpdateRequest(BaseModel):
    fields: dict[str, object]


class NoteApprovalRequest(BaseModel):
    fields: dict[str, object] = {}


def current_role(x_role: str | None = Header(default=None)) -> str:
    role = x_role or "doctor"
    allowed = {"doctor", "nurse", "front_desk", "billing", "admin"}
    if role not in allowed:
        raise HTTPException(status_code=403, detail="Unknown role")
    return role


@app.get("/health")
def health(db: Session = Depends(get_db)) -> dict[str, str]:
    db.execute(text("SELECT 1"))
    return {"status": "ok", "environment": settings.environment}


@app.get("/api/v1/context")
def context(role: str = Depends(current_role)) -> dict[str, object]:
    return {"role": role, "demo_mode": settings.demo_mode, "llm_mode": settings.llm_mode}


@app.get("/api/v1/patients")
def patients(db: Session = Depends(get_db), role: str = Depends(current_role)) -> dict[str, object]:
    rows = db.scalars(select(Patient).order_by(Patient.patient_id)).all()
    return {"role": role, "items": [{"id": p.patient_id, "name": p.name, "region": p.region} for p in rows]}


def transcript_payload(db: Session, transcript: Transcript) -> dict[str, object]:
    note = db.scalar(select(ScribeNote).where(ScribeNote.transcript_id == transcript.id))
    return {
        "id": transcript.id,
        "patient_id": transcript.patient_id,
        "patient_name": transcript.patient_name,
        "consultation_date": transcript.consultation_date,
        "clinic": transcript.clinic,
        "status": note.status if note else "none",
    }


@app.get("/api/v1/scribe/transcripts")
def scribe_transcripts(
    db: Session = Depends(get_db), role: str = Depends(current_role)
) -> dict[str, object]:
    rows = db.scalars(select(Transcript).order_by(Transcript.consultation_date.desc(), Transcript.id)).all()
    return {"role": role, "items": [transcript_payload(db, row) for row in rows]}


@app.get("/api/v1/scribe/transcripts/{transcript_id}")
def scribe_transcript(
    transcript_id: str, db: Session = Depends(get_db), role: str = Depends(current_role)
) -> dict[str, object]:
    transcript = db.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(status_code=404, detail="Transcript not found")
    note = db.scalar(select(ScribeNote).where(ScribeNote.transcript_id == transcript.id))
    return {
        **transcript_payload(db, transcript),
        "phone": transcript.phone,
        "nhis_number": transcript.nhis_number,
        "text": transcript.text,
        "note": json.loads(note.note_json) if note else None,
        "generated_by": note.generated_by if note else None,
        "follow_up": follow_up(note) if note else None,
    }


@app.post("/api/v1/scribe/transcripts/{transcript_id}/generate")
def scribe_generate(
    transcript_id: str, db: Session = Depends(get_db), role: str = Depends(current_role)
) -> dict[str, object]:
    transcript = db.get(Transcript, transcript_id)
    if transcript is None:
        raise HTTPException(status_code=404, detail="Transcript not found")
    note = generate_note(db, transcript)
    db.commit()
    return {
        "id": note.id,
        "status": note.status,
        "generated_by": note.generated_by,
        "note": json.loads(note.note_json),
        "follow_up": follow_up(note),
    }


@app.patch("/api/v1/scribe/notes/{note_id}")
def scribe_update(
    note_id: str,
    request: NoteUpdateRequest,
    db: Session = Depends(get_db),
    role: str = Depends(current_role),
) -> dict[str, object]:
    note = db.get(ScribeNote, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    if note.status == "approved":
        raise HTTPException(status_code=409, detail="Approved notes cannot be edited")
    payload = json.loads(note.note_json)
    payload.update(request.fields)
    note.note_json = json.dumps(payload, sort_keys=True)
    note.status = "draft"
    db.commit()
    return {"id": note.id, "status": note.status, "note": payload}


@app.post("/api/v1/scribe/notes/{note_id}/approve")
def scribe_approve(
    note_id: str,
    request: NoteApprovalRequest,
    db: Session = Depends(get_db),
    role: str = Depends(current_role),
) -> dict[str, object]:
    if role != "doctor":
        raise HTTPException(status_code=403, detail="Doctor role required")
    note = db.get(ScribeNote, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="Note not found")
    try:
        note, approval, already_approved = approve_note(
            db, note, actor=role, edits=request.fields or None
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    db.commit()
    return {
        "id": note.id,
        "status": note.status,
        "approval_id": approval.id,
        "idempotent": already_approved,
        "note": json.loads(note.note_json),
        "follow_up": follow_up(note),
    }


@app.post("/api/v1/approvals")
def approvals(
    request: ApprovalRequest,
    db: Session = Depends(get_db),
    role: str = Depends(current_role),
) -> dict[str, object]:
    approval = decide(
        db,
        entity=request.entity,
        entity_id=request.entity_id,
        decision=request.decision,
        actor=role,
        reason=request.reason,
    )
    db.commit()
    return {"id": approval.id, "status": approval.decision}


@app.get("/api/v1/audit")
def audit(db: Session = Depends(get_db), role: str = Depends(current_role)) -> dict[str, object]:
    if role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")
    rows = db.scalars(select(AuditLog).order_by(AuditLog.id.desc()).limit(50)).all()
    return {"items": [{"action": row.action, "actor": row.actor, "entity": row.entity} for row in rows]}


@app.get("/api/v1/llm/smoke")
def llm_smoke() -> dict[str, object]:
    result = LLMClient(settings).complete(
        "foundation-smoke",
        [{"role": "user", "content": "Patient Ama ama@example.com"}],
    )
    with SessionLocal.begin() as db:
        record_audit(
            db,
            actor="AI",
            action="llm.complete",
            entity="foundation",
            model=result.model,
            metadata={"mode": result.mode},
        )
        db.commit()
    return {"mode": result.mode, "model": result.model, "text": result.text}
