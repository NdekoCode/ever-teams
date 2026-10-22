# [AUDIT-006] `GET /organization-team/:id` returns any team of the tenant with its members, emails and last worked task

**Type**: Security
**Priority**: P1
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The team list (`GET /organization-team`) is scoped to the caller's own teams, but the by-id
read is not. Any employee can request any team UUID of the tenant (other teams, other
organizations) with `relations[]=members.employee.user` and receive the member list with user
emails, `isManager` flags and last worked tasks.

## Evidence

- Controller: `ever-gauzy/packages/core/src/lib/organization-team/organization-team.controller.ts:136-146`.
- Service `getOrganizationTeamStatistic`: `organization-team.service.ts:82-107`:
  `findOneByIdString(organizationTeamId, { relations })` with no `members: { employeeId }`
  condition and no `CHANGE_SELECTED_EMPLOYEE` branch.
- Contrast `findAll`: `organization-team.service.ts:546-563, 616-636` adds
  `"organization_team"."id" IN (SELECT organizationTeamId FROM organization_team_employee WHERE employeeId = :me)`.
- Ever Teams requests `members, members.role, members.employee, members.employee.user, projects`
  on this route (`apps/web/core/services/client/api/organizations/teams/team.service.ts:201-226`).

Demonstration: `GET /api/organization-team/<any-team-uuid>?tenantId=<t>&organizationId=<any org>&relations[]=members&relations[]=members.employee&relations[]=members.employee.user&withLastWorkedTask=true` → 200 with every member's user record.

## Impact

Information disclosure (PII: emails, names, activity) across teams and organizations. Same
class as the `/employee/pagination` problem that was already fixed for `/employee/members`
(`employee/employee.controller.ts:262-282`).

## Expected Behavior

Without `ALL_ORG_VIEW`/`CHANGE_SELECTED_EMPLOYEE`, the by-id read succeeds only when the
caller is an active member of that team (`ManagedEmployeeService.isMemberOfTeam`) or the team
is public and the request comes through the public-share route.

## Scope

1. `OrganizationTeamService.getOrganizationTeamStatistic` (`:82`): before loading relations,
   check `isMemberOfTeam(RequestContext.currentEmployeeId(), organizationTeamId)` unless the
   caller holds `ALL_ORG_VIEW`; throw `ForbiddenException`/`NotFoundException` otherwise.
2. Apply the same gate to `GET /organization-team/:id` sibling reads (`/teams/:id` if present).
3. Spec next to `organization-team.service.soft-delete-manager.spec.ts`.

## Acceptance Criteria

- [ ] Non-member gets 403/404 for another team's id.
- [ ] Member and manager still receive the full team with members.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
