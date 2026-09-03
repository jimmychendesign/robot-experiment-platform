# Session — 2026-08-31

## User Request

Add guidance above the object/background usage section telling requesters to confirm unavailable resources with the experiment administrator before submitting.

## Changes

- Added the requested guidance above the object and background resource configuration cards.
- Styled the guidance as a compact informational note using existing design tokens.
- Added the corresponding English translation for the language switcher.

## Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, including the production build and 2 rendered HTML tests.

## Follow-up — PRD-004 delivery confirmation lifecycle

### User Request

Update the “实验全生命周期管理总览” under PRD-004 Background without changing the diagram style, adding the newly supplied content.

### Changes

- Renamed stage ⑥ to “完成交付（新增待确认环节）”.
- Added Freddy Fu's “查看最终测试结果” action and “发起待确认 → 待确认” transition.
- Added Freddy Fu's “点击「完成测试」确认交付” action and the final “已完成” state.
- Updated the source-detail table and the successful review/delivery path to match the diagram.
- Updated the PRD metadata date and Registry date to 2026-08-31.

### Validation

- Confirmed the existing Mermaid structure and the first five lifecycle stages remain unchanged.
- Confirmed both new stage-⑥ source rows are represented in the diagram and detail table.
- Confirmed Markdown fences, table structure, local links, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.

## Follow-up — Pending-confirmation design implementation

### User Request

Update the current design from the latest PRD-004 changes, primarily the newly added “待确认” status.

### Analysis

- The detail Stepper, current owner, notification, and administrator completion operation already supported “待确认”.
- The aggregate Requirement Status still classified “待确认” as “已完成”, and the requester filter did not expose it independently.

### Changes

- Added “待确认” to the shared aggregate Requirement Status model and requester list filter.
- Updated the shared mapping so requester and administrator lists display the same pending-confirmation state.
- Retained stage ⑥ ownership by Freddy Fu, the administrator “测试完成” action, and the requester post-completion “确认已查看” action.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, including the production build and both rendered HTML tests.
- `git diff --check`: passed.
- `http://localhost:3000/`: returned HTTP 200.
- No release was created.

## Follow-up — PRD-004 request-detail operations and notifications

### User Request

Align requester and experiment-administrator operations in Requirement Detail with PRD-004 FR-001, and make the FR-009 workflow notifications visible in the current design.

### Analysis

- The archived PRD-001 does not contain FR-009; the active PRD-004 contains both the referenced FR-001 role flows and FR-009 notification matrix, so PRD-004 was used as the implementation source of truth.
- Existing experiment-creation failures incorrectly advanced into DEBUG, completion skipped the review/confirmation stages, and workflow notifications were only transient feedback.

### Changes

- Aligned workflow labels, current owners, requester tasks, and role-specific detail actions with FR-001.
- Kept experiment-creation failures in `待创建` with a retry action, and routed completed experiments through `待审核` and `待确认` before `已完成`.
- Added manager `测试完成` and requester `确认已查看` operations.
- Added a persistent Requirement notification timeline showing message, recipients, application delivery, optional Feishu-group delivery, and timestamps.
- Generated mock notifications from lifecycle transitions including submission, creation, validation, issue repair, execution, review, delivery, cancellation, and retest.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, including the production build and rendered HTML tests.
- `git diff --check`: passed.
- No release was created.

## Follow-up — System-level notification center

### User Request

Promote the Requirement notification capability to a system-level experience by adding a notification icon to the Header and showing the corresponding messages.

### Changes

- Added a Header notification entry across administrator, requester, and tester consoles.
- Added role-scoped notification aggregation across Requirements, an unread-count badge, individual read state, and “全部已读”.
- Added a keyboard-accessible notification panel with outside-click and Escape dismissal, reduced-motion handling, and a contextual screen-reader unread announcement.
- Added direct navigation from notifications to permitted requester or administrator Requirement details.
- Preserved the Requirement-level notification timeline and synchronized PRD-004, the feature inventory, permissions, project notes, and changelog.

### Validation

- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed, including the production build and both rendered HTML tests.
- `git diff --check`: passed.
- Clean local development-server restart completed; `http://localhost:3000/` returned HTTP 200 without a runtime error.
- No release was created.

## Follow-up — PRD-004 FR-001 pending-confirmation additions

### User Request

Update FR-001 from the latest five screenshots by adding only newly introduced content.

### Changes

- Added “待确认” to the “已完成” aggregate-status row.
- Added “待确认” and the final “已完成” rows to the detail Stepper.
- Added the requester pending-confirmation row and “确认已查看” recording action.
- Added the manager “测试完成” confirmation action and final completed row.
- Updated the supplied Stepper and manager-flow testing/review owners to “实验测试员”; retained Freddy Fu for rejected retest in the Stepper as shown.
- Kept the existing Edge Case content unchanged because the latest image does not add an edge case.

### Validation

- Confirmed every new pending-confirmation field from the screenshots is represented in FR-001.
- Confirmed existing FR-001 rows were preserved except where the latest screenshots explicitly changed status contents or owners.
- Confirmed Markdown table column counts and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.

## Follow-up — PRD-004 FR-003 resource confirmation and fields

### User Request

Update PRD-004 FR-003 from the supplied specification image.

### Changes

- Added the rule requiring offline confirmation with the experiment administrator when an object or background is missing from the resource library.
- Added the exact guidance copy displayed above the object/background selection area.
- Added optional `扩展字段` (`Object`, `Key:Value`) and required `通知推送` (`Object`, default fields) rows.
- Updated the edit-form acceptance criterion to require both new fields to be restored and editable.
- Added acceptance criteria for the resource guidance and the two new field definitions.

### Validation

- Confirmed the FR-003 field table matches the supplied image.
- Confirmed the guidance copy matches the supplied Chinese text.
- Confirmed Markdown tables, fences, links, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.

## Follow-up — PRD-004 Feature List descriptions and FR-009

### User Request

Update the PRD-004 Feature List with descriptions for all current capabilities and add a description for “流程流转与通知”.

### Changes

- Expanded the Feature List to three columns: FR ID, functional requirement, and description.
- Added descriptions for FR-001 through FR-008 based on their existing detailed requirements.
- Added FR-009 “流程流转与通知”.
- Defined lifecycle synchronization and notification events for submission, cancellation, Experiment creation, validation repair, schedule changes, retest, pending confirmation, and completed delivery.
- Added three FR-009 acceptance criteria and kept notification channel/template/retry/deduplication details as TBD.

### Validation

- Confirmed all nine Feature List entries map to a detailed FR section.
- Confirmed every FR-009 notification event maps to an existing PRD lifecycle or state transition.
- Confirmed Markdown table column counts, fences, links, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.

## Follow-up — PRD-004 FR-009 notification matrix

### User Request

Update PRD-004 FR-009 “流程流转与通知” from the supplied lifecycle notification table.

### Changes

- Replaced the preliminary event summary with the complete 18-row notification matrix.
- Recorded each lifecycle step's current status, current owner, bilingual role, trigger event, notification recipient, suggested message, and Feishu-group flag.
- Added template-variable rules for `{Requester}`, `{Requirement ID}`, and `{Issue}`.
- Clarified that “否” for Feishu-group delivery does not suppress direct notification when a notification recipient is defined.
- Replaced the preliminary acceptance criteria with verifiable checks for matrix routing, template rendering, no-notification rows, direct-only delivery, and completed-delivery notification.

### Validation

- Confirmed all rows in the supplied image are represented in the same top-to-bottom order.
- Confirmed every “是 / 否” Feishu-group value is retained.
- Confirmed Markdown table column counts, code fences, links, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.

## Follow-up — PRD-004 User Flow delivery confirmation

### User Request

Update PRD-004 section 4 User Flow from FR-001 by adding the missing administrator pending-confirmation step and the requester's post-completion “确认已查看” action.

### Changes

- Extended the Mermaid flow after all Annotations pass: `待确认 → 管理员点击「测试完成」→ 已完成 → 需求方点击「确认已查看」`.
- Added the administrator's Freddy Fu ownership and test-result confirmation behavior to the Flow Description.
- Added the requester's “确认已查看” action and clarified that it records delivery visibility without changing the completed Requirement state.
- Renumbered the existing cancellation row after the new completion-delivery steps.

### Validation

- Confirmed sections 4.1 and 4.2 now match the FR-001 pending-confirmation and requester acknowledgement rows.
- Confirmed the completion flow no longer skips directly from Annotation Passed to “已完成”.
- Confirmed Markdown table structure, Mermaid fence, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.

## Follow-up — PRD-004 requester list pending-confirmation status

### User Request

Update PRD-004 so the requester list distinguishes “待确认” from “已完成”, and visually highlight the modified PRD content.

### Changes

- Added “待确认” to the requester-list filter values in FR-001.
- Split the Requirement Status mapping into separate “待确认” and “已完成” rows.
- Defined administrator confirmation as the boundary that changes the requester-list status from “待确认” to “已完成”.
- Updated FR-001-AC-01 and added FR-001-AC-05 for the new mapping and transition.
- Added temporary HTML `<mark>` tags to the modified prose, mapping rows, and new acceptance-criteria heading for review visibility.

### Validation

- Confirmed “完成交付” remains one Stepper stage containing the internal statuses “待确认” and “已完成”.
- Confirmed the requester list does not display “已完成” before the administrator clicks “测试完成”.
- Confirmed Markdown table column counts, code fences, and whitespace checks pass.
- Application tests were not run because this was a documentation-only update.
