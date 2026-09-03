# PRD Registry

本目录是产品需求文档的统一入口。PRD 描述一次明确的需求迭代；长期稳定的业务规则、状态和权限仍分别由 `docs/business-rules.md`、`docs/states.md` 和 `docs/roles-permissions.md` 维护。

编写或更新 PRD 前，必须完整阅读 [PRD 编写规范](../standards/prd-writing-guide.md)。

## Current PRDs

| PRD ID | Title | Domain | PRD Status | Implementation | Related Features | Last Updated |
|---|---|---|---|---|---|---|
| PRD-004 | [实验需求方：需求提交与排期追踪](./active/PRD-004-experiment-requester.md) | Experiment Management / Experiment Schedule | Confirmed | Partial | EXP-007.1, EXP-305.1/.2/.4; asset gaps pending | 2026-09-03 |
| PRD-005 | [实验管理者：资源维护与调度例外处理](./active/PRD-005-experiment-manager.md) | Asset Management / Robot; Experiment Management / Experiment Schedule | Confirmed | Partial | EXP-007.1, EXP-304.*, EXP-305.1–EXP-305.3; Requirement/RBAC/notification/asset gaps pending | 2026-09-02 |
| PRD-006 | [实验员：任务执行与个人可用性](./active/PRD-006-tester.md) | Experiment Management / Experiment Schedule | Confirmed | Partial | EXP-007.1, EXP-304.1/.2/.3; asset gaps pending | 2026-08-27 |

## Shared Contracts

| Contract | Status | Used By | Last Updated |
|---|---|---|---|
| [实验调度共享契约](./shared/scheduling-contract.md) | Confirmed | PRD-004, PRD-005, PRD-006 | 2026-09-01 |

## Archived PRDs

| PRD ID | Title | Status | Successor | Archived At |
|---|---|---|---|---|
| PRD-001 | [实验需求方：需求提交与排期追踪](./archive/2026/PRD-001-experiment-requester.md) | Superseded | PRD-004 | 2026-08-26 |
| PRD-002 | [实验管理者：资源维护与调度例外处理](./archive/2026/PRD-002-experiment-manager.md) | Superseded | PRD-005 | 2026-08-26 |
| PRD-003 | [实验员：任务执行与个人可用性](./archive/2026/PRD-003-tester.md) | Superseded | PRD-006 | 2026-08-26 |

## Directory Responsibilities

```text
prd/
├── README.md      # Registry and lifecycle rules
├── active/        # PRDs that still describe current or planned product behavior
├── shared/        # Cross-PRD contracts and definitions
└── archive/       # Confirmed inactive PRDs retained as history
```

## PRD Status

| Status | Meaning | Directory |
|---|---|---|
| Draft | Initial document not yet approved | `active/` |
| Under Discussion | Direction is still being evaluated | `active/` |
| Confirmed | Requirements are approved | `active/` |
| In Progress | Implementation is underway | `active/` |
| Implemented | Implementation is complete but may still need validation | `active/` |
| Validated | Current behavior has been verified | `active/` |
| Superseded | A confirmed successor fully replaces this PRD | `archive/` |
| Cancelled | The requirement was explicitly cancelled | `archive/` |
| Obsolete | The represented capability was explicitly retired | `archive/` |

`Implemented` and `Validated` PRDs remain active while they still describe current behavior.

## Archive Decision Rule

A PRD may be moved to `archive/` only when one of the following is explicitly confirmed:

1. A newer confirmed PRD fully supersedes it.
2. The requirement is cancelled.
3. The represented product capability is retired.

Age, implementation completion, release publication, inactivity, similar titles, or code drift are not sufficient reasons to archive a PRD.

Codex may identify and report archive candidates, but must not change status or move a PRD without explicit user confirmation or an existing confirmed product decision.

Before archiving:

1. Update the old PRD status and add `archived_at`, `archive_reason`, and `superseded_by` when applicable.
2. Add `supersedes` to the successor PRD when applicable.
3. Update this Registry.
4. Move the old PRD to `archive/YYYY/` without rewriting its historical requirements.
5. Update affected links and decision/changelog records.

Archived PRDs are historical records. Subsequent corrections should be added as dated errata rather than silently rewriting the original decision context.

## Creating or Updating a PRD

1. Search the Registry and existing active PRDs before creating a new ID.
2. Update an existing PRD when the request extends the same goal and scope.
3. Create a new PRD only for a distinct iteration, materially different goal/scope, or an approved replacement.
4. Allocate the next unused `PRD-XXX` identifier; never reuse an archived ID.
5. Follow the required structure in the writing guide.
6. Store shared logic once under `shared/` or the appropriate long-term product document, then reference it from role or feature PRDs.
7. Update this Registry, affected formal product documents, and the current session record.

## Required Metadata

```yaml
---
prd_id: PRD-XXX
title: PRD title
status: Draft
implementation_status: Not Started
domain: Product domain
owner: TBD
related_features: []
shared_contracts: []
supersedes: null
superseded_by: null
last_updated: YYYY-MM-DD
---
```
