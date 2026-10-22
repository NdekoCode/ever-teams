# Prior-work branch inventory (NdekoCode forks, 2026-10-22)

Status of every `fix/*`, `feat/*` and `docs/*` branch of the two forks relative to `origin/develop`:
`MERGED` = branch tip is an ancestor of develop; `CONTENT-PRESENT` = not an ancestor but its full diff reverse-applies cleanly (same change landed by squash/upstream sync); `CONTENT-ABSENT` = its diff still applies forward (change missing from develop); `UNCLEAR` = neither applies cleanly (later edits touched the same lines; the Ever-Teams-relevant ones were checked by hand in AUDIT-REPORT.md §4).

| Repo | Branch | Subject | Status vs develop |
|---|---|---|---|
| ever-teams | docs/proxy-authorization-model | docs(web): wrap the API authorization paragraphs at 80 columns | MERGED |
| ever-teams | feat/daily-plan-task-order | refactor(web): move the plan rollback merge out of the drag handler | MERGED |
| ever-teams | feat/start-blocked-by-plan-tooltip | refactor(web): resolve the plan action labels before rendering | MERGED |
| ever-teams | feat/team-card-task-breakdown | refactor(web): drop the unused auth hook from the activity tabs hook | MERGED |
| ever-teams | feat/team-member-presence-heartbeat | fix(web): share input across windows and age heartbeats on the server clock | MERGED |
| ever-teams | feat/timesheet-reject-reason | fix(timesheet): keep the reject dialog open when the update fails, clear the reason on close | MERGED |
| ever-teams | feat/tracking-source-empty-state | refactor(web): share the member screenshots list and its empty state | MERGED |
| ever-teams | feat/weekly-report | fix(web): reject invalid or reversed dates in the weekly report route | MERGED |
| ever-teams | fix/406-error-handling | fix(web): release the shared stop request once Gauzy answers | MERGED |
| ever-teams | fix/60s-polling-inter-member | test(web): drop the mock of the removed timer polling hook | MERGED |
| ever-teams | fix/calendar-add-time-picks | refactor(web): build the optional Add Time picks outside the submit handler | MERGED |
| ever-teams | fix/chat-file-url-ssrf | refactor(web): split URL collection and replacement out of resolveFileUrls | MERGED |
| ever-teams | fix/chatgpt-initialize-forward-token | fix(chatgpt): forward the bearer token on initialize | MERGED |
| ever-teams | fix/chatgpt-mcp-notifications | fix(chatgpt): report unhealthy when the MCP health route answers 5xx | MERGED |
| ever-teams | fix/chatgpt-rate-limit-behind-proxy | fix(chatgpt): count /mcp rate limit on the caller address behind a proxy | MERGED |
| ever-teams | fix/compose-self-host-local-api | docs(readme): note the browser-host assumption of the compose API default | MERGED |
| ever-teams | fix/crypto-polyfill-one-call | fix(web): use Web Crypto in generateToken to drop the crypto polyfill | MERGED |
| ever-teams | fix/date-libs-lodash-overlap | fix(web): keep moment locales out of the Turbopack bundle | MERGED |
| ever-teams | fix/dead-next-config-entries | fix(web): drop dead entries from next.config package lists | MERGED |
| ever-teams | fix/dev-backend-latency | docs(web): show the local Gauzy API option in .env.sample | MERGED |
| ever-teams | fix/dev-cold-first-page | docs(web): explain the dev server cold start and the .next/dev cache | MERGED |
| ever-teams | fix/dev-core-module-blob | fix(web): import the offline Timer statically again | MERGED |
| ever-teams | fix/dev-memory-4-6gb | docs(web): describe the retained memory level and wrap the dev memory note | MERGED |
| ever-teams | fix/dev-react-icons-barrel | refactor(web): render IconsSearch directly in the timesheet search bar | MERGED |
| ever-teams | fix/double-token-refresh | fix(web): remove the unused second token refresh scheduler | MERGED |
| ever-teams | fix/emoji-mart-on-login | fix(web): load the input emoji picker and its dataset on first use | MERGED |
| ever-teams | fix/employee-members-proxy-route | fix(web): answer a real 401 on the employee members proxy route | MERGED |
| ever-teams | fix/gauzy-production-logging-pii | fix(web): stop logging the authenticated user on timer start | MERGED |
| ever-teams | fix/gauzy-tasks-team-unbounded | fix(web): load only list relations on the team task list | MERGED |
| ever-teams | fix/infra-env-doc-healthcheck-drift | fix(docker): add a web image healthcheck, sync .env.sample with code | MERGED |
| ever-teams | fix/invite-code-signin-cookies | fix(web): sign in after an invite code on the passcode screen | MERGED |
| ever-teams | fix/kanban-item-unmemoized | fix(web): count only a task's first entry per member in the worked-time index | MERGED |
| ever-teams | fix/livekit-ondemand-chunk | fix(web): preload the LiveKit chunk before the meeting room renders | MERGED |
| ever-teams | fix/livekit-unauthenticated-token | refactor(web): use an optional chain in the LiveKit session check | MERGED |
| ever-teams | fix/load-my-plans-on-demand | fix(web): refresh a first plan read that was running during a plan change | MERGED |
| ever-teams | fix/locale-json-all-bundled | fix(web): ship only the active locale's messages to the browser | MERGED |
| ever-teams | fix/mobile-active-task-route | refactor(mobile): name the active-task request body | MERGED |
| ever-teams | fix/mobile-signin-code-confirmed-twice | refactor(mobile): drop the redundant cast on the confirm reply | MERGED |
| ever-teams | fix/mobile-task-stats-body | fix(mobile): send task statistics filters in the request body | MERGED |
| ever-teams | fix/mobile-timer-status-local-day | fix(mobile): send the local day range with the timer status request | MERGED |
| ever-teams | fix/mobile-timer-team-id | fix(mobile): send the active team id when starting the timer | MERGED |
| ever-teams | fix/no-error-feedback-create | fix(web): return the created task when the list refresh after creation fails | MERGED |
| ever-teams | fix/no-network-loss-handling | fix(web): keep the enforce plan modal helper from returning a promise | MERGED |
| ever-teams | fix/no-pagination-tasks | fix(web): reload shifted task pages, keep later pages on rollback, no create form on a partial assign list | MERGED |
| ever-teams | fix/no-rate-limiting-passcode | fix(web): show a refused resend on the passcode screen and keep the wait across modal tabs | MERGED |
| ever-teams | fix/no-xlsx-export | refactor(web): share the export row measures and drop the unused startExport argument | MERGED |
| ever-teams | fix/not-found-duplicate-entry | fix(web): stop the not-found boundaries from shipping code twice | MERGED |
| ever-teams | fix/prod-payload-every-route | chore(perf): label the page weight as the scripts of the initial HTML | MERGED |
| ever-teams | fix/proxy-currency-favorite-routes-missing | fix(web): add the currency and favorite proxy routes | MERGED |
| ever-teams | fix/proxy-daily-plan-routes | Merge branch 'develop' into fix/proxy-daily-plan-routes | MERGED |
| ever-teams | fix/proxy-guard-status-on-outage | fix(web): proxy routes answer the guard status when Gauzy is down | MERGED |
| ever-teams | fix/proxy-metadata-query-params | fix(web): answer 400 for a malformed date on /api/timer/daily | MERGED |
| ever-teams | fix/proxy-organization-team-routes | fix(web): honor the team id and current org in team proxy routes | MERGED |
| ever-teams | fix/proxy-refresh-token-rejection | refactor(web): unwrap the refresh rejection with async/await | MERGED |
| ever-teams | fix/proxy-report-daily-projectids-format | refactor(web): read the daily report array filters in one loop | MERGED |
| ever-teams | fix/proxy-signin-workspace-route | fix(web): stop logging the invite sign-in tokens | MERGED |
| ever-teams | fix/proxy-timesheet-routes-missing | fix(web): refuse a non JSON body before the timesheet proxy reads it | MERGED |
| ever-teams | fix/proxy-timeslots-route-mismatch | fix(web): make time slot reads and deletes work in proxy mode | MERGED |
| ever-teams | fix/roles-list-inaccessible-managers | fix(web): type the team-assignable roles server request as a paginated list | MERGED |
| ever-teams | fix/server-cookie-reads | fix(web): keep requestCookies declared in the route helpers | MERGED |
| ever-teams | fix/stop-fails-silently-offline | fix(web): only roll a failed timer stop back to a running snapshot | MERGED |
| ever-teams | fix/task-statistics-filters-in-body | fix(web): only treat activeTask=true as the active task filter in the statistics route | MERGED |
| ever-teams | fix/task-update-proxy-response | fix(web): return the updated task from the task proxy route | MERGED |
| ever-teams | fix/taskcard-defeats-memo | refactor(web): mark ActiveTaskWorkedTime props as read-only | MERGED |
| ever-teams | fix/team-polling-invalidates-102-consumers | fix(web): reuse unchanged team members and sync member presence | MERGED |
| ever-teams | fix/team-type-save | fix(web): restore the team type of the team on screen and refetch after a failed save | MERGED |
| ever-teams | fix/timer-heartbeat-stale-status | fix(web): skip the sync status while a timer command is in flight | MERGED |
| ever-teams | fix/timer-orphan-tab-closed | refactor(web): compute the shell refresh interval once in InitState | MERGED |
| ever-teams | fix/timer-requireplan-server-enforcement | fix(web): keep the timer start key from stopping a cross-team timer | MERGED |
| ever-teams | fix/timer-start-explicit-task | fix(web): reject a malformed body on the timer start route | MERGED |
| ever-teams | fix/timer-start-stop-races | fix(web): release timer guards when the request lands, refuse a start for another task | MERGED |
| ever-teams | fix/timer-tick-rerender-storm | perf(web): take plan rows and the offline wrapper off the timer tick | MERGED |
| ever-teams | fix/timer-timeslot-duration-inflation | fix(timer): do not fail the proxy sync when only the status read fails | MERGED |
| ever-teams | fix/timer-today-duration-timezone | fix(web): build both day bounds from one clock read | MERGED |
| ever-teams | fix/timer-toggle-proxy-route | fix(web): serve the timer toggle proxy route at the path the client calls | MERGED |
| ever-teams | fix/timer-toggle-semantics | fix(web): stop chaining a stop call after the timer toggle | MERGED |
| ever-teams | fix/timesheet-approval-rbac-mismatch | fix(web): hide timesheet approve/reject without CAN_APPROVE_TIMESHEET | MERGED |
| ever-teams | fix/timesheet-calendar-navigation | refactor(web): use Number.isNaN in the timesheet calendar resync | MERGED |
| ever-teams | fix/timesheet-edit-log-local-time | fix(web): keep edited time log on its own day and local hours | MERGED |
| ever-teams | fix/toolkit-tracking-api-url | fix(toolkit): send tracking requests to the SDK API host by default | MERGED |
| ever-teams | fix/tsconfig-module-resolution | fix(web): resolve modules with the bundler strategy | MERGED |
| ever-teams | fix/turbopack-root-misdetected | refactor(web): import path through the node: scheme in next.config.js | MERGED |
| ever-teams | fix/userteamcard-unmemoized | fix(web): keep other progress bars off the timer and isolate outside-click errors | MERGED |
| ever-teams | fix/web-5s-polling-prefix-invalidation | fix(web): poll only the active team detail while a timer runs | MERGED |
| ever-teams | fix/web-activity-filter-discarded | fix(web): apply the member and team filter on time and activity | MERGED |
| ever-teams | fix/web-activity-querykey-missing-filters | fix(web): add report filters to the activity query keys | MERGED |
| ever-teams | fix/web-audit-password-email-flows | fix(web): page-level heading and retry-aware copy on the verify-email failure state | MERGED |
| ever-teams | fix/web-auth-secret-fallback | fix(web): treat a blank AUTH_SECRET as unset for next-auth and Ever ID | MERGED |
| ever-teams | fix/web-auto-refresh-broken | fix(web): retry a public team query that failed with no data after a stale window | MERGED |
| ever-teams | fix/web-auto-stop-silent | fix(web): show the auto-stop toast only after the stop request settles | MERGED |
| ever-teams | fix/web-circular-dependencies | fix(web): stop hooks importing the daily-plan component barrel | MERGED |
| ever-teams | fix/web-console-logs-token-metadata | fix(web): gate the remaining refresh traces behind dev mode | MERGED |
| ever-teams | fix/web-initstate-fanout-waterfall | fix(web): keep shared shell queries alive on scope transitions | MERGED |
| ever-teams | fix/web-manager-role-name-gating | fix(web): hide screenshot delete while the previous member's slots are still shown | MERGED |
| ever-teams | fix/web-manual-time-utc | refactor(web): move the skipped-time clearing out of the shift change handler | MERGED |
| ever-teams | fix/web-manual-timelog-invalidation-dead-namespace | fix(web): refresh time log views after adding manual time | MERGED |
| ever-teams | fix/web-missing-enabled-guards | fix(web): wait for tenant, org and team before task size/version reads | MERGED |
| ever-teams | fix/web-org-team-schema-nullable | fix(web): accept null team logo and profile_link in team schemas | MERGED |
| ever-teams | fix/web-placeholder-mock-ui | fix(web): hide the calendar page that only shows sample data | MERGED |
| ever-teams | fix/web-plan-date-range-filter | fix(web): make the plan date picker follow the tab on screen | MERGED |
| ever-teams | fix/web-plan-date-timezone-shift | refactor(timer): share the today and tomorrow plan lookup between the timer hooks | MERGED |
| ever-teams | fix/web-plan-status-views | fix(daily-plan): treat done, closed and cancelled tasks as finished | MERGED |
| ever-teams | fix/web-proxy-guard-200-on-auth-failure | refactor(web): unwrap the session check rejection without nesting promises | MERGED |
| ever-teams | fix/web-query-defaults-bypassed | fix(web): stop refetching every stale query on network reconnect | MERGED |
| ever-teams | fix/web-report-proxy-auth | fix(web): read the denial status and message from the same upstream body | MERGED |
| ever-teams | fix/web-reset-password-token-validation | fix(web): check the first token when the reset link repeats the parameter | MERGED |
| ever-teams | fix/web-sentry-unwired | fix(web): pass Sentry build options where SDK v10 reads them | MERGED |
| ever-teams | fix/web-setactivetask-side-effects | fix(web): keep the user assigned when the active task is set again | MERGED |
| ever-teams | fix/web-setactivetask-unassigns-same-task | fix(web): keep user on task when re-selecting the active task | UNCLEAR |
| ever-teams | fix/web-silent-error-states | refactor(web): replace the nested ternary in the timesheet content with plain conditions | MERGED |
| ever-teams | fix/web-statistics-omit-teamids | fix(web): check team management against the teams the counts request sends | MERGED |
| ever-teams | fix/web-statistics-tasks-querykey | fix(web): build the plan auto-assign task update from a fresh read | MERGED |
| ever-teams | fix/web-task-status-enum | fix(web): accept custom task statuses in the task schema | MERGED |
| ever-teams | fix/web-tasks-by-employee-cache | fix(web): remove the unused tasks-by-employee query path | UNCLEAR |
| ever-teams | fix/web-tasks-by-employee-team-filter | refactor(web): share the employee tasks query between task hooks | MERGED |
| ever-teams | fix/web-team-member-delete-zod | fix(web): reject the proxy auth refusal when removing a team member | MERGED |
| ever-teams | fix/web-timesheet-status-silent-fail | fix(web): stop swallowing timesheet status errors, fix calendar delete | MERGED |
| ever-teams | fix/web-tokens-non-httponly | fix(web): keep the SameSite and Secure defaults when a caller passes them as undefined | MERGED |
| ever-teams | fix/zod-services-on-login | fix(web): stop auth routes from pulling every client API service | MERGED |
| ever-gauzy | feat/daily-plan-task-order | fix(daily-plan): make the task order migration safe to retry | UNCLEAR |
| ever-gauzy | feat/team-member-presence-heartbeat | refactor(employee): build the presence migration statements from one column list | UNCLEAR |
| ever-gauzy | feat/timesheet-reject-reason | refactor(migrations): stop AddTimesheetReason from copying another migration | UNCLEAR |
| ever-gauzy | fix/accounting-chart-recurring-expenses | test(employee-statistics): the cash flow chart counts recurring expenses once | CONTENT-PRESENT |
| ever-gauzy | fix/activepieces-connection-integration-tenant | fix(activepieces): read a connection's key from the tenant row it was created with | CONTENT-PRESENT |
| ever-gauzy | fix/activepieces-mcp-servers-route | fix(activepieces): call the existing MCP server API routes | CONTENT-PRESENT |
| ever-gauzy | fix/activity-no-employee-identity | test(activity): pin whose activity each read answers, on both ORMs | UNCLEAR |
| ever-gauzy | fix/agent-keep-rotated-refresh-token | fix(agent): retry a request only once after a token refresh | CONTENT-PRESENT |
| ever-gauzy | fix/agent-queue-owner-check | fix(agent): keep queued jobs of a signed-out user local | CONTENT-PRESENT |
| ever-gauzy | fix/agent-queue-resume-after-login | fix(agent): resume upload queues when pooling starts again | CONTENT-PRESENT |
| ever-gauzy | fix/auth-refresh-retry-logout | fix(ui-core): replay waiting requests like the first one after a token refresh | CONTENT-PRESENT |
| ever-gauzy | fix/candidate-interview-criteria-tenant-scope | fix(candidates): return no interview criteria when there is no current tenant | CONTENT-PRESENT |
| ever-gauzy | fix/changelog-write-operator-only | fix(changelog): only the installation admin may change the changelog | CONTENT-PRESENT |
| ever-gauzy | fix/channel-changed-organization-scope | fix(channel): withhold an organization's channel from an organization-less subscriber | CONTENT-PRESENT |
| ever-gauzy | fix/channel-domain-list-org-scope | test(core): cover the organization scope of the channel domain lists | UNCLEAR |
| ever-gauzy | fix/channel-region-fallback-order | fix(channel-region): write the fallback region last when replacing a set | CONTENT-ABSENT |
| ever-gauzy | fix/channel-soft-delete-org-scope | test(core): assert the 404 status of the cross-organization channel refusals | UNCLEAR |
| ever-gauzy | fix/client-invite-accept-null-user | test(core): cover conditions-only reads with and without a user in context | UNCLEAR |
| ever-gauzy | fix/comment-update-mentions | test(comment): cover the mention sync of a comment update | CONTENT-PRESENT |
| ever-gauzy | fix/compose-worker-service | fix(docker): run the worker in the compose stacks | CONTENT-PRESENT |
| ever-gauzy | fix/daily-plan-bulk-task-removal | test(daily-plan): bulk task removal on a real SQLite database, both ORMs | CONTENT-PRESENT |
| ever-gauzy | fix/daily-plan-write-authorization | Merge remote-tracking branch 'origin/develop' into pr-10435 | UNCLEAR |
| ever-gauzy | fix/desktop-timer-redact-config-log | fix(desktop-lib): redact secrets in timer config log lines | CONTENT-PRESENT |
| ever-gauzy | fix/employee-recurring-expense-january | fix(recurring-expense-employee): show a January end month in the delete dialog | CONTENT-PRESENT |
| ever-gauzy | fix/employee-status-unrelated-update | fix(employee): await the membership update of a work status change | CONTENT-PRESENT |
| ever-gauzy | fix/employee-update-external-ids | test(employee): partial updates keep the Upwork and LinkedIn ids | CONTENT-PRESENT |
| ever-gauzy | fix/employee-working-org-membership | test(employee): the working routes check organization membership | CONTENT-PRESENT |
| ever-gauzy | fix/empty-db-type-dialect-helpers | fix(config): treat empty DB_TYPE as better-sqlite3 in dialect helpers | CONTENT-PRESENT |
| ever-gauzy | fix/equipment-sharing-update-approval-type | fix(equipment-sharing): keep request type and org when editing a sharing | CONTENT-PRESENT |
| ever-gauzy | fix/event-delivery-dead-reclaim | test(core): cover the dead-letter skip of claimDelivery and runOnce | CONTENT-PRESENT |
| ever-gauzy | fix/event-delivery-replay-redrive | test(core): cover a delivery replay under a settled outbox row | CONTENT-PRESENT |
| ever-gauzy | fix/expense-category-select-org-filter | fix(expenses): filter category picker by the selected organization | CONTENT-PRESENT |
| ever-gauzy | fix/export-foreign-email-history | fix(export): keep other tenants' sent emails out of the archive | CONTENT-PRESENT |
| ever-gauzy | fix/gauzy-addmanualtime-manager-aware | fix(time-log): run a manager's manual time for a member as that member | UNCLEAR |
| ever-gauzy | fix/gauzy-ai-request-config-per-request | fix(integration-ai): keep Gauzy AI keys per request | CONTENT-PRESENT |
| ever-gauzy | fix/gauzy-daily-plan-create-read-authz | Merge branch 'develop' into fix/gauzy-daily-plan-create-read-authz | CONTENT-PRESENT |
| ever-gauzy | fix/gauzy-daily-plan-duplicate-task-guard | Merge branch 'develop' into fix/gauzy-daily-plan-duplicate-task-guard | CONTENT-PRESENT |
| ever-gauzy | fix/gauzy-daily-plan-team-idor-read | test(daily-plan): cover who may read team plans | UNCLEAR |
| ever-gauzy | fix/gauzy-daily-plan-unique-constraint | fix(daily-plan): look a plan up by the day it is stored under | UNCLEAR |
| ever-gauzy | fix/gauzy-dailyplan-date-index | fix(daily-plan): index plan lookups by employee, team and day | MERGED |
| ever-gauzy | fix/gauzy-employee-members-orgwide | fix(employee): scope GET /employee/members to the caller's team | MERGED |
| ever-gauzy | fix/gauzy-findteamtasks-orwhere-bracket | fix(tasks): scope the project branch of team tasks to the tenant | CONTENT-PRESENT |
| ever-gauzy | fix/gauzy-managed-employee-edge-cases | fix(employee): scope a manager to the teams and projects they manage | UNCLEAR |
| ever-gauzy | fix/gauzy-manager-guard-unused | fix(core): drop barrel export of removed ManagerOrPermissionGuard | CONTENT-PRESENT |
| ever-gauzy | fix/gauzy-missing-composite-indexes | fix(time-tracking): add composite indexes on time_log and time_slot | MERGED |
| ever-gauzy | fix/gauzy-production-logging-pii | fix(core): stop logging time-log payloads and every permission check | MERGED |
| ever-gauzy | fix/gauzy-statistics-counts-residual-block | Merge branch 'develop' into fix/gauzy-statistics-counts-residual-block | UNCLEAR |
| ever-gauzy | fix/gauzy-task-manager-access | fix(tasks): only count teams of the task's organization when a manager deletes it | UNCLEAR |
| ever-gauzy | fix/gauzy-team-detail-n-plus-1 | refactor(statistic): pass only promises to Promise.all when resolving member scopes | UNCLEAR |
| ever-gauzy | fix/gauzy-unbounded-endpoints | fix(core): page with the values that were validated and bound the offset | UNCLEAR |
| ever-gauzy | fix/graphql-connection-null-page-args | test(core): cover null pagination arguments in buildConnection | CONTENT-PRESENT |
| ever-gauzy | fix/graphql-cursor-gone-row | fix(graphql): read an empty gone cursor as null on declared non-text fields | CONTENT-ABSENT |
| ever-gauzy | fix/graphql-time-log-conflicts-scope | test(time-log): build the resolver with develop's constructor arguments | CONTENT-PRESENT |
| ever-gauzy | fix/import-junction-rows | fix(import): count junction rows as linked since orIgnore hides duplicates | CONTENT-PRESENT |
| ever-gauzy | fix/import-stamp-importer-tenant | fix(import): stamp the importer's tenant on rows with no tenantId | CONTENT-PRESENT |
| ever-gauzy | fix/import-unique-lookup | fix(import): match unique rows on the whole key within the tenant | CONTENT-PRESENT |
| ever-gauzy | fix/invoice-pdf-dates | test(invoice): PDF header dates and documents without a due date or contact | CONTENT-PRESENT |
| ever-gauzy | fix/invoice-total-value-range-filter | test(invoice): the Total Value range filter reads its bounds as numbers | CONTENT-PRESENT |
| ever-gauzy | fix/issue-types-mikro-orm-tenant-scope | test(issue-type): cover the tenant scope of the MikroORM list | UNCLEAR |
| ever-gauzy | fix/jitsu-redact-entity-secrets | fix(jitsu-analytics): mask export-redacted columns in entity events | CONTENT-PRESENT |
| ever-gauzy | fix/local-storage-path-containment | test(file-storage): keep local provider keys inside the root folder | CONTENT-PRESENT |
| ever-gauzy | fix/make-com-token-refresh-settings | fix(make-com): keep integration settings when refreshing the token | CONTENT-PRESENT |
| ever-gauzy | fix/manual-time-covered-log | test(time-log): cover manual time over a whole multi-slot entry | CONTENT-PRESENT |
| ever-gauzy | fix/mcp-http-tool-call-handler | fix(mcp-server): call registered tool handler over HTTP and WebSocket | CONTENT-PRESENT |
| ever-gauzy | fix/mcp-per-session-auth | Merge remote-tracking branch 'origin/develop' into fix/mcp-per-session-auth | CONTENT-PRESENT |
| ever-gauzy | fix/mcp-refresh-token-rotation | fix(mcp): wait for a running refresh before logout revokes tokens | UNCLEAR |
| ever-gauzy | fix/mcp-session-minimatch | fix(mcp-server): use named minimatch import in session middleware | CONTENT-PRESENT |
| ever-gauzy | fix/mcp-tool-api-routes | fix(mcp-server): keep activity log reads within the API's 100-row page | CONTENT-PRESENT |
| ever-gauzy | fix/mcp-tool-args-html-escaped | Merge remote-tracking branch 'origin/develop' into fix/mcp-tool-args-html-escaped | UNCLEAR |
| ever-gauzy | fix/media-plugins-write-ownership | fix(plugins): ignore the sent uploader without CHANGE_SELECTED_EMPLOYEE | CONTENT-PRESENT |
| ever-gauzy | fix/members-statistics-slot-fanout | fix(statistics): count each time log once in members statistics | CONTENT-ABSENT |
| ever-gauzy | fix/mention-sync-all-authors | test(mention): keep a second mention in the edit that removes one | CONTENT-PRESENT |
| ever-gauzy | fix/mikro-orm-postgres-placeholders | test(core,plugins): cover ? placeholders for MikroORM raw statements on Postgres | CONTENT-PRESENT |
| ever-gauzy | fix/mikro-orm-task-statistics-rows | fix(core): read MikroORM task statistics rows on MySQL and SQLite | CONTENT-ABSENT |
| ever-gauzy | fix/mikro-orm-time-slots-screenshot-url | Merge origin/develop (9fa2bf6ed1) into fix/mikro-orm-time-slots-screenshot-url | CONTENT-PRESENT |
| ever-gauzy | fix/mikro-orm-update-find-operators | test(core): cover TypeORM operators in MikroORM update criteria | CONTENT-PRESENT |
| ever-gauzy | fix/mysql-check-constraint-probe | test(core): pin what the MySQL CHECK probe answers when the catalog fails | CONTENT-PRESENT |
| ever-gauzy | fix/org-policy-guard-mikro-orm | test(core): cover the organization policy guard's lookups on MikroORM | CONTENT-PRESENT |
| ever-gauzy | fix/payroll-item-deleted-on-add | test(payroll-run): adding a line keeps it on the run | UNCLEAR |
| ever-gauzy | fix/pipeline-update-stage-tenant | fix(pipeline): check stage tenant when updating a pipeline | CONTENT-PRESENT |
| ever-gauzy | fix/plugin-owner-guard-route-id | fix(plugin-registry): check owner of the plugin named in the route | CONTENT-PRESENT |
| ever-gauzy | fix/product-translation-tenant-check | fix(product): check stated tenant and bare-id parent on translation saves | CONTENT-PRESENT |
| ever-gauzy | fix/product-type-update-nested-tenant-check | fix(product-type): check nested rows for tenant when updating on TypeORM | CONTENT-PRESENT |
| ever-gauzy | fix/product-update-missing-delete-lists | fix(product): keep existing translations when an update omits them | CONTENT-PRESENT |
| ever-gauzy | fix/project-module-typeorm-lists | test(project-module): run the employee and team module lists on TypeORM | CONTENT-PRESENT |
| ever-gauzy | fix/public-team-task-member-fields | test(public-share): cover the public team task assignee fields | CONTENT-PRESENT |
| ever-gauzy | fix/refund-line-order-mismatch | fix(payment): refuse refund lines that belong to another order | CONTENT-PRESENT |
| ever-gauzy | fix/remove-from-all-teams-unassign-scope | test(organization-team): cover the per-team task unassign of Remove From All Teams | CONTENT-PRESENT |
| ever-gauzy | fix/roles-list-inaccessible-managers | docs(role): document the paginated shape of GET /roles/team-assignable | UNCLEAR |
| ever-gauzy | fix/shared-entity-read-permission | fix(shared-entity): apply the tracked-data setting and cover media recordings in share checks | CONTENT-PRESENT |
| ever-gauzy | fix/skill-by-name-tenant-scope | test(skills): the lookup by name answers only the caller's tenant | CONTENT-PRESENT |
| ever-gauzy | fix/social-signin-verified-email | fix(auth): sign in through the GitHub primary address only, and cover both strategies | UNCLEAR |
| ever-gauzy | fix/statistics-mikro-orm-soft-deleted-logs | test(statistics): MikroORM soft-deleted rows against a real SQLite store | UNCLEAR |
| ever-gauzy | fix/stock-count-bin-scope | fix(inventory): count a bin-scoped stock count against its bin | CONTENT-ABSENT |
| ever-gauzy | fix/stock-transfer-edit-status | fix(inventory): let a transfer canceled in transit correct its destination | CONTENT-PRESENT |
| ever-gauzy | fix/stock-transfer-ship-duplicate-lines | fix(inventory): sum repeated ship entries at the six decimals the line stores | CONTENT-PRESENT |
| ever-gauzy | fix/task-number-soft-deleted | test(tasks): the project-move spec expects the withDeleted flag | CONTENT-PRESENT |
| ever-gauzy | fix/task-project-move-number | fix(tasks): number a moved task in its target project in one save | UNCLEAR |
| ever-gauzy | fix/team-join-accept-existing-employee | fix(core): read only a 404 as "not on the team yet" when accepting a join request | CONTENT-PRESENT |
| ever-gauzy | fix/team-join-request-applicant-fields | fix(core): keep every name part when accepting a team join request | CONTENT-PRESENT |
| ever-gauzy | fix/team-join-request-manager-check | fix(teams): only team managers may accept or reject join requests | CONTENT-PRESENT |
| ever-gauzy | fix/team-join-request-tenant | test(organization-team-join-request): a public join request keeps the team's tenant | CONTENT-PRESENT |
| ever-gauzy | fix/team-join-request-tenant-2 | fix(teams): keep the team tenant and details on join requests | UNCLEAR |
| ever-gauzy | fix/team-manager-member-update | fix(organization-team-employee): write only the membership fields on a member update | CONTENT-PRESENT |
| ever-gauzy | fix/team-soft-delete-manager-check | fix(organization-team): bind team soft delete and restore to the checked team id | CONTENT-PRESENT |
| ever-gauzy | fix/team-tasks-mikro-orm-project-or | test(tasks): cover team tasks with a project on MikroORM | CONTENT-PRESENT |
| ever-gauzy | fix/time-log-delete-own-logs | test(time-log): cover whose logs deleteTimeLogs lets a non-picker delete | CONTENT-PRESENT |
| ever-gauzy | fix/time-log-delete-own-without-team | fix(core): let employees delete their own time logs without a team | CONTENT-ABSENT |
| ever-gauzy | fix/time-log-delete-slots | test(time-tracking): cover hard deletes and MikroORM in the deleted log's slot cleanup | CONTENT-PRESENT |
| ever-gauzy | fix/time-off-balance-mysql-remaining | test(time-off-balance): applyDelta assigns remaining before taken | CONTENT-PRESENT |
| ever-gauzy | fix/time-off-policy-employee-ids | docs(time-off-policy): document the employee id helper | CONTENT-ABSENT |
| ever-gauzy | fix/time-off-statistics-org-membership | test(security): membership checks on time off and statistics reads | CONTENT-PRESENT |
| ever-gauzy | fix/time-slot-merge-mikro-orm | test(time-slot): the MikroORM merge on a real SQLite database | UNCLEAR |
| ever-gauzy | fix/webhook-retry-claim-before-post | docs(webhook): name the refused claim in the skipped flag's description | CONTENT-PRESENT |
| ever-gauzy | fix/webhook-stream-org-scope | fix(graphql): withhold an organization's delivery event from an organization-less subscriber | CONTENT-PRESENT |
| ever-gauzy | fix/worker-token-cleanup-queue-gate | fix(worker): skip token cleanup processor when queueing is off | CONTENT-PRESENT |
| ever-gauzy | fix/zapier-oauth-callback-integration-tenant | fix(zapier): store Gauzy OAuth tokens without a user on the public token endpoints | UNCLEAR |
| ever-gauzy | fix/zapier-token-query-param | Merge branch 'develop' into fix/zapier-token-query-param | UNCLEAR |
