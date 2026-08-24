# Session — 2026-08-24

## User Request

根据当前项目实现和两份外部 Markdown 参考，将实验调度业务拆成实验需求方、实验管理者和实验员三份相互连通的 PRD。

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

## Files Changed

- `docs/prd.md`
- `docs/prd/PRD-001-experiment-requester.md`
- `docs/prd/PRD-002-experiment-manager.md`
- `docs/prd/PRD-003-tester.md`
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

## Open Questions

- 同优先级实验的稳定排序规则。
- 正式 Robot 操作资格数据模型和维护入口。
- 组合内多资源作为整体时的执行数据结构。
- 通知、审计、持久化、并发和失败恢复策略。
