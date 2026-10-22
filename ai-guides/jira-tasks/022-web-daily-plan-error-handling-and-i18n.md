# [AUDIT-022] Daily plans (web): silent failures, unhandled rejections and hard-coded English in user-facing errors

**Type**: Bug
**Priority**: P3
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Several daily-plan mutations fail without feedback or with untranslated text:

- No `onError`: `apps/web/core/hooks/daily-plans/use-delete-daily-plan.ts:17-25` (callers
  `plan-header.tsx:244-253`, `user-profile-plans.tsx:337-351` log to console only),
  `use-update-daily-plan.ts:35-55,57-140`.
- Unhandled promise rejections: `apps/web/core/components/tasks/task-card.tsx:1032-1034,1055-1057`,
  `features/daily-plan/add-task-to-plan.tsx:63-75`, `enforce-planed-task-modal.tsx:54`.
- `console.log` only: `add-daily-plan-work-hours-modal.tsx:48-50`, `unplan-active-task-modal.tsx:62-64`,
  `active-task-handler-modal.tsx:751,774`.
- Hard-coded English toasts/labels: `use-create-daily-plan.ts:34-36,48-50`,
  `use-update-daily-plan.ts:105,112`, `use-employee-daily-plans.ts:124,128`,
  `add-task-to-plan.tsx:102-108,164,170,189-191`, `add-task-estimation-hours-modal.tsx:192,218,249,934,952,963,1141,1153,1163,1338,1352`,
  `plan-header.tsx:99,105`, `task-card.tsx:1064`, `suggest-daily-plan-modal.tsx:71`,
  `create-daily-plan-form-modal.tsx:203,300,302`.

## Evidence

File:line above.

## Impact

Users (Employee, Team Manager) do not learn that a plan write failed (e.g. the 403 of
AUDIT-017 or the 400 of AUDIT-019); non-English locales see English strings.

## Expected Behavior

Every mutation reports failure with a translated toast; no unhandled rejections.

## Scope

1. Add `onError` with `toast.error(t(...))` to the three hooks; await/catch the listed calls.
2. Move the strings to `apps/web/locales/*.json`.

## Acceptance Criteria

- [ ] Forcing a 4xx on create/update/delete/add-task/remove-task shows a translated error.
- [ ] No `console.log`-only failure paths remain in `features/daily-plan/**`.

## Dependencies

None.
