from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI(title="MediFlow Simulated NHIS", version="0.1.0")


class Claim(BaseModel):
    claim_id: str
    total_ghs: float


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/adjudicate")
def adjudicate(claim: Claim) -> dict[str, object]:
    accepted = claim.total_ghs <= 1000
    return {
        "claim_id": claim.claim_id,
        "decision": "accepted" if accepted else "rejected",
        "reasons": [] if accepted else ["Synthetic threshold exceeded"],
        "amount_paid_ghs": claim.total_ghs if accepted else 0,
    }
