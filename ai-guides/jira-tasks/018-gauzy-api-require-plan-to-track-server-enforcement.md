# [AUDIT-018] `requirePlanToTrack` is enforced only in the browser; Gauzy `TimerService.startTimer` never checks the daily plan

**Type**: Incomplete feature
**Priority**: P2
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The team setting `requirePlanToTrack` ("blocking timer start without a plan") exists on the
Gauzy entity and is enforced by Ever Teams' timer policy, but Gauzy starts the timer
regardless. Any client (mobile, desktop, direct API call) and one web path bypass it.

## Evidence

- Gauzy: the only references are the entity/resolver
  (`ever-gauzy/packages/core/src/lib/organization-team/organization-team.entity.ts:132`,
  `organization-team.resolver.ts:62,480`); `grep -rn requirePlanToTrack packages/core/src/lib/time-tracking` → none;
  `time-tracking/timer/timer.service.ts:214-275` (`startTimer`) has no plan lookup.
- Web enforcement: `apps/web/core/lib/helpers/timer-policy.ts:117-150`,
  `apps/web/core/hooks/timer/use-start-stop-timer-handler.ts:114-156`, `use-timer-api.ts:332-335`.
- Web bypass: task-card start (`apps/web/core/hooks/tasks/use-timer-button.ts:42-95` →
  `startTimer(task)`) skips the ENFORCE_PLAN policy; the button is only disabled by
  `!canTrack` (`apps/web/core/components/tasks/task-card.tsx:431,450`), so a plan that exists
  but lacks the task still lets the timer start.

## Impact

The documented rule is advisory; managers cannot rely on it. Employee / Team Manager.

## Expected Behavior

When the task's team has `requirePlanToTrack=true`, `POST /timesheet/timer/start` is refused
(422/403 with a stable error code) unless a daily plan for today exists for the employee in
that team and contains the task (or the team allows planless start for tasks without a plan,
per the existing web policy). The web keeps its pre-check for UX and handles the server error.

## Scope

1. `TimerService.startTimer`: load the team (`organizationTeamId` from the DTO), and when
   `requirePlanToTrack` query `DailyPlan` for `employeeId`, `organizationTeamId`, today's day
   (use `storedPlanDay` from `daily-plan.service.ts:48-49` for the day boundary) with the
   task; throw a typed exception. Keep `CHANGE_SELECTED_EMPLOYEE`/admin start unaffected or
   configurable.
2. Web: route the task-card start through the same policy as the main timer
   (`use-timer-button.ts`), and map the new server error to the existing "plan required" modal.
3. Spec.

## Acceptance Criteria

- [ ] With the setting on, a direct `POST /timesheet/timer/start` without a plan is refused.
- [ ] Task-card start obeys the policy.
- [ ] Works in both API modes (direct Gauzy + proxy, `apps/web/app/api/timer/start`).

## Dependencies

None.
