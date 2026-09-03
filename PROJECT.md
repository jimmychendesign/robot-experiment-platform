# Robot Experiment Platform

## Project Information

**Project Name:** RobotOps · 实验运营控制台

**Goal:** 为实验管理员、实验需求方和实验员提供统一的机器人实验需求管理、资源排期、执行协作与状态跟踪原型。

## Current Status

- Stage: Interactive prototype / active development
- Progress: Core multi-role console and scheduling flows implemented with local mock data
- Last Updated: 2026-09-02
- Latest Release: v0.3.0 (`output/html/2026-08-28_v0.3.0/`)
- Latest Release Type: Portable Build

## Tech Stack

- Framework: React 19 + vinext (Next.js-compatible app router)
- Language: TypeScript
- UI Library: Local design system with Radix UI primitives and Lucide icons
- Styling: CSS design tokens and component styles
- Build Tool: Vite / vinext
- Runtime / Hosting: Cloudflare Workers / OpenAI Sites
- Package Manager: npm
- Optional Data Layer: Drizzle ORM + Cloudflare D1

## Development Model

The active application source lives in `app/`. Historical shareable releases live under `output/html/`. Normal development changes do not automatically create releases.

## Product Areas

- 管理员控制台：四列响应式 Robot 卡片、批量与单机共用的时间配置、在线/暂停/维护设置、排期派生运行状态、容量与设备独立排期；Tester 排班在实验员管理中独立处理；需求详情按状态提供创建、验证、问题分类、修复、重新验证和测试完成操作。
- 需求方控制台：实验需求手动创建与 Excel 批量导入、待处理阶段的完整回填修改与二次确认删除、后续阶段取消与完成结果确认，以及包含待确认、已完成和已取消的宏观进度筛选。
- 实验员控制台：当日任务、执行状态、Break/请假与任务详情。
- 共享体验：角色切换、筛选、Drawer/Modal、状态与冲突反馈。
- 双语体验：顶部可在中文与英文之间切换，并在当前浏览器保留语言偏好。

## Architecture Notes

- The prototype is client-state driven; its business data is mock data defined in the application source.
- `app/design-system/axis.css` owns foundational tokens; `platform.css` implements the product shell and components.
- `db/` and `worker/` are prepared for persistence and Cloudflare runtime integration but are not required for current mock flows.
- Authentication helpers exist in `app/chatgpt-auth.ts`; the main prototype remains anonymous-compatible.

## Release Commands

- `发布当前版本` → `output/html/YYYY-MM-DD_vX.Y.Z/`
- `发布 Single HTML` → `output/html/YYYY-MM-DD_vX.Y.Z-single.html`

Use semantic versioning. Start with `v0.1.0`, and never overwrite a historical release. See `AGENTS.md` for the complete release contract.

## Release History

| Version | Date | Type | Summary |
|---|---|---|---|
| v0.3.0 | 2026-08-28 | Portable Build | Complete requester/manager Requirement Detail actions, validation/repair loops, and retained cancellation state |
| v0.2.0 | 2026-08-26 | Portable Build | Unified Requirement workflow/status and Excel batch request intake |
| v0.1.2 | 2026-08-21 | Portable Build | Tester workday queue and manager leave-approval UX refinements |
| v0.1.1 | 2026-08-21 | Portable Build | Corrected browser-only bundle; browser-validated role switching and key interactions |
| v0.1.0 | 2026-08-21 | Portable Build | Superseded: initial SSR shell did not reliably preserve client interaction |

## Prototype / Interaction Notes

- Navigation: Multi-role console navigation and view switching.
- Filters: Resource and schedule views include local filtering/selection behavior.
- Modals / Drawers: Used for request, robot, experiment, and operational detail flows.
- Forms: Prototype forms update in-memory client state.
- Client-side state: Resets on page reload.
- Mock data: Robot, tester, request, experiment, schedule, leave, and break data are simulated.
- Simulated backend behavior: Scheduling, assignment, conflict handling, and status transitions are front-end simulations.
- Request intake: Request submission creates a pending request; requester editing and confirm-delete are allowed until manager processing locks it. Later active stages expose cancellation without deleting linked records.
- Manager validation: Manager-triggered creation/linking, retry, initial validation, Policy/JSON issue routing, repair completion, re-validation, and pass-to-Test-Execution transitions are simulated in the request detail drawer.
- Request detail Stepper: Fixed six-stage flow with a separate current Status line; DEBUG, re-export, and re-validation remain within Request Validation.
- Request notifications: Requirement Detail keeps a lifecycle timeline; the global Header provides role-scoped notifications with unread counts, read state, mark-all-read, and direct access to permitted request details. Notification state is currently in-memory.
- Requester list status: “我的需求” derives macro Requirement Status values from the internal workflow, including 已取消; granular Stage and Status remain in request detail.
- Cross-role request status: Manager and requester Requirement lists call the same mapping and display identical macro status for the same Requirement.
- Excel request intake: The requester can download the current form-aligned `.xlsx` template, upload up to 200 rows, validate atomically, and create Pending Requirements in client state.
- Product requirements: `docs/prd/README.md` is the PRD Registry; PRD-004 through PRD-006 are the current requester, manager, and Tester requirements under `docs/prd/active/`. PRD-001 through PRD-003 are superseded archives, and the shared scheduling contract lives under `docs/prd/shared/`.

## Known Issues

- No persistent backend is connected to the primary prototype flows.
- Browser refresh resets in-memory changes.

## TODO

- [ ] Validate the complete multi-role workflow with representative users.
- [ ] Decide which prototype entities require persistent storage.
- [x] Create the first portable release when explicitly requested.

## Notes

Keep this file current after material product, architecture, or release changes.
