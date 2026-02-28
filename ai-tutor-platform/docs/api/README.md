# API Documentation

All backend microservices expose a versioned REST API at `/v1/`.

## Authentication

Protected endpoints require:

```
Authorization: Bearer <access_token>
```

- Access tokens expire in **15 minutes**
- Refresh tokens expire in **7 days**
- Use `POST /v1/auth/refresh-token` to rotate tokens

## Response Envelope

Every endpoint returns:

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional string",
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

Errors follow:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Access token is missing or invalid",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "path": "/v1/users/me"
}
```

## Service Endpoints

| Service            | Port | Swagger (local dev)           |
|--------------------|------|-------------------------------|
| auth-service       | 8001 | http://localhost:8001/api     |
| session-service    | 8002 | http://localhost:8002/api     |
| curriculum-service | 8003 | http://localhost:8003/api     |
| homework-service   | 8004 | http://localhost:8004/api     |
| analytics-service  | 8005 | http://localhost:8005/api     |
| payment-service    | 8006 | http://localhost:8006/api     |

## Auth Service Endpoints

| Method | Route                       | Auth   | Sprint | Description               |
|--------|-----------------------------|--------|--------|---------------------------|
| POST   | `/v1/auth/signup`           | Public | 1      | Register student account  |
| POST   | `/v1/auth/login`            | Public | 1      | Get JWT token pair        |
| POST   | `/v1/auth/refresh-token`    | Public | 1      | Rotate refresh token      |
| POST   | `/v1/auth/logout`           | JWT    | 1      | Invalidate tokens         |
| GET    | `/v1/auth/verify-email`     | Public | 2      | Verify email address      |
| GET    | `/v1/users/me`              | JWT    | 1      | Get own profile           |
| GET    | `/v1/users/:id`             | Admin  | 2      | Get user by ID            |
| GET    | `/v1/health`                | Public | 1      | Health check              |
| GET    | `/v1/status`                | Public | 1      | Service status            |

## Session Service Endpoints (Sprint 6)

| Method | Route                          | Description               |
|--------|--------------------------------|---------------------------|
| POST   | `/v1/sessions`                 | Start AI teaching session |
| GET    | `/v1/sessions/:id`             | Get session details       |
| PATCH  | `/v1/sessions/:id/end`         | End an active session     |
| GET    | `/v1/sessions/user/:userId`    | Get user's sessions       |

## Curriculum Service Endpoints (Sprint 10)

| Method | Route                              | Description                |
|--------|------------------------------------|----------------------------|
| POST   | `/v1/curriculum/roadmap`           | Generate learning roadmap  |
| GET    | `/v1/curriculum/:userId`           | Get user's roadmap         |
| PATCH  | `/v1/curriculum/:id/milestone`     | Update milestone progress  |

## Homework Service Endpoints (Sprint 11)

| Method | Route                        | Description                  |
|--------|------------------------------|------------------------------|
| POST   | `/v1/homework/generate`      | Generate homework tasks       |
| POST   | `/v1/homework/:id/submit`    | Submit homework answers       |
| GET    | `/v1/homework/:id/grade`     | Get grade + AI feedback       |
| GET    | `/v1/homework/user/:userId`  | Get user's homework history   |

## AI Services Endpoints

| Service           | Route                        | Description              |
|-------------------|------------------------------|--------------------------|
| llm-wrapper       | `POST /v1/llm/complete`      | Generate LLM completion  |
| llm-wrapper       | `POST /v1/llm/stream`        | Stream LLM response      |
| vector-db         | `POST /v1/vectors/upsert`    | Store embeddings         |
| vector-db         | `POST /v1/vectors/search`    | Similarity search        |
| prompt-engine     | `POST /v1/prompts/build`     | Build composed prompt    |
| prompt-engine     | `GET  /v1/prompts/templates` | List available templates |
| safety-guardrails | `POST /v1/guardrails/check`  | Validate input safety    |
