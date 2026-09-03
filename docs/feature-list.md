# Feature List

> 本文件使用 `F-xxx` 追踪当前原型实现能力，不作为 PRD Scope 的功能资产编号来源。PRD Scope 的正式功能 ID 和功能点 ID 以 `docs/standards/feature-list.xlsx` 为准；无法匹配的能力必须标记为待登记资产。

| ID | Module | Feature | Description | Priority | Status | Version |
|---|---|---|---|---|---|---|
| F-001 | Navigation | Role console switching | Switch among administrator, requester, and tester workspaces | P0 | Validated | v0.1.1 |
| F-002 | Requests | Request intake and tracking | Configure and submit a request manually or through a validated Excel template as “待处理”; edit or confirm-delete before processing; cancel later active stages without deleting records; list and filter by Requirement Status including 待确认 and 已取消 | P0 | Implemented | Current development |
| F-003 | Scheduling | Request experiment creation and validation | Manager locks and creates linked experiments, then performs validation, Policy/JSON issue routing, repair completion, and re-validation; failures retain the request and expose retry; lists share one derived Requirement Status | P0 | Implemented | Current development |
| F-004 | Robot Management | Card capacity view and shared settings | Inspect a responsive four-column Robot card grid, select individual or all filtered Robots for batch schedule settings, and override the same fields per Robot | P0 | Implemented | Current development |
| F-005 | Experiment Management | Experiment detail | Inspect configuration, assignment, priority, status, and the six-stage request workflow Stepper | P1 | Implemented | Current development |
| F-006 | Tester Operations | Live queue | View the full 10:00–19:00 workday in consistent 30-minute rows, including empty slots | P0 | Validated | Current development |
| F-007 | Tester Operations | Start/finish experiment | Simulate execution timing and completion | P0 | Implemented | v0.1.1 |
| F-008 | Availability | Leave and Break | Use one leave entry and a compact manager approval card with design-system status and actions | P1 | Implemented | Current development |
| F-009 | Conflict Handling | Tester-side reassignment feedback | Simulate personnel conflict detection, delay, and reassignment independently from Robot scheduling | P1 | Implemented | Current development |
| F-010 | Persistence | Durable operational data | Persist requests, schedules, and history | P0 | Deferred | TBD |
| F-011 | Localization | Chinese/English switching | Switch all interface copy, mock data labels, dynamic feedback, dialogs, tooltips, and accessibility text between Simplified Chinese and English while preserving the selected language locally | P1 | Validated | Current development |
| F-012 | Notifications | System notification center | Show role-scoped lifecycle notifications from every Requirement in the global Header with unread counts, read state, mark-all-read, and direct access to permitted request details | P0 | Implemented | Current development |

## Feature Point Map for Role PRDs

| Feature Point ID | Parent | Feature Point | Implementation Status |
|---|---|---|---|
| F-002.1 | F-002 | Submit experiment request | Implemented |
| F-002.2 | F-002 | Configure single/group combinations | Implemented; group calculation needs production alignment |
| F-002.3 | F-002 | View request configuration | Implemented |
| F-002.4 | F-002 | Batch create requests from the current Excel template | Implemented as client-side `.xlsx` validation and import |
| F-003.1 | F-003 | Preview shared Robot availability | Implemented |
| F-003.2 | F-003 | Create and link experiments by request ID | Implemented as manager-triggered simulation |
| F-003.4 | F-003 | Lock request, validate creation, route Policy/JSON failures, retry, repair, and re-validate | Implemented as simulation |
| F-003.3 | F-003 | View Robot and Tester schedules | Implemented as simulation |
| F-004.1 | F-004 | View Robot capacity and utilization | Implemented |
| F-004.2 | F-004 | Set paused/maintenance override; derive running/idle from schedule; maintain blocked time | Implemented as simulation |
| F-004.3 | F-004 | Batch work/rest/duration configuration | Implemented as simulation |
| F-005.1 | F-005 | Requester views linked experiments | Implemented as simulation |
| F-005.2 | F-005 | Manager inspects source request and allocation | Implemented |
| F-006.1 | F-006 | Full personal workday queue | Validated |
| F-007.1 | F-007 | Start experiment and timer | Implemented as simulation |
| F-007.2 | F-007 | Finish experiment | Implemented as simulation |
| F-008.1 | F-008 | Submit and view leave request | Implemented as simulation |
| F-008.2 | F-008 | Review Tester leave | Implemented as simulation |
| F-008.3 | F-008 | Start and end temporary Break | Implemented as simulation |
| F-009.1 | F-009 | Requester views conflict/recalculation | Partial |
| F-009.2 | F-009 | Robot scheduling remains independent from Tester availability | Implemented |
| F-009.3 | F-009 | Tester views recalculated assignment/time | Implemented as simulation |
| F-012.1 | F-012 | View role-scoped Requirement notifications from the Header | Implemented as in-memory simulation |
| F-012.2 | F-012 | Track unread state and mark one or all notifications as read | Implemented as in-memory simulation |
| F-012.3 | F-012 | Open the permitted Requirement detail from a notification | Implemented for requester and administrator roles |
