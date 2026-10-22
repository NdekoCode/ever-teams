# [AUDIT-012] Organization-wide tag writes, project reads and a team-update edge case for employees

**Type**: Security
**Priority**: P3
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Three smaller scoping gaps found in endpoints Ever Teams uses:

1. `PUT /tags/:id`, `DELETE /tags/:id` (`ever-gauzy/packages/core/src/lib/tags/tag.controller.ts:165-195`):
   `ORG_TAGS_EDIT` is held by `EMPLOYEE`; service is tenant-scoped CRUD → any employee
   edits/deletes any tag of any team/organization.
2. `GET /organization-projects`, `GET /organization-projects/:id`
   (`organization-project/organization-project.controller.ts:296-301,331-335` →
   `organization-project.service.ts:500-508` `super.findAll`): organization-wide project list
   with any `relations[]` (members, teams). Membership scoping exists only on
   `/organization-projects/employee/:employeeId`.
3. `PUT /organization-team/:id` by a user whose token has no employee id
   (`organization-team/organization-team.service.ts:320-343`): the manager check is wrapped in
   `if (employeeId) { … }`; without an employee id the check is skipped and
   `super.create({...input, id})` updates any team (settings, `managerIds`). `deleteTeam`
   (`:684-690`) and `OrganizationTeamEmployeeService.update` already fail closed.

## Evidence

File:line above; EMPLOYEE permissions in `role-permission/default-role-permissions.ts:938-1067`.

## Impact

Tag vandalism across teams; project metadata disclosure; a rare privilege path for
employee-less users.

## Expected Behavior

Tag writes limited to tags of teams the caller manages (or org-level permission); project
reads limited to projects the caller is a member/manager of unless `ALL_ORG_VIEW`; team update
fails closed when the caller has no employee record.

## Scope

1. Tag service update/delete: team-manager assertion via `ManagedEmployeeService`.
2. `OrganizationProjectService.findAll/findById`: add `members.employeeId = me OR manager`
   subquery like `OrganizationTeamService.findAll` (`organization-team.service.ts:546-563`).
3. `OrganizationTeamService.update:320`: `if (!employeeId) throw new ForbiddenException()`
   unless `ALL_ORG_EDIT`.

## Acceptance Criteria

- [ ] Covered by specs; Ever Teams project/tag pages keep working for members and managers.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
