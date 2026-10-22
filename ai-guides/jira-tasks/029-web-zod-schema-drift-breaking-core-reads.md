# [AUDIT-029] Zod response schemas drift from Gauzy entities and reject real responses (activity rows, null bill rates on task members, custom status names, team avatars)

**Type**: Bug
**Priority**: P1
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Response validation throws `ZodValidationError` on any mismatch (`apps/web/core/types/schemas/utils/validation.ts:30-41`;
every service rethrows, e.g. `team.service.ts:63-82`, and `zodStrictPaginationResponseValidate`
throws at `apps/web/core/lib/validation/zod-validators.ts:155-156`). Ever Teams uses Zod 4
(`apps/web/package.json`), where `.optional()` rejects `null`. Gauzy serializes with
`instanceToPlain` and sends `null` columns as `null`
(`ever-gauzy/packages/core/src/lib/core/interceptors/transform.interceptor.ts:38`). Four schemas
reject responses Gauzy produces in normal use. Verified statically (deterministic from the
code paths); not reproduced at runtime in this audit.

| # | Schema (web) | Gauzy | Effect |
|---|---|---|---|
| 1 | `activitySchema` (`apps/web/core/types/schemas/activities/activity.schema.ts`, `export const activitySchema`: requires `id` via the base schema, `description` key, `time: z.string()`) validates `GET /timesheet/activity` and `/activity/daily` (`apps/web/core/services/client/api/activities/activity.service.ts:43-46,111`) | Both endpoints return aggregated raw rows `sessions, duration, employeeId, [projectId], date, title` (`ever-gauzy/.../time-tracking/activity/activity.service.ts:55-61,154-160`, `getRawMany` at `:135,231`), never the entity | Task "Activity" tab and profile "Apps / Visited sites" always fail validation → empty views (the hook swallows the error, AUDIT-032) |
| 2 | `employeeSchema.billRateValue / minimumBillingRate / reWeeklyLimit: z.number().optional()` (`apps/web/core/types/schemas/organization/employee.schema.ts:31-34`); used for `taskSchema.members` (`task/task.schema.ts:18`) and `/tasks/team` is validated strictly (`task.service.ts:135-143`) | Columns `nullable: true` (`employee/employee.entity.ts:156-178`, `shared/pipes/billing-rate.transform.ts:18-24`), `ColumnNumericTransformerPipe.from(null)` → `null` (`column-numeric-transformer.pipe.ts:107-110`); Ever Teams sign-up creates employees without them (`apps/web/app/api/auth/register/route.ts:123-130`, `core/services/server/requests/o-auth.ts:70-73`) | Any task whose `members` include a Teams-created employee fails the whole team task list; hidden on demo data because `employee.seed.ts:53` fills the fields |
| 3 | `taskStatusSchema.name: taskStatusNameSchema` (enum) + `.strict()` (`apps/web/core/types/schemas/task/task-status.schema.ts:19-37`) | `TaskStatus.name` is free text (`tasks/statuses/status.entity.ts:21-26`); Teams' own form posts the typed name (`task-statuses-form.tsx:102-110`) | Creating a custom status ("QA") shows an error although it was created; `/task-statuses` and `/task-metadata/bootstrap` then fail for that team |
| 4 | `imageAssetSchema` `.strict()` with `thumb: z.string().optional()` (`apps/web/core/types/schemas/common/image-asset.schema.ts:14-30`) | Upload stores `thumb: null` when no thumbnail (`image-asset/image-asset.controller.ts:151`), column nullable (`image-asset.entity.ts:33-34`); `OrganizationTeam.image` is eager (`organization-team.entity.ts:162-168`) | After a team logo upload without thumbnail, `GET /organization-team` and `/:id` fail validation (`team.service.ts:63-67,237-241`) |

## Evidence

File:line above (schema, service call, Gauzy entity/query read for each row).

## Impact

Core reads (task list, team list, activity views, status settings) can fail for real data;
because consuming hooks sync only `data` into Jotai, the user sees empty screens with no
error (Employee, Team Manager, Admin).

## Expected Behavior

Schemas accept every value Gauzy can legitimately return (nullable where the column is
nullable, free text where the column is free text, raw-row schemas for aggregated endpoints,
no `.strict()` on entities that Gauzy extends).

## Scope

1. Add an `activityReportRowSchema` matching the raw rows and use it for the two activity
   endpoints; fix `use-task-activity.ts:45-49` to the correct type (drop `as any`).
2. Make the employee money fields `.nullable()`; audit `employeeSchema` for every nullable
   Gauzy column (`endWork`, `offerDate`, …; see AUDIT-030 for date coercion).
3. `taskStatusSchema.name: z.string()` (keep the enum for `value`/template matching); remove
   `.strict()`.
4. `imageAssetSchema.thumb/size/storageProvider/thumbUrl` `.nullable()`; remove `.strict()`.
5. Add contract tests that parse recorded Gauzy responses (fixtures captured from a
   Teams-created tenant, not seeds).

## Acceptance Criteria

- [ ] Task list renders when a member has null bill rate fields.
- [ ] Custom status creation shows no error and the list reloads.
- [ ] Team with uploaded logo (no thumbnail) loads.
- [ ] Task Activity tab and Apps/Sites views render data.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

AUDIT-030, AUDIT-032.
