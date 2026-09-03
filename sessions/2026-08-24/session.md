# Session — 2026-08-24

## User Request

根据当前项目实现和两份外部 Markdown 参考，将实验调度业务拆成实验需求方、实验管理者和实验员三份相互连通的 PRD。

后续确认采用 Registry、active、shared、archive 的 PRD 治理结构，并要求将通用英文规则同步到 `AGENTS.md`。

## Context

- 参考《实验平台产品架构总览_结构化.md》的产品域、对象与编号思想。
- 参考《实验平台 PRD 编写规范 V10.0》的九段式 PRD 结构。
- 以 `app/page.tsx` 的当前交互和 `PROJECT.md` 为实现基线。

## Analysis

- 当前原型已覆盖三角色控制台、需求组合、自动排期模拟、Robot 可用性、Tester 默认/备用映射、请假审批、Break、执行计时和动态反馈。
- “管理员创建实验”和“待审核”与用户确认的自动创建/自动排期边界不一致，PRD 将其列为现状差距，而非延续为目标流程。
- 当前优先级主要用于展示和局部排序，尚未完整实现 Urgent 对所有未执行 Normal 的重排。

## Confirmed Decisions

- 需求提交后由系统自动创建实验。
- Robot 决定执行设备，Robot 与 Tester Availability 的交集决定时间。
- Tester 必须具备目标 Robot 操作资格。
- Urgent 优先于尚未执行的 Normal，不能中断正在执行的实验。
- 管理者维护资源约束、审批请假和处理例外，不负责日常手工排班。
- 资源变化只重排受影响的未执行实验。
- `docs/prd/README.md` 作为 PRD Registry。
- 当前有效 PRD 存放在 `docs/prd/active/`，跨 PRD 契约存放在 `docs/prd/shared/`。
- 只有明确确认的 Superseded、Cancelled 或 Obsolete PRD 才进入 `docs/prd/archive/YYYY/`。
- Codex 可以提出归档候选，但不得依据年龄、实现完成或推断自行归档。

## Files Changed

- `docs/prd/README.md`
- `docs/prd/active/PRD-001-experiment-requester.md`
- `docs/prd/active/PRD-002-experiment-manager.md`
- `docs/prd/active/PRD-003-tester.md`
- `docs/prd/shared/scheduling-contract.md`
- `docs/prd/archive/README.md`
- `docs/standards/prd-writing-guide.md`（用户已创建，本次未修改正文）
- `AGENTS.md`
- `docs/README.md`
- `docs/business-rules.md`
- `docs/roles-permissions.md`
- `docs/user-flow.md`
- `docs/states.md`
- `docs/feature-list.md`
- `docs/decisions.md`
- `docs/changelog.md`
- `PROJECT.md`
- `sessions/2026-08-24/`

## Validation

- Confirmed all three PRDs contain the required nine sections in order.
- Confirmed all role-PRD and index targets exist.
- Reviewed shared terminology for Urgent / Normal, automatic creation, manager role boundary, and not-started-only recalculation.
- `git diff --check` passed.
- Application tests were not run because no source code changed in this session.
- Confirmed the migrated PRD structure contains the Registry, three active PRDs, one shared contract, an archive policy, and the repository writing guide.
- Confirmed all three active PRDs retain the required nine sections and contain all required metadata keys.
- Checked relative Markdown links across the PRD tree; all targets resolve.
- Confirmed the newly added `AGENTS.md` PRD governance section contains English only and no product-specific examples.

## Open Questions

- 同优先级实验的稳定排序规则。
- 正式 Robot 操作资格数据模型和维护入口。
- 组合内多资源作为整体时的执行数据结构。
- 通知、审计、持久化、并发和失败恢复策略。

## Implementation — Simplified Work-order Flow

### Confirmed Decisions

- 提交后立即生成“待处理”工单，不设置草稿。
- 管理员开始处理前需求方可修改；开始处理后工单锁定且需求方只读。
- 创建脚本携带工单 ID，实验自动关联来源工单。
- 实验创建、关联或校验异常时工单保持“处理中”，仅管理员侧显示原因与重试。
- 全部实验创建且校验通过后，管理员才能确认排期。
- 公开状态统一为：待处理 → 处理中 → 已排期 → 进行中 → 已完成。

### Files Changed

- `app/page.tsx`
- `app/i18n.ts`
- `app/design-system/platform.css`
- `docs/prd/active/PRD-001-experiment-requester.md`
- `docs/prd/active/PRD-002-experiment-manager.md`
- `docs/prd/shared/scheduling-contract.md`
- `docs/business-rules.md`
- `docs/states.md`
- `docs/roles-permissions.md`
- `docs/user-flow.md`
- `docs/feature-list.md`
- `docs/decisions.md`
- `docs/changelog.md`
- `PROJECT.md`

### Validation

- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, including production build and rendered-shell tests.
- Browser validated manager start/lock, disabled confirmation before validation, failure remaining in “处理中”, retry enabling confirmation, successful confirmation to “已排期”, requester read-only state after lock, and zero console errors during the validated flow.

## UI Terminology Simplification

- User-facing “工单” terminology was standardized to “需求” across the application and formal product documents.
- Removed the prototype-only “模拟脚本失败” action.
- Removed the manual “重新校验实验” action; validation now remains an automatic system step after “创建实验”.
- Browser verified the streamlined actions `开始处理 → 创建实验 → 确认排期`, with confirmation disabled before creation and enabled after automatic validation.

## PRD Governance Implementation

- 仓库内 PRD 写作规范已位于 `docs/standards/prd-writing-guide.md`。
- 已消除 `docs/prd.md` 与 `docs/prd/` 的同名歧义。
- 已将共享排期契约从 Registry 中拆出。
- 已增加生命周期、元数据、替代关系和显式归档权限规则。

## Requirement Analysis Addendum — Manual Request Intake and External Experiment Linking

### User Request

- 先分析、不修改当前 App。
- 需求提交后不再自动排期；工单新增“待处理”，由实验管理员用外部脚本创建实验，再在控制台确认后进入“已排期”。
- 重点分析需求方在待处理阶段是否允许修改，以及外部软件创建的实验如何关联到来源需求。

### Analysis

- 该方向与本 session 已确认的“提交后自动创建、自动排期”责任边界冲突；若采纳，需要作为新的产品决策同步修改共享调度契约及 PRD-001/002，而不是只增加一个 UI 状态。
- 建议拆分“工单处理状态”和“实验排期状态”，避免“待处理”同时表达未受理、脚本执行中、实验已导入待核验和资源未排齐。
- 需求方可以在尚未被管理员受理时修改；管理员开始处理或已经产生实验关联后，应锁定当前需求版本。后续变化应通过撤回重提或变更单处理，避免脚本按旧参数创建实验。
- 外部脚本传入 `request_id` 可以建立需求级关联，但不足以保证多实验、组合覆盖、幂等和版本一致性。推荐同时传入 `source_system`、`external_experiment_id`、`request_version`，多组合场景再传 `request_item_id` / `combination_id`。
- 外部系统应通过受控 API/CLI 执行幂等 upsert，不建议直接写平台数据库。管理员“确认排期”负责核验并发布关联结果，不负责首次建立关联。

### Unconfirmed Recommendation

- 工单公开状态采用：`待处理 → 处理中 → 待确认 → 已排期`；另设 `需补充信息 / 已撤回 / 已关闭` 处理例外。
- 请求方仅在 `待处理` 且尚未被管理员领取时直接编辑；编辑生成新版本并更新 `updated_at`。
- 管理员领取时记录 `handled_by`、`handling_started_at` 和 `request_version`，形成乐观锁；版本变化时阻止确认并要求重新核对。
- 确认前校验：关联实验至少一条、外部实验 ID 唯一、需求版本一致、必要组合覆盖完整、Robot/Tester/起止时间合法且无冲突。

### Open Questions

- 一个需求是否必须覆盖系统计算出的全部实验组合，还是允许管理员部分创建、分批确认？
- “已排期”是否要求每个实验都已有 Robot、Tester、开始与结束时间，还是仅表示实验已创建并进入外部排期系统？
- 管理员领取前是否允许需求方无限次修改；领取后是允许撤回，还是只能提交变更申请？
- 外部软件是否支持主动调用平台 API，还是只能由平台定时拉取/导入？

## Requirement Analysis Addendum — Simplified Automation-Ready Flow

### User Intent

- 希望避免复杂的工单领取、退回、修改和再次确认流程。
- 当前仍可能由管理员运行脚本创建实验，但未来会自动化，因此现在的流程应能平滑迁移。

### Unconfirmed Recommendation

- 对需求方仅暴露：`处理中 → 已排期 → 进行中 → 已完成`，另加少量异常终态 `处理失败 / 已撤回`。
- 后台内部阶段保存为：`queued → creating → validating → awaiting_confirmation → scheduled`；内部阶段不作为需求方筛选状态。
- 当前人工阶段由管理员点击“执行创建”触发同一条创建流水线，并在校验通过后确认；未来仅把触发器替换为自动队列，并可将“人工确认”配置为“校验通过后自动确认”。
- 已提交需求采用不可变快照，避免自动任务执行期间发生参数竞态。尚未开始创建时，需求方可撤回并复制为新需求；创建开始后不允许修改原单。
- 自动化异常默认进入管理员异常队列并支持幂等重试，不自动退回需求方。只有缺少或无效的业务输入才标记为“需要补充信息”。
- 创建任务必须使用稳定幂等键，并区分可重试技术错误、不可重试业务错误和部分成功；部分成功不得直接发布为“已排期”。

### Latest Clarification

- 不设置草稿状态；需求方提交后立即形成工单。
- 不设置“需要补充信息”或退回补充流程。
- 工单处于“待处理”且管理员尚未开始处理时，需求方允许修改。
- 管理员点击“开始处理”后锁定工单内容；管理员完成实验创建、关联和核验后确认排期。

## Implemented Update — Full Request Editing

### User Request

- 实验需求方点击“修改需求”后，应使用提交实验需求的同一弹窗。
- 弹窗需带入此前填写的全部内容，并允许修改所有字段。

### Implementation

- “待处理”需求的修改入口改为打开完整需求表单，不再在详情抽屉中仅编辑描述和备注。
- 自动回填需求描述、Policy、Robot、物体、背景、物体/背景使用方式、优先级和实验备注。
- 保存后沿用原需求 ID，状态保持“待处理”，详情和列表立即显示更新内容。
- 管理员开始处理后仍保持只读锁定，不开放修改入口。

### Files Changed

- `app/page.tsx`
- `app/i18n.ts`
- `app/design-system/platform.css`
- `docs/prd/active/PRD-001-experiment-requester.md`
- `docs/user-flow.md`
- `docs/business-rules.md`
- `docs/changelog.md`
- `PROJECT.md`

### Validation

- 浏览器实际修改 `REQ-2090` 的描述、优先级和备注并保存；需求 ID 与“待处理”状态保持不变，修改内容在列表和详情中正确回显。
- `npm run typecheck`、`npm run lint`、`npm test` 和 `git diff --check` 均通过；`npm test` 包含生产构建与 2 项渲染测试。

## Implemented Update — Manager Processing Action States

### Confirmed Flow

- 管理员点击“开始处理”，再点击“创建实验”。
- 系统自动完成实验创建后的关联与校验，不提供独立的关联或校验按钮。
- 创建、关联或校验失败时，操作区只显示失败原因和“重试”，隐藏“确认排期”。
- 全部校验成功后隐藏“创建实验”，自动启用“确认排期”。

### Files Changed

- `app/page.tsx`
- `app/i18n.ts`
- `docs/prd/active/PRD-002-experiment-manager.md`
- `docs/user-flow.md`
- `docs/feature-list.md`
- `docs/changelog.md`

### Validation

- 浏览器验证待处理阶段只显示“开始处理”；开始后显示“创建实验”和禁用的“确认排期”；创建后实验自动关联、校验通过、“创建实验”隐藏且“确认排期”可用。
- `npm run typecheck`、`npm run lint`、`npm test` 和 `git diff --check` 均通过；`npm test` 包含生产构建与 2 项渲染测试。

## Implemented Update — Unified Drawer Action Footer

### User Request

- 所有抽屉增加固定的底部按钮区域，并把当前抽屉可执行的业务操作集中放入该区域。

### Implementation

- 抽屉统一为独立滚动正文和固定底部操作栏，底栏不随正文滚动。
- 需求方“修改需求”迁移到底栏。
- 管理员“开始处理 / 创建实验 / 重试 / 确认排期”迁移到底栏。
- Robot 设置“保存并确认”迁移到底栏。
- 实验异常“确认指定 Tester”迁移到底栏；需求方只读实验不显示管理操作。
- 无可执行操作的只读抽屉不显示空底栏；关闭和返回仍保留在顶部。
- 移动端底栏纵向排列，主按钮满宽，并为底部安全区域预留空间。

### Files Changed

- `app/page.tsx`
- `app/design-system/platform.css`
- `app/i18n.ts`
- `docs/design.md`
- `docs/changelog.md`

### Validation

- 浏览器逐项验证了需求方需求、管理员需求、Robot 设置和实验异常四类抽屉的操作栏语义与唯一按钮位置。
- 浏览器验证新增操作栏提示、按钮和 accessible name 在英文界面正确切换。
- `npm run typecheck`、`npm run lint`、`npm test` 和 `git diff --check` 均通过；`npm test` 包含生产构建与 2 项渲染测试。

## Implemented Copy Update — 关联创建实验

- 管理员需求抽屉中的“创建实验”按钮已更名为“关联创建实验”。
- 英文按钮同步为 “Create & Link Experiments”。
- PRD 与管理员处理流程文档已同步使用新名称。
- 浏览器确认新按钮只出现一次且位于固定抽屉操作栏，旧“创建实验”按钮不再出现。
- `npm run typecheck`、`npm run lint`、`npm test` 和 `git diff --check` 均通过。

## Implemented Update — Robot Status Authority

### Confirmed Requirement

- 实验管理员只能将 Robot 设置为“已暂停”或“维护中”。
- “运行中”和“空闲”不是人工选项，由系统根据当前排期自动返回。
- 为支持解除人工覆盖，设置中提供“自动（根据排期）”。

### Implementation

- Robot 设置抽屉的状态选项收敛为“自动（根据排期） / 已暂停 / 维护中”。
- 暂停或维护时保留排期事实，不再清空已排数量和当前实验；人工状态仅覆盖可用性并触发未执行实验重排。
- 恢复自动后，根据当前实验排期派生“运行中”或“空闲”，并恢复按全局规则计算的容量与利用率。
- 同步了管理员 PRD、业务规则、状态、角色权限、功能清单、产品决策和变更记录。

### Validation

- `npm run typecheck`、`npm run lint`、`npm test` 和 `git diff --check` 均通过；`npm test` 包含生产构建与 2 项渲染测试。
- 本地开发服务已重新启动并运行于 `http://localhost:3000/`。
- 内置浏览器的本地地址安全策略阻止自动化刷新，因此未完成点击式浏览器验证；未尝试绕过该策略。
