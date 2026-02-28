# Backend Services

All services are Node.js + TypeScript + Express microservices.

| Service             | Port | Status         |
|---------------------|------|----------------|
| auth-service        | 8001 | Scaffold ✓     |
| session-service     | 8002 | Scaffold ✓     |
| curriculum-service  | 8003 | Scaffold ✓     |
| homework-service    | 8004 | Scaffold ✓     |
| analytics-service   | 8005 | Scaffold ✓     |
| payment-service     | 8006 | Scaffold ✓     |

## Common patterns

- **Config**: `src/config/env.ts` – Zod-validated env vars, fails fast at startup
- **Logging**: Pino structured logger, redacts secrets
- **Errors**: `AppError` hierarchy, central `error.middleware.ts`
- **Validation**: Zod schemas + `validate.middleware.ts`
- **Health**: `GET /health` on every service
- **Tests**: Jest + Supertest, coverage thresholds enforced in CI

## Running locally

```bash
# From repo root
docker-compose up backend
```
