# [AUDIT-023] Live "total today" on the profile and screenshots views counts the running segment twice

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

`useLiveTimerStatus` returns `timerStatus.duration + timerSeconds`. Gauzy's timer status
already adds `now - lastLog.startedAt` to `duration` while the timer runs, and the status is
refetched every 60 s; `timerSeconds` is the seconds elapsed since the local start. After the
first refetch the displayed total grows at roughly twice real time.

## Evidence

- `apps/web/core/hooks/timer/use-timer-ui.ts:156-165` (`secondsToTime((timerStatus?.duration || 0) + seconds)`);
  `timerSeconds` is derived from the local tick counter at `:70-109`.
- Gauzy: `ever-gauzy/packages/core/src/lib/time-tracking/timer/timer.service.ts:203-206`
  (`status.duration += diff(lastLog.startedAt)` when running).
- Refetch cadence: `apps/web/core/hooks/timer/use-timer-api.ts:427-435`, `init-state.tsx:18,94-101`.
- Consumers: `apps/web/core/components/pages/profile/user-profile-tasks.tsx:160-168` (LiveTotalTime),
  `apps/web/core/components/pages/profile/screenshoots.tsx:33-35,55`.
- The main timer is unaffected (`timer.tsx:61-64` uses `useTodayWorkedTime`).

## Impact

Wrong worked-time numbers shown to Employee and Team Manager while a timer runs.

## Expected Behavior

Live total = server `duration` at the last status fetch + seconds elapsed since that fetch
(or `duration` of the stopped logs + local running seconds), never both.

## Scope

1. In `useLiveTimerStatus`, track the time of the last `timerStatus` update and add only the
   seconds since then; or subtract the running segment Gauzy already included.
2. Unit test in `use-timer-ui` tests with a mocked status refetch.

## Acceptance Criteria

- [ ] After 2 minutes of tracking, the profile total increased by 2 minutes.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
