# [AUDIT-030] Zod schema drift (secondary): nullable organization/invite fields, silent 1970 date coercion, issue-type casing, strict schemas, enum gaps

**Type**: Bug
**Priority**: P2
**Component**: web
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Further mismatches between `apps/web/core/types/schemas/**` and Gauzy entities, each with a
real but narrower trigger than AUDIT-029:

1. `organizationSchema.profile_link: z.string()`, `totalEmployees: z.number()` required
   (`organization/organization.schema.ts:41,43`) vs nullable columns
   (`ever-gauzy/.../organization/organization.entity.ts:76-85`); Teams creates organizations
   with `{currency, name, tenantId, invitesAllowed}` only → `getOrganizationById`
   (`use-current-organization.ts:35`) fails for Teams-created organizations.
2. `inviteSchema.roleId / invitedByUserId / actionDate / code` not nullable
   (`user/invite.schema.ts:216-234`); safe on list/me/validate (explicit `select`), but
   `PUT /invite/:id/REJECTED` returns the full entity → client-side throw after a successful
   reject.
3. Non-nullable `z.coerce.date()` on nullable columns: Zod 4 coerces `null` to `1970-01-01`
   silently (`employee.schema.ts:26-28,35-37` `endWork/startedWorkOn/valueDate/offerDate/acceptDate/rejectDate`;
   `organization-project.schema.ts:58-59` `startDate/endDate`).
4. `taskSchema.issueType: z.nativeEnum(EIssueType)` = `Bug/Task/Story/Epic`
   (`task/task.schema.ts:63`) vs Gauzy `TaskTypeEnum` lowercase incl. `memo`, column free
   text → a task written by the Gauzy UI/integrations fails the whole task list
   (UNVERIFIED which writers use lowercase in practice).
5. `.strict()` on entity schemas that Gauzy extends: `taskStatusSchema`, `roleSchema`
   (`role/role.schema.ts:384`), `rolePermissionSchema`, `tagSchema`/`tagTypeSchema`,
   `favoriteSchema`, `imageAssetSchema`, `userOrganizationSchema`, `organizationLanguageSchema`
   → any new Gauzy column breaks the read.
6. Enum gaps: `EBaseEntityEnum` lacks 11 Gauzy `BaseEntityEnum` members (favorites strict,
   `favorite/favorite.schema.ts:543,548-552`); `rolePermission.enabled` non-nullable vs
   `nullable: true, default: false` (`role-permission.entity.ts:29-30`);
   `ETimeLogSource.WEB_TIMER='WEB_TIMER'` vs Gauzy `'BROWSER'` (`types/generics/enums/timer.ts:10`,
   not sent today).

## Evidence

File:line above.

## Impact

Organization settings fail for self-registered tenants (1); reject invite shows an error (2);
wrong dates displayed as 1970 (3); task list failure in mixed-client tenants (4); fragility
on every Gauzy upgrade (5, 6).

## Expected Behavior

Schemas are nullable where Gauzy columns are nullable, use `.nullable()` dates (no silent
coercion), accept Gauzy's enum values (normalize casing in one place), and are not `.strict()`.

## Scope

1. Fix the listed fields; replace `z.coerce.date()` with a nullable date helper.
2. Replace `.strict()` with `.passthrough()`/default on entity schemas.
3. Normalize `issueType` casing on read.
4. Sync `EBaseEntityEnum`, `ETimeLogSource` with `@gauzy/contracts` values.

## Acceptance Criteria

- [ ] A self-registered organization loads in settings; rejecting an invite shows no error.
- [ ] No `1970-01-01` dates on profiles/projects.
- [ ] Works in both API modes (direct Gauzy + proxy).

## Dependencies

AUDIT-029.
