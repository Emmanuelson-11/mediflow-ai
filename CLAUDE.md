# MediFlow AI

AI copilot layer for private, NHIS-accredited outpatient clinics in Ghana: scribe (M1), guideline RAG (M2), no-show ML (M3), patient messenger (M4), care-coordinator agent (M5), NHIS claims checker (M6). Prototype on synthetic data. It is the owner's flagship portfolio project and a proof of concept to win clinic/agency clients, so quality and honesty both matter.

## Specs (read before building)

`docs/specs/` holds text extractions of the owner's PDFs (the PDFs in the repo root and `Modules/` are the source of truth). Every brief = the module doc + `02-trd.md` + `05-backend-schema.md` + `04-design-brief.md`. Acceptance criteria live in `07-user-stories.md` and each module's "Definition of done".

## Budget rules (hard constraints)

The owner has about $5 of Anthropic API credit in total. Building with Claude Code does not touch it; only the app's own LLM calls do.

- Default model `claude-haiku-5-5` (set via `LLM_DEFAULT_MODEL`). Never hard-code another model. Use `output_config.effort: "low"` for classification/extraction routes unless an eval shows it hurts quality.
- Every LLM call goes through `core/llm.py`, which: enforces `LLM_BUDGET_USD` from a persistent spend ledger (refuses calls once reached); logs tokens and cost per call; supports `LLM_MODE=live|record|replay` with a disk cache keyed by a hash of (model, prompt version, request). Recordings are committed so tests, CI and the public demo run at $0.
- Tests never call the live API. Use replay fixtures or a fake provider.
- Synthetic data is written by coding agents as files or by seeded scripts, never by the app's API key.
- Prefer the Message Batches API (50% cheaper) for bulk eval runs (M2 judge, M6's 200 claims).
- Before any command that spends real credit (live evals, record mode), state the estimated cost and get the owner's OK.

## Architecture rules (from the TRD)

- Python 3.11 + FastAPI + Pydantic v2 + SQLAlchemy 2 + Alembic; PostgreSQL 16 + pgvector; React 18 + Vite + TypeScript + Tailwind; Docker Compose services `api`, `web`, `db`, `sim_nhis`.
- `api/` holds one package per module (`scribe`, `knowledge`, `risk`, `messenger`, `coordinator`, `claims`) plus `core` (llm, masking, audit, events, config). A module writes only its own tables.
- `sim_nhis/` must never import anything from `api/`.
- Prompts live in `prompts/<name>_v<N>.txt`. Never inline prompts in code.
- Any patient text sent to an LLM goes through `core.masking.mask()` first. The name map is never stored.
- Every AI action and human approval is written to `audit_log`.
- No hard-coded keys, model names or thresholds: everything comes from `core/config.py` reading `.env`.
- Human approval before any record, message or claim becomes final. An LLM failure never blocks a user (manual fallback everywhere).
- Seed 42 everywhere. `make reset-demo` rebuilds all data.
- When writing Anthropic SDK code, load the `claude-api` skill first; don't code the SDK from memory.

## Decisions log (amendments to the PDFs; the owner can veto any of these)

1. Cost strategy above (Haiku default, budget cap, record/replay) added to the TRD.
2. Public demo runs in replay mode, so visitors never spend the owner's credit.
3. Claims headline is framed as "errors caught before vetting (synthetic data)", per the validation research; the rejection-rate before/after stays as the eval but is never presented as real-world NHIS data.
4. M3 model card states plainly that metrics reflect the generator's known rules; the cold-start story (attendance marking feeds retraining) is shown on the Results page.
5. A public landing page / case study is added in the Launch phase (not in the PDFs).

## Working agreement

- One agent, one branch, one module (`m1-scribe`, `m2-knowledge`, ...). Shared `core`/schema changes are proposed, merged first, then others rebase.
- Builder agents build; critic agents (architecture, design, ML/eval honesty, clinical safety, buyer persona) review against the specs before each gate. The owner is the product judge at every gate (G0–G4 in `06-implementation-plan.md`).
- Windows host; use Docker for Postgres. Never commit `.env`.
