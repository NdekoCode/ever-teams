# [AUDIT-020] Daily plans (web): `plansIds` stripped by the wrong schema, module-level "tomorrow/yesterday" dates, dead estimate helper

**Type**: Bug
**Priority**: P3
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

1. `removeManyTaskFromPlans` validates its body with `dailyPlanTasksUpdateSchema`
   (`apps/web/core/services/client/api/daily-plans/daily-plan.service.ts:436-440`), which has
   no `plansIds` key (`apps/web/core/types/schemas/task/daily-plan.schema.ts:96-104`), so Zod
   strips the list and Gauzy always removes the task from every plan
   (`ever-gauzy/.../daily-plan.service.ts:789-790,861-870`). The dedicated
   `removeTaskFromManyPlansRequestSchema` (`:109-113`) is unused. Masked today because all
   callers mean "all plans".
2. `tomorrowDate`/`yesterdayDate` are module-load constants
   (`apps/web/core/lib/helpers/date-and-time.ts:173,175`) used as default/disabled calendar
   dates (`create-daily-plan-form-modal.tsx:61,273,275`, `add-task-to-plan.tsx:138`) → wrong
   after midnight in a long-lived tab; Gauzy accepts past dates.
3. `dailyPlanSubtraction` mixes seconds and hours
   (`apps/web/core/lib/helpers/daily-plan-estimated.ts:119-122`); its only consumer
   `DailyPlanCompareEstimatedModal` (which also calls `updateDailyPlan` without `employeeId`
   and without awaiting, `:51`) is not rendered anywhere.
4. Frontend `dailyPlanStatusSchema` is the task-status list (`daily-plan.schema.ts:9-25`)
   while Gauzy's enum is `open/in-progress/completed` (`packages/contracts/src/lib/daily-plan.model.ts:6-10`);
   every write sends `open`, no transition exists on either side.

## Evidence

File:line above.

## Impact

Latent contract bug (1), stale dates after midnight (2), dead/incorrect helper (3), misleading
schema (4). Employee.

## Expected Behavior

Request schemas match the Gauzy DTO; dates are computed at render time; dead code removed or
wired; status schema mirrors the Gauzy enum.

## Scope

1. Use `removeTaskFromManyPlansRequestSchema` in `removeManyTaskFromPlans`.
2. Replace the constants with functions (`getTomorrowDate()`), or `useMemo` per render.
3. Delete `DailyPlanCompareEstimatedModal` + `dailyPlanSubtraction`, or fix and use them.
4. Align `dailyPlanStatusSchema` with the Gauzy enum.

## Acceptance Criteria

- [ ] `plansIds` reaches Gauzy when provided.
- [ ] Opening the plan modal after midnight proposes the correct dates.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

None.
