# MediFlow AI

MediFlow AI is a prototype clinical workflow copilot for synthetic outpatient-clinic data. The recruiter-facing MVP combines an interactive clinic operations shell with the implemented Scribe vertical slice; the remaining modules are intentionally under construction.

## Run locally

1. Copy `.env.example` to `.env` (the default replay mode never calls a live LLM).
2. Run `docker compose up --build`. The API container applies migrations and seeds ten demo patients on startup.
3. Open `http://localhost:8000/docs` for the API and `http://localhost:5173` for the web shell. The Vite dev server proxies `/api/*` to the API container.

The API exposes `/health`, role-aware `/api/v1/context`, deterministic demo patients, the recruiter-facing Scribe slice at `/api/v1/scribe/transcripts`, approval recording, admin-only audit reads, and an LLM replay smoke endpoint. The simulated NHIS service is independent of `api/` and exposes `/health` and `/adjudicate`.

## Scribe demo flow

1. Open the web app in **Overview**, then select **Consultations** (or **Follow Ama's journey**).
2. Select a synthetic consultation and then **Generate AI draft**. The result is a deterministic replay fixture; no live LLM call is made.
3. Edit the diagnosis, ICD-10 code, plan, or follow-up date inline. Changes are saved on blur.
4. Select **Approve note** as the Doctor role from the role switcher. The API records the approval and audit event exactly once, then shows the proposed follow-up appointment/action. Other roles remain read-only for this action.

The API also supports `GET /api/v1/scribe/transcripts`, `GET /api/v1/scribe/transcripts/{id}`, `POST /api/v1/scribe/transcripts/{id}/generate`, `PATCH /api/v1/scribe/notes/{note_id}`, and `POST /api/v1/scribe/notes/{note_id}/approve`. To run focused tests without Docker from `api/`, use `pytest tests/test_scribe.py tests/test_foundation.py`; the normal `make test` command remains the full containerized check.

To rebuild demo data after the stack is running, use `make reset-demo`. The module-specific clinical workflows, live LLM provider adapters, real authentication, and production NHIS integration remain under construction by later vertical-slice builders.

## Foundation contracts

- All configuration is environment-driven; `.env` is never committed.
- Patient text is masked before reaching the LLM boundary.
- Replay/fake modes are safe defaults for tests and demos; live calls are not implemented in this foundation.
- AI actions and human approvals have an audit primitive.
- Final clinical, message, and claim actions must be approved by a human in future module implementations.
- `make reset-demo` uses seed 42 and rebuilds the ten foundation patients.
