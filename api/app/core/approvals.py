from sqlalchemy.orm import Session

from app.core.audit import record_audit
from app.core.models import Approval


def decide(
    db: Session,
    *,
    entity: str,
    entity_id: str,
    decision: str,
    actor: str,
    reason: str | None = None,
) -> Approval:
    if decision not in {"approved", "rejected"}:
        raise ValueError("decision must be approved or rejected")
    approval = Approval(
        entity=entity,
        entity_id=entity_id,
        decision=decision,
        actor=actor,
        reason=reason,
    )
    db.add(approval)
    record_audit(
        db,
        actor=actor,
        action=f"{entity}.{decision}",
        entity=entity,
        entity_id=entity_id,
        metadata={"reason": reason} if reason else {},
    )
    return approval
