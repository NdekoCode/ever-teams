# [AUDIT-034] Dead proxy routes and dead client API code

**Type**: Bug
**Priority**: P4
**Component**: web
**API mode affected**: proxy
**Status**: NOT_STARTED

## Problem

Dead code found while auditing API parity; some of it is wrong (and would mislead a future
caller).

Proxy routes with no client caller: `timer/toogle` (alias), `timer/timesheet/status`
(validates lowercase `'rejected'`, `apps/web/app/api/timer/timesheet/status/route.ts:35`,
Gauzy statuses are `DRAFT/PENDING/IN REVIEW/DENIED/APPROVED`), `timer/timesheet/bulk-delete`,
`timer/timesheet/time-log`, `timer/timesheet/time-log/[id]`, `timer/timesheet/daily` (builds a
malformed `/timesheet/time-log?activityLevel?…`, `core/services/server/requests/timesheet.ts:74`),
`daily-plan/plan/[planId]`, `roles/options` GET/POST, `organization-team/employee/[id]` DELETE,
`user/[id]` GET, `auth/signin-email-social-login`, `auth/_signin-workspace`. Unused server
requests: `deleteTaskRequest` (`requests/tasks.ts:124`, should be used by AUDIT-002),
`getTaskCreator`, `requests/timer/status.ts`.

Client paths with no Gauzy route (0 callers): `POST /user/:id` (`services/client/api/users/user.service.ts:102`),
`GET /user/authenticated` (`services/server/requests/auth.ts:111`; Gauzy is `/auth/authenticated`),
`POST /auth/signin.provider.social` (`auth.service.ts:185`), `POST /auth/signup.email.social`
(`server/requests/auth.ts:223`), `registerGauzy` chain (`/employee`, `/organization`, `/tenant`, `/smtp`),
`getTaskStatusList` (`timers/timer.service.ts:174-193`), `removeOrganizationTeamEmployee`
(`team-employee.service.ts:100-113`, expects a boolean from an endpoint returning an entity),
`savePersonalSettings`; the unused `users.employees.working` key (`core/query/keys/index.ts:63`).

## Evidence

File:line above; `apps/web/test/architecture/feature-surface-preserved.test.ts` pins some of
these routes, so removal must update that test deliberately.

## Impact

None for users; maintenance cost and misleading contracts.

## Expected Behavior

Dead routes/requests removed (or wired where AUDIT-002 needs them); `feature-surface`
test updated.

## Scope

Delete the listed code; `knip` (`apps/web/package.json` script) can confirm.

## Acceptance Criteria

- [ ] `yarn workspace @ever-teams/web knip` reports none of the above.

## Dependencies

AUDIT-002.
