# AI Project Working Instructions

Follow these rules unless the user explicitly overrides them.

## Project Source of Truth

- `app/` is the active product source. This repository uses the vinext/Next.js app layout, so the template's generic `src/` directory is intentionally replaced by `app/`.
- `app/design-system/` contains reusable components and design tokens.
- `docs/design.md` is the visual specification.
- `PROJECT.md` records product status, architecture notes, and release history.
- Normal UI, copy, interaction, logic, and bug-fix requests update the active source only.
- Do not create a release unless the user explicitly asks for one.

## Development vs Release

`app/` is the active development version for this project. Normal requests update current source only. Do not create a new release after every change; create one only when the user explicitly asks to publish or export a version.

## Start-of-Work Checklist

1. Read `AGENTS.md` and `PROJECT.md`.
2. Inspect the current git status and preserve unrelated user changes.
3. Review `docs/design.md` before changing UI or styling.
4. Record material work in `sessions/YYYY-MM-DD/`.
5. Keep secrets, credentials, and private tokens out of source and releases.

## Development Verification

Use the smallest relevant checks, then run the full checks when practical:

```bash
npm run typecheck
npm run lint
npm test
```

`npm test` includes a production build. Do not treat generated directories such as `dist/`, `.next/`, `.vinext/`, or `.wrangler/` as authored source.

## Release Command 1 — Portable Release

When the user says `发布当前版本`, `Release current version`, or `输出新版本到 output`, create a new release under:

```text
output/html/YYYY-MM-DD_vX.Y.Z/
├── index.html
├── assets/
└── VERSION.md
```

This is the default release type. It must be a portable, shareable, runnable web build that preserves implemented UI and interactions. It may contain multiple files.

## Portable Release Requirements

Portable releases must:

- be built from the current source;
- use a new version folder and never overwrite history;
- contain required JavaScript, CSS, images, icons, fonts, and mock data locally where practical;
- use relative asset paths;
- avoid dependencies on `app/`, `node_modules/`, localhost-only services, or the original repository;
- prefer direct opening of `index.html` when technically possible;
- document the minimum local-server command in `VERSION.md` if direct opening is not supported.

## Release Command 2 — Single HTML Release

When the user says `发布 Single HTML`, `发布当前版本为 Single HTML`, or `Release as Single HTML`, create:

```text
output/html/YYYY-MM-DD_vX.Y.Z-single.html
```

## Single HTML Requirements

Inline or embed CSS, JavaScript, mock data, icons, images, and other required resources whenever technically possible. The file must not depend on `app/`, `node_modules/`, the development server, or the original repository. If a true single-file build would break essential functionality, explain the limitation instead of producing a broken file.

## Release Purpose

A release is a shareable snapshot of the product experience, not a static screenshot. Preserve behavior wherever possible, including navigation, buttons, links, tabs, dropdowns, filters, modals, drawers, forms, hover/focus/active states, client-side state, mock data, charts, simulated workflows, and front-end business logic.

## Backend / API Behavior

If unavailable APIs or backends are required, preserve the intended UX with local mock or simulated behavior, document the simulation, and never ship secrets.

## Versioning

Use semantic versioning: `vMAJOR.MINOR.PATCH`.

- PATCH: visual polish, copy changes, spacing, minor fixes.
- MINOR: new feature, component, page, workflow, or meaningful UX change.
- MAJOR: major redesign, architecture milestone, or product release.

The default first release is `v0.1.0`. Before releasing, inspect `output/html/`, identify the latest version, choose the next appropriate version, and never overwrite an existing version. Use the current local date in `YYYY-MM-DD` format.

If the user explicitly specifies a version number, use it unless doing so would overwrite an existing release.

## Release Date

Release paths use the current local date:

- Portable: `output/html/YYYY-MM-DD_vX.Y.Z/`
- Single HTML: `output/html/YYYY-MM-DD_vX.Y.Z-single.html`

## VERSION.md

Every portable release must contain `VERSION.md` with version, date, type, related session, summary, major changes, supported interactions, mocked behavior, known limitations, and run instructions.

A Single HTML release may have a sibling `YYYY-MM-DD_vX.Y.Z-single.VERSION.md`, but the HTML must not depend on it.

## Release Verification

Before considering a release complete, verify:

- the expected release path exists and previous releases remain untouched;
- primary screens render and critical CSS/JavaScript load;
- important interactions and mock data work;
- no authored-source or accidental localhost references remain;
- no secrets or credentials are included;
- Single HTML output is self-contained to the intended degree.

### Interactive Release Validation

- Do not create a Portable Release by merely saving or copying server-rendered HTML.
- For React, Next.js, vinext, RSC, or SSR applications, confirm that client hydration completes successfully.
- A successful HTTP 200 response does not prove that a release is functional.
- Test the release in a real browser using the exact files and run instructions delivered to the recipient.
- Verify navigation, role/view switching, buttons, tabs, dropdowns, modals, drawers, filters, forms, and client-side state changes.
- Check the browser console for JavaScript, hydration, module-loading, and missing-resource errors.
- If the release depends on a server runtime, include that runtime or clearly document the requirement.
- Do not label an artifact as a Portable Release when it only renders the initial static shell.

## Product Documentation

This is a product-management-driven project. Product requirements, business rules, implementation, session history, and published releases must remain clearly separated.

Use the following product documentation structure:

```text
docs/
├── product-overview.md
├── standards/
│   └── prd-writing-guide.md
├── prd/
│   ├── README.md
│   ├── active/
│   ├── shared/
│   └── archive/
├── feature-list.md
├── user-flow.md
├── business-rules.md
├── roles-permissions.md
├── states.md
├── decisions.md
├── changelog.md
└── research.md
```

### Product Documentation Responsibilities

#### `docs/product-overview.md`

Maintain stable product context: product background, problem statement, goals, non-goals, target users, core value proposition, success metrics, and high-level scope.

#### `docs/standards/prd-writing-guide.md`

Maintain the repository's authoritative PRD format, numbering rules, section responsibilities, and writing conventions. Read this guide completely before creating or materially updating a PRD. Do not silently replace its required structure with a different template.

#### `docs/prd/README.md`

Maintain the PRD Registry. It is the authoritative index for PRD identifiers, titles, product domains, requirement status, implementation status, related features, successor relationships, and current file locations. Keep it concise; detailed requirements belong in individual PRDs.

#### `docs/prd/active/`

Store PRDs that still describe current or planned product behavior. Draft, under-discussion, confirmed, in-progress, implemented, and validated PRDs remain active unless an explicit product decision makes them inactive.

#### `docs/prd/shared/`

Store cross-PRD contracts, definitions, or system behavior that multiple PRDs must share. Maintain one detailed source of truth and reference it from individual PRDs instead of duplicating rules.

#### `docs/prd/archive/`

Store only PRDs whose inactive status has been explicitly confirmed. Archived PRDs are historical records and must retain their original decision context.

#### `docs/feature-list.md`

Maintain the product feature inventory using at least:

| ID | Module | Feature | Description | Priority | Status | Version |
|---|---|---|---|---|---|---|

Use these statuses consistently: `Proposed`, `Confirmed`, `In Progress`, `Implemented`, `Validated`, and `Deferred`.

#### `docs/user-flow.md`

Document entry points and prerequisites, primary and branching flows, exception flows, completion states, and back/cancel/retry/recovery behavior. Use Mermaid for complex flows when useful, with supporting text for important rules.

#### `docs/business-rules.md`

Document executable and testable rules, including scheduling and matching, priority handling, calculations, conflict resolution, automatic recalculation, dependencies, constraints, and edge cases. Where practical, include a rule ID, trigger, logic, result, and exceptions.

#### `docs/roles-permissions.md`

Document role definitions, data visibility, allowed and prohibited actions, approval relationships, delegation, and special-permission rules.

#### `docs/states.md`

For each business object, document the state name, meaning, entry conditions, available actions, valid next states, and exception/rollback rules. State names must remain consistent across documentation, UI copy, and code.

#### `docs/decisions.md`

Append important confirmed product decisions without deleting their history:

```markdown
## YYYY-MM-DD — Decision title

- Decision:
- Context:
- Reason:
- Impact:
- Alternatives considered:
- Open questions:
```

#### `docs/changelog.md`

Record changes to approved product requirements, including date, change, reason, affected modules, and related version when applicable. This document does not replace Git history.

#### `docs/research.md`

Store user research, competitor research, data analysis, sources, and findings. Clearly distinguish facts, inferences, and recommendations.

## PRD Governance

### PRD Creation and Update Rules

Before creating a PRD:

1. Read `docs/standards/prd-writing-guide.md` completely.
2. Read `docs/prd/README.md` and search all active PRDs for overlapping goals and scope.
3. Update an existing PRD when the request extends the same goal and scope.
4. Create a new PRD only for a distinct iteration, a materially different goal or scope, or an approved replacement.
5. Allocate the next unused `PRD-XXX` identifier from the Registry. Never reuse an identifier, including an archived one.
6. Add the required metadata defined by the writing guide or Registry.
7. Store shared logic once in `docs/prd/shared/` or the appropriate long-term product document and reference it from individual PRDs.
8. Update the Registry, affected formal product documents, and the current session record in the same work phase.

PRDs describe expected behavior and verifiable outcomes. Avoid unnecessary implementation details, and do not present unconfirmed recommendations as approved requirements.

### PRD Lifecycle

Use these document lifecycle statuses consistently:

- `Draft`: initial document not yet approved;
- `Under Discussion`: direction is still being evaluated;
- `Confirmed`: requirements are approved;
- `In Progress`: implementation is underway;
- `Implemented`: implementation is complete but may still need validation;
- `Validated`: current behavior has been verified;
- `Superseded`: a confirmed successor fully replaces the PRD;
- `Cancelled`: the requirement was explicitly cancelled;
- `Obsolete`: the represented capability was explicitly retired.

`Draft`, `Under Discussion`, `Confirmed`, `In Progress`, `Implemented`, and `Validated` belong in `docs/prd/active/`. Implementation or validation alone is not an archive trigger.

### PRD Archive Rules

Move a PRD to `docs/prd/archive/` only when one of the following is explicitly confirmed:

1. A newer confirmed PRD fully supersedes it.
2. The requirement is cancelled.
3. The represented capability is retired.

Age, implementation completion, release publication, inactivity, a similar title, or drift between code and documentation are not sufficient archive reasons.

Codex may identify and report archive candidates, but must not change status or move a PRD without explicit user confirmation or an existing confirmed product decision.

Before archiving a PRD:

1. Update its status and record `archived_at`, `archive_reason`, and `superseded_by` when applicable.
2. Record `supersedes` in the successor when applicable.
3. Update `docs/prd/README.md`.
4. Move the file to `docs/prd/archive/YYYY/` without rewriting its historical requirements.
5. Update affected links, decisions, changelog entries, and the current session record.

Treat archived PRDs as immutable historical records. Add dated errata when correction is necessary rather than silently rewriting original requirements.

## Product Requirement Status

Treat product content as one of the following states.

These states describe requirement certainty and implementation progress. PRD file placement and archival eligibility are governed separately by the PRD Lifecycle and Archive Rules above.

### Under Discussion

When the user is exploring, comparing, brainstorming, or requesting recommendations and has not confirmed a final direction:

- Analyze and recommend solutions.
- Record meaningful analysis in today's session.
- Record unresolved questions separately.
- Do not write unconfirmed ideas into the formal PRD as approved requirements.
- Do not modify source code unless the user explicitly asks for implementation or a prototype.

### Confirmed

When the user explicitly approves a direction, asks to adopt it, or asks to synchronize product documentation:

- Update only affected formal product documents.
- Synchronize related scope, flows, business rules, states, permissions, exceptions, and acceptance criteria.
- Record important decisions and impacts.
- Do not modify unrelated documents.

### Implemented

When the confirmed requirement has been implemented and verified:

- Update the relevant status in `docs/feature-list.md`.
- Update `PROJECT.md` when project status materially changes.
- Record changed files and validation results in today's session.
- Do not automatically create a release.

## Product Documentation Update Rules

Update affected formal documents when a confirmed task changes product scope, user roles, user flows, functional requirements, business rules, system states, permissions, feature priority, page/component behavior, exception handling, acceptance criteria, or key product decisions.

When updating product documentation:

1. Update only affected files.
2. Do not represent unconfirmed recommendations as approved requirements.
3. Do not invent business facts or user decisions.
4. Mark missing information as `TBD` or place it under Open Questions.
5. Keep one primary source of truth for each detailed rule.
6. Preserve important decision history.
7. Update `docs/changelog.md` when approved requirements change.
8. Check role names, state names, and terminology for consistency.

## Session Documentation

For every meaningful product, design, development, or release session, use:

```text
sessions/YYYY-MM-DD/
├── session.md
├── prompts.md
├── summary.md
└── todo.md
```

Do not create an empty session folder for a simple question that produces no meaningful project work.

### `session.md`

Recommended sections: User Request, Context, Analysis, Confirmed Decisions, Unconfirmed Ideas, Files Changed, Validation, and Open Questions.

### `prompts.md`

Save only important reusable prompts or prompts the user explicitly asks to retain. Do not copy the entire conversation by default.

### `summary.md`

At the end of a meaningful work phase, record work completed, confirmed decisions, changed documents/source files, validation results, remaining issues, and the recommended next step.

### `todo.md`

Keep unfinished tasks and unresolved questions only. Mark or remove completed items.

## Product Acceptance Criteria

Write important acceptance criteria in verifiable form whenever practical:

```text
Given a precondition
When the user performs an action
Then the system produces an observable result
```

Consider primary flow, permissions, loading and empty states, invalid input, system failure, conflicts or duplicate actions, cancel/recovery behavior, and feedback after data changes. Avoid vague statements such as “works correctly” or “good experience” as the only acceptance criteria.

## Product Management Commands

### When the user says `先分析这个需求`

Analyze and recommend without modifying source code or treating unconfirmed ideas as approved PRD content. Record meaningful analysis and unresolved questions in today's session.

### When the user says `整理当前需求`

Organize confirmed requirements into affected `docs/` files, mark uncertainty as `TBD` or Open Questions, and do not modify source code or create a release.

### When the user says `生成 PRD`

Read `docs/standards/prd-writing-guide.md` and the PRD Registry completely. Determine whether the request should update an active PRD or create a new one. Create new PRDs under `docs/prd/active/`, follow the required guide structure, add required metadata, reference shared sources of truth, and update `docs/prd/README.md`. Do not invent missing information, archive another PRD without confirmed authority, or create a release.

### When the user says `同步产品文档`

Review confirmed requirements and implementation, update every affected formal product document, preserve unrelated decisions, and do not create a release.

### When the user says `记录产品决策`

Append the confirmed decision to `docs/decisions.md` with date, context, reason, impact, alternatives, and open questions. Synchronize affected formal requirements when necessary; do not create a release.

### When the user says `实现当前需求`

Read the relevant active PRD, shared contracts, rules, states, permissions, and implementation; implement the confirmed requirement; run appropriate lint, typecheck, tests, build, and browser checks; update implementation status in the PRD Registry, affected product documents, feature status, and today's session; do not create a release.

### When the user says `结束本次工作`

Update today's session, summary, todo, and `PROJECT.md`; ensure confirmed decisions are reflected in active PRDs, shared contracts, the PRD Registry, and other affected formal product documents; update `README.md` only if setup or usage changed; do not create a release unless separately requested.

## Documentation and Output Layout

- `docs/architecture.md`: architecture and technical decisions.
- `docs/design.md`: visual specification and design-system guidance.
- `docs/standards/`: version-controlled documentation standards and writing guides.
- `docs/prd/`: PRD Registry, active PRDs, shared contracts, and confirmed archives.
- `docs/research.md`: research inputs and conclusions.
- `docs/notes.md`: durable working notes.
- `prompts/`: reusable task prompts.
- `sessions/YYYY-MM-DD/`: session log, prompts, summary, and todo.
- `output/html/`: versioned interactive releases.
- `output/pdf/`: PDF deliverables.
- `output/screenshots/`: verified screenshots.
- `output/exports/`: other exported artifacts.
- `assets/`: source/reference assets not better placed in `public/`.

## Default Workflow

### Normal Development

1. Read `AGENTS.md` and `PROJECT.md`.
2. Read the product documents relevant to the task.
3. For PRD work, read the PRD writing guide and Registry before creating or updating files.
4. Inspect the current project and git status.
5. Determine whether the requirement is Under Discussion, Confirmed, or Implemented.
6. Make changes to `app/` only when implementation is requested.
7. Run appropriate validation.
8. Update affected product documentation and today's session.
9. Do not create a release unless explicitly requested.

### When the user requests a Portable Release

1. Inspect the current source/build configuration and existing releases.
2. Determine the next semantic version.
3. Build a portable interactive snapshot into `output/html/YYYY-MM-DD_vX.Y.Z/`.
4. Create `VERSION.md`.
5. Test the exact delivered artifact in a real browser, including hydration and important interactions.
6. Keep previous releases unchanged.

### When the user requests a Single HTML Release

1. Inspect source/build configuration and existing releases.
2. Determine the next semantic version.
3. Create `output/html/YYYY-MM-DD_vX.Y.Z-single.html`.
4. Verify that the exact file is self-contained and functional in a real browser.
5. Keep previous releases unchanged.
