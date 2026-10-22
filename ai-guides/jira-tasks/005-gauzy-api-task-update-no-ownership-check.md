# [AUDIT-005] `PUT /tasks/:id` lets any employee of the tenant rewrite any task (no team/organization ownership check)

**Type**: Security
**Priority**: P1
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

`TaskService.update` only loads the task by id with tenant scoping and then saves the input.
There is no check that the caller belongs to (or manages) one of the task's teams, nor that
the task belongs to the caller's organization. The `EMPLOYEE` role holds `ORG_TASK_EDIT`, so
every signed-in employee can retitle, close, reassign (`members`, `teams`), move
(`projectId`, `organizationSprintId`) any task in the tenant, including tasks of other
organizations.

## Evidence

- Route guard: `ever-gauzy/packages/core/src/lib/tasks/task.controller.ts:386-390`
  (`@Permissions(ALL_ORG_EDIT, ORG_TASK_EDIT) @Put('/:id')`).
- Service: `ever-gauzy/packages/core/src/lib/tasks/task.service.ts:128-160` loads
  `findOneByIdString(id, { relations })` (tenant scope only, `Task` has no `employeeId`
  column so `TenantAwareCrudService.findConditionsWithEmployeeByUser`
  (`core/crud/tenant-aware-crud.service.ts:328-350`) adds nothing) and `:213-217` saves
  `super.create({ ...data, id, ...moved })`.
- `UpdateTaskDTO extends CreateTaskDTO` accepts `organizationId`, `members`, `teams`,
  `projectId`, `status`, `title`, `description`, `organizationSprintId`.
- Siblings do check: `deleteTask` (`task.service.ts:465-483`,
  `isManagerOfTeamsOrProjects`) and `updateStatus` (`task.controller.ts:414-425`).
- EMPLOYEE default permissions: `role-permission/default-role-permissions.ts:970-972`.
- Ever Teams calls this endpoint at
  `apps/web/core/services/client/api/tasks/task.service.ts:277,282`.

Demonstration (employee of team A): `PUT /api/tasks/<task-of-team-B>` with body
`{"title":"hijacked","status":"closed","members":[],"teams":[{"id":"<teamA>"}]}` → 202.

## Impact

Cross-team and cross-organization write IDOR on the core entity of the product. Affects
every tenant; exploitable by any Employee.

## Expected Behavior

Without `ALL_ORG_EDIT`, a caller may update a task only if they are a member of one of the
task's teams (or of the task's project), or manage one of them via
`ManagedEmployeeService.isManagerOfTeamsOrProjects`; the task must belong to the caller's
organization. Reassigning `teams`/`members` to teams the caller does not belong to is refused.

## Scope

1. In `TaskService.update` (`task.service.ts:128`), after loading the task, apply the same
   organization filter as `deleteTask` (`teams.filter(team => team.organizationId === task.organizationId)`)
   and refuse with `ForbiddenException` unless the caller has `ALL_ORG_EDIT`, or is a member
   of one of those teams, or `isManagerOfTeamsOrProjects(employeeId, teamIds, [task.projectId])`.
   Add a membership helper (`ManagedEmployeeService.isMemberOfTeam` exists at
   `employee/managed-employee.service.ts:191`) rather than granting
   `CHANGE_SELECTED_EMPLOYEE`.
2. Apply the same rule to `PUT /tasks/:id/status` if its organization check is weaker, and to
   `POST /tasks` (`teams` of another organization).
3. Add specs next to `task.service.find-team-tasks.spec.ts`.

## Acceptance Criteria

- [ ] An employee of team A gets 403 on `PUT /tasks/<task of team B>`.
- [ ] A team manager of team A can update tasks of team A, including members.
- [ ] A task cannot be re-pointed to a team of another organization.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None (helper service already exists).
