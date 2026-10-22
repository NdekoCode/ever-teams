# [AUDIT-031] Shipped UI without logic: kanban card actions, XLSX export, placeholder member columns, disabled SMTP step

**Type**: Incomplete feature
**Priority**: P3
**Component**: web
**API mode affected**: n/a
**Status**: NOT_STARTED

## Problem

1. Kanban card menu renders four active actions (Change parent, Change relations, Set as
   next, Move to) whose `onClick` is an empty `// TODO` (`apps/web/core/components/pages/kanban/menu-kanban-card.tsx:116-148`).
2. Dashboard export dialog shows "Download XLSX" whose handler is
   `console.log('XLSX export not implemented yet')` (`apps/web/core/components/pages/dashboard/export-dialog.tsx:112-120`).
3. Members table hard-codes "-" for Position and derives Status only from `isActive`
   (`apps/web/core/components/teams/member-table.tsx:267-269,281-283`); invitation table
   likewise (`invite/invitation-table.tsx:77`).
4. Sign-up: tenant SMTP creation commented out (`apps/web/core/services/client/api/auth/register.service.ts:100-105`,
   `// TODO: This should be implemented from Gauzy`; Gauzy `POST /smtp` exists,
   `custom-smtp/custom-smtp.controller.ts:91`).

## Evidence

File:line above.

## Impact

Visible controls that do nothing erode trust; not blocking.

## Expected Behavior

Either implement the action or hide the control until it exists.

## Scope

1. Hide the four kanban actions (or implement "Move to" via `PUT /tasks/:id`).
2. Hide XLSX until implemented (CSV export exists).
3. Remove placeholder columns or bind them to real data (`employee.position`, presence).
4. Decide with the owner whether per-tenant SMTP belongs to sign-up; otherwise delete the
   commented code.

## Acceptance Criteria

- [ ] No visible control without a handler in kanban/dashboard/members pages.

## Dependencies

None.
