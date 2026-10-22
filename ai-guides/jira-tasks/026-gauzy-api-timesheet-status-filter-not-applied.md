# [AUDIT-026] Timesheet page "Status" filter is a no-op: the client sends `status[]`, Gauzy's time-log filter has no status predicate

**Type**: Incomplete feature
**Priority**: P3
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The timesheet page lets the user filter by timesheet status. The client sends `status[i]`
with the time-log query, but `TimeLogService.getFilterTimeLogQuery` never reads it, so the
list is unchanged; the client only counts the selected statuses.

## Evidence

- Client: `apps/web/core/hooks/timesheet/use-timesheet-query.ts:97,120`,
  `apps/web/core/services/client/api/timesheets/time-log.service.ts:191`,
  `apps/web/core/components/pages/timesheet/timesheet-filter-popover.tsx:44,66`.
- Gauzy: `ever-gauzy/packages/core/src/lib/time-tracking/time-log/time-log.service.ts:1222-1420`
  contains no `status` predicate (`grep -n status` in that range → none);
  `time-log/dto/query/time-log-query.dto.ts` does not declare it.

## Impact

Filter UI that does nothing (Employee, Team Manager).

## Expected Behavior

`status[]` filters by `timesheet.status` (join on `timeLog.timesheet`), or the filter is
removed from the UI.

## Scope

1. Add `status?: TimesheetStatus[]` to `TimeLogQueryDTO` / `IGetTimeLogReportInput` and a
   `timesheet.status IN (:...status)` predicate in `getFilterTimeLogQuery` (both ORM branches).
2. Client: keep sending `status[]`; drop the client-side count hack.

## Acceptance Criteria

- [ ] Selecting "APPROVED" lists only logs of approved timesheets, both API modes.

## Dependencies

None.
