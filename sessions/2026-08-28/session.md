# Session — 2026-08-28

## User Request

更新 PRD-004，在 Background 下增加“实验全生命周期管理总览”，一比一还原参考图中的所有信息，不遗漏任何内容。

Follow-up：根据五张连续截图完整更新 PRD-004 的 FR-001，按从上到下顺序写入全部内容。

Follow-up：根据 FR-001 补齐 4.1 和 4.2 在“查看测试与执行进度”之后的生命周期流程，并且只展示实验需求方视角。

Follow-up：根据 PRD-004 FR-001 的实验需求方与实验管理员流程，调整两个角色在实验需求详情中的状态化操作。

Follow-up：发布当前版本。

## Context

- PRD-004 已存在一版经过角色和状态术语归一化的生命周期摘要。
- 参考图包含六个阶段、具体责任人、主要操作 / 判断、状态、Policy / Model 与 JSON / 实验配置分支、重新验证循环、审核驳回重测循环和图例。
- 用户明确要求保留原图全部信息，因此本次不做姓名或状态术语归一化。

## Confirmed Decisions

- 在 PRD-004 Background 下以 Mermaid、原图信息逐项对照表、问题类型与循环路径表、图例表完整保存参考图信息。
- 保留 Freddy Fu、Niko Ni、Felix Yuan、Agumon Cui、Zeyu Pan、Victor Tao 和“审核人员”“需求人”“系统”等原始责任人标注。
- 保留“待实验 / 实验中 / 完成交付”等原图阶段和状态术语，不用项目标准术语替换。
- 本总览是参考图转录，不据此新增角色权限或改写其他章节的既有状态契约。
- FR-001 按源图顺序包含聚合状态、详情 Stepper、实验需求方流程、实验管理员方流程和 Edge Case。
- 保留源图中的具体负责人、CTA、Experiment / Annotation 英文状态条件和流转文案；带删除线的旧文案不作为有效需求写入。
- 保留 4.1 / 4.2 现有需求提交与实验创建内容，并从进度查看节点继续补充验证、修复、重新验证、测试、审核、重测、完成与取消路径。
- 后续流程只描述需求方的查看、等待、跟踪、取消和查看最终交付行为；其他角色的处理仅作为系统状态变化呈现，不展开其内部操作流程。
- 需求方待处理详情提供“修改需求 / 删除需求”，删除需二次确认；后续支持的活动阶段提供独立“取消需求”，取消不删除已有记录。
- 管理员详情按状态提供“开始处理 → 关联创建实验 → 开始验证 → 通过 / 不通过 → Policy 修复完成 / DEBUG 完成 → 重新验证”。
- 验证不通过必须选择 Policy 问题或 JSON 问题，可填写补充说明；修复与重新验证不新增 Stepper 节点。
- 本次实现正式替代 2026-08-26 的临时“确认需求直接进入测试执行”决策。
- 当前功能级更新发布为新的可移植版本 v0.3.0，不覆盖历史版本。

## Files Changed

- `docs/prd/active/PRD-004-experiment-requester.md`
- `docs/changelog.md`
- `sessions/2026-08-28/`
- `app/page.tsx`
- `app/i18n.ts`
- `app/design-system/platform.css`
- `PROJECT.md`
- `docs/prd/active/PRD-005-experiment-manager.md`
- `docs/prd/shared/scheduling-contract.md`
- `docs/prd/README.md`
- `docs/feature-list.md`
- `docs/user-flow.md`
- `docs/business-rules.md`
- `docs/roles-permissions.md`
- `docs/states.md`
- `docs/decisions.md`
- `output/html/2026-08-28_v0.3.0/`

## Validation

- PRD-004 retains all nine required sections and balanced Markdown fences.
- The lifecycle overview covers every source-image owner, action/judgment node, status node, transition result, branch, loop, and legend item.
- FR-001 includes every visible active row from all five supplied screenshots, including the cancelled aggregate state and both role-specific CTA matrices.
- User Flow 4.1 and 4.2 now cover the full post-creation lifecycle and reuse FR-001's Experiment/Annotation-derived state conditions.
- Flow Description uses one continuous Step 1–26 sequence with no duplicated legacy rows.
- Existing formal Scope rows were rechecked against `docs/standards/feature-list.xlsx`; all four remain unique exact matches.
- Related local links resolve and whitespace checks pass.
- Application tests were not run because this update changes documentation only.
- `npm run typecheck` passed.
- `npm run lint` passed.
- `npm test` passed, including the vinext production build and 2 rendered HTML tests.
- Browser validation covered requester edit/delete visibility, delete confirmation, later-stage cancellation confirmation, manager creation/validation actions, JSON failure routing, DEBUG completion, re-validation, and pass-to-Test-Execution; no browser console errors were observed.
- Portable v0.3.0 build completed; source typecheck, lint, production build, and 2 rendered HTML tests passed before release validation.
- The exact v0.3.0 delivery folder hydrated in a real browser; requester role switching, cancelled filtering, pending edit/delete actions, and manager processing → creation → validation result actions were verified with no browser JavaScript errors.

## Open Questions

- 图中姓名、角色称呼和状态术语是否需要正式纳入权限与状态契约，仍需后续单独确认；本次只忠实转录参考图。
- 取消后已创建或执行中 Experiment 的处置、资源释放、生产通知与审计规则仍为 TBD；当前原型仅保留记录并标记“已取消”。
