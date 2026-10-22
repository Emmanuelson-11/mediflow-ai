from dataclasses import dataclass

from app.core.config import Settings
from app.core.masking import mask


class LLMUnavailable(RuntimeError):
    """Raised when a live provider is intentionally unavailable."""


@dataclass(frozen=True)
class LLMResult:
    text: str
    model: str
    mode: str
    input_tokens: int = 0
    output_tokens: int = 0
    cost_usd: float = 0.0


class LLMClient:
    def __init__(self, settings: Settings):
        self.settings = settings

    def complete(
        self,
        task: str,
        messages: list[dict[str, str]],
        *,
        schema: dict | None = None,
    ) -> LLMResult:
        masked_messages = [
            {**message, "content": mask(message.get("content", "")).text}
            for message in messages
        ]
        if self.settings.llm_mode == "replay":
            return LLMResult(
                text=f"Replay response for {task}",
                model=self.settings.llm_default_model,
                mode="replay",
            )
        if self.settings.llm_mode == "fake":
            return LLMResult(
                text=f"Fake response for {task}",
                model=self.settings.llm_default_model,
                mode="fake",
            )
        raise LLMUnavailable(
            "Live LLM calls are not enabled in the foundation; use replay or fake mode."
        )
