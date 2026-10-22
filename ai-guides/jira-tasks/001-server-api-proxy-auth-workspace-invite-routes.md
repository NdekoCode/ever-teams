# [AUDIT-001] Proxy mode: workspace selection, workspace switch and invitation acceptance have no Next.js route

**Type**: Bug
**Priority**: P0
**Component**: server-api
**API mode affected**: proxy
**Status**: NOT_STARTED

## Problem

When `NEXT_PUBLIC_GAUZY_API_SERVER_URL` is empty (proxy mode, the documented option for
remote browsers in `docker-compose.yml:97-105`), every client call is sent to the app's own
`/api/*` handlers. The authentication and onboarding flows below call paths that have no
handler, so proxy-mode deployments cannot complete login (workspace chooser), cannot switch
workspace and cannot accept a team invitation.

| Client call | Client file:line | Proxy route |
|---|---|---|
| `GET /auth/workspaces` | `apps/web/core/services/client/api/auth/workspace.service.ts:30` | none (`apps/web/app/api/auth/` has no `workspaces`) |
| `POST /auth/switch-workspace` | `apps/web/core/services/client/api/auth/workspace.service.ts:79` | none |
| `POST /invite/accept` | `apps/web/core/services/client/api/organizations/teams/invites/invite.service.ts:322` | none (`/api/invite` has no `accept` segment) |
| `GET /user-organization?...` | `apps/web/core/services/client/api/users/user-organization.service.ts:28` | none |
| `PUT /invite/:id?action=ACCEPTED|REJECTED` | `invite.service.ts:286-290`, hook `apps/web/core/hooks/organizations/teams/invites/use-respond-to-invitation.ts:37` | exists, but `apps/web/app/api/invite/[id]/route.ts:66-67` reads `action` with `const { action } = searchParams as unknown as {...}` on a `URLSearchParams` object → always `undefined` → 400 |
| `GET /organization/:id` | `apps/web/core/hooks/organizations/use-current-organization.ts:35` | none |

## Evidence

- Base URL selection: `apps/web/core/services/client/api.service.ts:378-402, 463-542` (falls
  back to `/api` when `GAUZY_API_BASE_SERVER_URL.value` is empty; `api-factory.ts:4-18`).
- There is no catch-all proxy: `apps/web/app/api/route.ts` is a static status GET; unknown
  `/api/*` paths return Next.js 404/405.
- Accept-invite page flow: `apps/web/core/hooks/auth/use-accept-invite.ts:42-62` chains
  `/invite/validate` (lands on `invite/[id]` GET), `/invite/accept`, `/user-organization`.
- Gauzy exposes all of these directly: `ever-gauzy/packages/core/src/lib/invite/invite.controller.ts:148,211`,
  `auth.controller.ts` (`/auth/workspaces`, `/auth/switch-workspace`).
- Route tests exist only for `auth/*`, `chat`, `ever-stats`, `health`, `livekit`,
  `task-priorities`, `ever-connect` (`apps/web/test/**`); none cover the routes above.

## Impact

Production blocker for every proxy-mode deployment (self-hosted behind one origin, the
`NEXT_PUBLIC_GAUZY_API_SERVER_URL=` empty option in `docker-compose.yml`): users with
several workspaces cannot sign in, nobody can switch workspace, invited users cannot join a
team. Affects Employee, Team Manager and Admin alike.

## Expected Behavior

Every path the client can send in proxy mode has a handler that forwards the same method,
query and body to Gauzy and returns Gauzy's status code and body unchanged.

## Scope

1. Add `apps/web/app/api/auth/workspaces/route.ts` (GET) and
   `apps/web/app/api/auth/switch-workspace/route.ts` (POST) forwarding to Gauzy with the
   caller's bearer token (the chooser runs before cookies exist, so forward the
   `Authorization` header the client sends instead of relying on `authenticatedGuard`).
2. Add `apps/web/app/api/invite/accept/route.ts` (POST), `apps/web/app/api/invite/validate`
   (if the client path is kept) and `apps/web/app/api/user-organization/route.ts` (GET).
3. Fix `apps/web/app/api/invite/[id]/route.ts:66-67` to read `searchParams.get('action')`.
4. Add `apps/web/app/api/organization/[id]/route.ts` (GET) or change
   `use-current-organization.ts` to a path that exists in both modes.
5. Prefer the transparent `forwardToGauzy()` helper
   (`apps/web/core/services/server/forward-to-gauzy.ts`) so method, query, body and status
   are preserved.
6. Add a route test per new handler under `apps/web/test/` (same pattern as the existing
   `auth/*` tests).

## Acceptance Criteria

- [ ] With `NEXT_PUBLIC_GAUZY_API_SERVER_URL` empty, a user with two workspaces can sign in
      and pick a workspace, and can switch workspace from the UI.
- [ ] Accepting an invitation from the notification (`use-respond-to-invitation`) and from the
      accept-invite link completes in proxy mode.
- [ ] `PUT /api/invite/:id?action=ACCEPTED` forwards `action`.
- [ ] Works in both API modes (direct Gauzy + proxy).
- [ ] Route tests cover each new handler.

## Dependencies

AUDIT-002, AUDIT-003 (same class of bug, other routes). No Gauzy change required.
