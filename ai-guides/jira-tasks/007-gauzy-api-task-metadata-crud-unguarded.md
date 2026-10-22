# [AUDIT-007] Task statuses / priorities / sizes / versions / issue types: create, update, delete and reorder have no permission guard (UI-only manager gating)

**Type**: Security
**Priority**: P1
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The metadata controllers mount `TenantPermissionGuard` only. The `CrudFactory` base mounts
`POST`, `PUT /:id`, `DELETE /:id` with no `@Permissions` and no `PermissionGuard`, and the
reorder/mark-as-default routes are likewise unguarded. Ever Teams shows the settings UI only to
team managers, so authorization is client-side only: any authenticated user of the tenant can
rename/delete the statuses of any team or organization (and break every kanban board).

## Evidence

- `ever-gauzy/packages/core/src/lib/tasks/statuses/status.controller.ts:26-36`:
  `@UseGuards(TenantPermissionGuard)` … `extends CrudFactory<…>`; `:59-61` `PATCH /reorder`.
- `core/crud/crud.factory.ts:119-172`: `@Post()`, `@Put(':id')`, `@Delete(':id')` without
  permissions.
- `tasks/statuses/status.service.ts:93-97` delete only adds `isSystem: false`.
- Same shape: `tasks/priorities/priority.controller.ts:23-26`, `tasks/sizes/size.controller.ts:23-26`,
  `tasks/versions/version.controller.ts:25-28`, `tasks/issue-type/issue-type.controller.ts:23-26`,
  `tasks/related-issue-type/related-issue-type.controller.ts:25-28` (only `:id/soft` and
  `:id/recover` add `PermissionGuard`).
- Ever Teams writes: `apps/web/core/services/client/api/tasks/task-status.service.ts:45,90,126,161`;
  UI gate: `apps/web/core/components/pages/settings/left-side-setting-menu.tsx:33-57`.

Demonstration: `DELETE /api/task-statuses/<status id of any team>` as a plain member → 202.

## Impact

Any user can corrupt or delete the workflow configuration of any team/organization; kanban
columns disappear for everyone. Client-only authorization → classified as a security bug.

## Expected Behavior

Writes require a permission (`ORG_TASK_SETTING` or a new `ORG_TASK_METADATA_EDIT`) OR, for
team-scoped records (`organizationTeamId` set), that the caller manages that team
(`ManagedEmployeeService.isManagerOfTeamsOrProjects`). Organization-level records require an
organization-level permission not held by `EMPLOYEE`.

## Scope

1. Add a guard (e.g. `TaskMetadataWriteGuard`) applied to `POST`, `PUT /:id`, `DELETE /:id`,
   `PATCH /reorder`, `markAsDefault` on the six controllers: loads the record (or body
   `organizationTeamId`), and allows `ALL_ORG_EDIT`, or team manager of that team.
2. Keep reads as they are (EMPLOYEE needs them for boards).
3. Add `ORG_TASK_SETTING`-style permission to ADMIN defaults if a new one is introduced
   (`role-permission/default-role-permissions.ts`).
4. Specs for each controller.

## Acceptance Criteria

- [ ] A non-manager member gets 403 on create/update/delete/reorder of team statuses.
- [ ] A team manager can manage their team's statuses, not another team's.
- [ ] Ever Teams settings pages keep working for managers in both API modes.

## Dependencies

None.
