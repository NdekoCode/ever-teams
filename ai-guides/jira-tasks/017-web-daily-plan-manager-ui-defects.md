# [AUDIT-017] Daily plans: manager UI is partially wired (member picker dead, menu computed from the viewer's plans, plan actions shown to non-managers)

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Gauzy now accepts manager writes on daily plans (`daily-plan.service.ts:83-85,552-575,632-679`
via `ManagedEmployeeService.canManageEmployee`) and the payloads Ever Teams sends are
accepted. The UI around the manager flow is incomplete:

1. The "choose member" picker of `CreateDailyPlanFormModal` is dead: it needs the
   `chooseMember` prop (`apps/web/core/components/features/daily-plan/create-daily-plan-form-modal.tsx:161`)
   which neither renderer passes (`apps/web/core/components/tasks/task-card.tsx:868-874`,
   `apps/web/core/components/pages/kanban/menu-kanban-card.tsx:218-224`); kanban passes it to
   `PlanTask`, which ignores it (`task-card.tsx:883`).
2. On a teammate's profile, "Plan for today/tomorrow" and "Remove from all plans" visibility
   is computed from the viewer's own plans (`useMyDailyPlans()`, `task-card.tsx:699-711`)
   while the actions target `profile.member.employeeId` (`task-card.tsx:795,808,820,872`) →
   managers see the wrong menu.
3. `PlanTask` items are shown to any teammate on a member profile (`task-card.tsx:787-823`;
   only Remove is gated); non-managers get Gauzy 403 surfaced as a hard-coded English toast
   (`apps/web/core/hooks/daily-plans/use-create-daily-plan.ts:34`).

## Evidence

File:line above. Gauzy acceptance of manager payloads:
`ever-gauzy/packages/core/src/lib/employee/managed-employee.service.ts:222-285`.

## Impact

Team Manager: cannot create a plan for a member from the kanban/task card, sees incorrect
plan menu state on member profiles. Employee: sees actions that always fail.

## Expected Behavior

Managers can pick a member when planning from kanban/task cards; the plan menu on a member
profile reflects that member's plans; non-managers do not see plan actions for others.

## Scope

1. Pass `chooseMember` from the renderers (or drop the prop and derive from `isTeamManager`).
2. Use `useEmployeeDailyPlans(profile.member.employeeId)` for the menu state on member profiles.
3. Gate `PlanTask` items on `isTeamManager || isOwnProfile`.

## Acceptance Criteria

- [ ] Manager plans a task for a member from the kanban card; the member's plan shows it.
- [ ] Member profile menu matches the member's plans.
- [ ] Non-manager never sees plan actions for another member.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

AUDIT-016 (2).
