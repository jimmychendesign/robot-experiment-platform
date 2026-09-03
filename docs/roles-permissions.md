# Roles and Permissions

## Requirement Lifecycle Role Definitions

以下为新增 Role，需要进入 RBAC Role Management 的正式角色。

| Role | 中文名称 | 类型 | 角色定义 |
|---|---|---|---|
| Experiment Requester | 实验需求员 | New | 提出实验需求并跟踪 Requirement 生命周期及最终测试结果的业务角色 |
| Experiment Requirement Manager | 实验需求管理员 | New | 负责接收和处理 Requirement、创建/关联 Experiment，并完成最终测试交付确认 |
| Experiment Requirement Verifier | 实验需求验证员 | New | 负责验证 Requirement 对应 Experiment 的 Policy、Config、JSON 及实验环境是否满足正式测试条件 |
| Requirements Validation Engineer | 需求验证工程师 | New | 负责处理实验验证过程中发现的 JSON / 实验配置问题，并在修复后提交重新验证 |
| Tester | 实验员 | Existing | 负责执行正式实验以及相关实验结果处理 |

## Requirement Lifecycle Role Responsibility

| Role | 核心职责 | 主要负责阶段 |
|---|---|---|
| Experiment Requester | 创建、修改、取消需求；查看需求、排期、实验进度及最终结果 | 全生命周期，以需求提交和结果查看为主 |
| Experiment Requirement Manager | 处理需求、创建/关联 Experiment、协调测试流程、确认最终交付 | 需求处理、实验创建、完成交付 |
| Experiment Requirement Verifier | 验证 Experiment 是否满足测试条件；判断验证通过或选择问题类型；执行重新验证 | 需求验证 |
| Requirements Validation Engineer | 修复 JSON / Config 等实验配置问题，并提交重新验证 | DEBUG / 修复 |
| Tester | 执行 Experiment、上传结果并参与测试结果处理 | 测试执行、结果审核 |

## Requirement Lifecycle Functional Permission

| 功能权限 | Experiment Requester | Experiment Requirement Manager | Experiment Requirement Verifier | Requirements Validation Engineer | Tester |
|---|:---:|:---:|:---:|:---:|:---:|
| 创建实验需求 | ✓ | — | — | — | — |
| 修改待处理实验需求 | ✓ | — | — | — | — |
| 删除待处理实验需求 | ✓ | — | — | — | — |
| 取消实验需求 | ✓ | ✓ | — | — | — |
| 查看实验需求 | ✓ | ✓ | ✓ | ✓ | ✓ |
| 开始处理实验需求 | — | ✓ | — | — | — |
| 创建 / 关联实验 | — | ✓ | — | — | — |
| 开始验证 | — | — | — | — | — |
| 验证通过 / 不通过 | — | — | — | — | — |
| 选择 Policy / JSON 问题 | — | — | — | — | — |
| 完成 JSON | — | — | — | ✓ | — |
| 完成 Policy 修复 | — | — | ✓ | — | — |
| 执行实验 | — | — | — | — | ✓ |
| 上传实验结果 | — | — | — | — | ✓ |
| 确认测试完成 | — | ✓ | — | — | — |
| 查看最终结果 | ✓ | ✓ | ✓ | ✓ | ✓ |

### Permission Consistency Open Questions

- “开始验证”“验证通过 / 不通过”“选择 Policy / JSON 问题”在当前矩阵中均未授权，但属于 Experiment Requirement Verifier 的已定义职责；正式配置 RBAC 前需确认。
- PRD-004 FR-009 当前将“Policy修复完成”事件归于 Experiment Requester，本矩阵将该功能授予 Experiment Requirement Verifier；需确认最终授权角色。
- PRD-004 FR-009 当前将“待确认 → 已完成”事件归于 Experiment Requirement Verifier，本矩阵将“确认测试完成”授予 Experiment Requirement Manager；需确认最终授权角色。

## Existing Operational Capability Summary

| Capability | Experiment Requester | Experiment Administrator | Tester |
|---|---:|---:|---:|
| View request status | Allowed | Allowed | Limited to assigned operational context |
| View system notifications | Own Requirement notifications | Operational and collaboration notifications | Notifications for assigned experiments |
| Create experiment request | Allowed | Not primary workflow | Prohibited |
| View shared Robot availability | Allowed | Allowed | Limited operational view |
| Set Robot paused/maintenance override and configuration | Prohibited | Allowed | Prohibited |
| Add Robot blocked time | Prohibited | Allowed | Prohibited |
| Edit submitted request | Allowed only before manager starts | Prohibited | Prohibited |
| Delete submitted request | Allowed only while Pending, with confirmation | Prohibited | Prohibited |
| Initiate request cancellation | Allowed at any stage; downstream handling TBD | Review affected operations | Prohibited |
| Start request processing / lock content | Prohibited | Allowed | Prohibited |
| Run/retry experiment creation; validate; classify Policy/JSON issues; confirm repair and re-validation | Prohibited | Allowed | Prohibited |
| Assign or reassign Tester from Robot management or Robot schedule | Prohibited | Prohibited | Prohibited |
| View assigned experiment queue | Prohibited | Allowed | Allowed for self |
| Start/finish experiment | Prohibited | Oversight only | Allowed for assigned work |
| Submit leave | Prohibited | Review/approval context | Allowed for self |
| Start/end temporary Break | Prohibited | Visibility and rescheduling context | Allowed for self |
| Approve/reject Tester leave | Prohibited | Allowed | Prohibited |
| Manually edit routine schedule time | Prohibited | Prohibited; system-calculated | Prohibited |
| Configure default/backup Tester on a Robot | Prohibited | Prohibited | Prohibited |

## Notes

- Current role switching is a prototype demonstration and is not an authorization boundary.
- Production data visibility, workspace membership, delegation, and special permissions remain TBD.
- Server-side authorization is required before any protected production action is implemented.
- “Experiment Manager / 实验管理者” is the canonical product role; the current UI label “实验管理员” refers to the same role, not the system-level `Admin` role in the architecture reference.
- `Experiment Requirement Manager / 实验需求管理员` 是 Requirement 生命周期中的新增正式 RBAC Role，与覆盖 Robot、Tester 和资源运维职责的 `Experiment Manager / 实验管理者` 不应默认视为同一角色。
- 上方 Requirement 生命周期权限矩阵生效后，应作为 Requirement 操作授权的详细来源；本节旧有运营能力摘要继续描述当前原型中的宽泛角色能力。
- The manager owns Robot constraints and Tester leave approval. Robot scheduling and Tester personnel scheduling remain separate workflows.
- A Requirement combination fixes each Experiment's Robot. Neither manager exception handling nor automatic rescheduling may silently switch Robot.
