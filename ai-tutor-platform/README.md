# AI Tutor Platform

Enterprise-grade, cloud-native AI tutoring SaaS for software engineers.
Built as a FAANG-style mono-repo across 6 NestJS microservices, 4 AI services, and a React frontend.

## Quick Start

### Prerequisites

- **Node.js** 20+ and **Yarn** 4+
- **Docker** + **Docker Compose**

### Run locally

```bash
# 1. Clone
git clone <repo-url>
cd ai-tutor-platform

# 2. Copy env files (edit API keys where needed)
cp backend/auth-service/.env.example backend/auth-service/.env
cp ai-services/llm-wrapper/.env.example ai-services/llm-wrapper/.env
# Repeat for each service as needed

# 3. Start all services
docker-compose up --build

# Services will be available at:
#   Frontend:           http://localhost:3000
#   Auth API + Swagger: http://localhost:8001/api
#   Session API:        http://localhost:8002/api
#   Curriculum API:     http://localhost:8003/api
#   Homework API:       http://localhost:8004/api
#   Analytics API:      http://localhost:8005/api
#   Payment API:        http://localhost:8006/api
#   LLM Wrapper:        http://localhost:5001
#   Vector DB:          http://localhost:5002
#   Prompt Engine:      http://localhost:5003
#   Safety Guardrails:  http://localhost:5004
#   PostgreSQL:         localhost:5432
#   Redis:              localhost:6379
```

## Repository Structure

```
ai-tutor-platform/
├── frontend/                  # React 18 + TypeScript + Vite
├── backend/
│   ├── auth-service/          # NestJS — JWT auth, users, RBAC        :8001
│   ├── session-service/       # NestJS — AI teaching sessions          :8002
│   ├── curriculum-service/    # NestJS — adaptive learning roadmaps    :8003
│   ├── homework-service/      # NestJS — homework generation + grading :8004
│   ├── analytics-service/     # NestJS — progress tracking             :8005
│   └── payment-service/       # NestJS — Stripe subscriptions          :8006
├── ai-services/
│   ├── llm-wrapper/           # OpenAI / Anthropic with failover       :5001
│   ├── vector-db/             # Pinecone embeddings + RAG              :5002
│   ├── prompt-engine/         # Versioned prompt templates             :5003
│   └── safety-guardrails/     # Input/output moderation                :5004
├── common/                    # Shared types, errors, constants
├── scripts/                   # DB migrations, seeders, deployment
├── docs/                      # Architecture, API docs, ADRs
└── docker-compose.yml         # Full local dev environment
```

## Development

```bash
# Install all dependencies (from repo root)
yarn install

# Run lint across all packages
yarn lint

# Type-check all packages
yarn typecheck

# Run all tests
yarn test

# Work on a single service
cd backend/auth-service
yarn dev                       # Hot-reload dev server
yarn test                      # Unit tests
yarn test:e2e                  # End-to-end tests
```

## Commit Convention

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by Husky + commitlint.

```
feat(auth-service): add email verification endpoint
fix(session-service): handle WebSocket reconnection edge case
docs(root): update architecture overview
ci(root): add path-filtered test jobs
```

Allowed scopes: `root`, `frontend`, `auth-service`, `session-service`, `curriculum-service`,
`homework-service`, `analytics-service`, `payment-service`, `llm-wrapper`, `vector-db`,
`prompt-engine`, `safety-guardrails`, `common`, `docker`, `ci`, `docs`

## CI/CD

| Trigger              | Pipeline           | Steps                                      |
|----------------------|--------------------|--------------------------------------------|
| PR / push to any branch | `ci.yml`       | Lint → Typecheck → Test (path-filtered)    |
| Push to `main`       | `ci.yml`           | + Docker build & push to GHCR             |
| CI succeeds on `main`| `cd.yml`           | Deploy to EKS staging                      |

## Sprint Roadmap

| Phase                       | Sprints | Status        |
|-----------------------------|---------|---------------|
| 1 — Foundation              | 1–4     | **Current**   |
| 2 — AI Teaching Engine      | 5–8     | Upcoming      |
| 3 — Adaptive Learning       | 9–12    | Upcoming      |
| 4 — Dashboard & Payments    | 13–16   | Upcoming      |
| 5 — Scale & Observability   | 17–20   | Upcoming      |
| 6 — Hardening & Launch      | 21–24   | Upcoming      |

## Further Reading

- [Architecture Overview](docs/architecture/overview.md)
- [API Documentation](docs/api/README.md)
- [ADR-001: NestJS for backend microservices](docs/design/adr-001-nestjs-microservices.md)
- [Backend Services README](backend/README.md)
- [AI Services README](ai-services/README.md)
- [Frontend README](frontend/README.md)

## License

Proprietary — AI Tutor Platform © 2025
