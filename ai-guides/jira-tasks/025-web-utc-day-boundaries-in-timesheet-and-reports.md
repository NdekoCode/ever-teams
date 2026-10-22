# [AUDIT-025] Timesheet, daily report and time-limit ranges snap to UTC midnight while Gauzy buckets by the user's time zone; counts ignore the local day

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

1. The date-range helper used by the timesheet page, daily report and daily chart converts the
   picked days to UTC midnight; Gauzy groups the results by the `timeZone` parameter. For a
   user west of UTC the last selected day loses its evening entries (and the first day gains
   the previous evening).
2. Time-limit reports use `setUTCHours`.
3. Statistics counts never send `todayStart`/`todayEnd`, so the "today" cards use the API
   server's day; `timeZone` is ignored by the counts query.
4. The timesheet query key omits `timeZone` (see AUDIT-016).

## Evidence

- `apps/web/core/lib/helpers/format-date-range.ts:24-31` (UTC snapping).
- `apps/web/core/services/client/api/timesheets/time-log.service.ts:434-446` (`setUTCHours`).
- Gauzy bucketing by `timeZone`: `ever-gauzy/packages/core/src/lib/time-tracking/time-log/time-log.service.ts:407`.
- Counts "today": `apps/web/core/services/client/api/timesheets/statistic.service.ts:273-295`
  (no today range) vs `ever-gauzy/.../statistic/statistic.service.ts:873-878`.
- The weekly report sends exact instants and is correct
  (`apps/web/core/hooks/activities/queries/use-activity-weekly-report-query.ts:29-36`).
- The timer status computes today in the browser correctly (`timer.service.ts:15-22`).

## Impact

Employees and managers in non-UTC zones see entries missing from the last day of a range and
"today" cards that flip at the server's midnight.

## Expected Behavior

Ranges are sent as the local-day boundaries converted to instants (as the weekly report does),
with the IANA `timeZone`; counts receive `todayStart`/`todayEnd` from the browser.

## Scope

1. `format-date-range.ts`: build `startDate`/`endDate` with `startOfDay(local)`/`endOfDay(local)`
   then `toISOString()`; same for the time-limit helper.
2. Send `todayStart`/`todayEnd` in `getTimesheetStatisticsCounts`.
3. Add `timeZone` to the timesheet key.
4. Unit tests with `America/New_York` fixtures.

## Acceptance Criteria

- [ ] Entries logged at 22:00 local on the last selected day appear in the timesheet.
- [ ] "Today" cards match the browser's day.
- [ ] Works in both API modes (direct Gauzy + proxy; the proxy daily-chart route must forward
      the parameters, AUDIT-003).

## Dependencies

AUDIT-003, AUDIT-016.
