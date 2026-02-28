# ADR-001: Use NestJS for Backend Microservices

**Status:** Accepted
**Date:** 2025-01
**Deciders:** Engineering Team

## Context

We need a Node.js backend framework for 6 microservices. Requirements:
- TypeScript-first with strong type safety
- Dependency injection for testability
- Modular architecture that scales across services
- First-party support for JWT, TypeORM, Redis, Swagger, testing
- Enterprise patterns: guards, interceptors, exception filters, pipes

## Decision

**Use NestJS 10** for all backend microservices.

AI services (`llm-wrapper`, `vector-db`, `prompt-engine`, `safety-guardrails`) use **lightweight Express + TypeScript** to minimise latency on the hot path between services and the LLM API.

## Rationale

| Factor                  | NestJS                                  | Plain Express                   |
|-------------------------|-----------------------------------------|---------------------------------|
| Dependency injection    | Built-in IoC container                  | Manual wiring                   |
| Modular architecture    | First-class `@Module()` system          | Roll your own                   |
| Validation              | `class-validator` + global `ValidationPipe` | Manual per-route               |
| Testing                 | `TestingModule` + Jest mocks            | Supertest only                  |
| Swagger                 | `@nestjs/swagger` auto-generates from DTOs | Manual YAML/JSON              |
| TypeORM                 | `@nestjs/typeorm` — first-party module  | Manual config                   |
| Auth                    | `@nestjs/passport` + strategy pattern   | Custom middleware               |
| Consistency at scale    | Every service follows the same pattern  | Diverges per engineer           |

## Consequences

**Positive:**
- Consistent structure across all 6 services — any engineer can navigate any service
- Built-in testing patterns (`TestingModule`) enforce unit test quality
- Swagger UI auto-generated from DTOs + JSDoc comments
- DI container makes swapping implementations (e.g. DB, queue) trivial

**Negative:**
- Higher initial boilerplate vs plain Express
- Learning curve for engineers unfamiliar with Angular-style decorators
- Slightly larger cold-start time vs plain Express (acceptable for always-on microservices)

## Alternatives Considered

**Fastify + manual DI** — faster cold start but no built-in module system or testing utilities at the NestJS level.

**Hono** — ultra-lightweight but lacks mature ecosystem for TypeORM, Passport, Swagger at enterprise scale.

**Spring Boot (Java)** — rejected for this stack due to team's Node.js proficiency and faster iteration cycle in TypeScript.
