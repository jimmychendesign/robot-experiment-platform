# Session — 2026-09-02

## User Request

1. Remove Tester staffing from Robot scheduling and remove Tester selection from Robot settings.
2. Replace Robot management with a four-column card grid, move selection-based bulk settings to a header-level global setting applied to every Robot, and add matching per-Robot schedule overrides while removing the extra unavailable-period editor.
3. Remove the large outer Robot Management container so the section header and cards sit directly on the page body.
4. Set the direct section gap in the manager Operations page to 40px.
5. Remove dialog callout copy and the repeated Robot online-status helper text.
6. Standardize detail section titles on Heading 3 and remove residual Tester content from active experiment details.
7. Remove configuration-source labels from Robot cards and move effective schedule times below every Robot name.
8. Add 8px top padding and a divider above the current-experiment row on every Robot card.
9. Remove the Daily Rules block from the Robot detail Current Information tab.
10. Rename Robot Global Settings to Batch Settings while retaining apply-to-all behavior.
11. Restore checkbox and select-all targeting so Robot batch modification applies only to selected Robots.
12. Increase the Robot card icon to span the two-line name/schedule block and align all Robot Header controls to the same 40px size.
13. Align the select-all and status-filter typography to the same Caption size and semibold weight.

## Confirmed Decisions

- Robot schedules depend only on Robot capacity, availability, blocked periods, and occupancy.
- Robot management does not display or edit default/backup Tester assignments.
- Tester management and Tester execution remain independent product areas.
- Robot global and per-Robot settings use the same daily work, downtime, and average-duration fields.
- Robot cards remain individually bounded, but the section-level Panel container is removed.
- Batch settings reset only the selected Robots; a Robot detail save overrides only that Robot.
- Online replaces Automatic as the editable healthy availability setting, while effective Running/Idle remains schedule-derived.

## Files Changed

- `app/page.tsx`
- `app/i18n.ts`
- `app/design-system/platform.css`
- `PROJECT.md`
- `docs/prd/active/PRD-005-experiment-manager.md`
- `docs/prd/shared/scheduling-contract.md`
- `docs/business-rules.md`
- `docs/user-flow.md`
- `docs/roles-permissions.md`
- `docs/feature-list.md`
- `docs/decisions.md`
- `docs/changelog.md`

## Follow-up — PRD-004 FR-009 cancellation notification

### User Request

Update PRD-004 FR-009 from the supplied notification matrix by adding the new cancellation event.

### Changes

- Added the nineteenth FR-009 event for Requirement status “已取消”.
- Defined the trigger as a successful status transition to “已取消”.
- Defined the notification recipient as the current owner captured immediately before cancellation.
- Added the confirmed message template and enabled Feishu-group delivery.
- Added FR-009-AC-08 for cancellation notification, record preservation, and group routing.
- Replaced cancellation-notification TBD language elsewhere in PRD-004 with references to FR-009; Experiment disposition and resource release remain TBD.
- Updated PRD metadata and Registry dates.

### Validation

- Confirmed FR-009 now contains 19 data rows.
- Confirmed the cancellation message uses `{Requirement ID}` and targets the pre-cancellation current owner.
- Confirmed Markdown table structure, code fences, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.
- `sessions/2026-09-02/*`

## Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, including the production build and 2 rendered-HTML tests.
- Browser verified that Robot management has no Tester table column, Robot schedule content contains no Tester, and Robot settings contain only one status select with no Tester controls.
- Browser verified that the independent Tester schedule remains visible and reported no console errors.
- `npm run typecheck`, `npm run lint`, and `npm test` passed; `npm test` included the production build and 2 rendered-HTML tests.
- Browser verified 10 rendered Robot cards in a four-column computed grid, the accessible global Settings dialog, global application to all 32 mock Robots, isolated per-Robot override, global reset of that override, Online status wording, and absence of the extra unavailable-period editor.
- Selection-based batch settings passed typecheck, lint, and the production build/tests. Browser validation confirmed the disabled initial action, one-Robot selection, selected-name dialog summary, selected-only capacity update (`15 / 16` → `8 / 8`), unchanged unselected capacity (`12 / 16`), and select-all across all 10 Robots in the current list.

## Open Questions

- Production ownership of Tester qualification and assignment remains TBD outside Robot management.

## Follow-up — Robot availability and schedule-effect analysis

### User Request

Review the Robot scheduling rules associated with the current PRDs and recommend a low-error design for manager-controlled shutdown/maintenance plus recurring daily schedulable hours, including when changes should take effect.

### Analysis

- Robot availability is governed primarily by PRD-005 and the shared scheduling contract; PRD-004 consumes the resulting schedule from the requester perspective.
- Separate recurring availability templates from one-off operational events. Daily working hours and recurring breaks define candidate slots; planned maintenance, emergency outage, and administrative pause are time-bound exceptions.
- Do not expose editable capacity as a source field. Derive legal slots from working intervals minus recurring breaks, one-off unavailable windows, occupied intervals, and experiment duration.
- Emergency shutdown should block new starts immediately. Running work must be preserved as an execution record and explicitly marked interrupted/exceptional if the physical Robot has stopped; it must not be silently moved.
- Planned maintenance should require a start and end time and take effect at that boundary. The default effective date for recurring daily-hours changes should be the next scheduling day, with same-day application treated as a high-impact exception.
- Saving should follow validate → impact preview → explicit confirmation → atomic constraint/version commit and reschedule → notification/audit. If recalculation fails, retain the last legal published schedule rather than exposing a partial result.
- Restoring a Robot online should immediately make future capacity available but should not automatically pull already-delayed work earlier; a separate explicit optimization/replanning action can prevent schedule oscillation.
- Status/incident controls and recurring schedule-template controls should use separate save actions and confirmations.

### Current Gaps Identified

- PRD-005 describes pause/maintenance as indefinite status overrides while its rescheduling table also references added shutdown periods; the product model does not yet define a structured, time-bounded maintenance event.
- The active prototype reassigns not-started experiments to a fallback Robot after pause/maintenance, conflicting with the fixed-Robot queue contract.
- The active prototype forces calculated capacity to at least 1, conflicting with the PRD edge rule that a zero-capacity configuration must remain zero/invalid rather than be coerced.
- The current settings drawer saves operational status and recurring daily time rules together without an impact preview.

### Validation

- Reviewed PRD-004, PRD-005, the shared scheduling contract, business rules, states, roles/permissions, and the active Robot settings/rescheduling implementation.
- No source code or formal confirmed requirement documents were changed in this analysis phase.

## Follow-up — PRD-004 Requirement lifecycle RBAC

### User Request

Add the supplied Role Definition, Role Responsibility, and Functional Permission content to PRD-004.

### Changes

- Added four new formal Requirement-lifecycle RBAC roles and retained Tester as an existing role.
- Added the supplied responsibilities and functional-permission matrix to PRD-004.
- Synchronized the canonical product-structure role inventory and the long-term roles-and-permissions document.
- Added an RBAC enforcement acceptance criterion.
- Preserved the supplied permission matrix exactly and documented three unresolved inconsistencies instead of silently changing authorization.

### Validation

- Confirmed all five role definitions, five responsibility rows, and sixteen functional-permission rows are present in PRD-004 and `docs/roles-permissions.md`.
- Confirmed PRD-004 keeps the required top-level section numbering and moves existing business rules to section 8.4.
- Application tests were not run because this was a documentation-only update.

## Follow-up — PRD-005 current-app alignment

### User Request

Update PRD-005 based on the current App.

### Changes

- Audited the current manager console across “运行与资源”“实验需求管理”“实验员管理”, Robot and Tester schedule/detail interactions, Requirement lifecycle operations, pending-confirmation delivery, and the application notification center.
- Reconciled PRD-005 Scope with `product-structure.md` and `feature-list.xlsx`; removed unrelated schedule-filter and assigned-Tester IDs from formal Scope and retained unregistered capabilities as pending assets.
- Added the implemented three-page information architecture, page-specific KPIs, selection-based Robot configuration, Requirement six-state list and six-stage detail behavior, final-delivery confirmation, and manager notification-center requirements.
- Added verifiable acceptance criteria for page-specific metrics, shared Requirement Status, pending confirmation, completion delivery, notification navigation, and mark-all-read behavior.
- Recorded prototype deviations for fallback-Robot reassignment, same-day scheduling, forced minimum capacity, missing time validation, label-only date navigation, legacy search behavior, pending-confirmation status inconsistency, and incomplete RBAC enforcement. These observations do not replace the confirmed target rules.
- Updated the PRD Registry and product documentation changelog.

### Validation

- Inspected the running local App in a browser and verified the three manager pages and main interactions used as the implementation baseline.
- Read the product structure and the complete feature workbook sheet before reconciling Scope.
- Documentation-only change; application source code was not modified.
