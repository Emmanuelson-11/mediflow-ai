# MediFlow AI

MediFlow AI is a prototype clinical workflow copilot for synthetic outpatient-clinic data. The foundation intentionally stops before implementing the six vertical modules.

## Run locally

1. Copy `.env.example` to `.env` (the default replay mode never calls a live LLM).
2. Run `docker compose up --build`. The API container applies migrations and seeds ten demo patients on startup.
3. Open `http://localhost:8000/docs` for the API and `http://localhost:5173` for the web shell.

The API exposes `/health`, role-aware `/api/v1/context`, deterministic demo patients, approval recording, admin-only audit reads, and an LLM replay smoke endpoint. The simulated NHIS service is independent of `api/` and exposes `/health` and `/adjudicate`.

To rebuild demo data after the stack is running, use `make reset-demo`. The module-specific clinical workflows, live LLM provider adapters, real authentication, and production NHIS integration remain under construction by later vertical-slice builders.

## Foundation contracts

- All configuration is environment-driven; `.env` is never committed.
- Patient text is masked before reaching the LLM boundary.
- Replay/fake modes are safe defaults for tests and demos; live calls are not implemented in this foundation.
- AI actions and human approvals have an audit primitive.
- Final clinical, message, and claim actions must be approved by a human in future module implementations.
- `make reset-demo` uses seed 42 and rebuilds the ten foundation patients.
