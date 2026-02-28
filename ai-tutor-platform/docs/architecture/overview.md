# Architecture Overview

AI Tutor Platform — Cloud-Native SaaS for Software Engineers

## High-Level Flow

```
Client (Web / Mobile)
    │
    ▼
CDN (CloudFront)  →  Static assets, edge caching
    │
    ▼
WAF (AWS WAF)  →  Injection blocking, IP rate limiting
    │
    ▼
Load Balancer (ALB)  →  SSL termination, health-check routing
    │
    ▼
API Gateway  →  Auth enforcement, route delegation
    │
    ├── auth-service      :8001  (NestJS + TypeORM + Redis)
    ├── session-service   :8002  (NestJS + TypeORM + Redis)
    ├── curriculum-service:8003  (NestJS + TypeORM)
    ├── homework-service  :8004  (NestJS + TypeORM + SQS)
    ├── analytics-service :8005  (NestJS + TypeORM)
    └── payment-service   :8006  (NestJS + TypeORM + Stripe)
              │
              ▼
    AI Layer (internal only)
    ├── llm-wrapper       :5001  (OpenAI GPT-4o → Anthropic Claude fallback)
    ├── vector-db         :5002  (Pinecone embeddings, RAG)
    ├── prompt-engine     :5003  (template management)
    └── safety-guardrails :5004  (moderation, topic blocking)
              │
              ▼
    Data Layer
    ├── PostgreSQL (RDS Multi-AZ)
    ├── Redis (ElastiCache)
    ├── Pinecone (Vector DB)
    └── S3 (recordings, homework files, archives)
```

## Mono-Repo Structure

```
ai-tutor-platform/
├── frontend/                  React 18 + TypeScript + Vite
├── backend/
│   ├── auth-service/          NestJS — JWT, users, RBAC
│   ├── session-service/       NestJS — AI teaching sessions
│   ├── curriculum-service/    NestJS — adaptive roadmaps
│   ├── homework-service/      NestJS — generation + grading
│   ├── analytics-service/     NestJS — progress tracking
│   └── payment-service/       NestJS — Stripe subscriptions
├── ai-services/               Express + TypeScript (latency-optimised)
│   ├── llm-wrapper/           Multi-provider LLM with failover
│   ├── vector-db/             Pinecone client + embedding store
│   ├── prompt-engine/         Versioned prompt templates
│   └── safety-guardrails/     Input/output moderation
├── common/                    Shared types, errors, constants
├── scripts/                   Migrations, seeders, deployment
├── docs/                      Architecture, API, ADRs
└── docker-compose.yml         Local dev (all 13 services + PG + Redis)
```

## Technology Decisions

| Layer           | Technology                                  | Rationale                                      |
|-----------------|---------------------------------------------|------------------------------------------------|
| Frontend        | React 18 + Vite + TanStack Query            | Fast DX, excellent TypeScript support          |
| Backend         | NestJS 10 + TypeORM + PostgreSQL            | DI container, modules, built-in testing        |
| AI layer        | Express + TypeScript (lightweight)          | Minimal overhead for LLM proxy calls           |
| Auth            | JWT (HS256) + Passport.js + Redis rotation  | Stateless access + revocable refresh tokens    |
| Cache           | Redis (ioredis)                             | Session store, rate limiting, token blacklist  |
| Queue           | AWS SQS                                     | Durable async jobs (grading, emails, analytics)|
| Vector DB       | Pinecone                                    | Managed, scalable, low-latency similarity search|
| LLM             | OpenAI GPT-4o + Anthropic Claude fallback   | Cost + reliability balance                     |
| Containerisation| Docker + Kubernetes (EKS)                   | Cloud-portable, auto-scaling                   |
| CI/CD           | GitHub Actions → GHCR → ArgoCD             | GitOps, path-filtered builds                   |
| Monitoring      | Prometheus + Grafana + OpenTelemetry        | Full observability stack (Sprint 17)           |

## AI Teaching Session Data Flow

1. Student sends question via frontend WebSocket/REST
2. `session-service` validates JWT and authorises the request
3. `session-service` → `safety-guardrails` (input check)
4. `session-service` → `prompt-engine` (compose full prompt)
5. `session-service` → `vector-db` (fetch prior conversation context via RAG)
6. `session-service` → `llm-wrapper` (LLM call with context)
7. `llm-wrapper` → OpenAI (or falls back to Anthropic on error/timeout)
8. Response streams back to client via SSE
9. `session-service` persists exchange to PostgreSQL + updates Pinecone embeddings
10. `session-service` → SQS (async analytics event)

## Sprint Roadmap

| Phase | Sprints | Status        |
|-------|---------|---------------|
| 1 — Foundation             | 1–4   | **Current**   |
| 2 — AI Teaching Engine     | 5–8   | Upcoming      |
| 3 — Adaptive Learning      | 9–12  | Upcoming      |
| 4 — Dashboard & Payments   | 13–16 | Upcoming      |
| 5 — Scale & Observability  | 17–20 | Upcoming      |
| 6 — Hardening & Launch     | 21–24 | Upcoming      |
