# [AUDIT-032] Hooks swallow API/validation errors and return empty data; `as any` / `@ts-ignore` hide contract errors in data paths

**Type**: Bug
**Priority**: P3
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

1. Silent empty data: `getTasksByEmployee` → `[]`
   (`apps/web/core/hooks/organizations/teams/use-tasks-by-employee-query.ts:58-61`),
   `getTaskTimesheet` → `[]` (`hooks/timesheet/use-timesheet-query.ts:179-182`), server
   `getAllTeamInvitationsRequest` → `{items:[],total:0}` (`services/server/requests/invite.ts:120-127`),
   `getTaskById` → `null` (`hooks/organizations/teams/use-task-queries.ts:69-72`). Combined with
   the throwing validators (AUDIT-029) these turn contract failures into "no data" screens.
2. Success toast even when the post-create handler fails
   (`hooks/organizations/teams/use-create-organization-team.ts:114-118`).
3. `as any` in data paths: `setTaskTimesheets(activitiesData as any)` hides `TActivity ≠ IActivity`
   (`hooks/tasks/use-task-activity.ts:45-49`), `setActiveTask(created as any)` (`use-task-input.ts:180`),
   `setIntegration(... as any)` (`use-integration.ts:43`), label casts (`use-task-labels.ts:96,108`).
4. `// @ts-ignore` on `<SessionProvider>` (`components/layouts/default-layout/next-auth-provider.tsx:10`).
5. Dead sync effect keyed on the `timerStatus` object (`hooks/timer/use-timer-api.ts:802-812`;
   the working interval is `init-state.tsx:118-122`).
6. Workaround provider for a Gauzy refresh-token rotation bug kept
   (`components/providers/proactive-token-refresh-provider.tsx:11-12`; `apps/web/proxy.ts:63-68,279-287`)
   — confirm the Gauzy fix (`fix/mcp-refresh-token-rotation`, `fix/auth-refresh-retry-logout`
   branches) is in the deployed API before removing.

## Evidence

File:line above.

## Impact

Errors are invisible to users and to Sentry; type escapes let the schema drift of AUDIT-029
ship unnoticed.

## Expected Behavior

Query errors propagate to the page error state; no `as any` on API data; `tsc` covers the
auth provider.

## Scope

1. Remove the empty fallbacks; render error states.
2. Replace the casts with the correct schema types (after AUDIT-029 adds the activity row type).
3. Fix the SessionProvider typing; delete the dead effect; retire the workaround provider when
   the Gauzy fix is confirmed.

## Acceptance Criteria

- [ ] A 403/validation failure on the task list shows an error state, not an empty list.
- [ ] No `as any` on values returned by `core/services/client/api/**`.

## Dependencies

AUDIT-029.
