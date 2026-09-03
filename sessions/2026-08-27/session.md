# Session — 2026-08-27

## User Request

按 PRD Writing Guide V10.1 更新 PRD-004、PRD-005 和 PRD-006，并根据两张参考图补充 PRD-004 缺少的 Requirement Status、删除/取消、验证修复、Robot 可用性与排期规则。

## Context

- `product-structure.md` 与 `feature-list.xlsx` 现为 PRD Scope 的强制输入。
- 现有三份 PRD 的 Scope 使用自定义 `F-xxx`，与 Excel 的正式功能资产编号不一致。
- Excel 尚未登记 Requirement、自动排期、Tester 执行、请假和 Break 等部分核心能力。
- Excel 的 `EXP-301.*`、`EXP-302.1`、`EXP-302.2` 存在 Experiment Schedule 与 Flagged Annotation 重复定义；Robot 业务对象名称也与产品结构不一致。

## Confirmed Decisions

- 每个 Experiment 保留 Requirement 组合指定的 Robot，不因 Robot 不可用自动切换。
- 最早从 T+1 排期；排序为 Urgent > Normal、同优先级 Requirement 创建时间 FIFO、同 Requirement 下 Experiment 创建顺序。
- 新增 Urgent 只调整未开始 Experiment，正在执行和已完成 Experiment 不变。
- Policy 修复和 DEBUG 留在需求验证；修复更新原 Experiment，不重新创建。
- 待处理 Requirement 可二次确认后删除；处理中和测试中不可删除。
- 任意阶段可以发起取消，但取消终态和下游 Experiment 处置仍为 TBD。

## Files Changed

- `docs/prd/active/PRD-004-experiment-requester.md`
- `docs/prd/active/PRD-005-experiment-manager.md`
- `docs/prd/active/PRD-006-tester.md`
- `docs/prd/shared/scheduling-contract.md`
- `docs/prd/README.md`
- `docs/business-rules.md`
- `docs/states.md`
- `docs/roles-permissions.md`
- `docs/user-flow.md`
- `docs/feature-list.md`
- `docs/decisions.md`
- `docs/changelog.md`
- `sessions/2026-08-27/`

## Validation

- PRD-004 through PRD-006 contain all nine required sections and balanced Markdown fences.
- Every formal Scope row matches exactly one row in `feature-list.xlsx`.
- Every `related_features` entry appears in the corresponding formal Scope.
- Relative links, affected Markdown tables, and tracked-file whitespace checks passed.
- `git diff --check` passed.
- Application tests were not run because this work changed documentation only.

## Open Questions

- Requirement 应归属哪个正式产品域/业务对象，以及对应功能与功能点 ID。
- 自动排期、Tester 执行、请假和 Break 的正式功能资产 ID。
- 取消的终态、审批、已创建/执行中 Experiment 处置、资源释放和通知。
- 指定 Robot 长期不可用时的最大顺延和升级策略。
