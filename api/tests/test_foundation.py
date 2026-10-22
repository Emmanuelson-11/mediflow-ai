from app.core.config import Settings
from app.core.masking import mask
from app.core.llm import LLMClient


def test_masking_removes_direct_identifiers():
    result = mask("Ama ama@example.com, 0241234567, NHIS-ABC12345")
    assert "ama@example.com" not in result.text
    assert "0241234567" not in result.text
    assert result.replacements >= 3


def test_replay_llm_never_calls_live_provider():
    result = LLMClient(Settings(llm_mode="replay")).complete(
        "test", [{"role": "user", "content": "hello"}]
    )
    assert result.mode == "replay"
    assert result.cost_usd == 0
