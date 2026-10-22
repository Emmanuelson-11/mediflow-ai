import random

from sqlalchemy import delete

from app.core.db import SessionLocal
from app.core.models import Approval, AuditLog, Patient, ScribeNote, Transcript
from app.scribe.data import TRANSCRIPTS


def reset_demo() -> None:
    random.seed(42)
    with SessionLocal.begin() as db:
        db.execute(delete(AuditLog))
        db.execute(delete(Approval))
        db.execute(delete(ScribeNote))
        db.execute(delete(Transcript))
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
        db.add_all([Transcript(**transcript.__dict__) for transcript in TRANSCRIPTS])


if __name__ == "__main__":
    reset_demo()
    print("Seeded 10 deterministic demo patients and 2 synthetic transcripts.")
