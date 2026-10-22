# [AUDIT-019] `removeTaskFromManyPlans` compares plan dates against the UTC date, so today's plan is skipped for users west of UTC

**Type**: Bug
**Priority**: P2
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Plans are stored at UTC midnight of the user's local day (`storedPlanDay`,
`daily-plan.service.ts:48-49`; web `apps/web/core/lib/helpers/daily-plan-day.ts:9-15`).
`removeTaskFromManyPlans` computes `currentDate = new Date().toISOString().split('T')[0]`
and keeps plans with `date >= currentDate`. For a user at UTC-5 after ~19:00 local, the UTC
date is already tomorrow, so today's plan is excluded: the task stays planned while the UI
toasts "Task removed from all plans", or the call fails with 400 "Daily plans not found".

## Evidence

- `ever-gauzy/packages/core/src/lib/tasks/daily-plan/daily-plan.service.ts:791` (`currentDate`),
  `:856` (`"date" >= :currentDate`), `:883-885` (400 when nothing matches).
- Web caller and toast: `apps/web/core/components/features/daily-plan/add-task-estimation-hours-modal.tsx:1338-1341`,
  `task-card.tsx:1051-1054`.

## Impact

Employee / Team Manager in western time zones: "remove from all plans" silently leaves the
task in today's plan.

## Expected Behavior

The cutoff uses the same day definition as plan creation (the caller's local day, or the plan
day computed by `storedPlanDay`), consistently across `getAllPlans` views and
`removeTaskFromManyPlans`.

## Scope

1. Accept an optional `date`/`timeZone` in `IDailyPlansTasksUpdateInput` (web already knows the
   local day) or derive the cutoff from the employee's time zone; use `storedPlanDay` for the
   comparison.
2. Audit `:814` (same pattern) and any other `toISOString().split('T')[0]` in the service.
3. Spec with a UTC-5 evening case.

## Acceptance Criteria

- [ ] At 20:00 America/New_York, removing a task from all plans removes it from today's plan.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
