# [AUDIT-021] Daily plan `workTimePlanned` has no server-side validation (negative values accepted, no estimate check)

**Type**: Incomplete feature
**Priority**: P3
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The documented "planned work time: validation against estimates" exists only as informational
warnings in the web modal; Gauzy accepts any number.

## Evidence

- `ever-gauzy/packages/core/src/lib/tasks/daily-plan/dto/create-daily-plan.dto.ts:22-25`
  (`@IsNumber()` only).
- Web warnings only: `apps/web/core/components/features/daily-plan/add-task-estimation-hours-modal.tsx:287-325`;
  `plan-header.tsx:69-105`, `add-daily-plan-work-hours-modal.tsx:39-56`.

## Impact

Data integrity (negative or absurd planned hours), inconsistent behavior across clients. Low.

## Expected Behavior

`workTimePlanned` is `>= 0` and bounded (e.g. `<= 24`); optionally a warning/flag when the
sum of task estimates exceeds it (business rule to confirm with the owner, not enforced
silently).

## Scope

1. Add `@Min(0) @Max(24)` (or org-configurable) to the create/update DTOs.
2. Keep the web warnings; surface the 400 from Gauzy.

## Acceptance Criteria

- [ ] `PUT /daily-plan/:id` with `workTimePlanned: -1` → 400 in both API modes.

## Dependencies

None.
