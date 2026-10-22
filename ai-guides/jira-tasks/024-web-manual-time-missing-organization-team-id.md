# [AUDIT-024] Manual time entries are created without `organizationTeamId`, so they are excluded from every team report

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The manual-time modal builds the body with `tenantId`, `employeeId`, `logType`, `source` and
the form data but never adds `organizationTeamId`. Gauzy stores the log with a null team;
every report that filters by `teamIds` (team dashboard, daily/weekly reports, manager views
after AUDIT-015) drops these logs.

## Evidence

- `apps/web/core/hooks/activities/use-manual-time.ts:52-62` (request body),
  `apps/web/core/components/features/manual-time/add-manual-time-modal.tsx:108-118` (form data).
- Gauzy team filter: `ever-gauzy/packages/core/src/lib/time-tracking/time-log/time-log.service.ts:1305-1307`.
- Timer start, by contrast, sends `organizationTeamId`
  (`apps/web/core/services/client/api/timers/timer.service.ts:61-69`).

## Impact

Manual time of Employees disappears from team-level reporting; totals per team are wrong.

## Expected Behavior

Manual time carries the active team (or a team chosen in the modal, restricted to teams the
target employee belongs to).

## Scope

1. Add `organizationTeamId` (active team by default) to the request in `use-manual-time.ts`;
   add it to `TAddManualTimeRequest` and the Zod request schema.
2. Confirm the Gauzy `ManualTimeInputDTO` accepts it (it is on the entity).
3. Backfill: not required; document that older manual logs have no team.

## Acceptance Criteria

- [ ] A manual entry appears in the team dashboard for the active team.
- [ ] Works in both API modes (direct Gauzy + proxy, `apps/web/app/api/timesheet/time-log`).

## Dependencies

AUDIT-015.
