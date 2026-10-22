# [AUDIT-010] `POST /timesheet/statistics/tasks` "special case" returns per-task durations of any team to a non-member

**Type**: Security
**Priority**: P2
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

`StatisticService.getTasks` skips `ManagedEmployeeService.filterAccessibleEmployeeIds` when
the caller sends an `organizationTeamId` with empty `employeeIds` (or holds
`ORG_MEMBER_LAST_LOG_VIEW`, which `EMPLOYEE` has at `default-role-permissions.ts:1043`). The
query then filters by `organizationTeamId` only, so any employee can read the time per task
of every member of a team they do not belong to. The route is also the only statistics route
without `EmployeeTrackedDataGuard`.

## Evidence

- `ever-gauzy/packages/core/src/lib/time-tracking/statistic/statistic.service.ts:2007-2020`
  (special case comment: "Keep empty employeeIds to fetch all team members").
- `statistic.service.ts:2336-2393` `getTaskDurationRows` filters by
  `tenantId/organizationId/organizationTeamId` from the request only.
- `time-tracking/statistic/statistic.controller.ts:161-163` has no guard; siblings at
  `:82,108,134,186,212,240` use `EmployeeTrackedDataGuard`.
- Ever Teams calls it from `apps/web/core/hooks/tasks/use-task-statistics.ts:88-99` (with
  explicit `employeeIds`, so the fix must keep the manager path working).

Demonstration: `POST /api/timesheet/statistics/tasks {"organizationId":"<org>","organizationTeamId":"<team caller is not in>","employeeIds":[]}` → per-task durations for all its members.

## Impact

Cross-team disclosure of tracked time per task.

## Expected Behavior

The special case applies only if the caller is an active member of `organizationTeamId`
(`ManagedEmployeeService.isMemberOfTeam`); otherwise `filterAccessibleEmployeeIds` runs.

## Scope

1. `statistic.service.ts:2007`: add the membership check to the condition.
2. Add `EmployeeTrackedDataGuard` to the controller route for consistency.
3. Spec in `statistic.service.employee-scope.spec.ts`.

## Acceptance Criteria

- [ ] Non-member with `organizationTeamId` of another team gets no rows (or 403).
- [ ] Team members still see the team task breakdown used by Ever Teams task cards.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
