# Ever Teams — Production Readiness Audit Report

**Date**: 2026-10-22
**Scope**: `NdekoCode/ever-teams` `develop` @ `2ddf90a` (web app `apps/web`, proxy routes, shared
packages) and `NdekoCode/ever-gauzy` `develop` @ `954aac86` (API). Mobile/desktop/extensions only
checked for blockers.
**Method**: static code audit of both repositories (every claim carries `file:line`),
CI-equivalent build run on Ever Teams (see §8), reconciliation of the 118 + 119 prior-work branches
of the two forks (`PRIOR-WORK-BRANCH-INVENTORY.md`). Nothing outside `ai-guides/` was modified.
Items that could not be verified are marked `UNVERIFIED`.

---

## 1. Executive status

**Production readiness: NOT READY.**

The build/deploy layer is in good shape (install, typecheck, lint, 1371 unit tests and the
production build all pass; Docker image and compose are runtime-configured; CI covers them), and
the two historically known problems are largely resolved on the Gauzy side. What blocks shipping
is different from what the previous documentation assumed:

1. **Proxy mode is not usable** (`NEXT_PUBLIC_GAUZY_API_SERVER_URL` empty — the documented
   option for remote browsers in `docker-compose.yml:97-105`): no route for workspace selection /
   switch, invitation accept, task delete, project delete, kanban reorder, task estimations;
   Time & Activity counts always 400; several handlers drop filters (AUDIT-001..003).
2. **Authorization gaps in Gauzy on endpoints Ever Teams uses**: any employee can rewrite any
   task of the tenant, read any team's member list with emails, and edit/delete any team's task
   statuses (AUDIT-005..007), plus six P2 scoping gaps.
3. **Manager flows are still broken in the client**: team managers cannot approve timesheets
   (permission model), and the reports/dashboards send empty `employeeIds`/`teamIds`, which the
   now manager-aware Gauzy resolves to "self only" (AUDIT-014, AUDIT-015).
4. **Response-schema drift** makes core reads fail on real (non-seeded) data: activity views,
   task lists with Teams-created members, custom status names, team avatars (AUDIT-029).
5. A **tracked `.env` with a public `AUTH_SECRET`** signs sessions on non-Docker production
   deployments that forget to set their own (AUDIT-013).

Distance to deployable: the P0/P1 set is 11 tasks (3 proxy, 4 security, 2 manager flows,
1 schema, 1 secret). Most are small, well-localized changes; the Gauzy ones reuse the existing
`ManagedEmployeeService` helper.

---

## 2. Critical blockers (P0 / P1)

| ID | Blocker | Repo |
|---|---|---|
| AUDIT-001 | Proxy mode: workspace chooser/switch, invitation accept, `/user-organization`, `/organization/:id` have no handler; `invite/[id]` loses `action` | ever-teams |
| AUDIT-002 | Proxy mode: `DELETE /tasks/:id`, `DELETE /organization-projects/:id`, `PATCH /task-statuses/reorder`, `/task-estimation` → 404/405 | ever-teams |
| AUDIT-003 | Proxy handlers drop params / rewrap responses: counts 400, tags list throws, member tasks across all teams, task activity org-wide, chart filters ignored, projects without relations, invite role forced, toggle uses cookie task, GitHub integration ids lost, error statuses not forwarded | ever-teams |
| AUDIT-005 | `PUT /tasks/:id` — any tenant employee rewrites any task (cross-org) | ever-gauzy |
| AUDIT-006 | `GET /organization-team/:id` — any team's members + emails by UUID | ever-gauzy |
| AUDIT-007 | Task metadata CRUD/reorder has no permission guard; UI-only manager gating | ever-gauzy |
| AUDIT-013 | Tracked `apps/web/.env` with `AUTH_SECRET=ever-app-auth-secret`; prod start only warns | ever-teams |
| AUDIT-014 | Team managers cannot approve/deny timesheets (`CAN_APPROVE_TIMESHEET` not in EMPLOYEE) | ever-gauzy |
| AUDIT-015 | Manager reports/dashboards/timesheet default to self-only data | ever-teams |
| AUDIT-029 | Zod schemas reject real Gauzy responses (activity raw rows, null bill rates on task members, free-text status names, avatar `thumb: null`) | ever-teams |

### 2.1 Team-manager blocked routes — verified status (known problem #1)

The approved helper approach exists and is in use on Gauzy `develop`:
`packages/core/src/lib/employee/managed-employee.service.ts` (`ManagedEmployeeService`:
`filterAccessibleEmployeeIds`, `isManagerOfTeamsOrProjects`, `isMemberOfTeam`, `canManageEmployee`,
`canManageEmployees`, `canViewEmployeeProfile`). `TenantAwareCrudService` gained
`withoutEmployeeFilter()` (`core/crud/tenant-aware-crud.service.ts:380-391`) and
`findConditionsWithoutOwnEmployee()` (`:362`). `CHANGE_SELECTED_EMPLOYEE` was **not** granted to
EMPLOYEE (`role-permission/default-role-permissions.ts:938-1067`). Used by: `daily-plan.service.ts`,
`time-log.service.ts`, `statistic.service.ts`, `task.service.ts`, `employee.controller.ts`,
`custom-tracking.service.ts`, `shared-entity.*`.

| Domain | Documented as | Current status | Evidence (Gauzy `packages/core/src/lib/`) |
|---|---|---|---|
| Daily plans POST/PUT/DELETE | blocked | **FIXED** | create `tasks/daily-plan/daily-plan.service.ts:83-85` (`canManageEmployee`), team read `:435-453` (`isMemberOfTeam`), update `:531-595`, delete `:629-675` (`withoutEmployeeFilter` + `canManageEmployee`), add/remove task `:795-802`, `:877-885` |
| Time logs GET/PUT/DELETE | blocked | **FIXED** (manager must name `employeeIds`/`teamIds`) | `time-tracking/time-log/time-log.service.ts:1222-1255` (`canManageEmployees`), `:1541` (`addManualTime`), `:1724-1742` (`updateManualTime`), `:1851-1870` (`deleteTimeLogs`) |
| Statistics (7 methods) | blocked | **FIXED** (same condition) | `time-tracking/statistic/statistic.service.ts:652, 704, 868, 1086, 1681, 2021, 2255-2265, 2578, 2760, 2924` (`filterAccessibleEmployeeIds`) |
| Tasks POST/PUT/DELETE | blocked | **FIXED / over-corrected** | EMPLOYEE holds `ORG_TASK_ADD/EDIT` (`default-role-permissions.ts:970-972`); `DELETE /tasks/:id` admits `ORG_TASK_EDIT` + manager check (`tasks/task.controller.ts:434-435`, `task.service.ts:465-483`); `PUT /tasks/:id` has **no** scoping at all (AUDIT-005) |
| Roles GET /roles, /role-permissions | blocked | **FIXED for the client** | `GET /roles` still needs `CHANGE_ROLES_PERMISSIONS` (`role/role.controller.ts:30,113`) but `/roles/options` and `/roles/team-assignable` admit `ORG_TEAM_ADD` (`:53-54,92-93`); Ever Teams uses them for non-admins (`apps/web/core/hooks/roles/use-roles-query.ts:57`); `/role-permissions/me` is open (`role-permission.controller.ts:70-71`) |

What remains on the client side: AUDIT-015 (defaults), AUDIT-017 (daily plan manager UI),
AUDIT-014 (timesheet approval is a permission-model gap, not a CRUD-filter one).

### 2.2 Employee endpoint migration — verified status (known problem #2)

**DONE**, with one documentation drift.

- Client: `apps/web/core/services/client/api/organizations/teams/employee.service.ts:23-57`
  calls `/employee/members` with `organizationId`, `tenantId`, `relations[0]=user` and root-level
  `organizationTeamId` (not `teamId`, not `where[]`).
- Server request: `apps/web/core/services/server/requests/employee.ts:25-50`, same structure;
  proxy route `apps/web/app/api/employee/members/route.ts:13-22` forwards `organizationTeamId`.
- Query key: `useEmployee` uses `queryKeys.users.employees.workingByScope(tenantId, organizationId, organizationTeamId)`
  (`apps/web/core/hooks/organizations/employees/use-employee.ts:55-58`,
  `core/query/keys/index.ts:50-62`); invalidation uses the `users.employees.all` prefix
  (`use-employee.ts:126-128`) which matches. The older `working(...)` key (`index.ts:63-75`)
  also includes the team id but is unused.
- No remaining `/employee/pagination` call in `apps/**` or `packages/**` (grep: only comments).
- Gauzy side: `GET /employee/members` refuses non-members of the requested team unless
  `ALL_ORG_VIEW`/`CHANGE_SELECTED_EMPLOYEE` (`employee/employee.controller.ts:262-282`).
- Drift: the migration notes describe a `/employee/working` fallback in proxy mode; the current
  code uses `/employee/members` in both modes. Accepted deviations (`relationalEmployeeSchema.organizationTeamId`,
  the `useEffect`→Jotai sync) cause no runtime bug and are not tasked.

---

## 3. Task summary table

See `jira-tasks/README.md` for the full table (35 tasks). Counts: P0 ×2, P1 ×9, P2 ×12, P3 ×10,
P4 ×2. By component: server-api 3, web 16, gauzy-api 15, infra 1.

---

## 4. Existing task reconciliation

`ai-guides/jira-tasks/` did not exist on `develop` (nor on any of the 120 remote branches) and no
`ai-guides/` documents were present, so **0 existing task files** could be reconciled
(DONE 0 / PARTIALLY_DONE 0 / NOT_DONE 0 / INCORRECT 0 / OBSOLETE 0 / DUPLICATE 0). The nearest
record of prior work is the set of `fix/*`/`feat/*` branches on both forks, which were reconciled
against `develop` instead (`PRIOR-WORK-BRANCH-INVENTORY.md`):

| Repo | Branches | MERGED (ancestor) | CONTENT-PRESENT | CONTENT-ABSENT | UNCLEAR |
|---|---|---|---|---|---|
| ever-teams | 119 (`fix/*`, `feat/*`, `docs/*`) | 117 | 0 | 0 | 2 |
| ever-gauzy | 118 | 4 | 79 | 7 | 28 |

Hand checks of the Ever-Teams-relevant `UNCLEAR`/`ABSENT` branches:
- `fix/web-setactivetask-unassigns-same-task` → **DONE differently** (`use-team-tasks-state.ts:99` guards `$memberActiveTaskId.current !== task?.id`).
- `fix/web-tasks-by-employee-cache` → **OBSOLETE** (hook reworked as `use-tasks-by-employee-query.ts`; team id passed explicitly).
- `feat/daily-plan-task-order`, `feat/team-member-presence-heartbeat`, `feat/timesheet-reject-reason` → **DONE** on Gauzy develop (`daily-plan.entity.ts:63`, `employee.controller.ts:303`, `update-timesheet-status.dto.ts:11`, migrations `1790000025000-*`, `1790000027000-*`).
- `fix/gauzy-daily-plan-*`, `fix/daily-plan-write-authorization`, `fix/gauzy-task-manager-access`, `fix/gauzy-statistics-counts-residual-block`, `fix/gauzy-managed-employee-edge-cases`, `fix/gauzy-addmanualtime-manager-aware`, `fix/roles-list-inaccessible-managers` → **DONE** (content verified in §2.1).
- `fix/time-log-delete-own-without-team` (ABSENT) → **DONE differently** (`deleteTimeLogs` excludes the caller's own logs before `canManageEmployees`, `time-log.service.ts:1853-1857`).
- `fix/members-statistics-slot-fanout` (ABSENT) → **NOT_DONE** → AUDIT-028.
- `fix/mikro-orm-task-statistics-rows` (ABSENT) → **NOT_DONE** → AUDIT-035.
- Remaining ABSENT branches (`channel-region-fallback-order`, `graphql-cursor-gone-row`, `stock-count-bin-scope`, `time-off-policy-employee-ids`) are outside the Ever Teams surface; not tasked.

---

## 5. New tasks (sorted by priority)

- **P0**: AUDIT-001, AUDIT-002
- **P1**: AUDIT-003, AUDIT-005, AUDIT-006, AUDIT-007, AUDIT-013, AUDIT-014, AUDIT-015, AUDIT-029
- **P2**: AUDIT-004, AUDIT-008, AUDIT-009, AUDIT-010, AUDIT-011, AUDIT-016, AUDIT-017, AUDIT-018, AUDIT-019, AUDIT-023, AUDIT-024, AUDIT-025, AUDIT-030
- **P3**: AUDIT-012, AUDIT-020, AUDIT-021, AUDIT-022, AUDIT-026, AUDIT-027, AUDIT-028, AUDIT-031, AUDIT-032, AUDIT-033
- **P4**: AUDIT-034, AUDIT-035

Classification against the production scope (auth, teams, projects, tasks, kanban, daily plans,
time tracking, timesheets, manager flows, permissions, stable API, deployment):

1. **Required for production readiness**: all P0/P1 above, plus AUDIT-008..011 (security P2s)
   and AUDIT-016, AUDIT-023, AUDIT-024, AUDIT-025 (wrong numbers in the core time-tracking views).
2. **Important but non-blocking**: AUDIT-004, AUDIT-017, AUDIT-018, AUDIT-019, AUDIT-030,
   AUDIT-012, AUDIT-020, AUDIT-022, AUDIT-026, AUDIT-027, AUDIT-032, AUDIT-033.
3. **Future / nice-to-have**: AUDIT-021, AUDIT-028, AUDIT-031, AUDIT-034, AUDIT-035.

---

## 6. Cross-repository dependency map

| Ever Teams feature | Needs in Ever Gauzy | Task |
|---|---|---|
| Task edit by non-managers must be scoped | `TaskService.update` ownership check | AUDIT-005 |
| Team page / member list | `OrganizationTeamService.getOrganizationTeamStatistic` membership check | AUDIT-006 |
| Settings → task statuses/priorities/sizes/versions/issue types (manager-only UI) | Guards on the six metadata controllers | AUDIT-007 |
| Invitations management (manager-only UI) | Managed-team scoping in `InviteService` | AUDIT-008 |
| Member profile tasks, task detail | `getAllTasksByEmployee` / `findById` scoping | AUDIT-009 |
| Task statistics on task cards | `StatisticService.getTasks` special case membership check | AUDIT-010 |
| Join requests list | `OrganizationTeamJoinRequestService.findAll` scoping | AUDIT-011 |
| Timesheet approval by team managers | `PUT /timesheet/status` manager path via `ManagedEmployeeService` | AUDIT-014 |
| Manager reports (after AUDIT-015) | none — Gauzy already honours `teamIds`/`employeeIds` | — |
| requirePlanToTrack | `TimerService.startTimer` plan check | AUDIT-018 |
| Remove task from all plans | `removeTaskFromManyPlans` day cutoff | AUDIT-019 |
| Timesheet status filter | `status[]` predicate in `getFilterTimeLogQuery` | AUDIT-026 |
| Daily plan hours validation | DTO bounds | AUDIT-021 |
| Task Activity tab / Apps & Sites | none — Gauzy returns raw rows; client schema must change | AUDIT-029 |
| Everything in proxy mode | none — Next.js routes only | AUDIT-001..003 |

Version coupling: Ever Teams does not depend on `@gauzy/*` packages; the contract is the HTTP
API. Gauzy `develop` requires Node `>=26` (`ever-gauzy/package.json` engines) while Ever Teams
requires `>=24` (`.nvmrc` 24.14.0); both images pin their own Node, no conflict.

---

## 7. Stabilization roadmap (dependency-aware)

**Phase 1 — Gauzy authorization + manager permission model (unblocks several client flows)**
AUDIT-005, AUDIT-006, AUDIT-007 (P1 security) → AUDIT-014 (timesheet approval) →
AUDIT-008, AUDIT-009, AUDIT-010, AUDIT-011 (P2 security). All reuse `ManagedEmployeeService`.
In parallel on Ever Teams: AUDIT-013 (secret), AUDIT-001, AUDIT-002 (proxy P0).

**Phase 2 — Core correctness (client)**
AUDIT-029 (schemas that break core reads) → AUDIT-032 (stop swallowing errors so regressions
are visible) → AUDIT-015 (manager defaults) → AUDIT-016 (keys) → AUDIT-023, AUDIT-024, AUDIT-025
(time numbers).

**Phase 3 — Data / API consistency in both modes**
AUDIT-003 (proxy parameter parity + status codes, with the parity test) → AUDIT-004 (direct-only
mismatches) → AUDIT-030 (secondary schema drift) → AUDIT-019, AUDIT-026 (Gauzy) → AUDIT-018.

**Phase 4 — UX and reliability**
AUDIT-017, AUDIT-020, AUDIT-022, AUDIT-027, AUDIT-012, AUDIT-021.

**Phase 5 — Deployment**
AUDIT-033 (env documentation + sync test); re-run the CI-equivalent checks of §8 against a
proxy-mode compose stack (`NEXT_PUBLIC_GAUZY_API_SERVER_URL=`) once Phase 1–3 land.

**Phase 6 — Non-blocking improvements**
AUDIT-028, AUDIT-031, AUDIT-034, AUDIT-035.

---

## 8. Production checklist (checked only with evidence)

| Item | State | Evidence |
|---|---|---|
| Dependency install | ✅ | `yarn install --frozen-lockfile --ignore-scripts` on Node 24.14.0 (`.nvmrc`): exit 0 (958 s). Fails on Node 22 by `engines` (`package.json`) — expected. |
| TypeScript compilation | ✅ | `yarn workspace @ever-teams/web tsc --noEmit -p tsconfig.json` exit 0; cypress tsconfig exit 0 |
| Lint | ✅ | `yarn nx run web:lint` exit 0 (`--max-warnings=0`) |
| Unit tests | ✅ | `yarn test:web --runInBand`: 136 suites, 1371 tests passed; `yarn test:performance` exit 0 |
| Production build (web) | ✅ | `yarn build:web` exit 0 (3 m 26 s; only `url.parse` deprecation warnings) |
| Docker / compose | ✅ | `.deploy/web/Dockerfile` (Node 24.14.0-slim, standalone output, no deployment build args), `docker-compose.yml` (api + webapp, runtime env, `GAUZY_API_SERVER_URL` vs `NEXT_PUBLIC_GAUZY_API_SERVER_URL` documented at `:91-105`), `.env.docker` |
| Health check / logging | ✅ | `apps/web/app/api/health/route.ts`; Sentry configs present (`sentry.*.config.ts`) |
| CI/CD | ✅ | `.github/workflows/web.before-merge.yml` runs tests, perf tests, feature-surface check, tsc, lint, build on Node 24.14.0; docker/deploy workflows present |
| Database migrations (Gauzy) | ✅ | TypeORM migrations run on `initialize()` with a migration lock (`packages/core/src/lib/database/database.module.ts:68-80`); migrations for the new features present |
| Environment config | ⚠️ | Runtime-env mechanism works (`CLAUDE.md`, `core/services/server/runtime-env.ts`); samples incomplete (AUDIT-033); tracked `.env` with public secret (AUDIT-013) |
| Auth | ⚠️ direct ✅ / proxy ❌ | Passcode/password/social flows have routes and tests; proxy mode lacks workspace chooser/switch and invite accept (AUDIT-001) |
| Teams | ⚠️ | Member list scoped (`/employee/members`); by-id team read leaks any team (AUDIT-006); proxy team list merges all orgs (AUDIT-003) |
| Projects | ⚠️ | Proxy cannot delete, drops relations (AUDIT-002/003); org-wide read for employees (AUDIT-012) |
| Tasks / kanban | ❌ | `PUT /tasks/:id` unscoped (AUDIT-005); metadata CRUD unguarded (AUDIT-007); proxy delete/reorder/estimation 405/404 (AUDIT-002); schema drift can empty the list (AUDIT-029) |
| Daily plans | ⚠️ | CRUD, one-per-day, reorder, manager writes work in both modes; manager UI partial (AUDIT-017); UTC cutoff (AUDIT-019); `requirePlanToTrack` client-only (AUDIT-018) |
| Time tracking | ⚠️ | Timer start/stop/race/cross-device/polling verified sound; live total double count (AUDIT-023), manual time without team (AUDIT-024), UTC boundaries (AUDIT-025), activity views fail validation (AUDIT-029), proxy task activity/chart (AUDIT-003) |
| Timesheets | ❌ for managers | Auto-create, reject reason OK; approval impossible for team managers (AUDIT-014); status filter no-op (AUDIT-026) |
| Manager flows | ❌ | Gauzy side fixed (§2.1); client defaults self-only (AUDIT-015), approval (AUDIT-014), plan UI (AUDIT-017) |
| Permissions | ❌ | Three P1 + six P2 server-side gaps (AUDIT-005..012) |
| API contracts, direct mode | ⚠️ | Two mismatches (AUDIT-004); schema drift (AUDIT-029/030) |
| API contracts, proxy mode | ❌ | AUDIT-001..003 |
| Query keys | ⚠️ | 88 call sites scanned; 3 mismatches (AUDIT-016); polling predicates verified against the current key factory |

Not run: Gauzy API build/tests (out of scope for the Ever Teams build; Gauzy CI covers it), a
live end-to-end run against a database (static audit only — the `BROKEN (static)` schema items in
AUDIT-029 are deterministic from code but were not reproduced at runtime).

---

## 9. Verified facts worth keeping (no task)

- `use-timer-polling.ts:42-62` predicates match the current key factory (`organizationTeams.detailByScope`
  team id at index 4; `users.employees.working*`), so the "first 3 key elements" concern no longer applies.
- Timer start body matches `StartTimerDTO`; double-start/stop-before-start/cross-tab races are
  guarded (`use-timer-api.ts:112-141, 285-307, 447-485, 639-662, 676-694`; Gauzy
  `stopPreviousRunningTimers`, `timer.service.ts:242,582-600`).
- `isManager` escalation via `PUT /organization-team-employee/:id` is not possible (DTO whitelist
  + manager check); `PUT /employee/:id` needs `ORG_EMPLOYEES_EDIT`; `PUT /user/:id` is self-only;
  `PUT /timesheet/status` requires `CAN_APPROVE_TIMESHEET`; time-log edit/delete check ownership;
  Next.js SSRF-prone proxies (`chat`, `public-assets`, `ever-connect`, image upload) are allow-listed.
- Gauzy signing secrets have no literal fallback (`packages/config/src/lib/environments/environment.ts:49-56`).
- Dual-mode daily-plan routes are 1:1 and send identical bodies.
