from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "MediFlow AI"
    environment: str = "development"
    database_url: str = "postgresql+psycopg://mediflow:mediflow@db:5432/mediflow"
    anthropic_api_key: str | None = None
    llm_default_model: str = "claude-haiku-5-5"
    llm_budget_usd: float = 4.0
    llm_mode: str = "replay"
    llm_replay_dir: str = "data/llm_replays"
    coordinator_enabled: bool = True
    rag_min_similarity: float = 0.50
    sim_nhis_url: str = "http://sim_nhis:8001"
    demo_mode: bool = True

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
