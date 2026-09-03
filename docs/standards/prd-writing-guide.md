# 实验平台 PRD 编写规范 V10.1

---

# 1. 核心原则

## 1.1 功能资产库管理长期稳定能力

功能资产库负责维护：

```text
产品域（Domain）
↓
业务对象（Business Object）
↓
功能（Feature）
↓
功能点（Feature Point）
```

功能资产库属于长期产品资产。

原则上保持稳定。

不因为单次需求迭代频繁修改。

---

## 1.2 PRD 描述本次迭代

PRD 负责描述：

- 本次要解决什么问题
- 本次涉及哪些已有功能点
- 本次新增或修改什么能力
- 用户如何完成任务
- 系统如何响应用户操作
- 不同条件和状态下系统如何表现
- 什么条件下可以认为需求实现正确
- 异常情况如何处理

PRD 不负责维护功能资产库。

---

## 1.3 优先扩展已有功能点

新增需求时优先判断：

> 是否属于已有功能点的能力扩展。

例如：

已有：

```text
TSK-101.2 Edit Task Type
```

新增：

- Test Documentation URL
- Test Method Guide

属于：

```text
TSK-101.2 Edit Task Type
```

能力扩展。

不新增新的功能点。

只有当需求产生独立、长期存在且可以单独管理的产品能力时，才考虑新增 Feature Point。

---

## 1.4 Scope 保持稳定

Scope 只引用功能点。

例如：

| 功能 ID | 功能 | 功能点 ID | 功能点 |
|---|---|---|---|
| TSK-101 | Task Type Management | TSK-101.2 | Edit Task Type |

Scope 不描述：

- UI
- 字段
- Interaction
- State
- Business Rule
- Acceptance Criteria
- Edge Case

具体新增内容进入：

- Functional Requirement
- Acceptance Criteria
- States & Rules
- Edge Cases

---

## 1.5 功能与模式分离

不要把以下内容定义为功能：

- Create Drawer
- Edit Drawer
- View Drawer
- Create Modal
- Edit Modal
- View Modal
- Read Only
- Editing
- Single Select
- Multi Select

这些属于：

- State
- Mode
- Interaction
- Rule

而不是 Feature。

例如：

正确：

```text
Test Method Drawer
```

错误：

```text
Create Test Method Drawer
View Test Method Drawer
Edit Test Method Drawer
```

---

## 1.6 User Story 不承担完整需求描述

User Story 只用于表达：

```text
Who
↓
Want
↓
Why
```

User Story 不负责描述：

- 页面结构
- 操作流程
- 字段
- 交互细节
- 状态
- 状态转换
- 按钮 Enabled / Disabled
- Business Rule
- Edge Case
- 所有可能 Case

这些内容分别进入：

```text
User Story
↓
User Flow
↓
Functional Requirement
↓
Acceptance Criteria
↓
States & Rules
↓
Edge Cases
```

不要为了覆盖所有 Case 而不断扩展 User Story。

---

## 1.7 User Flow 同时描述用户行为和系统反馈

User Flow 不应只有流程图。

完整 User Flow 由两部分组成：

```text
Flow Diagram
+
Flow Description
```

### Flow Diagram

用于快速理解：

- 用户从哪里开始
- 用户经过哪些主要步骤
- 关键 Decision Point
- 用户最终完成什么任务

### Flow Description

用于说明：

- 每一步用户做什么
- 系统对应发生什么

推荐格式：

| Step | User Action | System Behavior |
|---|---|---|

User Flow 只描述：

- Happy Path
- 主流程
- 影响流程方向的关键 Decision

不负责穷举所有状态组合。

---

## 1.8 复杂逻辑必须结构化表达

当一个系统行为受到多个条件影响时，不应主要依赖自然语言描述。

优先使用：

- Decision Table
- State Transition Table
- Given / When / Then
- Flow Chart
- Swimlane
- Mermaid

例如：

不要写：

> 当 Experiment 没有被标记为 Retest，并且用户没有完成所有 Episode，同时不存在 Episode Retest 时，Submit 按钮保持 Disabled。

应该写：

| Experiment Retest | Episode Completed | Episode Retest | Submit |
|---|---|---|---|
| No | 19/20 | No | Disabled |

---

# 2. 功能资产库与强制输入源

## 2.1 功能资产库结构

```text
产品域
↓
业务对象
↓
功能
↓
功能点
```

---

## 2.2 权威输入源

创建或实质性更新 PRD 前，必须完整读取以下文件：

| 文件 | 权威职责 |
|---|---|
| `docs/standards/product-structure.md` | 产品平台、产品域、业务对象、模块归属、业务关系和编号规则 |
| `docs/standards/feature-list.xlsx` | 功能 ID、功能、功能点 ID、功能点、页面入口、适用角色及现有 PRD 关联 |

两份文件共同构成功能资产库的输入：

```text
product-structure.md
产品域 / 业务对象 / 模块归属

              +

feature-list.xlsx
功能 / 功能点 / ID / Role

              ↓

PRD Scope
```

PRD 不复制维护完整产品结构或功能清单，只引用与本次需求有关的已登记功能点。

---

## 2.3 读取与匹配顺序

必须按照以下顺序确定 PRD Scope：

1. 从需求中识别本次调整的用户目标、业务行为和产品能力。
2. 在 `product-structure.md` 中确定所属产品域、业务对象和模块归属。
3. 在 `feature-list.xlsx` 中查找对应的功能和功能点。
4. 使用 Excel 中的 `权限角色 Permission` 校验相关角色，但不得只依赖角色列判断 Scope。
5. 校验业务对象、功能 ID、功能点 ID 和名称之间的一致性。
6. 仅将匹配明确、已登记且确实受本次需求影响的功能点写入 Scope。

如果同一能力匹配到多个功能点、同一 ID 对应多个定义，或两份输入源相互冲突，不得自行选择或推测。应标记为 `TBD`，并在 PRD 的待确认事项中记录冲突。

---

# 3. 产品结构引用规则

产品域和业务对象的完整定义，以 `docs/standards/product-structure.md` 为唯一权威来源。

本规范不重复维护产品结构明细，避免产品结构调整后出现多份定义不一致。

生成 PRD 时：

- 使用产品结构中的名称确定 Domain 和 Business Object。
- 使用产品结构中的层级顺序组织 Scope。
- 不在 PRD 中创建产品结构文件尚未登记的新产品域或业务对象。
- 发现产品结构缺失时，按照本规范第 7.5 节处理。

---

# 4. 编号规范

## 4.1 功能编号

格式：

```text
业务对象编号-序号
```

例如：

```text
EXP-001 Create Experiment
EXP-002 Edit Experiment
```

---

## 4.2 功能点编号

格式：

```text
功能编号.序号
```

例如：

```text
EXP-001.1 Manual Create
EXP-001.2 Quick Create
EXP-001.3 Batch Create
```

---

## 4.3 PRD 编号

格式：

```text
PRD-001
PRD-002
PRD-003
```

PRD 与功能资产库解耦。

---

## 4.4 Functional Requirement 编号

格式：

```text
FR-001
FR-002
FR-003
```

FR 编号只在当前 PRD 内有效。

---

## 4.5 Acceptance Criteria 编号

Acceptance Criteria 挂靠对应 FR。

推荐格式：

```text
FR-001-AC-01
FR-001-AC-02
FR-002-AC-01
```

这样可以明确：

```text
Feature Point
↓
Functional Requirement
↓
Acceptance Criteria
```

之间的关系。

---

# 5. 标准 PRD 结构（强制）

所有 PRD 必须按照以下结构输出。

```text
1. Overview
2. Scope
3. User Story
4. User Flow
5. Feature List
6. Functional Requirement
7. Acceptance Criteria
8. States & Rules
9. Edge Cases
```

各部分职责：

| Section | 回答的问题 |
|---|---|
| Overview | 为什么做？ |
| Scope | 本次影响哪些产品能力？ |
| User Story | 谁希望完成什么？为什么？ |
| User Flow | 用户如何完成任务？系统如何响应？ |
| Feature List | 本次包含哪些 FR？ |
| Functional Requirement | 系统需要提供什么能力？ |
| Acceptance Criteria | 什么情况下可以认为功能实现正确？ |
| States & Rules | 系统长期遵循什么状态和规则？ |
| Edge Cases | 非正常情况下系统如何处理？ |

整体逻辑：

```text
WHY
Overview

↓

WHO / WANT / WHY
User Story

↓

HOW
User Flow

↓

WHAT
Functional Requirement

↓

WHEN / EXPECTED RESULT
Acceptance Criteria

↓

SYSTEM LOGIC
States & Rules

↓

EXCEPTION
Edge Cases
```

---

# 6. Overview

## 6.1 Background

描述：

- 当前产品背景
- 当前存在的问题
- 为什么需要本次需求

避免直接进入 UI Solution。

---

## 6.2 Goal

描述本次 PRD 希望实现的目标。

建议控制在 1–3 条。

例如：

- Reduce experiment configuration effort.
- Allow annotators to complete annotation without leaving the current context.
- Improve visibility of annotation progress.

---

## 6.3 Business Value

描述需求对业务、运营或用户效率产生的价值。

例如：

- 减少实验创建时间
- 降低人工配置成本
- 减少标注操作中断
- 提升实验处理效率

---

# 7. Scope

## 7.1 Scope 的职责

Scope 回答：

> 本次 PRD 影响功能资产库中的哪些产品能力？

Scope 只引用功能资产库中已经登记的 Feature Point。

Scope 不负责描述具体改动方案。字段、UI、Interaction、State、Rule 和 Acceptance Criteria 应进入后续对应章节。

---

## 7.2 Scope 推导规则

每一条 Scope 记录必须同时满足：

1. 业务对象可在 `product-structure.md` 中定位。
2. 功能和功能点可在 `feature-list.xlsx` 中定位。
3. 功能点确实受到本次需求影响，而不只是与需求主题相似。
4. 功能 ID、功能点 ID、功能名称和功能点名称能够形成唯一匹配。

新增需求应优先判断是否属于已有 Feature Point 的能力扩展。只有形成独立、长期存在且可以单独管理的产品能力时，才提出新增 Feature Point。

Scope 行按照 `product-structure.md` 中的产品层级顺序排列；同一业务对象内按照功能 ID、功能点 ID 排列。

---

## 7.3 Scope 输出格式

Scope 固定使用以下四列，不增加 UI、状态或规则字段：

例如：

| 功能 ID | 功能 | 功能点 ID | 功能点 |
|---|---|---|---|
| EXP-001 | Create Experiment | EXP-001.2 | Quick Create |

表格中的名称和 ID 必须与 `feature-list.xlsx` 保持一致，不得在 PRD 中自行改写。

---

## 7.4 Role 的使用规则

`feature-list.xlsx` 中的角色信息用于辅助判断相关用户和校验功能参与关系，但不是 Scope 的唯一筛选条件。

以下能力仍可能属于 PRD Scope：

- 由系统自动触发、但影响目标角色结果的功能点。
- 由上游角色操作、但改变目标角色流程或状态的功能点。
- 跨角色共享流程中的功能点。

角色是否拥有操作权限，以正式权限文档为准。Excel 角色列与正式权限定义不一致时，应记录冲突，不得在 PRD 中自行决定权限。

---

## 7.5 未登记功能和新增模块

当需求无法匹配现有功能资产时，先判断：

| 情况 | 处理方式 |
|---|---|
| 已有 Feature Point 的能力扩展 | 复用已有 Feature Point，不新增 ID |
| 已有业务对象下产生独立、长期能力 | 提出新增 Feature Point，由产品负责人确认后登记到 `feature-list.xlsx` |
| 新增业务对象或产品模块 | 先由产品负责人确认并更新 `product-structure.md`，再登记对应功能和功能点 |

在功能资产正式登记前：

- 不得自行生成正式功能 ID 或功能点 ID。
- 不得将未登记能力混入正式 Scope 表格。
- Draft 或 Under Discussion PRD 可在 Scope 表格后增加“待登记功能资产”，但必须明确它不属于已确认 Scope。

推荐格式：

| 建议归属 | 建议功能 / 功能点 | 未匹配原因 | 状态 |
|---|---|---|---|
| TBD | TBD | 功能资产库中无唯一匹配 | Pending Confirmation |

确认并完成产品结构或功能清单登记后，必须重新生成 Scope，并移除临时 `TBD` 记录。

---

## 7.6 一致性校验

输出 Scope 前必须检查：

- 每个业务对象都存在于 `product-structure.md`。
- 每个功能 ID 在功能资产库中只有一个定义。
- 每个功能点 ID 在功能资产库中只有一个定义。
- 功能点 ID 以前缀关联正确的功能 ID。
- Scope 中的功能名称和功能点名称与 Excel 原文一致。
- 角色名称使用项目正式角色定义。
- 不存在一个 ID 对应多个业务对象、功能或功能点的情况。

发现校验失败时：

1. 输出无冲突、可以确认的 Scope 记录。
2. 将冲突项标记为 `TBD`，并说明冲突来源。
3. 不自动修改 `product-structure.md` 或 `feature-list.xlsx`。
4. 等待产品负责人确认并更新功能资产库后，再生成最终 Scope。

---

## 7.7 Scope 内容边界

Scope 不描述：

- UI
- 字段
- Interaction
- State
- Rule
- Acceptance Criteria

---

# 8. User Story

## 8.1 标准格式

```text
作为 [Role]，

我希望 [Goal]，

从而 [Value]。
```

例如：

> 作为 Experiment Manager，
>
> 我希望快速创建实验，
>
> 从而减少实验配置成本并提升实验创建效率。

---

## 8.2 User Story 编写规则

User Story 只表达：

```text
Role
+
Goal
+
Value
```

禁止在 User Story 中写：

- 完整流程
- UI 结构
- 字段规则
- Button State
- State Transition
- Business Rule
- Edge Case
- Acceptance Criteria

---

## 8.3 一个 PRD 可以包含多个 User Story

如果不同角色或不同用户目标明显不同，可以拆分多个 User Story。

例如：

### US-001

> 作为 Annotator，我希望在查看实验信息时直接完成 Annotation，从而减少页面切换。

### US-002

> 作为 Experiment Manager，我希望查看 Annotation Progress，从而了解当前实验的标注进度。

不要因为存在不同 Case 而拆 User Story。

只有：

- Role 不同
- Goal 明显不同
- User Value 明显不同

时才考虑拆分。

---

# 9. User Flow

User Flow 用于描述：

> 用户如何完成任务，以及过程中系统如何响应。

完整 User Flow 必须包含：

1. Flow Diagram
2. Flow Description

---

## 9.1 Flow Diagram

Flow Diagram 用于快速展示主流程。

应该包含：

- Entry Point
- User Action
- Major System Response
- Key Decision Point
- End State

例如：

```text
Open Experiment
      ↓
View Configuration / Results / Episode Detail
      ↓
Open Annotation Widget
      ↓
Review Experiment
      ↓
Need Retest?
   ↙        ↘
 Yes         No
 ↓            ↓
Mark Retest   Annotate Episodes
 ↓            ↓
Submit     Complete Episodes
              ↓
            Submit
```

---

## 9.2 Flow Description

Flow Diagram 下方必须使用文字描述主流程。

推荐使用：

| Step | User Action | System Behavior |
|---|---|---|
| 1 | Annotator 进入 Experiment Configuration、Results 或 Episode Detail | 系统提供 Annotation Widget 入口 |
| 2 | 用户打开 Annotation Widget | 系统展示当前 Experiment 的 Annotation 状态和 Episode Progress |
| 3 | 用户判断 Experiment 是否需要 Retest | 系统记录用户的 Retest Decision |
| 4 | 如果 Experiment 不需要 Retest，用户开始 Episode Annotation | 系统记录 Episode Annotation Result |
| 5 | 用户继续完成 Episode Annotation | 系统实时更新 Annotation Progress |
| 6 | 满足 Submit 条件后用户点击 Submit | 系统提交 Annotation 并更新 Annotation 状态 |

Flow Description 重点描述：

```text
User Action
→
System Behavior
```

---

## 9.3 User Flow 描述到什么程度

User Flow 应描述：

- 用户主要操作
- 系统主要反馈
- 页面 / 功能之间的切换
- 关键 Decision Point
- 主要成功路径

User Flow 不需要描述：

- 所有 Button Enabled / Disabled 组合
- 所有 Permission Case
- 所有 State Combination
- Loading / Network Error
- Save Failed
- Delete Failed
- 所有边界条件

例如：

可以写：

> 用户完成 Episode Annotation，系统更新 Annotation Progress。

不要在 Flow 中继续展开：

> 如果完成 19/20，则 Submit Disabled；如果完成 20/20，则 Submit Enabled；如果其中一个 Episode 为 Retest，则……

这些属于 Acceptance Criteria。

---

## 9.4 Branch Flow

只有当一个 Decision 会明显改变用户后续流程时，才应该出现在 Flow Diagram 中。

例如：

```text
Need Retest?
   ↙       ↘
 Yes        No
 ↓           ↓
Submit    Annotate Episodes
```

如果只是：

```text
Submit Enabled
Submit Disabled
```

通常不需要增加 Flow Branch。

应进入 Acceptance Criteria。

---

## 9.5 Flow 与 Rule 的边界

判断方法：

### 描述「接下来发生什么」

→ User Flow

例如：

> 用户打开 Widget 后开始 Episode Annotation。

### 描述「什么条件下发生」

→ Acceptance Criteria / Rule

例如：

> 所有 Episode 完成后 Submit Enabled。

---

# 10. Feature List

Feature List 用于列出本次 PRD 包含哪些 Functional Requirement。

例如：

| FR 编号 | 功能需求 |
|---|---|
| FR-001 | Task Type Selection |
| FR-002 | Asset Configuration |
| FR-003 | Combination Calculation |
| FR-004 | Experiment Preview |
| FR-005 | Experiment Creation |

Feature List 仅作为目录。

不描述：

- 详细功能
- State
- Rule
- Case

---

# 11. Functional Requirement

每个 FR 单独展开。

Functional Requirement 回答：

> 系统需要提供什么能力？

---

## 11.1 标准结构

推荐：

```text
## FR-XXX Feature Name

### 功能说明

### Entry / Trigger（如适用）

### UI / Interaction（如适用）

### Fields（如适用）

### Data / Content（如适用）
```

不要求所有 FR 都必须包含所有小节。

根据功能类型选择需要的部分。

---

## 11.2 示例：Task Type Selection

### FR-001 Task Type Selection

#### 功能说明

用户可选择 Task Type。

#### 字段

| 字段 | 类型 | 必填 |
|---|---|---|
| Task Type | Select | 是 |

---

## 11.3 示例：Asset Configuration

### FR-002 Asset Configuration

#### 功能说明

用户配置 Robot、Object、Background 与 Policy。

#### 字段规则

| 字段 | 类型 | 必填 |
|---|---|---|
| Robot | Multi Select | 是 |
| Object | Multi Select | 是 |
| Background | Multi Select | 是 |
| Policy | Multi Select | 是 |

---

## 11.4 示例：Combination Calculation

### FR-003 Combination Calculation

#### 功能说明

系统根据配置自动生成实验组合。

#### 组合方式

| 类型 | 说明 |
|---|---|
| Single | 每个选项独立参与组合 |
| Group | 多个选项作为一个整体参与组合 |

具体组合逻辑如果属于长期业务规则，可以进入 Business Rule。

---

# 12. Acceptance Criteria

Acceptance Criteria 用于定义：

> 在具体条件下，系统应该产生什么结果。

以及：

> 什么情况下可以认为 Functional Requirement 实现正确。

Acceptance Criteria 是覆盖不同业务 Case 的主要位置。

---

## 12.1 每个重要 FR 应有 Acceptance Criteria

关系：

```text
FR-001
├── FR-001-AC-01
├── FR-001-AC-02
└── FR-001-AC-03
```

不是所有简单展示型 FR 都必须机械地产生大量 AC。

但以下情况必须明确 AC：

- 存在不同结果
- 存在条件判断
- 存在 Enabled / Disabled
- 存在状态变化
- 存在权限差异
- 存在业务判断
- 存在多个输入条件影响结果

---

## 12.2 简单 Case 使用 Given / When / Then

适用于：

- 单一条件
- 单一操作
- 单一结果

格式：

```text
Given [前置条件]

When [用户操作 / 系统事件]

Then [预期结果]
```

例如：

### FR-005-AC-01

```text
Given 所有 Episode 已完成 Annotation

When 用户查看 Annotation Widget

Then Submit 按钮为 Enabled
```

---

### FR-005-AC-02

```text
Given 存在未完成 Annotation 的 Episode
And Experiment 未被标记为 Need Retest

When 用户查看 Annotation Widget

Then Submit 按钮为 Disabled
```

---

# 13. Decision Table

当一个结果受到多个条件影响时，优先使用 Decision Table。

不要写大量：

```text
If...
If...
If...
If...
```

---

## 13.1 示例：Annotation Progress / Submit

| Experiment Retest | Episode 完成情况 | 是否存在 Episode Retest | Annotation Progress | Submit |
|---|---|---|---|---|
| Yes | Any | Any
