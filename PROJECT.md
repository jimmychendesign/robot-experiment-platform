# Robot Experiment Platform

## Project Information

**Project Name:** RobotOps · 实验运营控制台

**Goal:** 为实验管理员、实验需求方和实验员提供统一的机器人实验需求管理、资源排期、执行协作与状态跟踪原型。

## Current Status

- Stage: Interactive prototype / active development
- Progress: Core multi-role console and scheduling flows implemented with local mock data
- Last Updated: 2026-08-24
- Latest Release: v0.1.2 (`output/html/2026-08-21_v0.1.2/`)
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

- 管理员控制台：Robot 状态、容量、排期、Tester 分配与异常处理。
- 需求方控制台：实验需求创建、组合配置、审核与进度查看。
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
- Product requirements: The scheduling workflow is now specified in three connected role PRDs under `docs/prd/`, with `docs/prd.md` as the shared contract and index.

## Known Issues

- No persistent backend is connected to the primary prototype flows.
- Browser refresh resets in-memory changes.

## TODO

- [ ] Validate the complete multi-role workflow with representative users.
- [ ] Decide which prototype entities require persistent storage.
- [x] Create the first portable release when explicitly requested.

## Notes

Keep this file current after material product, architecture, or release changes.
