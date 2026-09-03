# 实验平台产品架构总览

> 来源：`实验平台产品架构总览 (2).pdf`
>
> 本 Markdown 将 PDF
> 中的正文、表格、思维导图和业务关系图转换为机器可读取的结构。图形关系使用
> Mermaid 表达；原文中不可见或未填写的内容不做补充。

## 1. 文档目的

本文档用于统一管理实验平台的产品架构、模块归属、功能资产及编号规范。

-   为 PRD、开发任务、测试用例提供统一引用来源

------------------------------------------------------------------------

## 2. 产品架构总览

### 2.1 产品架构思维导图

``` mermaid
mindmap
  root((实验平台))
    Experiment Management
      Experiment
      Annotation
      Annotation Review
      Experiment Schedule
      Flagged Annotation
    Task Management
      Task
      Task Type
    Asset Management
      Robot
      Robot Type
      Object
      Object Set
      Background
      Background Type
      Policy
      Policy Type
    Reporting
      Sim Report
      Sim2Real Report
      Leaderboard
    Data Analytics
      Analytics
    Tag Management
      Tags
    System Configuration
      User Management
      Role Management
      Profile Management
```

### 2.2 产品架构层级表

  平台       产品域 / 模块           业务对象 / 功能
  ---------- ----------------------- ---------------------
  实验平台   Experiment Management   Experiment
  实验平台   Experiment Management   Annotation
  实验平台   Experiment Management   Annotation Review
  实验平台   Experiment Management   Experiment Schedule
  实验平台   Experiment Management   Flagged Annotation
  实验平台   Task Management         Task
  实验平台   Task Management         Task Type
  实验平台   Asset Management        Robot
  实验平台   Asset Management        Robot Type
  实验平台   Asset Management        Object
  实验平台   Asset Management        Object Set
  实验平台   Asset Management        Background
  实验平台   Asset Management        Background Type
  实验平台   Asset Management        Policy
  实验平台   Asset Management        Policy Type
  实验平台   Reporting               Sim Report
  实验平台   Reporting               Sim2Real Report
  实验平台   Reporting               Leaderboard
  实验平台   Data Analytics          Analytics
  实验平台   Tag Management          Tags
  实验平台   System Configuration    User Management
  实验平台   System Configuration    Role Management
  实验平台   System Configuration    Profile Management

------------------------------------------------------------------------

## 3. 业务对象目录

  ------------------------------------------------------------------------
  业务对象          中文名称          说明               定义 / 流程
  ----------------- ----------------- ------------------ -----------------
  Experiment        实验管理          实验生命周期管理   

  Annotation        实验标注          实验结果审核       认领 → 执行 →
                                                         提交 → 查看结果

  Annotation Review 标注审核          标注结果修正       修改实验结果 →
                                                         修改标注结果 →
                                                         ...

  Experiment        实验调度          实验资源调度       
  Schedule                                               

  Flagged           异常标注          风险实验识别       发现问题 →
  Annotation                                             定位问题 →
                                                         快速进...

  Task              任务管理          实验任务定义       

  Task Type         任务模板          实验结构模板       

  Robot             机器人资源        实验机器人资产     

  Object            物体资源          实验物体资产       

  Object Set        物体集合          多物体组合         

  Background        场景资源          背景资产           

  Background Type   场景模板          背景定义           

  Policy            策略资源          测试策略           

  Policy Type       策略模板          策略分类           

  Report            报告              实验结果报告       

  DataAnalytics     数据分析          数据统计分析       

  Leaderboard       排行榜            实验数据排行榜     

  Tag               标签管理          标签体系           

  User              用户管理          用户账户           

  Role              角色管理          RBAC 角色          

  Permission        权限管理          权限控制           
  ------------------------------------------------------------------------

> 注：PDF 页面中 `Annotation Review` 与 `Flagged Annotation`
> 的"定义/流程"右侧内容被页面边界截断，因此这里只保留可见内容，不推测缺失文字。

------------------------------------------------------------------------

## 4. 业务对象关系

### 4.1 主流程关系图

``` mermaid
flowchart LR
    TT[Task Type] --> T[Task]
    T --> E[Experiment]
    E --> Tester((Tester))
    Tester --> ER[Experiment Result]
    ER --> A[Annotation]
    A -.-> Analytics[Analytics]

    E -.关联.-> Assets["Robot<br/>Object<br/>Background<br/>Policy"]
    A -.关联.-> AnnotationRelated["Annotation Review<br/>Flagged Annotation<br/>Report"]
```

### 4.2 关系说明

  -----------------------------------------------------------------------
  上游对象                 关系                    下游对象
  ----------------------- ----------------------- -----------------------
  Task Type               定义 / 产生             Task

  Task                    产生                    Experiment

  Experiment              分配 / 执行             Tester

  Tester                  产生                    Experiment Result

  Experiment Result       进入                    Annotation

  Annotation              数据进入                Analytics

  Experiment              关联实验资源            Robot / Object /
                                                  Background / Policy

  Annotation              关联后续处理            Annotation Review /
                                                  Flagged Annotation /
                                                  Report
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 5. 功能编号规范

### 5.1 产品域编号

  编号    产品域
  ------ -----------------------
  EXP    Experiment Management
  TSK    Task Management
  ROB    Robot Management
  OBJ    Object Management
  BKG    Background Management
  POL    Policy Management
  RPT    Reporting
  ANA    Analytics
  LDB    Leaderboard
  TAG    Tag Management
  SYS    System Configuration

### 5.2 功能编号

格式：

``` text
模块编号-序号
```

示例：

``` text
EXP-001
```

### 5.3 功能点编号

格式：

``` text
功能编号.序号
```

示例：

``` text
EXP-001.1
```

------------------------------------------------------------------------

## 6. 功能管理

PDF 中本节显示：

-   实验平台功能清单

原 PDF 以链接/引用形式展示"实验平台功能清单"，当前 PDF
页面未包含该清单的具体内容，因此 Markdown 不补写未展示的数据。

------------------------------------------------------------------------

## 7. 状态命名规范

### 7.1 Experiment Status

实验状态用于管理实验执行生命周期。

#### 说明

-   实验由 Experiment Manager 创建
-   分配给 Tester
-   Tester 在外部系统执行实验
-   执行结果通过 API 回传本平台

#### 状态定义

  状态        说明
  ----------- ---------------
  Created     已创建
  Assigned    已分配 Tester
  Running     实验执行中
  Completed   实验完成
  Aborted     实验中止

#### 生命周期结构

``` mermaid
stateDiagram-v2
    [*] --> Created
    Created --> Assigned
    Assigned --> Running
    Running --> Completed
    Running --> Aborted
```

> 上述 Mermaid 按 PDF 中状态列表和文字说明结构化表达。PDF
> 本身未绘制明确的状态迁移箭头。

### 7.2 Annotation Status

标注状态用于管理标注实验执行生命周期。

#### 说明

-   仅 Completed 或 Aborted 的实验允许进入标注流程
-   标注中实验 1 小时内未完成，系统将重置标注状态至 Needs Review

#### 状态定义

  状态           说明
  -------------- ----------
  Needs Review   待认领
  In Progress    标注中
  Passed         标注完成
  Need Retest    需要重测

#### 状态结构

``` mermaid
stateDiagram-v2
    [*] --> NeedsReview
    NeedsReview --> InProgress
    InProgress --> Passed
    InProgress --> NeedRetest
    InProgress --> NeedsReview: 1小时内未完成
```

> `Completed / Aborted → Annotation`
> 是进入标注流程的前置条件。状态图中的主要迁移按 PDF
> 的流程说明进行结构化表达。

------------------------------------------------------------------------

## 8. 角色定义以及权限定义

### 8.1 角色定义

| 角色 | 中文名称 | 说明 |
|---|---|---|
| Admin | 系统管理员 | 系统管理 |
| Experiment Manager | 实验管理者 | 实验管理 |
| Experiment Maintainer | 实验维护者 | 实验维护 |
| Annotator Manager | 标注管理员 | 标注管理 |
| Annotator | 标注人员 | 标注执行 |
| Policy Manager | 策略管理员 | 策略管理 |
| Assets Manager | 资产管理员 | 资产管理 |
| Data Maintainer | 数据维护人员 | 管理 ES 平台数据、海外专线 |
| Experiment Requester | 实验需求员 | 提出实验需求并跟踪 Requirement 生命周期及最终测试结果 |
| Experiment Requirement Manager | 实验需求管理员 | 接收和处理 Requirement、创建/关联 Experiment，并完成最终测试交付确认 |
| Experiment Requirement Verifier | 实验需求验证员 | 验证 Requirement 对应 Experiment 的 Policy、Config、JSON 及实验环境是否满足正式测试条件 |
| Requirements Validation Engineer | 需求验证工程师 | 处理验证过程中的 JSON / 实验配置问题，并在修复后提交重新验证 |
| Tester | 实验员 | 执行正式实验以及相关实验结果处理 |

> `Experiment Requester`、`Experiment Requirement Manager`、
> `Experiment Requirement Verifier` 和 `Requirements Validation Engineer`
> 为新增正式 RBAC Role；`Tester` 为既有正式角色。详细职责和功能权限见
> `docs/roles-permissions.md`。

### 8.2 权限定义

  权限       说明
  ---------- ------------
  ANY        任意资源
  OWNER      创建人
  ASSIGNEE   当前处理人
  REVIEWER   审核人
  TEAM       所属团队
  NONE       无限制

------------------------------------------------------------------------

## 9. PRD 引用

  -----------------------------------------------------------------------
  业务对象            功能（产品域）      功能              功能点
  ----------------- ----------------- ----------------- -----------------
  Experiment        Experiment        EXP-001           EXP-001.2 Quick
                    Management                          Create

  -----------------------------------------------------------------------

### 引用层级

``` text
业务对象
└── 功能（产品域）
    └── 功能编号
        └── 功能点编号 + 功能点名称
```

示例：

``` text
Experiment
└── Experiment Management
    └── EXP-001
        └── EXP-001.2 Quick Create
```

------------------------------------------------------------------------

## 10. 版本记录

  版本   日期         说明
  ------ ------------ ----------------
  1      YYYY-MM-DD   初始化产品架构
