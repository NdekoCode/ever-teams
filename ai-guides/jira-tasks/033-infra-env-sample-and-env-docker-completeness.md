# [AUDIT-033] `.env.sample` / `.env.docker` do not list many variables the web app reads

**Type**: Deployment
**Priority**: P3
**Component**: infra
**API mode affected**: n/a
**Status**: NOT_STARTED

## Problem

Comparing the keys in `apps/web/.env.sample` (88) with the variables read in `apps/web`
(`process.env.*`, `readRuntimeEnv(...)`, `getNextPublicEnv(...)`) shows deployment-relevant
variables that are documented nowhere in the samples, and sample keys no code reads.

Used in code, absent from `.env.sample` and `.env.docker` (file:line of first use):
`AUTH_URL` (`core/services/server/ever-id/sign-in.ts:295`),
`EVER_ID_CLIENT_ID`/`EVER_ID_CLIENT_SECRET`/`EVER_ID_ISSUER_URL`/`EVER_ID_TEAMS_AUTO_PROVISION`
(`core/constants/config/constants.tsx:685-697`), `EVER_TEAMS_AUTH_PROVIDERS`
(`core/components/auth/social-logins-buttons.tsx:19`), `NEXT_PUBLIC_DEMO_ACCOUNTS`
(`constants.tsx:232`), `NEXT_PUBLIC_RECAPTCHA_KEY` (`core/components/auth/re-captcha-client-boundary.tsx:17`),
`SLACK_/DISCORD_/LINKEDIN_/MICROSOFT_/APPLE_CLIENT_ID|SECRET` + `NEXT_PUBLIC_*_APP_NAME`
(`constants.tsx:650-673`), `MICROSOFT_TENANT_ID`, `NEXT_PUBLIC_CHATWOOT_BASE_URL`
(`core/components/integration/chatwoot/index.tsx:28`), `EVER_STATS_ENABLED`/`EVER_PLATFORM_API_URL`/`EVER_PLATFORM_PROJECT_ID`
(`app/api/ever-stats/status/route.ts:21`, `core/lib/ever-platform/stats-config.ts:7`),
`NEXT_PUBLIC_INBOX_ENABLED` (`core/components/layouts/app-sidebar.tsx:170`),
`NEXT_PUBLIC_EVER_CONNECT_ENABLED` (`app/api/ever-connect/[...path]/route.ts:25`),
`NEXT_PUBLIC_DESKTOP_APP_DOWNLOAD_URL` (`constants.tsx:291`), `EVER_TEAMS_OPTIMIZED_IMAGE_HOSTS`
(`proxy.ts:112`), `NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE` / `_REPLAYS_*` / `_ENVIRONMENT` / `_RELEASE`
(`sentry.client.config.ts:59`), `CLIENT_BASE_URL` (`app/api/health/route.ts:11`), `NEXT_PUBLIC_API_URL`.

In `.env.sample` but read by no code: `CHAT_CUSTOM_BASE_URL_ALLOWLIST` (UNVERIFIED — may be
read through a different accessor), `JITSU_SERVER_URL`, `JITSU_SERVER_WRITE_KEY`,
`NEXT_IGNORE_ESLINT_ERROR_ON_BUILD`, `NEXT_PUBLIC_SITE_DESCRIPTION`, `NEXT_PUBLIC_SITE_KEYWORDS`,
`NEXT_PUBLIC_SITE_NAME`, `NEXT_PUBLIC_TWITTER_USERNAME`, `POSTMARK_SERVER_API_TOKEN`,
`RECOIL_DUPLICATE_ATOM_KEY_CHECKING_ENABLED`, `SENTRY_LOG_LEVEL`.

## Evidence

`grep -oE "^[A-Z_]+=" apps/web/.env.sample` vs
`grep -rhoE "process\.env\.[A-Z_]+|readRuntimeEnv\('[A-Z_]+'|getNextPublicEnv\('[A-Z_]+'" apps/web`
(excluding tests); file:line above. Verified OK: `GAUZY_API_SERVER_URL` /
`NEXT_PUBLIC_GAUZY_API_SERVER_URL` semantics are documented in `docker-compose.yml:91-105`,
`.env.docker`, and the runtime-env mechanism (`CLAUDE.md`, `core/services/server/runtime-env.ts`).

## Impact

Operators cannot discover how to enable Ever ID, social providers, demo accounts, reCAPTCHA,
Sentry sampling or stats without reading code. Not blocking (defaults are safe).

## Expected Behavior

`.env.sample` and `.env.docker` list every variable the app reads with a comment; unused keys
are removed; a test keeps them in sync.

## Scope

1. Add the missing keys (commented, with purpose) to both files.
2. Remove dead keys (confirm `CHAT_CUSTOM_BASE_URL_ALLOWLIST`).
3. Add a test (`apps/web/test/`) that greps the env reads and asserts presence in `.env.sample`.

## Acceptance Criteria

- [ ] The sync test passes.

## Dependencies

None.
