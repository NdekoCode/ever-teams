# [AUDIT-015] Team-manager reports and statistics default to self-only data (empty `employeeIds`/`teamIds` sent)

**Type**: Bug
**Priority**: P1
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Gauzy's manager-aware scoping (`ManagedEmployeeService.filterAccessibleEmployeeIds`,
`TimeLogService.getFilterTimeLogQuery`) grants a team manager access to team members only
when the request names the team(s) (`teamIds`) and/or the members (`employeeIds`). Ever Teams
sends `employeeIds=[]`, `teamIds=[]` by default on most report pages, so Gauzy falls back to
"self only" and a team manager sees their own data presented as the team's. The Team
Dashboard sends `teamIds` for the counts cards but not for the chart/daily report on the same
page, so the cards and the chart disagree.

## Evidence

Gauzy rules (verified on `develop`):
- `ever-gauzy/packages/core/src/lib/employee/managed-employee.service.ts:97-111` (Case 4 needs
  `teamIds`/`projectIds`; Case 5 → `[currentEmployeeId]`).
- `time-tracking/time-log/time-log.service.ts:1240-1255` (no `employeeIds` → self).

Ever Teams defaults:
- `apps/web/core/hooks/activities/use-activity-filters.ts:146-156, 175-182`: `employeeIds`/
  `teamIds` come from `allUserState`/`allTeamsState`, which only the dashboard filter fills
  (`apps/web/core/components/pages/dashboard/team-dashboard-filter.tsx:93,130`).
- Timesheet page: `apps/web/core/hooks/timesheet/use-timesheet-query.ts:90-100` sends
  `employeeIds=[]`.
- Time & Activity counts: `apps/web/core/services/client/api/timesheets/statistic.service.ts:273-295`
  without team ids → Case 5.
- Team dashboard: counts use `useTeamDashboardStatisticsProps`
  (`apps/web/core/hooks/activities/use-team-dashboard-statistics-props.ts:48-66`, `teamIds=[routeTeam]`)
  but chart + daily report use raw `mergedProps`
  (`apps/web/app/[locale]/(main)/dashboard/team-dashboard/[teamId]/page.tsx:47-52`).
- Weekly report: `apps/web/core/hooks/activities/queries/use-activity-weekly-report-query.ts:29-36`.

| Endpoint | Default verdict for a team manager |
|---|---|
| `/timesheet/time-log/report/daily`, `/daily-chart`, `/weekly` | SELF-ONLY until members are picked |
| `/timesheet/time-log` (Timesheet page) | SELF-ONLY |
| `/timesheet/statistics/counts` (Time & Activity) | SELF-ONLY |
| `/timesheet/statistics/counts` (Team dashboard) | team, but chart/daily on the same page SELF-ONLY |
| `POST /timesheet/statistics/tasks`, `/timesheet/statistics/time-slots` | WORKS (team ids sent) |

## Impact

Team Manager: the reports, dashboards and timesheet list silently show only their own time
while the UI labels them as team views. This is the user-facing half of the "manager flows"
production requirement; the Gauzy side is now fixed, the client does not use it.

## Expected Behavior

When the signed-in user manages the active team (or the route team), report, dashboard,
timesheet and statistics requests default to `teamIds=[activeTeamId]` (and
`employeeIds=[all members]` where Gauzy requires explicit ids, i.e. time-log reads), and the
chart/daily/counts on one page use the same scope.

## Scope

1. In `use-activity-filters.ts` (and `use-team-dashboard-statistics-props.ts`), derive the
   default `teamIds`/`employeeIds` from `activeTeam` + `isTeamManager` instead of empty arrays;
   apply the same props to chart, daily report and counts on the team dashboard page.
2. `use-timesheet-query.ts:90-100`: default `employeeIds` to the managed team's member ids for
   managers.
3. Keep the "only me" toggle sending `onlyMe=true`.
4. Make sure the keys follow (AUDIT-016).

## Acceptance Criteria

- [ ] A team manager opening Time & Activity, Team Dashboard, Timesheet and the weekly/daily
      reports sees all team members' data by default; an employee sees only their own.
- [ ] Cards and chart on the team dashboard agree.
- [ ] Works in both API modes (direct Gauzy + proxy; see AUDIT-003 for the proxy counts 400
      and daily-chart filter bugs that also block this).
- [ ] Query keys include all parameters used by queryFn.

## Dependencies

AUDIT-003 (proxy counts/daily-chart), AUDIT-016 (keys).
