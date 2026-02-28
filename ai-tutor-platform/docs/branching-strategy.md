# Branching Strategy

## Overview

This project follows **GitHub Flow** with environment branches, optimised for a small team iterating in 2-week sprints.

## Branches

| Branch      | Purpose                        | Deploys To     | Protected |
|-------------|--------------------------------|----------------|-----------|
| `main`      | Production-ready code          | Production     | Yes       |
| `develop`   | Integration branch for sprints | Staging        | Yes       |
| `feature/*` | New features                   | —              | No        |
| `fix/*`     | Bug fixes                      | —              | No        |
| `hotfix/*`  | Urgent production fixes        | —              | No        |

## Workflow

### Feature Development

```
1. Create branch from develop:
   git checkout develop
   git pull origin develop
   git checkout -b feature/TICKET-123-short-description

2. Commit using Conventional Commits:
   feat(auth-service): add email verification endpoint

3. Push and open PR against develop:
   git push -u origin feature/TICKET-123-short-description
   gh pr create --base develop

4. PR triggers CI (lint, typecheck, path-filtered tests).
   Requires 1 approval + passing CI to merge.

5. Merge via squash merge to keep develop history clean.
```

### Sprint Release

```
1. At sprint end, open PR: develop → main
2. Full CI runs (all services tested)
3. Merge triggers CD pipeline → staging deploy
4. After staging validation → promote to production
```

### Hotfixes

```
1. Branch from main:
   git checkout -b hotfix/critical-auth-bug main

2. Fix, test, open PR against main.
3. After merge to main, cherry-pick or merge back into develop.
```

## Branch Naming Convention

```
feature/TICKET-123-short-description
fix/TICKET-456-fix-login-redirect
hotfix/critical-payment-webhook
chore/update-dependencies
docs/add-api-documentation
```

## Protection Rules

### `main`
- Require PR with 1+ approval
- Require passing CI status checks
- No force pushes
- No direct commits

### `develop`
- Require PR with 1+ approval
- Require passing CI status checks
- No force pushes
