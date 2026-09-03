# Product Documentation Changelog

## 2026-09-03 — PRD-004 FR-001 role-specific lifecycle actions

- Change: Updated FR-001 with the supplied Requirement aggregate-status layout, role-bearing Stepper, requester actions, and separate action matrices for Experiment Requirement Manager, Experiment Requirement Verifier, and Requirements Validation Engineer. Added acceptance criteria for each role-specific CTA and retained unresolved permission conflicts explicitly instead of silently reconciling them.
- Reason: Make Requirement detail ownership and available actions clear for each lifecycle role while preserving the confirmed pending-confirmation delivery gate.
- Affected modules: PRD-004 FR-001, Requirement Status, Requirement Detail Stepper, Role-specific Requirement Actions, Acceptance Criteria, Permission Consistency.
- Related version: Documentation-only; no product release.

## 2026-09-02 — PRD-005 current-app alignment

- Change: Reconciled PRD-005 with the current three-page manager console, Robot and Tester schedule views, selection-based Robot configuration, Requirement processing and delivery confirmation, and the role-scoped application notification center. Updated formal Scope to the feature IDs confirmed by the product structure and feature workbook, added six-state Requirement mapping and acceptance criteria, and recorded current prototype deviations without converting them into approved behavior.
- Reason: Keep the manager PRD consistent with the implemented product surface while preserving fixed-Robot, T+1, capacity-validation, delivery-confirmation, and RBAC requirements as the authoritative target behavior.
- Affected modules: PRD-005 Overview, Scope, User Flow, Functional Requirements, Acceptance Criteria, States & Rules, Edge Cases, PRD Registry.
- Related version: Documentation-only; no product release.

## 2026-09-02 — PRD-004 Requirement lifecycle RBAC roles

- Change: Added the supplied Role Definition, Role Responsibility, and Functional Permission matrices to PRD-004; registered four new Requirement-lifecycle RBAC roles in the product structure and synchronized the long-term roles-and-permissions document. Preserved the supplied permission values and explicitly recorded three inconsistencies requiring confirmation.
- Reason: Define the new FR-009 actors as formal roles and make their lifecycle responsibilities and functional authorization boundaries reviewable.
- Affected modules: PRD-004 States & Rules, Requirement Lifecycle RBAC, Product Structure, Roles and Permissions, Acceptance Criteria.
- Related version: Documentation-only; no product release.

## 2026-09-02 — PRD-004 FR-009 cancellation notification

- Change: Added the “已取消” lifecycle-notification event to FR-009, notifying the pre-cancellation current owner and the Feishu group with the confirmed cancellation template. Added cancellation-notification acceptance criteria and removed obsolete cancellation-notification TBD wording while retaining Experiment-disposition and resource-release TBDs.
- Reason: Complete the FR-009 matrix with the newly supplied cancellation event and eliminate internal contradictions.
- Affected modules: PRD-004 FR-009, Requirement Cancellation, Notification Routing, Acceptance Criteria, Edge Cases.
- Related version: Documentation-only; no product release.

## 2026-09-01 — PRD-004 FR-009 execution roles and delivery owners

- Change: Added the `Tester 实验员` role to all test-execution and result-review notification rows, and updated the pending-confirmation owner and role to `Freddy Fu / Niko Ni / Felix Yuan` and `Experiment Requirement Verifier 实验需求验证员`. Synchronized the delivery notification acceptance criterion.
- Reason: Complete the role and ownership information supplied in the latest FR-009 notification matrix.
- Affected modules: PRD-004 FR-009, Test Execution Notifications, Result Review Notifications, Completion Delivery Notifications.
- Related version: Documentation-only; no product release.

## 2026-09-01 — PRD-004 FR-009 repair-completion triggers

- Change: Replaced the generic Policy and DEBUG completion/API-success triggers in FR-009 with the explicit user actions “点击「Policy修复完成」” and “点击「Debug完成」”, and added acceptance criteria for the resulting Experiment update, pending-revalidation state, and direct notification.
- Reason: Make lifecycle notifications fire from the confirmed responsible-person CTA rather than an ambiguous backend event.
- Affected modules: PRD-004 FR-009, Validation Repair Flow, Notification Triggers, Acceptance Criteria.
- Related version: Documentation-only; no product release.

## 2026-09-01 — PRD-004 pending-confirmation lifecycle correction

- Change: Corrected the lifecycle overview so review approval enters “待确认”, Freddy Fu reviews the final test result while the Requirement remains pending confirmation, and only “测试完成” changes it to “已完成”. Synchronized the source comparison table, flow-path summary, FR-001 Stepper, section 8 state definitions, and the referenced shared Stepper and Requirement Status contract; removed residual old status terms from PRD-004.
- Reason: Remove the premature completed state and keep the entire PRD consistent with the confirmed delivery gate.
- Affected modules: PRD-004 Background Lifecycle, Requirement Status, Completion Delivery, States & Rules, Shared Scheduling Contract.
- Related version: Documentation-only; no product release.

## 2026-08-31 — PRD-004 requester list pending-confirmation status

- Change: Split the requester-list aggregate status “待确认” from “已完成” in FR-001, added the corresponding list filter and acceptance criteria, and implemented the same shared mapping in requester and administrator lists. Review-visible PRD changes are temporarily marked with HTML `<mark>` highlighting.
- Reason: Prevent the requester list from presenting a Requirement as completed before the experiment requirement administrator confirms delivery.
- Affected modules: PRD-004 Requirement Status Mapping, Requester List Filters, Completion Delivery, Acceptance Criteria.
- Related version: Current development; no product release.

## 2026-08-31 — System-level Requirement notification center

- Change: Added a global Header notification entry for every role, including role-scoped lifecycle messages, unread counts, per-message and mark-all-read behavior, and direct access to permitted Requirement details while retaining the per-Requirement timeline.
- Reason: Promote FR-009 workflow feedback from a detail-only record into a system-level message center that remains visible throughout the product.
- Affected modules: Command Header, Application Notifications, Requester Requirement Detail, Administrator Requirement Detail, Role Permissions.
- Related version: Current development; no release created.

## 2026-08-31 — PRD-004 detail actions and visible notification history

- Change: Aligned requester and administrator Requirement Detail operations with PRD-004 FR-001, added the pending-confirmation delivery actions, and surfaced FR-009 lifecycle notifications as persistent detail history with recipients and application/Feishu channel indicators.
- Reason: Make each role's available operation match the confirmed lifecycle and preserve workflow feedback beyond transient toast messages.
- Affected modules: Requester Requirement Detail, Administrator Requirement Detail, Requirement Lifecycle, Application Notifications, Feishu Notification Presentation.
- Related version: Current development; no release created.

## 2026-08-31 — PRD-004 User Flow delivery confirmation completion

- Change: Extended PRD-004 User Flow sections 4.1 and 4.2 with the administrator's pending-confirmation action and the requester's post-completion “确认已查看” action; clarified that the latter only records delivery-result visibility and keeps the Requirement in “已完成”.
- Reason: Keep the high-level requester flow consistent with the confirmed FR-001 completion-delivery workflow.
- Affected modules: PRD-004 User Flow, Completion Delivery, Administrator Confirmation, Requester Delivery Acknowledgement.
- Related version: Documentation-only; no product release.

## 2026-08-31 — PRD-004 Feature List descriptions and FR-009

- Change: Added descriptions to every PRD-004 Feature List row and introduced FR-009 “流程流转与通知”; subsequently expanded FR-009 into the confirmed 18-row lifecycle notification matrix covering current owner, role, trigger, notification recipient, message template, and Feishu-group routing, with matching acceptance criteria.
- Reason: Make the Feature List self-explanatory and formally define the newly supplied workflow-transition and notification capability.
- Affected modules: PRD-004 Feature List, Requirement Lifecycle, Notifications, Acceptance Criteria.
- Related version: Documentation-only; no product release.

## 2026-08-31 — PRD-004 FR-003 resource confirmation and fields

- Change: Added the offline confirmation rule and fixed guidance copy for objects/backgrounds missing from the resource library; added the optional Key:Value extension object and required notification object with default fields to FR-003.
- Reason: Align the requester configuration and validation requirement with the latest supplied FR-003 specification.
- Affected modules: Requester Requirement Form, Object/Background Selection, Extended Fields, Notification Push.
- Related version: Documentation-only; no product release.

## 2026-08-31 — PRD-004 FR-001 pending-confirmation additions

- Change: Added the new “待确认” completion status to FR-001's aggregate mapping, detail Stepper, requester flow, and manager flow; added requester “确认已查看” behavior and updated the supplied testing/review owner labels to “实验测试员”.
- Reason: Bring FR-001 in line with the latest complete source screenshots while preserving the existing content and adding only the newly introduced requirements.
- Affected modules: Requirement Overview, Requirement Detail Stepper, Requester Workflow, Manager Workflow, Completion Delivery.
- Related version: Documentation-only; no product release.

## 2026-08-31 — PRD-004 delivery confirmation lifecycle

- Change: Extended the Background lifecycle overview's sixth stage with the new pending-confirmation handoff: Freddy Fu reviews the final test result, initiates pending confirmation, then clicks “完成测试” to confirm delivery and return the requirement to “已完成”.
- Reason: Align the maintained PRD lifecycle diagram and source-detail table with the newly supplied delivery-confirmation flow.
- Affected modules: PRD-004 Background, Completion Delivery, Requirement Confirmation.
- Related version: Documentation-only; no product release.

## 2026-08-28 — Portable release v0.3.0

- Change: Published the current interactive prototype as a portable browser build with requester edit/delete/cancel behavior and the complete manager creation, validation, issue-routing, repair, and re-validation workflow.
- Reason: Create a verified, shareable snapshot of the implemented PRD-004 FR-001 state-aware operations without overwriting release history.
- Affected modules: Portable Release, Requester Requirement Detail, Manager Requirement Detail, Validation and Repair Workflow, Requirement Cancellation.
- Related version: v0.3.0.

## 2026-08-28 — PRD-004 requester User Flow lifecycle completion

- Change: Extended PRD-004 sections 4.1 and 4.2 after “查看测试与执行进度” to cover validation, Policy/JSON repair, re-validation, pending/running experiments, Annotation review, retest, completion, and cancellation visibility.
- Reason: Align the requester User Flow with the complete FR-001 lifecycle instead of ending after request creation and scheduling.
- Affected modules: Requester User Flow, Requirement Detail, Validation, Test Execution, Result Review.
- Related version: Documentation-only; no product release.

## 2026-08-28 — PRD-004 FR-001 complete workflow specification

- Change: Replaced the abbreviated FR-001 content with the complete supplied specification: Requirement aggregate statuses, detail Stepper ownership and transitions, requester CTA matrix, manager CTA matrix, Experiment/Annotation-derived status conditions, and FR-specific edge cases.
- Reason: Preserve the complete top-to-bottom FR-001 source content in the active requester PRD without omitting role, CTA, transition, or condition details.
- Affected modules: Requester Requirement List, Requirement Detail, Requirement Lifecycle, Manager Workflow, Result Review.
- Related version: Documentation-only; no product release.

## 2026-08-28 — PRD-004 experiment lifecycle overview corrected to source

- Change: Replaced the normalized PRD-004 lifecycle summary with a source-faithful transcription of all six stages, named owners, operation/judgment nodes, status nodes, Policy/JSON branches, validation loops, review-rejection retest loop, and legend from the supplied reference image.
- Reason: The lifecycle overview must retain every piece of information in the reference instead of replacing personal ownership or source status terms with generalized project terminology.
- Affected modules: Requester PRD, Requirement Lifecycle, Experiment Validation, Test Execution, Result Review.
- Related version: Documentation-only; no product release.

## 2026-08-26 — Portable release v0.2.0

- Change: Published the current interactive prototype as a portable browser build with the unified six-stage Requirement workflow, shared four-state Requirement Status mapping, Excel batch request intake, and the latest shared Stepper refinements.
- Reason: Create a new verified, shareable snapshot of the implemented requester and manager workflow changes without overwriting release history.
- Affected modules: Portable Release, Requester Console, Manager Request Queue, Requirement Detail, Excel Request Intake.
- Related version: v0.2.0.

## 2026-08-26 — Reissued requester, manager, and Tester PRDs

- Change: Archived PRD-001 through PRD-003 as superseded and created PRD-004 through PRD-006 as their active successors; expanded the shared scheduling contract with the common allocation and recalculation rules.
- Reason: Fulfill the explicit request to archive the current role PRDs and output a new connected set without losing history.
- Affected modules: PRD Registry, Requester PRD, Experiment Manager PRD, Tester PRD, Shared Scheduling Contract.
- Related version: Documentation-only; no product release.

## 2026-08-26 — Excel batch request creation

- Change: Added an “Excel 导入” entry beside manual request submission, a template download, `.xlsx` upload/drag-and-drop, atomic validation, and batch creation as Pending Requirements using the current form schema.
- Reason: Support efficient multi-request entry while preserving the same data structure and downstream workflow as manual submission.
- Affected modules: Requester Request Intake, Excel Template, Request Validation, Request Combination Data.
- Related version: Current development; no release created.

## 2026-08-26 — Cross-role Requirement Status consistency

- Change: 管理员“实验需求队列”改为与需求方“我的需求”共用同一个 Requirement Status 映射；状态列仅显示待处理、处理中、测试中、已完成，优先级筛选保持不变。
- Reason: 保证同一 Requirement 在不同角色列表中呈现一致的宏观进度，并与详情 Stage / Status、单个 Experiment Status 分层。
- Affected modules: Manager Request Queue, Requester Request List, Requirement Status Mapping, Manager Metrics.
- Related version: Current development; no release created.

## 2026-08-26 — Requester list Requirement Status projection

- Change: “我的需求”状态列与顶部筛选统一为“待处理、处理中、测试中、已完成”，并从 Requirement 当前内部 Stage / Status 自动派生；列表不再暴露内部执行状态或复制单个 Experiment 状态。
- Reason: 为需求方提供整个 Requirement 的宏观进度，同时保留详情页的细粒度 Stage + Status。
- Affected modules: Requester Request List, Status Filters, Requirement State Mapping, Request Details Contract.
- Related version: Current development; no release created.

## 2026-08-26 — Temporary direct request confirmation

- Change: After experiments are created and linked, Request Validation now shows “待验证” with a single “确认需求” action. Clicking it directly advances the Stepper to “测试执行 / 待测试”; no separate validation form or validation workflow is implemented yet.
- Reason: Preserve the six-stage workflow while the detailed Request Validation capability remains out of current scope.
- Affected modules: Manager Request Drawer, Request Validation Stage, Shared Scheduling Contract.
- Related version: Current development; no release created.

## 2026-08-26 — Request-detail Stage/Status Stepper

- Change: Replaced the mixed five-node request progress labels with six fixed Stages and an explicit Status-to-Stage mapping. The active Stage shows its current Status; completed and pending stages retain the existing visual behavior. DEBUG, re-export, and re-validation remain inside Request Validation.
- Reason: Separate durable workflow stages from transient processing statuses without changing the request-detail page structure or other interactions.
- Affected modules: Request Details, Request Workflow States, Requester and Manager PRDs.
- Related version: Current development; no release created.

## 2026-08-24 — Schedule-derived Robot operational status

- Change: Limited administrator Robot status controls to “Automatic (based on schedule)”, “Paused”, and “Maintenance”. Running and idle are now system-derived from the current schedule, and automatic mode clears the manual override.
- Reason: Prevent administrators from manually asserting operational states that should reflect scheduling facts while preserving a clear recovery path from paused or maintenance.
- Affected modules: Robot Management, Scheduling, States, Roles and Permissions.
- Related version: Current development; no release created.

## 2026-08-24 — Create-and-link action label

- Change: Renamed the manager action from “创建实验” to “关联创建实验”.
- Reason: Make the button label explicitly communicate that experiment creation also establishes the source-request association.
- Affected modules: Manager Request Drawer, Request Processing Copy.
- Related version: Current development; no release created.

## 2026-08-24 — Unified fixed drawer action footer

- Change: Standardized actionable drawers on a fixed bottom footer with an independently scrolling body. Request editing/processing, Robot saving, and Tester assignment actions now use the shared footer; read-only drawers omit it.
- Reason: Keep the next available action visible regardless of drawer content length and remove scattered action placement from detail content.
- Affected modules: Shared Drawer, Request Details, Manager Request Processing, Robot Details, Experiment Details.
- Related version: Current development; no release created.

## 2026-08-24 — Manager request processing action states

- Change: Standardized manager processing as “开始处理 → 创建实验 → automatic linking and validation”; failures now show only the cause and “重试”, while successful validation enables “确认排期”.
- Reason: Remove redundant or unavailable actions and make the next valid operation unambiguous at every processing state.
- Affected modules: Manager Console, Request Processing, Experiment Linking, Validation, Scheduling Confirmation.
- Related version: Current development; no release created.

## 2026-08-24 — Full prefilled request editing

- Change: Replaced the limited inline description/note editor with the original request modal, fully prefilled with description, Policy, Robot, objects, backgrounds, grouping modes, priority, and notes. Saving updates the same request ID and keeps it in “待处理”.
- Reason: Let requesters correct the complete request configuration before manager processing begins without learning a second editing interface.
- Affected modules: Requester Console, Request Detail, Request Form, Request State Rules.
- Related version: Current development; no release created.

## 2026-08-24 — Simplified request processing flow

- Change: Replaced immediate post-submit experiment creation with `待处理 → 处理中 → 已排期 → 进行中 → 已完成`; added requester editing before processing, manager locking, request-ID experiment linking, automatic validation-gated confirmation, and manager-only retry handling. Removed the prototype-only “模拟脚本失败” and manual “重新校验实验” actions, and standardized user-facing terminology on “需求”.
- Reason: Align the current prototype with the confirmed operational workflow while preserving a clean path to future automated creation.
- Affected modules: Requests, Work Orders, Experiment Creation, Scheduling, Manager Console, Requester Console, States and Permissions.
- Related version: Current development; no release created.

## 2026-08-24 — PRD registry and lifecycle structure

- Change: Migrated PRDs into `active/`, extracted the shared scheduling contract into `shared/`, added an explicit archive area, and made `docs/prd/README.md` the Registry.
- Reason: Remove the `docs/prd.md` versus `docs/prd/` ambiguity and establish explicit PRD lifecycle and archive authority.
- Affected modules: Product documentation governance.
- Related version: Documentation-only; no product release.

## 2026-08-24 — Role-based scheduling PRDs

- Change: Split the implemented scheduling product into requester, Experiment Manager, and Tester PRDs using the V10 required structure.
- Reason: Establish a coherent cross-role contract for automatic experiment creation, Robot/Tester/time matching, Urgent/Normal precedence, and availability-driven recalculation.
- Affected modules: Requests, Scheduling, Robot Management, Tester Operations, Availability, Conflict Handling.
- Related version: Current development; no release created.

## 2026-08-21 — Chinese/English interface switching

- Change: Added a persistent Chinese/English language switcher to the shared command bar and completed English coverage for all role consoles, mock data, forms, drawers, dialogs, tooltips, dynamic feedback, and accessibility labels without resetting in-memory workflow state.
- Reason: Support bilingual teams using the same operational prototype.
- Affected modules: Shared navigation, administrator console, requester console, tester console, accessibility metadata.
- Related version: Current development (unreleased).

## 2026-08-21 — Tester queue and leave approval refinement

- Change: Expanded the tester Live Queue to the full workday with equal-height rows, removed the duplicate leave-request entry, and consolidated manager leave approval information, status, and actions into one compact card.
- Reason: Improve information hierarchy, remove redundant controls, and keep empty and populated states visually stable.
- Affected modules: Tester Operations, Tester Availability, Admin Tester Management.
- Related version: Current development (unreleased).

## 2026-08-21 — v0.1.1 documentation baseline

- Change: Added formal product overview, PRD, feature inventory, user flows, business rules, roles/permissions, states, and decision history.
- Reason: Synchronize the project with the updated project template.
- Affected modules: Project-wide documentation and release governance.
- Related version: v0.1.1.

## 2026-08-21 — Interactive release validation

- Change: Added mandatory browser-based hydration and interaction checks for Portable Releases.
- Reason: Prevent server-rendered static shells from being treated as functional releases.
- Affected modules: Release workflow.
- Related version: v0.1.1.

## 2026-08-27 — Role PRD Scope and requester scheduling completion

- Change: Replaced the custom `F-xxx` PRD Scope rows with uniquely matched feature points from `docs/standards/feature-list.xlsx`, and listed unmatched Requirement, automatic scheduling, execution, leave, and Break capabilities as pending feature assets. Added requester status mapping, T+1 fixed-Robot queue ordering, cancellation/deletion boundaries, and Policy/DEBUG repair behavior from the supplied references.
- Reason: Align PRD-004 through PRD-006 with PRD Writing Guide V10.1 and complete the missing requester requirements without inventing feature IDs.
- Affected modules: PRD Governance, Requirement Management, Experiment Schedule, Robot Management, Tester Operations, Shared Scheduling Contract.
- Related version: Documentation-only; no release created.

## 2026-08-28 — PRD-004 request-detail action workflow

- Change: Implemented the PRD-004 role action matrices in request details. Requesters can edit or confirm-delete pending requests and cancel later active stages without deleting records. Managers now progress through creation, validation, Policy/JSON issue routing, repair completion, re-validation, and pass-to-test actions.
- Reason: Align requester and manager detail operations with the confirmed six-stage lifecycle and remove the obsolete direct “确认需求” shortcut.
- Affected modules: Requester Request Detail, Manager Request Detail, Requirement Status, Validation and Repair Flow, PRD-005 synchronization.
- Related version: Current development; no release created.

## 2026-09-02 — Robot schedule and Tester staffing decoupling

- Change: Removed Tester from Robot management tables, Robot schedule cells, Robot detail summaries, and Robot settings; removed Robot-side Tester conflict and assignment handling while retaining independent Tester management and execution views.
- Reason: Confirmed requirement that Robot scheduling should not include or depend on Tester scheduling.
- Affected modules: Robot Management, Robot Schedule, Tester Management, Scheduling Rules, Roles and Permissions.
- Related version: Current development; no release created.

## 2026-09-02 — Robot card management and global settings

- Change: Replaced the Robot table with a responsive four-column card grid; replaced checkbox-based bulk settings with a header Settings action that applies to all Robots; added matching daily schedule overrides and the visible global baseline to each Robot detail; renamed automatic availability to online and removed the extra unavailable-period editor.
- Reason: Confirmed requirement to simplify fleet-wide configuration while supporting clear single-Robot exceptions.
- Affected modules: Robot Management, Robot Detail, Robot Availability, Capacity Calculation, Responsive UI.
- Related version: Current development; no release created.

## 2026-09-02 — Flatten Robot management section

- Change: Removed the large outer Robot Management panel so the section header and Robot cards render directly on the page content canvas; individual cards retain their own boundaries.
- Reason: Browser review requested a flatter hierarchy without a redundant container around the card grid.
- Affected modules: Robot Management layout and design specification.
- Related version: Current development; no release created.

## 2026-09-02 — Simplify dialog guidance

- Change: Removed the Robot settings callout and the repeated online-status helper sentence from the drawer.
- Reason: Browser review requested less explanatory copy in dialogs and drawers.
- Affected modules: Robot Detail settings and dialog design guidance.
- Related version: Current development; no release created.

## 2026-09-02 — Standardize detail headings and remove Tester from experiment detail

- Change: Standardized detail-drawer section headings on the design-system Heading 3 token and removed Tester fields, Tester-dependent status, assignment controls, and Tester wording from the active experiment detail drawer.
- Reason: Browser review found undersized section headings and residual Tester information in Robot-side experiment details.
- Affected modules: Robot Detail, Experiment Detail, Design System typography.
- Related version: Current development; no release created.

## 2026-09-02 — Simplify Robot card schedule metadata

- Change: Removed global/single configuration labels from Robot cards and moved each Robot's effective working and downtime periods beneath its name.
- Reason: Browser review requested that cards prioritize the actual schedule rather than configuration-source metadata.
- Affected modules: Robot Management card layout.
- Related version: Current development; no release created.

## 2026-09-02 — Remove daily rules from Robot information tab

- Change: Removed the Daily Rules section from the Robot detail Current Information tab; scheduling configuration remains available in Settings.
- Reason: Browser review requested a more focused operational summary.
- Affected modules: Robot Detail and manager PRD.
- Related version: Current development; no release created.

## 2026-09-02 — Rename Robot global settings to batch settings

- Change: Renamed the Robot header action, dialog, per-Robot reference, schedule note, and feedback from Global Settings to Batch Settings while retaining apply-to-all behavior.
- Reason: Confirmed terminology update.
- Affected modules: Robot Management, Robot Settings, Scheduling copy, product documentation.
- Related version: Current development; no release created.

## 2026-09-02 — Add Robot selection and select-all for batch modification

- Change: Added per-card Robot checkboxes, current-filter select-all, selection count feedback, a disabled-until-selected batch settings action, and selected-only application/recalculation.
- Reason: Confirmed that Robot batch modification must use an explicit selection instead of applying to every Robot.
- Affected modules: Robot Management cards, Batch Settings dialog, Capacity Calculation, product rules and flows.
- Related version: Current development; no release created.
