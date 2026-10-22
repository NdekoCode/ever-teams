# [AUDIT-003] Proxy mode: handlers drop query parameters, change bodies or return wrapped/incorrect responses

**Type**: Bug
**Priority**: P1
**Component**: server-api
**API mode affected**: proxy
**Status**: NOT_STARTED

## Problem

Several proxy handlers rebuild the Gauzy request from cookies instead of forwarding the
client's query/body. Where the rebuilt request differs from the direct-mode request, proxy
mode returns different data (wrong scope, missing filters, wrong shape) from direct mode.

| # | Client call (file:line) | Handler (file:line) | Defect |
|---|---|---|---|
| 1 | `GET /timesheet/statistics/counts` — `apps/web/core/services/client/api/timesheets/statistic.service.ts:273-295` sends `tenantId` only as a header | `apps/web/app/api/timesheet/statistics/counts/route.ts:24,35-42` requires `tenantId` in the query | always 400 → Time & Activity counts never load in proxy mode |
| 2 | `GET /tags` — `apps/web/core/services/client/api/tags/tag.service.ts:35-36`, `apps/web/core/hooks/tags/use-tags-query.ts:16` | `apps/web/app/api/tags/route.ts:15-22` returns the `{data,response}` serverFetch wrapper from `getTaskLabelsListRequest` and calls `/tags/level` | `validatePaginationResponse` throws → tag list broken |
| 3 | `GET /tasks/employee/:id?organizationTeamId=…&where[teams][id]=…` — `apps/web/core/services/client/api/tasks/task.service.ts:389,436` | `apps/web/app/api/tasks/employee/[employeeId]/route.ts:18-22` forwards neither | member task list spans all teams (Gauzy filters by `options.where`, `task.service.ts:834-880`) |
| 4 | `GET /timer/timesheet?taskIds[0]=…&unitOfTime=…` — `apps/web/core/services/client/api/activities/activity.service.ts:35-39`, `use-task-activity.ts:36` | `apps/web/app/api/timer/timesheet/route.ts:12-14` destructures `taskId` from a `URLSearchParams` (always undefined), hard-codes `defaultRange:'false'`, drops `unitOfTime` | task Activity tab shows activities of all tasks |
| 5 | `GET /timesheet/time-log/report/daily-chart` with `projectIds[]`, `employeeIds[]`, `teamIds[]`, `logType[]` — `apps/web/core/services/client/api/timesheets/time-log.service.ts:320-324` | `apps/web/app/api/timesheet/time-log/report/daily-chart/route.ts:33-48` never reads them (sibling `daily/route.ts:45-49` does) | activity chart ignores every member/team/project filter |
| 6 | `GET /organization-projects[/:id]` with `relations[]`, `skip`, `take` | `apps/web/app/api/organization-projects/route.ts:30-34`, `[id]/route.ts:39-43`, `apps/web/core/services/server/requests/organization-projects.ts:46-82` | relations and pagination dropped |
| 7 | `POST /invite/emails` with `roleId` — `apps/web/core/hooks/organizations/teams/invites/use-send-team-invitation.ts:26` | `apps/web/app/api/invite/emails/route.ts:28-44` ignores `body.roleId` (forces EMPLOYEE) and returns the pending list instead of the created invites | invited role is wrong in proxy mode |
| 8 | `POST /timer/toggle` with `body.taskId` — `apps/web/core/hooks/timer/use-timer-api.ts:281` | `apps/web/app/api/timer/toggle/route.ts:13,133,144` uses the cookie task | toggle targets a different task than the client asked |
| 9 | GitHub integration `metadata`/`repositories` with `integrationId`; `integration-tenant/remember/state?name=` | `apps/web/app/api/integration/github/{metadata,repositories}/route.ts:12`, `integration-tenant/remember/state/route.ts:11` | `integrationId`/`name` lost → `/integration/github/undefined/...`, unfiltered list |
| 10 | `GET /organization-team` | `apps/web/app/api/organization-team/route.ts:55-86` merges the teams of ALL the user's organizations; direct mode returns the cookie organization only | team list content differs by mode |
| 11 | error status parity | `apps/web/core/services/server/fetch.ts:47-49` (no try/catch → Gauzy 4xx becomes Next 500); `timer/timesheet/time-log` POST/PUT, `tasks/team` POST, `task-statuses` POST answer 200 with an error body; `organization-team/[id]/route.ts:21,45,73` answers 400 `{}` when unauthenticated so the client 401 interceptor (`apps/web/core/services/client/api.service.ts:188-190`) never re-authenticates | error handling differs by mode |

## Evidence

See the file:line references above (both the client service and the handler were read).
Recurring root cause in #4, and in `invite/[id]` (AUDIT-001):
`const { x } = searchParams as unknown as {…}` on a `URLSearchParams` object.

## Impact

Proxy-mode users see wrong or missing data in Time & Activity, tags, member task lists, task
activity, activity chart, projects, invitations and the timer toggle. Affects Employee and
Team Manager. Direct mode is unaffected, which hides the bugs from SaaS testing.

## Expected Behavior

In proxy mode each handler forwards the client's method, query parameters and body verbatim
(cookies may add auth headers but never replace client-supplied scope filters that the direct
call sends), and returns Gauzy's status and body unchanged.

## Scope

1. Fix each handler listed above; where possible replace hand-rebuilt requests with
   `forwardToGauzy()` (`apps/web/core/services/server/forward-to-gauzy.ts`), already used by
   `timesheet/status`, `timesheet/time-log*` and `role-permissions/me`.
2. Replace every `searchParams as unknown as {...}` destructure with `searchParams.get()`.
3. Wrap `serverFetch` calls so Gauzy 4xx statuses are returned as-is (never 200/500).
4. Add a parity test harness: for each client service path, assert that a handler exists for
   the method and that the handler forwards the query keys the client sends.

## Acceptance Criteria

- [ ] Time & Activity counts, tag list, member task list (filtered by team), task activity
      tab, activity chart filters, project relations/pagination, invite role and timer toggle
      return the same data in proxy mode as in direct mode.
- [ ] Gauzy 4xx responses are surfaced with their status in proxy mode.
- [ ] Works in both API modes (direct Gauzy + proxy).
- [ ] Parity test fails when a client path has no handler.

## Dependencies

AUDIT-001, AUDIT-002. No Gauzy change required.
