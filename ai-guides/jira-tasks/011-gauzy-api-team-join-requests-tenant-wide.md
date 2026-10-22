# [AUDIT-011] `GET /organization-team-join` lists join requests of every team in the organization to any employee

**Type**: Security
**Priority**: P2
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The list route requires `ORG_TEAM_JOIN_REQUEST_VIEW`, which `EMPLOYEE` holds
(`default-role-permissions.ts:1008`), and the service delegates to `super.findAll` (tenant
scope). Ever Teams sends only `where[organizationId]`/`where[tenantId]`, so every member
receives the join requests (applicant email, full name, link address) of all teams.

## Evidence

- `ever-gauzy/packages/core/src/lib/organization-team-join-request/organization-team-join-request.controller.ts:54-57`.
- `organization-team-join-request.service.ts:64-66` `findAll` → `super.findAll(options)`.
- Ever Teams request: `apps/web/core/services/client/api/organizations/teams/request-to-join-team.service.ts:31-40`.
- Accept/reject is already guarded (`assertMayActOnRequest`, service `:331`), so this is read-only disclosure.

## Impact

PII disclosure (applicant emails) across teams; non-managers see requests they cannot act on.

## Expected Behavior

Without `ALL_ORG_VIEW`, the list is limited to requests whose `organizationTeamId` is a team
the caller manages (`ManagedEmployeeService`).

## Scope

1. `OrganizationTeamJoinRequestService.findAll`: inject the managed-team filter
   (`organizationTeamId IN (managed teams)`), consistent with `assertMayActOnRequest`.
2. Verify the entity's `code`/`token` columns are excluded from the serialized response
   (UNVERIFIED during the audit).
3. Spec.

## Acceptance Criteria

- [ ] A non-manager gets an empty list; a manager sees their teams' requests only.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
