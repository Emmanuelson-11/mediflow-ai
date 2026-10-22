import json

from sqlalchemy.orm import Session

from app.core.models import AuditLog


def record_audit(
    db: Session,
    *,
    actor: str,
    action: str,
    entity: str,
    entity_id: str | None = None,
    model: str | None = None,
    prompt_version: str | None = None,
    metadata: dict[str, object] | None = None,
) -> AuditLog:
    event = AuditLog(
        actor=actor,
        action=action,
        entity=entity,
        entity_id=entity_id,
        model=model,
        prompt_version=prompt_version,
        metadata_json=json.dumps(metadata or {}, sort_keys=True),
    )
    db.add(event)
    db.flush()
    return event
