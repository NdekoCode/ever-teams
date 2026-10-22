# [AUDIT-004] Direct mode: two client calls do not match the Gauzy contract (masked by the proxy)

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: direct
**Status**: NOT_STARTED

## Problem

Two client services send a request that Gauzy does not understand; the proxy handlers
silently rewrite them, so the bug appears only with `NEXT_PUBLIC_GAUZY_API_SERVER_URL` set
(the SaaS/default docker-compose configuration).

1. `GET /role-permissions/{roleId}?data=…`
   (`apps/web/core/services/client/api/roles/role-permission.service.ts:35`,
   `apps/web/core/hooks/roles/use-role-permissions-query.ts:25`): Gauzy's
   `ever-gauzy/packages/core/src/lib/role-permission/role-permission.controller.ts` has no
   `GET /:id` (only `/me` at line 71 and `['/pagination','/']` at line 93). The proxy rewrites
   it to `/role-permissions?data=…` (`apps/web/core/services/server/requests/role-permissions.ts:26`).
   Direct mode → 404 → role-permission settings page empty.
2. Time-slot statistics: the client sends `todayStart`/`todayEnd`
   (`apps/web/core/services/client/api/timesheets/statistic.service.ts:58-59`), but
   `StatisticService.getEmployeeTimeSlots` reads only `startDate`/`endDate` and defaults to the
   current week (`ever-gauzy/packages/core/src/lib/time-tracking/statistic/statistic.service.ts:2912-2921`).
   The proxy maps the names (`apps/web/core/services/server/requests/timer/timer-slot.ts:68-72`).
   Direct mode → the Screenshots tab shows the whole week instead of today.

## Evidence

File:line above; Gauzy controller/service read on `develop`.

## Impact

Direct-mode deployments: role-permission settings do not load (Admin), Screenshots/time-slot
view shows a week's data under a "today" heading (Employee, Team Manager).

## Expected Behavior

Client paths and parameter names match the Gauzy contract so both modes send the same request.

## Scope

1. `role-permission.service.ts:35`: call `/role-permissions?...` with `where[roleId]`.
2. `statistic.service.ts:58-59`: send `startDate`/`endDate` (keep `todayStart/todayEnd` only
   if the proxy still maps them, or simplify the proxy to forward).

## Acceptance Criteria

- [ ] Role-permission settings load in direct mode.
- [ ] Screenshots tab shows only the selected day in direct mode.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
