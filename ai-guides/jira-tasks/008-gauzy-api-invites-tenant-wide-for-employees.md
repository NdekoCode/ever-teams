# [AUDIT-008] Invitations: any employee can list, delete, resend and create invites for any team of the tenant

**Type**: Security
**Priority**: P2
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

`EMPLOYEE` holds `ORG_INVITE_VIEW` and `ORG_INVITE_EDIT`
(`default-role-permissions.ts:955-956`). The invite routes only check those permissions and
the service scopes by tenant, never by the caller's managed teams. Ever Teams shows the
invitation management UI to team managers only, so this is client-side authorization.

## Evidence

- `ever-gauzy/packages/core/src/lib/invite/invite.controller.ts:363-366` `GET /` →
  `invite.service.ts:803-830` `findAllInvites` builds `{ tenantId, ...restWhere }`; teams
  filter only if the client sends one → every invite (email, role, teams) of the tenant.
- `invite.controller.ts:387-389` `DELETE /:id` → base tenant-scoped delete.
- `invite.controller.ts:117-119` `POST /resend` → `invite.service.ts:488-561` regenerates
  token/code of any invite of the tenant and emails it.
- `invite.controller.ts:87-89` `POST /emails` (ORG_INVITE_EDIT | ORG_TEAM_ADD) →
  `invite.service.ts:166-260` `createBulk`: `teamIds` attached without checking the caller
  manages them.
- Ever Teams UI gate: `apps/web/core/hooks/organizations/teams/invites/*` used by
  manager-only components.

## Impact

Information disclosure (invitee emails) and privilege abuse (invite anyone into any team,
re-mint invitation tokens, delete other managers' invites). Affects all tenants.

## Expected Behavior

Without `ALL_ORG_EDIT`/`ALL_ORG_VIEW`, invite reads and writes are restricted to invites whose
`teams` include a team the caller manages (`ManagedEmployeeService`), and `createBulk` refuses
`teamIds` the caller does not manage.

## Scope

1. `InviteService.findAllInvites`, `delete`, `resendEmail`, `createBulk`: add the managed-team
   filter/assertion using `ManagedEmployeeService.isManagerOfTeamsOrProjects`.
2. Keep `GET /invite/me`, `/validate`, `/accept`, `/reject` unchanged.
3. Specs.

## Acceptance Criteria

- [ ] A member who manages no team gets an empty invite list and 403 on delete/resend/create.
- [ ] A manager of team A cannot invite into team B or see team B's invites.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
