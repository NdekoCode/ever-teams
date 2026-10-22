# [AUDIT-014] Team managers cannot approve/deny timesheets: `PUT /timesheet/status` requires `CAN_APPROVE_TIMESHEET`, which the EMPLOYEE role never holds

**Type**: Incomplete feature
**Priority**: P1
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

The documented timesheet validation workflow (manager approves/denies members' timesheets,
with the reject reason shipped in `feat/timesheet-reject-reason`) is only available to
ADMIN/SUPER_ADMIN. A team manager (role EMPLOYEE, `isManager=true`) gets 403; Ever Teams
hides the approve/deny controls for them, so the team-centric product has no validation path
at all for the role that is supposed to run it.

## Evidence

- Controller class guard: `ever-gauzy/packages/core/src/lib/time-tracking/timesheet/timesheet.controller.ts:13-15`
  (`@Permissions(PermissionsEnum.CAN_APPROVE_TIMESHEET)`).
- Permission holders: `role-permission/default-role-permissions.ts:109` (SUPER_ADMIN), `:564`
  (ADMIN); the EMPLOYEE block (`:938-1068`) does not contain it.
- Status handler has no manager logic:
  `time-tracking/timesheet/commands/handlers/timesheet-update-status.handler.ts:40-56`.
- Ever Teams gates the UI on that permission:
  `apps/web/core/components/pages/timesheet/selection-bar.tsx:87`,
  `apps/web/core/components/pages/timesheet/table-time-sheet.tsx:565-572`.
- Reject reason itself works end-to-end (`reject-selected-modal.tsx:50-54`,
  `update-timesheet-status.dto.ts:10-17`, `timesheet.entity.ts:104`).

## Impact

Team Manager: cannot validate the team's timesheets; the "Timesheets: manager validation
flow" item of the production scope is not usable. Employees' timesheets stay in
PENDING/IN REVIEW unless an organization admin intervenes.

## Expected Behavior

A team manager can approve/deny the timesheets of employees they manage (members of a team
they manage, `ManagedEmployeeService.canManageEmployees`), and only those; admins keep the
organization-wide permission. Do not grant `CAN_APPROVE_TIMESHEET` or
`CHANGE_SELECTED_EMPLOYEE` to EMPLOYEE.

## Scope

1. Change the route guard on `PUT /timesheet/status` to accept `CAN_APPROVE_TIMESHEET` OR a
   manager check: in `TimesheetUpdateStatusHandler` load the target timesheets, and when the
   caller lacks the permission require
   `ManagedEmployeeService.canManageEmployees(timesheets.map(t => t.employeeId))`; refuse
   approving one's own timesheet.
2. Expose the capability to the client: either return it from `/role-permissions/me` as a
   derived flag or let Ever Teams gate on `isTeamManager` for the current team (web change in
   `selection-bar.tsx:87`, `table-time-sheet.tsx:565-572`).
3. Spec for manager / non-manager / own timesheet.

## Acceptance Criteria

- [ ] Team manager approves and denies (with reason) a member's timesheet; 403 for a
      non-member's timesheet and for their own.
- [ ] Ever Teams shows the controls to team managers.
- [ ] Works in both API modes (direct Gauzy + proxy, `apps/web/app/api/timesheet/status`).

## Dependencies

Web follow-up for the UI gate (same task or AUDIT-015).
