from fastapi import Depends, FastAPI, Header, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, text
from sqlalchemy.orm import Session

from app.core.approvals import decide
from app.core.audit import record_audit
from app.core.config import get_settings
from app.core.db import SessionLocal, get_db
from app.core.llm import LLMClient
from app.core.models import AuditLog, Patient

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")


class ApprovalRequest(BaseModel):
    entity: str
    entity_id: str
    decision: str
    reason: str | None = None


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
