# [AUDIT-028] Members statistics weekly duration is inflated by the time-slot join (unmerged fix branch `fix/members-statistics-slot-fanout`)

**Type**: Bug
**Priority**: P3
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

`StatisticService.getMembers` joins `time_log` → `time_slot_time_logs` → `time_slot` and sums
log durations, so a log is counted once per 10-minute slot it spans; long logs outweigh short
ones. A fix exists on branch `fix/members-statistics-slot-fanout` of the Gauzy fork (commit
"fix(statistics): count each time log once in members statistics", `whereExists` sub-query)
but its content is absent from `develop` (checked with `git apply --check --reverse`).

## Evidence

- `ever-gauzy/packages/core/src/lib/time-tracking/statistic/statistic.service.ts:1104-1121`
  (knex branch: `innerJoin('time_slot_time_logs', ...)`, `innerJoin('time_slot', ...)`,
  `whereBetween('time_slot.startedAt', ...)`); TypeORM branch below it with
  `innerJoin('timeLogs.timeSlots', 'time_slot')`.
- Branch diff: `git diff $(git merge-base origin/develop origin/fix/members-statistics-slot-fanout) origin/fix/members-statistics-slot-fanout`.
- Ever Teams web does not call `/timesheet/statistics/members` today (audit of
  `apps/web/core/services/client/api/**`); the Gauzy UI and the mobile app may.

## Impact

Wrong weekly totals in Gauzy's members statistics; not visible in Ever Teams web today.

## Expected Behavior

Each time log counts once per week it has a live slot in.

## Scope

1. Rebase and merge `fix/members-statistics-slot-fanout` (or re-apply its `whereExists`
   approach) onto `develop`; keep both ORM branches in sync.
2. Spec with a 30-minute log (3 slots) asserting a single count.

## Acceptance Criteria

- [ ] Spec passes on TypeORM and MikroORM branches.

## Dependencies

None.
