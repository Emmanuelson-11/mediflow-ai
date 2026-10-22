from dataclasses import dataclass


@dataclass(frozen=True)
class DemoTranscript:
    id: str
    patient_id: int
    patient_name: str
    phone: str
    nhis_number: str
    consultation_date: str
    clinic: str
    text: str


TRANSCRIPTS = (
    DemoTranscript(
        id="tx-1001",
        patient_id=1,
        patient_name="Ama Mensah",
        phone="024 123 4567",
        nhis_number="NHIS-AMA-1001",
        consultation_date="2026-10-20",
        clinic="MediFlow Accra Clinic",
        text=(
            "Doctor: Good morning Ama Mensah. What brings you in? "
            "Patient: I have had a cough and fever for three days. "
            "Doctor: Your temperature is 38.1 C and lungs are clear. "
            "This is an uncomplicated upper respiratory infection. "
            "Take paracetamol 500 mg three times daily for 3 days, drink fluids, "
            "and return in 7 days if you are not better."
        ),
    ),
    DemoTranscript(
        id="tx-1002",
        patient_id=2,
        patient_name="Kojo Owusu",
        phone="020 555 0182",
        nhis_number="NHIS-KOJ-1002",
        consultation_date="2026-10-21",
        clinic="MediFlow Accra Clinic",
        text=(
            "Doctor: Kojo Owusu, tell me about the pain. Patient: My right knee hurts "
            "after football. Doctor: There is mild swelling and tenderness, with no deformity. "
            "This is a knee sprain. Rest, use ice, and return in 14 days."
        ),
    ),
)


DEMO_NOTES: dict[str, dict[str, object]] = {
    "tx-1001": {
        "chief_complaint": "Cough and fever for three days",
        "history": "Three days of cough and fever.",
        "examination": "Temperature 38.1 C; lungs clear.",
        "diagnosis": "Uncomplicated upper respiratory infection",
        "diagnosis_code": "J06.9",
        "medications": [
            {"name": "Paracetamol", "dose": "500 mg", "frequency": "three times daily", "duration_days": 3}
        ],
        "allergies": None,
        "assessment": "Stable outpatient presentation.",
        "plan": "Hydration and symptomatic treatment.",
        "follow_up_date": "2026-10-27",
        "instructions": "Drink fluids and return sooner if symptoms worsen.",
        "flags": [],
    },
    "tx-1002": {
        "chief_complaint": "Right knee pain after football",
        "history": "Knee pain after football with mild swelling.",
        "examination": "Mild swelling and tenderness; no deformity.",
        "diagnosis": "Sprain of right knee",
        "diagnosis_code": "S83.91XA",
        "medications": [],
        "allergies": None,
        "assessment": "No deformity noted.",
        "plan": "Rest and use ice.",
        "follow_up_date": "2026-11-04",
        "instructions": "Return sooner for worsening pain or inability to bear weight.",
        "flags": [],
    },
}
