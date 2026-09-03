# Product Decisions

## 2026-08-28 — Replace temporary direct confirmation with the PRD-004 validation workflow

- Decision: After linked experiments are created, the Experiment Manager uses state-specific request-detail actions: start validation, pass/fail, classify Policy or JSON issues with an optional note, mark repair complete, and re-validate. A pass enters Test Execution; failures remain inside Request Validation. Requesters may confirm-delete only while Pending and may cancel later supported active stages without deleting existing records.
- Context: PRD-004 FR-001 now defines complete requester and manager action matrices, superseding the temporary “确认需求” shortcut recorded on 2026-08-26.
- Reason: Make the request-detail operations match the confirmed six-stage lifecycle and preserve validation, repair, and re-validation loops without adding extra Stepper stages.
- Impact: Updates the active prototype, PRD-004, PRD-005, shared scheduling contract, states, rules, permissions, user flow, feature inventory, and project notes. The current prototype displays 已取消 while retaining records; downstream Experiment handling and resource release remain TBD.
- Alternatives considered: Keep direct confirmation; show validation states without actionable controls; create separate Stepper nodes for repair and re-validation.
- Open questions: Production validation evidence, external Policy/JSON update APIs, cancellation resource release, notifications, authorization, and audit remain TBD.

## 2026-08-26 — Reissue the three role PRDs with explicit succession

- Decision: Archive PRD-001, PRD-002, and PRD-003 as `Superseded`, then issue PRD-004, PRD-005, and PRD-006 as their respective active successors.
- Context: The user explicitly requested that the current three PRDs be archived and the requester, Experiment Manager, and Tester PRDs be output again.
- Reason: Preserve the previous requirement set as historical evidence while keeping exactly one active PRD per role and maintaining traceable successor relationships.
- Impact: The Registry, shared scheduling contract, archived metadata, and cross-PRD links now use the new active identifiers. The shared scheduling rules remain the single cross-role source of truth.
- Alternatives considered: Update PRD-001 through PRD-003 in place; keep both old and new PRDs active.
- Open questions: None.

## 2026-08-26 — Use the current request form schema as the Excel import contract

- Decision: Excel import uses one row per Requirement and maps directly to the current form fields. Semicolons separate selections or groups, `+` separates members inside one group, and the whole workbook is validated atomically before creating Pending Requirements.
- Context: Requesters need a batch-entry path without introducing a second request data model or changing the existing manual form.
- Reason: A single schema keeps manual and Excel-created Requirements consistent through editing, workflow mapping, experiment combination calculation, and manager processing.
- Impact: Added a downloadable three-sheet `.xlsx` template, requester import modal, catalog and structure validation, row-specific error feedback, and batch creation. Current persistence remains in memory.
- Alternatives considered: CSV import without grouping guidance; one worksheet per Requirement; partial success that imports valid rows and skips invalid rows.
- Open questions: Production upload storage, antivirus scanning, audit records, authorization, and large-file background processing remain TBD.

## 2026-08-26 — Separate requester Requirement Status from internal workflow status

- Decision: “我的需求”列表只展示自动派生的四种 Requirement Status：待处理、处理中、测试中、已完成。需求处理与实验创建映射为待处理，需求验证映射为处理中，测试执行与结果审核映射为测试中，测试完成映射为已完成。
- Context: 列表面向需求方，原有状态过度暴露创建、DEBUG、测试和审核等内部执行细节，并与详情页的 Stage / Status 职责重叠。
- Reason: 让列表表达整个 Requirement 的宏观进度，同时由详情页保留具体执行状态。
- Impact: 状态列、顶部筛选和映射逻辑统一使用 Requirement Status；该值不能手动维护，也不能直接采用某一个关联 Experiment 的 Status。详情页不变。
- Cross-role clarification: 该映射同时适用于需求方“我的需求”和管理员“实验需求队列”，两个角色不得分别维护映射或显示不同结果。
- Alternatives considered: 列表直接展示内部 Stage / Status；使用某一个 Experiment 的状态代表整个 Requirement。
- Open questions: 多 Experiment 场景下生产工作流聚合器的事件来源与一致性策略仍为 TBD。

## 2026-08-26 — Use direct confirmation as the temporary Request Validation action

- Decision: Once experiment creation and linking succeed, the Request Validation Stage displays “待验证” and the manager receives one primary action, “确认需求”. Clicking it directly enters “测试执行 / 待测试”. No additional validation UI or validation rules are introduced in the current prototype.
- Context: The six-stage Stepper includes Request Validation, but the detailed validation process has not yet been defined.
- Reason: Keep the workflow navigable and testable without inventing unconfirmed validation requirements or adding page structure.
- Impact: Replaces the previous “确认排期” action at this point in the flow; creation success now maps to “待验证”, and confirmation advances directly to Test Execution.
- Alternatives considered: Hide the action until a full validation design exists; retain “确认排期”; add a temporary validation form.
- Open questions: Future validation rules, evidence, permissions, rejection/rework paths, and automation remain TBD.

## 2026-08-26 — Separate request-detail Stepper Stage from Status

- Decision: The request-detail Stepper uses six fixed Stages—需求处理、实验创建、需求验证、测试执行、结果审核、测试完成—while the current transient Status appears as second-level text under the active Stage. DEBUG, re-export, and re-validation stay within 需求验证 and never create additional Steps.
- Context: The previous Stepper mixed public request statuses and action descriptions in its node labels.
- Reason: Keep progress stable and understandable while allowing operational states to change within a stage.
- Impact: Step labels, Stage/Status mapping, active-step calculation, accessibility labels, shared scheduling contract, and request-detail requirements now use the separated model. Other page structure and interactions remain unchanged.
- Alternatives considered: Continue using public statuses as Step labels; add a separate Step for DEBUG or re-export.
- Open questions: The production source and transition authority for export, review, and re-validation statuses remains TBD.

## 2026-08-24 — Separate Robot operational status from manual availability override

- Decision: Administrators may set only “已暂停” or “维护中”, or clear the override through “自动（根据排期）”. “运行中” and “空闲” are returned by the system from the current schedule and are not direct administrator choices.
- Context: The Robot settings drawer previously exposed all four effective states as manual options.
- Reason: Running and idle describe scheduling facts, while paused and maintenance are explicit availability interventions.
- Impact: Robot status controls, recovery behavior, state documentation, permissions, and scheduling rules use the separated model.
- Alternatives considered: Keep all four states manually selectable; rejected because manual values could contradict the schedule.
- Open questions: Production integration must define the authoritative real-time schedule signal used to distinguish running from idle.

## 2026-08-24 — Adopt a simplified manager-confirmed request flow

- Decision: A submitted request immediately enters “待处理”. The requester may edit only before the manager clicks “开始处理”. Processing locks the content; a script creates experiments using the request ID and writes the association back. The manager confirms scheduling only after all expected experiments are created and automatically validated. Failures remain “处理中”, with cause and retry shown only to the manager.
- Context: The prior implementation created and scheduled experiments immediately after requester submission, which did not match the desired current operating process or the planned path toward later automation.
- Reason: The five public states—待处理、处理中、已排期、进行中、已完成—keep the workflow understandable while allowing creation and validation to be automated later without changing the user-facing model or introducing a separate “work order” term.
- Impact: This decision replaces the request-intake portion of the earlier automatic-scheduling decision. Requester and manager PRDs, shared contracts, business rules, states, permissions, UI copy, and prototype logic now use the request flow.
- Alternatives considered: Immediate automatic experiment creation; draft and return-for-information states; a separate public “待确认” state.
- Open questions: Production script/API contract, idempotency key, audit log, and whether confirmation can become automatic after validation.

## 2026-08-24 — Govern PRDs through a registry and explicit archive authority

- Decision: Use `docs/prd/README.md` as the PRD Registry, store current PRDs in `active/`, shared contracts in `shared/`, and confirmed inactive PRDs in `archive/YYYY/`.
- Context: A single `docs/prd.md` could not clearly manage multiple PRDs, shared rules, lifecycle status, and historical documents.
- Reason: The structure separates current requirements, shared sources of truth, and historical evidence while preserving traceability.
- Impact: PRD creation must consult the repository writing guide and Registry; implemented or validated PRDs remain active while current; archive moves require explicit user confirmation or an existing confirmed product decision.
- Alternatives considered: Keep one monolithic PRD; archive by age or implementation completion; allow automatic archival based on inferred code drift.
- Open questions: None for the directory structure. Future archive candidates still require case-by-case confirmation.

## 2026-08-24 — Automatic scheduling is a shared system capability

- Decision: Experiment requests automatically create experiments; the scheduling service assigns Robot, qualified Tester, and time. The Experiment Manager maintains resource constraints and handles unresolved exceptions instead of planning routine shifts.
- Context: The three role experiences must remain connected while Robot and Tester availability changes dynamically.
- Reason: A single scheduling owner prevents divergent role-specific schedules and reduces manual coordination.
- Impact: Requester, manager, and Tester PRDs share one scheduling contract; resource changes recalculate affected not-started experiments only; Urgent precedes not-started Normal work.
- Alternatives considered: Manager manually creates experiments and schedules shifts; independent schedules per role.
- Open questions: Stable ordering within the same priority, notification channels, audit requirements, and production persistence.

> 2026-08-24 update: the request-intake and initial experiment-creation portion of this decision is replaced by the manager-confirmed work-order decision above. Availability-driven recalculation after scheduling remains applicable.

## 2026-08-21 — Use role-specific consoles in one application route

- Decision: Present administrator, requester, and tester workspaces as client-side views within the current root route.
- Context: The existing prototype is implemented in `app/page.tsx` and shares in-memory operational state.
- Reason: This supports rapid cross-role workflow simulation in one prototype.
- Impact: A single URL does not mean a single feature view; Portable Releases must preserve client hydration and view switching.
- Alternatives considered: Separate application routes for each role.
- Open questions: Whether production deep links and role-specific routes are required.

## 2026-08-21 — Portable releases require real browser interaction validation

- Decision: HTTP success alone is insufficient; exact delivered artifacts must be tested for hydration and primary interactions.
- Context: The initial `v0.1.0` release rendered the shell but did not reliably preserve interaction.
- Reason: Release quality must reflect the interactive product experience.
- Impact: Future releases require browser console checks and representative interaction testing.
- Alternatives considered: Static HTML shell checks only; rejected.
- Open questions: Whether future distribution should use a bundled local server or a pure SPA export.

## 2026-08-27 — Fix Robot assignment and define deterministic queue ordering

- Decision: Each Experiment keeps the Robot specified by its Requirement combination. Scheduling begins no earlier than T+1 and sorts by Urgent > Normal, then Requirement creation time FIFO, then Experiment creation order within one Requirement. Capacity overflow or Robot unavailability delays the Experiment in the same Robot queue; the system does not automatically switch Robot.
- Context: The requester scheduling reference defines Robot-specific queues and deterministic priority behavior, while earlier documentation allowed automatic Robot substitution and left same-priority order TBD.
- Reason: Preserve the requested execution resource, make queue results reproducible, and prevent resource changes from silently changing the experiment configuration.
- Impact: PRD-004, PRD-005, PRD-006, the shared scheduling contract, rules, flows, and role boundaries now use fixed Robot queues and deterministic ordering. Running and completed Experiments remain unchanged during Urgent insertion.
- Alternatives considered: Select any allowed Robot during every recalculation; keep same-priority ordering unspecified.
- Open questions: Maximum deferral horizon and escalation when a specified Robot remains unavailable are TBD.

## 2026-08-27 — Preserve the original Experiment during validation repair

- Decision: Policy repair and DEBUG remain inside Request Validation. Successful Policy or JSON repair updates the original Experiment and continues validation; failed repair loops within Request Validation. The system does not recreate the Experiment or return to Experiment Creation.
- Context: Request validation can discover Policy or experiment-configuration JSON problems after creation and linking are complete.
- Reason: Preserve Requirement–Experiment identity and history while allowing iterative correction.
- Impact: The Stepper mapping includes “Policy 修复中”; requester and manager PRDs define repair acceptance criteria and edge cases; Tester work is not released until validation passes.
- Alternatives considered: Recreate an Experiment after every repair; return the workflow to Experiment Creation.
- Open questions: Repair ownership, audit fields, version history, and validation evidence remain TBD.

## 2026-08-27 — Separate Pending deletion from cross-stage cancellation

- Decision: A requester may delete a Pending Requirement only after secondary confirmation. Once processing begins, the Requirement cannot be deleted. A requester may initiate cancellation at any stage, but cancellation terminal state and downstream Experiment handling remain TBD.
- Context: The requester reference distinguishes irreversible record deletion from operational cancellation.
- Reason: Protect created and executed Experiment history while retaining a cancellation entry point.
- Impact: PRD-004, permissions, flows, and shared contracts now distinguish delete and cancel. No speculative cancelled public state was added.
- Alternatives considered: Allow deletion at all stages; prohibit both deletion and cancellation after processing begins.
- Open questions: Cancellation approval, terminal status, resource release, in-progress handling, notifications, and audit requirements remain TBD.

## 2026-09-02 — Decouple Robot scheduling from Tester staffing

- Decision: Robot scheduling uses only Robot capacity, availability, blocked periods, and occupancy. Robot lists, details, settings, and schedule cells do not display or configure Tester assignments; Tester staffing remains in the independent personnel workflow.
- Context: Robot scheduling previously exposed a Tester column, default/backup Tester configuration, Tester-driven conflicts, and manual Tester assignment from Robot-side surfaces.
- Reason: Robot capacity planning and personnel staffing are separate operational concerns and should not block or rewrite each other.
- Impact: Tester Break and leave no longer alter Robot schedule cells; Robot settings no longer include Tester controls; Tester management and Tester execution remain available independently.
- Alternatives considered: Keep Tester visible but read-only; retain default/backup Tester mapping only in Robot settings.
- Open questions: Production ownership and qualification rules for personnel assignment remain TBD outside Robot management.

## 2026-09-02 — Unify global and per-Robot scheduling settings

- Decision: Replace the selectable Robot table and bulk action with a responsive card grid and a header-level global settings action. Global and per-Robot settings share the same daily working period, downtime period, and average-duration schema; global apply resets all Robots, while a detail save overrides only one Robot.
- Context: Robot configuration was exposed as a selection-dependent bulk action, while the detail page only supported status and arbitrary extra blocked periods.
- Reason: Establish a clear global baseline with explicit, discoverable per-Robot exceptions.
- Impact: Robot management layout, status wording, capacity calculation, schedule blocks, detail settings, and responsive design are updated. The extra unavailable-period editor is retired.
- Alternatives considered: Retain checkbox-based bulk configuration; keep global and per-Robot settings as separate schemas.
- Open questions: Persistent audit history and a dedicated “restore global defaults” action remain TBD.

## 2026-09-02 — Rename Robot global settings to batch settings

- Decision: Present the header-level shared Robot configuration as “Batch Settings” instead of “Global Settings”; applying it continues to update all Robots without requiring selection.
- Context: The shared configuration behavior is retained, but product terminology should describe the operation as a batch update.
- Reason: Confirmed terminology change from the user.
- Impact: Robot management copy, modal labels, per-Robot reference copy, notifications, PRD, rules, flows, and design guidance use “Batch Settings”.
- Alternatives considered: Restore checkbox-based Robot selection; retain “Global Settings”.
- Open questions: Whether a future batch workflow should support choosing a subset of Robots remains TBD.

## 2026-09-02 — Restore selection-based Robot batch settings

- Decision: Add a checkbox to every Robot card and a select-all control in the section Header. Batch Settings is disabled without a selection and applies only to selected Robots; select-all targets the current filtered list.
- Context: After the action was renamed from Global Settings to Batch Settings, applying it to every Robot no longer matched the expected batch-edit workflow.
- Reason: Batch modification requires an explicit, reviewable target set and must preserve unselected Robot configurations.
- Impact: Robot cards gain selection state, the Header gains select-all, the dialog lists selected Robots, and capacity/configuration recalculation is scoped to selected Robots.
- Alternatives considered: Continue applying to all Robots; provide only per-card selection without select-all.
- Open questions: Persistence of selections across navigation and a cross-page selection model remain TBD if pagination is introduced.
