# [AUDIT-013] `apps/web/.env` is tracked in git with a public `AUTH_SECRET`; non-Docker production starts sign sessions with it

**Type**: Security
**Priority**: P1
**Component**: web
**API mode affected**: n/a
**Status**: NOT_STARTED

## Problem

`apps/web/.env` is committed (`git ls-files apps/web/.env` → tracked) and contains
`AUTH_SECRET=ever-app-auth-secret` (line 20). Next.js loads `.env` for `next start` as well as
`next dev`, so a non-Docker production deployment (`yarn build:web && yarn start:web`,
`Procfile`, `app.json`, `render.yaml`, `fly.toml`, `railway.json`) that does not set its own
`AUTH_SECRET` signs next-auth JWTs and seals the Ever ID hand-off cookie with a value published
on GitHub. The startup check only warns when the variable is unset, not when it equals the
sample.

## Evidence

- `apps/web/.env:17-20` (comment acknowledges the file is in git).
- `.gitignore` ignores only `.env.local`/`.env.production`; `apps/web/.gitignore:31` ignores
  `.env*.local`.
- Secret resolution: `apps/web/core/constants/config/constants.tsx:648,714-715`
  (`authSecret = AUTH_SECRET?.trim() ? AUTH_SECRET : undefined ?? (isDevelopment ? developmentAuthSecret : undefined)`).
- Startup validation: `apps/web/core/lib/env/check-provider-env-vars.ts:206-224` (warns if
  unset only).
- Docker is protected: `.dockerignore:27-34` excludes `.env`, `.env.docker:49` leaves
  `AUTH_SECRET` blank and `AUTH_SECRET_REQUIRED` exists.

## Impact

Session forgery on any production deployment that follows the non-Docker instructions without
overriding `AUTH_SECRET`. Affects all roles.

## Expected Behavior

No real-looking secret is tracked; in production the app refuses to start (or `/api/health`
fails) when `AUTH_SECRET` is unset or equals a known sample value.

## Scope

1. Untrack `apps/web/.env` (keep `.env.sample`), add it to `.gitignore`; move the development
   value to `developmentAuthSecret` only.
2. In `check-provider-env-vars.ts`, fail hard when `NODE_ENV=production` and
   `AUTH_SECRET` is missing or in a deny-list of sample values; document `openssl rand -base64 32`.
3. Rotate the secret on any deployment that may have used the sample value.

## Acceptance Criteria

- [ ] `git ls-files apps/web/.env` is empty.
- [ ] `NODE_ENV=production yarn start:web` without `AUTH_SECRET` exits with a clear error.
- [ ] Docker image behavior unchanged.

## Dependencies

None.
