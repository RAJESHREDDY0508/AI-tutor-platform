# Frontend – AI Tutor Platform

React 18 + TypeScript + Vite application.

## Stack

| Concern        | Library                  |
| -------------- | ------------------------ |
| UI             | React 18                 |
| Routing        | React Router v6          |
| Server state   | TanStack Query v5        |
| Client state   | Zustand                  |
| HTTP client    | Axios                    |
| Testing        | Vitest + RTL             |
| Build          | Vite 5                   |
| Production     | nginx 1.25 (Alpine)      |

## Local Development

```bash
# From repo root
docker-compose up frontend

# Or directly
cd frontend
yarn install
yarn dev          # http://localhost:3000
```

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `yarn dev`        | Start Vite dev server          |
| `yarn build`      | Type-check + production build  |
| `yarn test`       | Run unit tests                 |
| `yarn typecheck`  | Run TypeScript compiler only   |
| `yarn lint`       | ESLint check                   |

## Environment Variables

Copy `.env.example` → `.env.local` and fill in values.
