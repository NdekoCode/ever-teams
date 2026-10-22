# [AUDIT-027] Timesheet approve / deny / delete actions fail silently and the reject modal resets its submitting state before the request settles

**Type**: Bug
**Priority**: P3
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

- Approve from the table: `.catch(console.error)` without user feedback
  (`apps/web/core/components/pages/timesheet/table-time-sheet.tsx:149`).
- Selection bar approve/delete: same (`selection-bar.tsx:103-104,115-116`).
- Reject modal: `setIsSubmitting(false)` runs synchronously before the mutation settles and
  the catch swallows the error (`reject-selected-modal.tsx:46-62`).
- `getTaskTimesheet` returns `[]` on any error (`apps/web/core/hooks/timesheet/use-timesheet-query.ts:179-182`),
  so a 403 (team manager without `CAN_APPROVE_TIMESHEET`, AUDIT-014) or a Zod failure renders
  as "no entries".

## Evidence

File:line above.

## Impact

Managers believe an approval/denial happened when it did not; empty lists hide API errors.

## Expected Behavior

Each action awaits the mutation, shows a translated success/error toast, and the modal stays
in the submitting state until the request settles; query errors are surfaced by the page's
error state instead of an empty list.

## Scope

1. Use the mutation's `onSuccess`/`onError` and `isPending` in the three components.
2. Let `useQuery` keep its error (remove the `[]` fallback) and render the error state.

## Acceptance Criteria

- [ ] A failing approve shows an error toast; a successful one shows success and refreshes.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

AUDIT-014.
