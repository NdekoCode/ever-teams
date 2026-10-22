# [AUDIT-035] MikroORM task statistics read `.rows` of a raw knex result (MySQL/SQLite return arrays) — unmerged fix branch

**Type**: Bug
**Priority**: P4
**Component**: gauzy-api
**API mode affected**: both
**Status**: NOT_STARTED

## Problem

Under `DB_ORM=mikro-orm` with MySQL or SQLite, `StatisticService.getTasks` reads
`(await knex.raw(...)).rows`, which is PostgreSQL-only. A fix exists on the Gauzy fork branch
`fix/mikro-orm-task-statistics-rows` ("read MikroORM task statistics rows on MySQL and
SQLite", adds `readKnexRawRows`) but is absent from `develop`.

## Evidence

- `git diff $(git merge-base origin/develop origin/fix/mikro-orm-task-statistics-rows) origin/fix/mikro-orm-task-statistics-rows`
  (1 file, +25/-2 in `packages/core/src/lib/time-tracking/statistic/statistic.service.ts`).
- Production for Ever Teams runs TypeORM + PostgreSQL (`docker-compose.yml` api service), so this
  does not affect the default deployment.

## Impact

Non-default ORM/DB combinations only.

## Expected Behavior

Raw rows read per driver.

## Scope

Rebase and merge the branch.

## Acceptance Criteria

- [ ] Spec passes for postgres/mysql/sqlite result shapes.

## Dependencies

None.
