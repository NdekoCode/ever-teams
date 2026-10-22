# [AUDIT-016] Query keys omit parameters that change the result set (activity reports, employee daily plans, legacy task metadata)

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Systematic scan of 88 React Query call sites (69 `useQuery`, 1 `useInfiniteQuery`,
16 `fetchQuery`, 2 `ensureQueryData`) found three places where a value used by the `queryFn`
is not in the key, so a changed filter/team is served from a stale cache entry (same class as
the past `organizationTeamId` bug).

1. HIGH — Activity report queries. `getActivityQueryKeyParams`
   (`apps/web/core/hooks/activities/use-activity-filters.ts:93-115`) keys only
   `selectedEmployeeIds`/`selectedTeamIds`, but the request sends `employeeIds`/`teamIds`
   which fall back (`:181-182`) to the dashboard atoms, `isManage`/`isTeamManager`
   (derived asynchronously from `activeTeam.members`, `use-team-member.ts:9-17`) and
   `useTeamDashboardStatisticsProps`. Hooks: `use-activity-chart-query.ts:36-37`,
   `use-activity-daily-report-query.ts:36-37`, `use-activity-report-list-query.ts:36-37`,
   `use-activity-statistics-query.ts:42-61` (hand-built key, `core/query/keys/index.ts:431`).
   The explicit-refetch mitigation exists only on
   `app/[locale]/(main)/dashboard/team-dashboard/[teamId]/page.tsx:74-78` and
   `app-url/[teamId]/page.tsx:73-76`; `core/components/pages/time-and-activity/page-component.tsx:42-43`
   uses the same queries with no refetch → wrong employee set served for up to the stale time.
2. MEDIUM — `useEmployeeDailyPlans` (`apps/web/core/hooks/daily-plans/use-employee-daily-plans.ts:72-84, 112-120`):
   key `dailyPlans.byEmployee(employeeId, activeTeam?.id)` (`keys/index.ts:248`) but the
   service reads the team from the cookie
   (`apps/web/core/services/client/api/daily-plans/daily-plan.service.ts:142-149`,
   `where[organizationTeamId]=this.activeTeamId`); `enabled` does not require `activeTeam?.id`,
   so while the atom is null the key collapses to a team-less entry holding the cookie team's plans.
3. MEDIUM — Legacy task-metadata queries (active when `publicState` is true):
   `use-task-statuses-query.ts:34-39` keys `taskStatuses.byTeam(teamId)` from atom/cookie
   (`use-invalidate-task-statuses.ts:35`) while `getTaskStatuses()` sends
   `organizationTeamId: this.activeTeamId` from the cookie (`task-status.service.ts:207-210`);
   same for labels (`task-label.service.ts:43`), priorities (`task-priority.service.ts:139`),
   sizes (`task-size.service.ts:134`), issue types (`issue-type.service.ts:41`), related
   issue types (`task-related-issue-type.service.ts:44`), versions. `usePublicOrganizationTeams`
   seeds `byTeam(<public team>)` (`use-public-organization-teams.ts:138-149`) and a mounted
   observer refetches the cookie team's metadata under the public team's key.
4. LOW — `use-timesheet-query.ts:64-74` key `timesheet.logs` (`keys/index.ts:645`) omits
   `timeZone` sent at `:118`.

Verified clean (no task): `use-timer-polling.ts` predicates match the current key factory
(`queryKey[4] === activeTeamId` for `organizationTeams.detailByScope`, `keys/index.ts:264-277`);
`useEmployee` (`workingByScope` includes team id); mutation invalidation prefixes.

## Evidence

File:line above (hook, key factory entry and service line read for each).

## Impact

Wrong member set in reports after a filter/role change, wrong team's plans or metadata under a
collapsed key. Affects Team Manager mostly (1), Employee (2, 3).

## Expected Behavior

Every value the queryFn (or the service it calls, including cookie reads) uses to build the
request is part of the key, or the service receives the value from the hook.

## Scope

1. (1): put the effective `employeeIds`/`teamIds` in `getActivityQueryKeyParams` (or pass the
   effective values explicitly and key on them); drop the manual refetch workaround.
2. (2): pass `organizationTeamId` from the hook to `getDayPlansByEmployee` and require it in
   `enabled`.
3. (3): make the metadata services accept `organizationTeamId` from the hook instead of the
   cookie (the non-legacy bootstrap path already does).
4. (4): add `timeZone` to `timesheet.logs`.
5. Add a lint-style test that each key factory entry used by a hook receives every service
   parameter (pattern exists in `core/query/keys/scope-keys.test.ts`).

## Acceptance Criteria

- [ ] Changing the member/team filter on Time & Activity updates the data without a manual
      refetch; switching teams never shows the previous team's plans/metadata.
- [ ] Query keys include all parameters used by queryFn.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

AUDIT-015.
