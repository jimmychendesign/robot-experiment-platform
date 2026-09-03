# Session — 2026-08-26

## User Request

在不修改需求详情页面结构、其他 UI 或现有交互的前提下，将 Stepper 改为固定六阶段，并建立 Stage 与 Status 的映射和 Completed / Active / Pending 判定。

后续要求在不调整“我的需求”页面结构的前提下，将列表状态和顶部筛选简化为“待处理、处理中、测试中、已完成”，并从 Requirement 内部流程自动计算，不能直接采用单个 Experiment 状态。

再次要求将管理员“实验需求队列”接入同一 Requirement Status 映射，不修改表格结构、优先级筛选或其他模块。

新增需求：在实验需求方“提交实验需求”旁增加 Excel 导入入口，弹窗提供上传区和模板下载，并以当前表单数据结构创建实验需求。

新增文档治理需求：归档当前三份角色 PRD，并重新输出实验需求方、实验管理者和实验员三份相互连通的 PRD。

## Context

- 现有 Stepper 使用“待处理 → 处理中 / 创建实验 → 已排期 → 进行中 → 已完成”，混合了 Stage、Status 和动作描述。
- 页面已有 Header、Tabs、Stepper 布局、需求配置和关联实验内容需要保持不变。

## Confirmed Decisions

- 固定 Stage：需求处理、实验创建、需求验证、测试执行、结果审核、测试完成。
- 当前 Status 只作为当前 Stage 下方的第二层文案。
- DEBUG、重新导出和重新验证均留在“需求验证”，不增加 Step。
- 前序 Stage 为 Completed，当前 Stage 为 Active，后续 Stage 为 Pending；整体完成时六个 Stage 均为 Completed。
- 当前暂不实现具体需求验证流程；实验创建完成后显示“需求验证 / 待验证”，管理员点击“确认需求”直接进入“测试执行 / 待测试”。
- “我的需求”列表只展示四种宏观 Requirement Status；详情页继续展示细粒度 Stage + Status。
- Requirement Status 按整个 Requirement 当前工作流派生：阶段 1–2 为待处理，阶段 3 为处理中，阶段 4–5 为测试中，阶段 6 为已完成。
- 需求方与管理员列表调用同一个映射函数；管理员队列不再直接展示已排期或进行中。
- Excel 模板一行对应一个 Requirement，字段与当前表单一致；整表校验通过后批量创建为待处理，任一行失败则不部分导入。
- PRD-001、PRD-002、PRD-003 明确归档为 Superseded；PRD-004、PRD-005、PRD-006 分别作为对应角色的当前替代版本。
- 共享契约集中维护 Robot、Tester Availability、Robot 操作资格、Urgent / Normal 和增量重排规则。

## Files Changed

- `app/page.tsx`
- `app/i18n.ts`
- `app/design-system/platform.css`
- `docs/prd/README.md`
- `docs/prd/active/PRD-001-experiment-requester.md`
- `docs/prd/active/PRD-002-experiment-manager.md`
- `docs/prd/active/PRD-004-experiment-requester.md`
- `docs/prd/active/PRD-005-experiment-manager.md`
- `docs/prd/active/PRD-006-tester.md`
- `docs/prd/archive/2026/PRD-001-experiment-requester.md`
- `docs/prd/archive/2026/PRD-002-experiment-manager.md`
- `docs/prd/archive/2026/PRD-003-tester.md`
- `docs/prd/archive/README.md`
- `docs/prd/shared/scheduling-contract.md`
- `docs/business-rules.md`
- `docs/states.md`
- `docs/user-flow.md`
- `docs/feature-list.md`
- `docs/decisions.md`
- `docs/changelog.md`
- `PROJECT.md`
- `sessions/2026-08-26/`
- `public/templates/实验需求批量导入模板.xlsx`
- `outputs/01a03bdb-b21f-7fd3-a006-d5357410a2c6/实验需求批量导入模板.xlsx`
- `package.json`
- `package-lock.json`

## Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, including the production build and rendered-shell tests.
- `git diff --check` passed.
- Browser validated the six Stage labels and transitions for 待处理 → 待创建 → 验证中 → 待测试.
- Browser confirmed Completed / Active / Pending classes, current Status second-line text, no Stepper overflow at the active desktop viewport, unchanged request-detail structure, and zero console errors.
- Browser validated “需求验证 / 待验证” with one enabled “确认需求” action after creation.
- Clicking “确认需求” directly moved the Stepper to “测试执行 / 待测试”, displayed the success Toast, removed the legacy “确认排期” action, and produced zero console warnings or errors.
- Browser validated the five requester filters: 全部、待处理、处理中、测试中、已完成.
- Browser confirmed initial list projection as REQ-2090 → 待处理, REQ-2088/2083/2076 → 测试中, and REQ-2061 → 已完成.
- After advancing REQ-2090 to “需求验证 / 待验证”, the requester list displayed “处理中”; the 处理中 filter returned only REQ-2090, while request detail retained the granular Stage and Status.
- Browser confirmed 测试中 returned three matching Requirements and 已完成 returned one; no internal execution status appeared in the filtered status column.
- Browser validated the manager queue initial projection as REQ-2090 → 待处理, REQ-2088/2083/2076 → 测试中, and REQ-2061 → 已完成; no 已排期 or 进行中 appeared in the Requirement status column.
- The manager priority filter remained 全部 / 紧急; selecting 紧急 returned only REQ-2088 with Requirement Status 测试中.
- After REQ-2090 entered “需求验证 / 待验证”, both manager and requester list rows displayed “处理中” for the same Requirement.
- Adjusted the Excel template download entry hover from a green success treatment to the console's neutral hover background and strong neutral border; retained an explicit keyboard focus ring.
- `npm run lint` and `git diff --check` passed after the hover-state adjustment.
- Removed the upload zone's selected-file visual state so choosing a workbook no longer changes the control to a green success treatment; the filename and reselect action remain.
- `npm run typecheck`, `npm run lint`, and `git diff --check` passed after removing the selected-file styling.
- Standardized the shared Requirement Detail Stepper copy to two reserved rows: non-wrapping Stage name above and Status below. Empty Status rows retain height, keeping all Stage labels aligned in requester and manager drawers.
- `npm run typecheck`, `npm run lint`, `npm test`, and `git diff --check` passed after the Stepper alignment update.
- Added shared top spacing between the Requirement Detail tabs and Stepper in both requester and manager drawers; `npm run lint` and `git diff --check` passed.
- Confirmed PRD-001 through PRD-003 are stored under `docs/prd/archive/2026/` with `Superseded`, `archived_at`, `archive_reason`, and matching `superseded_by` metadata.
- Confirmed PRD-004 through PRD-006 are the only active role PRDs, use `Confirmed`, and declare the matching `supersedes` relationships.
- Confirmed all six role PRDs retain the required nine sections and balanced Markdown fences.
- Confirmed Registry, active-to-archive, archive-to-successor, cross-role, shared-contract, and writing-guide links resolve.
- `git diff --check` passed after the PRD lifecycle changes.
- Application tests were not rerun for the PRD reissue because this work phase changed documentation only.
- Published Portable Release `v0.2.0` to `output/html/2026-08-26_v0.2.0/` without changing prior releases.
- The exact delivered folder was served with its included dependency-free server and validated in headless Chrome: role switching, Excel import modal and template HTTP 200, requester/manager six-stage Stepper layout, manager macro statuses, and zero browser errors passed.
- Final release checks passed: `npm run typecheck`, `npm run lint`, `npm test` (2/2), `git diff --check`, portable build, server syntax check, and bundled asset/reference/secret scan.

## Open Questions

- Production ownership and transitions for export, result review, and re-validation statuses remain TBD.
- Production multi-Experiment workflow aggregation and consistency strategy remains TBD.
