# Summary — 2026-08-26

## Work Completed

- Replaced the request-detail Stepper with six fixed Stage labels.
- Added the complete Stage/Status mapping, including DEBUG and re-export remaining inside Request Validation.
- Added active Status as second-level Step copy without changing the surrounding page structure.
- Preserved the existing request actions, tabs, detail content, and drawer layout.
- Simplified the currently undefined Request Validation workflow to “待验证 → 确认需求 → 测试执行 / 待测试” without adding UI areas.
- Synchronized affected PRDs, shared rules, states, feature inventory, decision history, changelog, and project status.
- Simplified “我的需求” list and filters to four derived Requirement Status values while preserving granular workflow status in request detail.
- Connected the manager request queue and Requirement-related attention counts to the same shared mapping without changing its priority filter or table structure.
- Added a current-form-aligned Excel template, requester upload modal, client-side workbook validation, and atomic batch creation of Pending Requirements.
- Archived PRD-001, PRD-002, and PRD-003 as superseded historical records.
- Reissued the connected requester, Experiment Manager, and Tester requirements as PRD-004, PRD-005, and PRD-006.
- Updated the Registry and shared scheduling contract with explicit successor relationships and one cross-role allocation/recalculation rule set.
- Published and browser-validated Portable Release v0.2.0 under `output/html/2026-08-26_v0.2.0/`.

## Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, including the production build and rendered-shell tests.
- `git diff --check` passed.
- Browser validated 待处理、待创建、验证中、待测试 across Stages 1–4, with correct Completed / Active / Pending states.
- The six-column Stepper fit its 608px desktop container without overflow; the request detail retained one Header, one Tabs group, one Stepper, and the existing content section.
- Browser console contained no warnings or errors.
- Follow-up browser validation confirmed “待验证 → 确认需求 → 待测试”, the absence of the legacy “确认排期” action, visible success feedback, and zero console warnings or errors.
- Browser validated all five requester filters and the four allowed list statuses. After REQ-2090 entered “需求验证 / 待验证”, its list status became “处理中” while its detail Stepper remained granular.
- Browser confirmed the manager queue uses the same four-state projection, preserves the 全部 / 紧急 priority filter, and shows REQ-2090 as “处理中” in both roles during Request Validation.
- The Excel template download entry now uses a neutral hover treatment instead of green; lint and diff checks passed after the adjustment.
- The upload zone now stays visually neutral after file selection while continuing to show the selected filename and reselect action.
- Requester and manager Requirement Detail steppers now reserve a consistent second line for Status, keeping every Stage name aligned on one non-wrapping row.
- Both Requirement Detail drawers now include consistent spacing above the shared Stepper.
- PRD lifecycle metadata, nine-section structure, balanced code fences, and all relative links passed documentation validation.
- `git diff --check` passed after the archive and reissue changes.
- Application tests were not rerun for the documentation-only PRD reissue.
- Final release verification passed source typecheck/lint/tests, exact-folder serving, Chrome interaction checks, Excel template delivery, browser error monitoring, and bundled asset/reference/secret scans.

## Remaining Issues

- Production transition authority for the newly documented granular statuses remains TBD.
- Production multi-Experiment Requirement aggregation remains TBD.

## Recommended Next Step

Connect backend workflow events to `workflowStatus` when export and result-review services are introduced.
