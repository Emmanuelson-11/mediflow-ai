import re
from dataclasses import dataclass


@dataclass(frozen=True)
class MaskedText:
    text: str
    replacements: int


def mask(text: str) -> MaskedText:
    """Remove common direct identifiers without retaining a reverse name map."""
    patterns = [
        r"\b[\w.+-]+@[\w-]+\.[\w.-]+\b",
        r"\b(?:\+233|0)\d{9}\b",
        r"\b(?:NHIS[- ]?)?[A-Z0-9]{8,}\b",
    ]
    masked = text
    replacements = 0
    for pattern in patterns:
        masked, count = re.subn(pattern, "[REDACTED]", masked, flags=re.IGNORECASE)
        replacements += count
    return MaskedText(masked, replacements)
