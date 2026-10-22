# [AUDIT-009] `GET /tasks/:id` and `GET /tasks/employee/:id` are tenant-wide reads (IDOR)

**Type**: Security
**Priority**: P2
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

- `GET /tasks/employee/:id` accepts any employee id of the tenant and returns all tasks
  assigned to that employee or to any of their teams. The sibling `GET /tasks/employee`
  (no id) goes through `resolveMemberFilter` → `ManagedEmployeeService.canManageEmployee`
  (`task.service.ts:656-671`); the by-id variant does not.
- `GET /tasks/:id` returns any task of the tenant with arbitrary `relations[]`.

## Evidence

- `ever-gauzy/packages/core/src/lib/tasks/task.controller.ts:264-268` →
  `task.service.ts:834-936` (`getAllTasksByEmployee`): filters only by `tenantId`,
  `task_employee.employeeId = :employeeId OR organization_team_employee.employeeId = :employeeId`
  and client `options.where`; no self/managed check.
- `task.controller.ts:248-251` → `task.service.ts:407-409` `findOneByIdString(id, params)`
  with client-controlled `relations` (`GetTaskByIdDTO extends FindOptionsQueryDTO<Task>`).
- `Task` has no `employeeId` column, so `TenantAwareCrudService` employee scoping never applies.
- Ever Teams calls `/tasks/employee/:id` at `apps/web/core/services/client/api/tasks/task.service.ts:389,436`.

## Impact

Read IDOR across teams/organizations (task titles, descriptions, members, daily plans).

## Expected Behavior

Without `ALL_ORG_VIEW`/`CHANGE_SELECTED_EMPLOYEE`: `/tasks/employee/:id` only for self or an
employee the caller manages (`canManageEmployee(id, organizationTeamId, organizationId)`);
`/tasks/:id` only when the caller is a member/manager of one of the task's teams or project.

## Scope

1. `TaskService.getAllTasksByEmployee`: resolve `employeeId` through `resolveMemberFilter`
   (same as `/tasks/employee`).
2. `TaskService.findById` (`:407`): after loading `teams`/`project`, assert membership via
   `ManagedEmployeeService.isMemberOfTeam` / `isManagerOfTeamsOrProjects`.
3. Specs.

## Acceptance Criteria

- [ ] Non-manager gets 403 for another employee's id and for a task of another team.
- [ ] Managers still load team members' tasks on the member profile page in both API modes.

## Dependencies

AUDIT-005 (same helper usage).
