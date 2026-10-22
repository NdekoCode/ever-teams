# [AUDIT-002] Proxy mode: task delete, project delete, kanban column reorder and task estimations return 404/405

**Type**: Bug
**Priority**: P0
**Component**: server-api
**API mode affected**: proxy
**Status**: NOT_STARTED

## Problem

Core write operations of the task/kanban scope have no proxy handler or no handler for the
HTTP method the client uses. In proxy mode they fail with Next.js 404/405 before reaching
Gauzy.

| Client call | Client file:line | Proxy route state |
|---|---|---|
| `DELETE /tasks/:id` | `apps/web/core/hooks/organizations/teams/use-team-tasks.ts:186` | `apps/web/app/api/tasks/[id]/route.ts` exports only `GET` (line 7) and `PUT` (line 28) → 405 |
| `DELETE /organization-projects/:id` | `apps/web/core/components/features/projects/delete-project-modal.tsx:30` | `apps/web/app/api/organization-projects/[id]/route.ts` exports only `PUT` (line 6) and `GET` (line 28) → 405 |
| `PATCH /task-statuses/reorder` | `apps/web/core/hooks/tasks/use-reorder-task-status.ts:24` | `apps/web/app/api/task-statuses/` contains only `[id]` and `route.ts` → 405/404 |
| `POST/PUT/DELETE /task-estimation[/:id]` | `apps/web/core/services/client/api/tasks/task-estimations.service.ts:22,47,69` | no `apps/web/app/api/task-estimation` directory → 404 |

## Evidence

- Route tree: `find apps/web/app/api -name route.ts` lists 135 handlers; none of the above.
- Gauzy has the endpoints: `ever-gauzy/packages/core/src/lib/tasks/task.controller.ts:434-435`
  (`DELETE /:id`), `organization-project/organization-project.controller.ts` (`DELETE /:id`),
  `tasks/statuses/status.controller.ts:59-61` (`PATCH /reorder`),
  `tasks/estimation/task-estimation.controller.ts`.
- No hook is gated on API mode, so the UI shows the actions and they fail at request time.

## Impact

Production blocker in proxy mode: tasks and projects cannot be deleted, kanban columns cannot
be reordered, task estimates cannot be saved. Affects Employee and Team Manager.

## Expected Behavior

Each client call has a handler for its method that forwards to Gauzy and returns Gauzy's
status and body.

## Scope

1. Add `DELETE` to `apps/web/app/api/tasks/[id]/route.ts` (reuse the unused
   `deleteTaskRequest` in `apps/web/core/services/server/requests/tasks.ts:124`).
2. Add `DELETE` to `apps/web/app/api/organization-projects/[id]/route.ts`.
3. Add `apps/web/app/api/task-statuses/reorder/route.ts` (PATCH), and the same for the
   sibling metadata controllers if the client reorders them.
4. Add `apps/web/app/api/task-estimation/route.ts` (POST) and `[id]/route.ts` (PUT, DELETE).
5. Add a route test per handler.

## Acceptance Criteria

- [ ] In proxy mode a task and a project can be deleted from the UI.
- [ ] Kanban column drag-and-drop persists in proxy mode.
- [ ] Task estimation add/edit/delete works in proxy mode.
- [ ] Works in both API modes (direct Gauzy + proxy).
- [ ] Route tests cover each new handler.

## Dependencies

AUDIT-001, AUDIT-003. No Gauzy change required.
