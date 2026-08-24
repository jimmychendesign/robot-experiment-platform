# Robot Experiment Platform

RobotOps 是一个面向实验管理员、实验需求方和实验员的机器人实验运营控制台原型，用于集中管理实验需求、Robot 资源、Tester 分配、排期与执行状态。

## Features

- 三类角色控制台与角色切换
- 实验需求创建、审核、组合配置和状态跟踪
- Robot 容量、排期、停用时段与冲突管理
- Tester 任务、Break、请假与替补分配模拟
- 基于本地 mock 数据的交互式业务流程
- Token 驱动的本地设计系统与响应式界面

## Tech Stack

- React 19 + TypeScript
- vinext / Vite
- Radix UI primitives + Lucide icons
- CSS design tokens
- Cloudflare Workers / OpenAI Sites runtime
- Optional Drizzle ORM + D1 scaffold

## Project Structure

```text
Robot Experiment Platform/
├── app/                    # Active application source
│   └── design-system/      # Components, tokens, and product styling
├── public/                 # Browser-served static assets
├── db/                     # Optional Drizzle data layer
├── worker/                 # Cloudflare worker entry
├── tests/                  # Build/render verification
├── docs/                   # Architecture, design, research, and durable notes
├── prompts/                # Reusable project prompts
├── sessions/               # Date-based work records
├── assets/                 # Source/reference assets
├── output/                 # Versioned deliverables and captures
├── PROJECT.md              # Product status and release history
└── AGENTS.md               # AI development and release rules
```

## Getting Started

Prerequisite: Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

Useful checks:

```bash
npm run typecheck
npm run lint
npm test
```

Build a Portable Release into a new version folder:

```bash
ROBOTOPS_PORTABLE_OUT=output/html/YYYY-MM-DD_vX.Y.Z npm run build:portable
```

The portable build is a browser-only bundle. Copy `tools/portable/serve.mjs` into the release folder, add `VERSION.md`, and validate the exact delivered folder in a real browser before marking the release complete.

Run `npm run bootstrap` to recreate any missing template directories and today's session files without overwriting existing content.

## Workflow

1. Read `AGENTS.md` and `PROJECT.md`.
2. Review `docs/design.md` before UI work.
3. Work in the active source under `app/`.
4. Record material work in `sessions/YYYY-MM-DD/`.
5. Create an `output/html/` release only when explicitly requested.

## Release

- `发布当前版本`: create a portable, versioned interactive build.
- `发布 Single HTML`: create a standalone single-file build when technically feasible.

Release paths, versioning, notes, and verification requirements are defined in `AGENTS.md`.

## Authentication and Persistence

`app/chatgpt-auth.ts` contains optional ChatGPT sign-in helpers. The prototype can remain anonymous; protected routes should use server-side identity checks and the hosting platform's access controls. The primary product flows currently use in-memory mock data. Optional D1/Drizzle scaffolding is available under `db/` and `examples/d1/`.

## License

No license has been specified.
