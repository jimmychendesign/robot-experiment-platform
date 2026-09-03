# System States

## Experiment Request

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 待处理 | 需求已提交，管理员尚未开始处理 | 需求方查看、修改、二次确认后删除、发起取消；管理员开始处理 | 处理中 |
| 处理中 | 管理员已开始处理，内容锁定；创建、关联、验证、修复或重试进行中 | 管理员创建/重试、验证、问题分类、修复完成、重新验证；需求方只读或发起取消 | 已排期, 已取消 |
| 已排期 | Resources and time assigned | Inspect, initiate cancellation, execute downstream | 进行中, 冲突 |
| 进行中 | Related experiment execution active | Inspect, initiate cancellation | 已完成, 冲突 |
| 已完成 | Request work completed | Inspect, initiate cancellation | — |
| 已取消 | Cancellation accepted; existing records retained | Inspect | — |

## Experiment

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 未排期 | No slot assigned | Schedule | 可排期, 已排期 |
| 可排期 | Eligible resources/slot available | Schedule | 已排期 |
| 已排期 / 待执行 | Ready for execution | Start | 进行中, 冲突 |
| 进行中 | Tester is executing | Finish | 已完成 |
| 已完成 | Execution finished | Inspect | — |
| 冲突 / 等待资源 | Required resource unavailable | Assign, recalculate | 已排期 / 待执行 |

## Robot

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 运行中 | Current schedule has an executing experiment | Inspect; set paused or maintenance | 空闲（system-derived）, 已暂停, 维护中 |
| 空闲 | Current schedule has no executing experiment | Inspect; set paused or maintenance | 运行中（system-derived）, 已暂停, 维护中 |
| 已暂停 | Temporarily unavailable by administrator override | Restore automatic mode; set maintenance | 运行中或空闲（system-derived）, 维护中 |
| 维护中 | Unavailable by administrator override | Restore automatic mode; set paused | 运行中或空闲（system-derived）, 已暂停 |

“自动（根据排期）”是清除人工覆盖的管理设置，不是 Robot 业务状态。管理员不能直接选择“运行中”或“空闲”；系统根据当前排期在两者之间切换。

## Leave Request

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 待审批 | Submitted for review | Approve, reject | 已批准, 已拒绝 |
| 已批准 | Leave accepted | Inspect | — |
| 已拒绝 | Leave declined | Inspect or resubmit separately | — |

## Tester Break

- Inactive → Active when the tester starts Break.
- Active → Ended when the tester ends Break.
- Active Break affects simulated availability and schedule recalculation.

## Canonical Request State Clarifications

The three role PRDs define the target scheduling semantics below. Current prototype labels remain documented above where they still appear in code.

### Experiment Request

| Canonical State | Meaning | Valid Next States |
|---|---|---|
| 待处理 | Request accepted; manager has not started | 处理中 |
| 处理中 | Content locked; creation, linking, validation, repair, re-validation, or retry is active | 已排期, 已取消 |
| 已排期 | All linked experiments have legal Robot, Tester, and time assignments | 进行中, 已完成 |
| 进行中 | At least one linked experiment is running | 已完成 |
| 已完成 | All linked experiments are complete | — |
| 已取消 | Request cancellation accepted; existing records remain | — |

技术失败、实验遗漏或关联异常不增加新的公开状态；需求保持在当前创建流程，管理员侧显示原因和重试操作。全部实验创建并关联成功后，“需求验证”显示“待验证”；管理员完成首次验证或修复后的重新验证并点击“通过”后，流程进入“测试执行 / 待测试”。

### Request Detail Stepper Stage / Status Mapping

Stepper 的 Stage 固定，不以内部 Status 替换节点名称。

| Stage | Status | Stepper behavior |
|---|---|---|
| 需求处理 | 待处理、待导出 | 当前阶段 Active；显示当前 Status |
| 实验创建 | 待创建、创建中 | 需求处理 Completed；当前阶段 Active |
| 需求验证 | 待验证、验证中、Policy 修复中、DEBUG、DEBUG 中、待重新导出、重新导出、待重新验证、重新验证、重新验证中 | 前两阶段 Completed；当前阶段 Active；内部往返不新增 Step |
| 测试执行 | 待测试、测试中 | 前三阶段 Completed；当前阶段 Active |
| 结果审核 | 待审核、审核中 | 前四阶段 Completed；当前阶段 Active |
| 测试完成 | 已完成 | 六个阶段均 Completed；显示“已完成” |

当前阶段之后的 Stage 均为 Pending。第二层 Status 文案只显示在当前 Stage；流程整体完成时显示在“测试完成”。

### Cross-role Requirement Status Projection

需求方“我的需求”和管理员“实验需求队列”共用同一套宏观展示状态，不替代上述内部流程状态。

| Internal Requirement Stage | Requirement Status | List Filter |
|---|---|---|
| 需求处理、实验创建 | 待处理 | 待处理 |
| 需求验证 | 处理中 | 处理中 |
| 测试执行、结果审核 | 测试中 | 测试中 |
| 测试完成 | 已完成 | 已完成 |
| 需求取消 | 已取消 | 已取消 |

该状态由 Requirement 当前内部 Stage / Status 自动投影，不允许手动维护，也不直接取某一个关联 Experiment 的状态。同一 Requirement 在两个角色列表中的结果必须一致；详情页仍展示细粒度 Stage + Status。

Policy 修复或 DEBUG 不产生新的 Stage。修复成功后更新原 Experiment 并继续验证；修复失败时保持在“需求验证”，不回退到“实验创建”。支持的活动阶段发起取消后，当前原型展示“已取消”并保留已有记录；已创建或执行中 Experiment 的处置和资源释放规则仍为 TBD。

### Tester Availability

| State | Meaning | Scheduling Effect |
|---|---|---|
| Available | Eligible for new work, subject to qualification | Can be matched |
| Busy | Running an experiment | Cannot be double-booked |
| Break | Temporarily unavailable immediately | Recalculate affected not-started work |
| Leave Pending | Leave awaits manager decision | No formal schedule change |
| On Leave | Approved leave interval | Cannot be matched within the interval |
