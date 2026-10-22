import random

from sqlalchemy import delete

from app.core.db import SessionLocal
from app.core.models import AuditLog, Patient


def reset_demo() -> None:
    random.seed(42)
    with SessionLocal.begin() as db:
        db.execute(delete(AuditLog))
        db.execute(delete(Patient))
        db.add_all(
            [
                Patient(
                    patient_id=index,
                    name=f"Demo Patient {index:02d}",
                    sex="F" if index % 2 else "M",
                    region="Greater Accra" if index % 3 else "Ashanti",
                )
                for index in range(1, 11)
            ]
        )


if __name__ == "__main__":
    reset_demo()
    print("Seeded 10 deterministic demo patients.")
