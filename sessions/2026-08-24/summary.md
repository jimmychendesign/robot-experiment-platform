# Summary — 2026-08-24

## Work Completed

- 按 V10 九段式结构创建三份角色 PRD。
- 建立统一自动排期主线和跨 PRD 事件契约。
- 对照当前原型标记已实现、模拟实现、部分实现和 TBD 能力。
- 同步业务规则、角色权限、流程、状态、功能点、决策与变更记录。
- 将 PRD 迁移为 Registry、active、shared、archive 四层结构。
- 将三份角色 PRD 增加统一元数据，并把共享调度契约独立维护。
- 用通用英文规则更新 `AGENTS.md`，明确 PRD 创建、更新、生命周期和归档权限。

## Key Outcome

三角色共享一个排期结果：需求方提出并追踪，管理者维护约束和处理例外，实验员执行并维护个人 Availability。资源变化只触发受影响未执行实验的自动重排。

PRD 管理现在通过 Registry 追踪。实现完成或验证通过不会自动归档；只有明确确认的替代、取消或能力下线才会触发归档。

## Validation

- All three PRDs contain the V10 required nine sections.
- Cross-document links resolve to existing files.
- Shared scheduling terminology and role boundaries were checked across the PRDs and supporting documents.
- `git diff --check` passed; application tests were not run because source code was not changed.
- The Registry, active PRDs, shared contract, archive policy, and writing guide all exist at their expected paths.
- Active PRDs retain the required nine-section structure and required metadata.
- Relative links across the PRD tree resolve successfully.
- The added `AGENTS.md` governance rules are English-only and product-agnostic.

## Recommended Next Step

以 PRD 中明确的差距为输入，优先实现正式的 Tester-Robot Qualification、规范化需求状态以及全队列 Urgent/Normal 重排。

## Implemented Update — Simplified Work-order Flow

- 当前开发版已改为“待处理 → 处理中 → 已排期 → 进行中 → 已完成”。
- 需求方可在待处理阶段修改描述与备注；管理员开始处理后显示锁定只读。
- 管理员可模拟脚本创建并按工单 ID 自动关联实验，查看异常原因并重试。
- 只有关联实验存在且校验通过时才能确认排期。
- 类型检查、lint、生产构建与测试均通过；浏览器验证了管理员处理、失败重试、确认排期和需求方锁定只读，未创建发布版本。

## Terminology and Action Cleanup

- 界面及正式产品文档统一使用“需求”，不再使用“工单”作为用户术语。
- 移除“模拟脚本失败”和人工“重新校验实验”；系统在创建实验后自动校验。
- 管理员操作收敛为“开始处理 → 创建实验 → 确认排期”。

## Additional Analysis — Manual Intake Proposal

- 分析了“需求提交后待管理员处理、外部脚本创建实验、管理员确认后已排期”的替代流程，未修改 App 或正式产品文档。
- 建议将工单处理状态与实验排期状态拆分，并使用 `待处理 → 处理中 → 待确认 → 已排期` 表达管理员工作进度。
- 建议需求方仅在管理员领取前直接修改；领取后锁定需求版本，以避免外部脚本按旧版本创建实验。
- `request_id` 是关联所必需但通常不充分的字段；还应使用外部实验唯一标识、来源系统、需求版本及可选组合项 ID，配合幂等 API 和确认前校验。
- 该提案尚未确认，并与当前已确认的自动创建/自动排期契约冲突；如采纳，需要正式记录产品决策并同步相关 PRD 和共享契约。
- 后续进一步收敛为自动化友好方案：需求方只看“处理中”，后台保留创建、校验和确认子阶段；当前人工触发与未来自动触发共用同一流水线。
- 为降低往返复杂度，提交后使用不可变需求快照；自动化失败默认进入管理员异常队列并幂等重试，而不是来回退单。
- 用户进一步明确：不设置草稿和补充流程；提交即生成“待处理”工单，管理员开始处理前需求方可修改，开始处理后锁定，确认完成后进入“已排期”。

## Full Request Editing

- “修改需求”已复用“提交实验需求”弹窗，并完整回填此前输入的描述、Policy、Robot、物体、背景、使用方式、优先级和备注。
- 待处理阶段所有字段均可编辑；保存后保留原需求 ID 和“待处理”状态，管理员开始处理后继续锁定只读。
- 浏览器已用 `REQ-2090` 验证修改保存、列表更新和详情回显；未创建发布版本。
- 类型检查、lint、生产构建、渲染测试及 `git diff --check` 均通过。

## Manager Processing Action States

- 管理员流程固定为“开始处理 → 创建实验 → 系统自动关联与校验 → 确认排期”。
- 失败时操作区只保留原因和“重试”，不展示“确认排期”；成功后隐藏“创建实验”并启用“确认排期”。
- 浏览器已验证待处理、创建前和校验成功后的按钮状态；未创建发布版本。
- 类型检查、lint、生产构建、渲染测试及 `git diff --check` 均通过。

## Unified Drawer Action Footer

- 所有实际使用的业务抽屉已统一为“独立滚动正文 + 固定底部操作栏”。
- 修改需求、管理员处理、Robot 保存和 Tester 指定操作均迁移到底栏；只读抽屉不显示空操作栏。
- 浏览器逐类验证了操作按钮仅出现一次且位于对应 Footer，中英文文案均正确；未创建发布版本。
- 类型检查、lint、生产构建、渲染测试及 `git diff --check` 均通过。

## Create-and-Link Copy

- 管理员操作按钮已从“创建实验”更名为“关联创建实验”，英文同步为 “Create & Link Experiments”。
- 浏览器与完整代码检查均通过。

## Robot Status Authority

- 管理员状态设置现仅包含“自动（根据排期）”“已暂停”“维护中”。
- “运行中/空闲”改为按当前排期派生，不能人工选择；恢复自动会清除人工停用覆盖。
- 暂停和维护不再清空排期事实，未执行实验仍会按既有规则自动重新匹配。
- 类型检查、lint、生产构建、渲染测试及 `git diff --check` 均通过；本地开发服务已重新启动。
- 内置浏览器受本地地址安全策略限制，未能完成本轮点击式验证。
