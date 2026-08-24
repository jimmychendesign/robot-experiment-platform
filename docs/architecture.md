# Architecture

## Runtime Shape

RobotOps is a React 19 application using the vinext compatibility layer and Vite. The app-router source is under `app/`; production output is generated in `dist/` and served through the Cloudflare worker runtime.

## Front End

- `app/layout.tsx`: document metadata and global stylesheet entry points.
- `app/page.tsx`: current multi-role prototype, mock domain data, and client-side workflows.
- `app/design-system/index.tsx`: reusable UI component adapter.
- `app/design-system/axis.css`: primitive and semantic design tokens.
- `app/design-system/platform.css`: RobotOps layout and component implementation.
- `app/globals.css`: global reset and base behavior.

## Data and State

The current experience is a front-end prototype. Requests, experiments, robots, testers, schedules, leave requests, and operational actions are stored in memory and reset on reload.

`db/`, `drizzle/`, and `drizzle.config.ts` provide an optional Drizzle/D1 path for future persistence. `worker/` contains the Cloudflare runtime entry. Do not imply persistence until the main flows are connected to these layers.

## Authentication

`app/chatgpt-auth.ts` exposes helpers for optional or required ChatGPT sign-in. Identity headers must be treated as optional on public pages. Protected pages and writes require server-side checks; identity alone does not prove workspace membership.

## Hosting

`.openai/hosting.json` declares the OpenAI Sites project and optional bindings. Generated build/runtime folders are ignored and are not source of truth.

## Verification

- `npm run typecheck`: TypeScript correctness.
- `npm run lint`: static analysis and accessibility-oriented linting for authored source; generated `dist/`, `.next/`, and `output/` artifacts are excluded.
- `npm test`: production build plus server-rendered shell and token-system assertions.

## Release Architecture

Development output and historical releases are separate. `dist/` is disposable build output; `output/html/` stores explicit, versioned, shareable releases.

Portable Releases use `vite.portable.config.ts` and `tools/portable/entry.tsx` to mount the client application directly as a browser-only bundle. This avoids treating a vinext/RSC server-rendered shell as a functional static release. The delivered folder includes `serve.mjs`, which uses only the Node.js standard library and does not require the original repository or `node_modules`.

Every delivered Portable Release must be tested from its own version folder in a real browser. See `AGENTS.md` for the complete contract.
