# Feature List

| ID | Module | Feature | Description | Priority | Status | Version |
|---|---|---|---|---|---|---|
| F-001 | Navigation | Role console switching | Switch among administrator, requester, and tester workspaces | P0 | Validated | v0.1.1 |
| F-002 | Requests | Request creation | Configure and submit a simulated experiment request | P0 | Implemented | v0.1.1 |
| F-003 | Scheduling | Automatic scheduling | Simulate Robot/Tester matching and time allocation | P0 | Implemented | v0.1.1 |
| F-004 | Robot Management | Capacity and status | Inspect capacity and adjust supported availability settings | P0 | Implemented | v0.1.1 |
| F-005 | Experiment Management | Experiment detail | Inspect configuration, assignment, priority, and status | P1 | Implemented | v0.1.1 |
| F-006 | Tester Operations | Live queue | View the full 10:00–19:00 workday in consistent 30-minute rows, including empty slots | P0 | Validated | Current development |
| F-007 | Tester Operations | Start/finish experiment | Simulate execution timing and completion | P0 | Implemented | v0.1.1 |
| F-008 | Availability | Leave and Break | Use one leave entry and a compact manager approval card with design-system status and actions | P1 | Implemented | Current development |
| F-009 | Conflict Handling | Reassignment feedback | Simulate conflict detection, delay, and backup assignment | P1 | Implemented | v0.1.1 |
| F-010 | Persistence | Durable operational data | Persist requests, schedules, and history | P0 | Deferred | TBD |
| F-011 | Localization | Chinese/English switching | Switch all interface copy, mock data labels, dynamic feedback, dialogs, tooltips, and accessibility text between Simplified Chinese and English while preserving the selected language locally | P1 | Validated | Current development |

## Feature Point Map for Role PRDs

| Feature Point ID | Parent | Feature Point | Implementation Status |
|---|---|---|---|
| F-002.1 | F-002 | Submit experiment request | Implemented |
| F-002.2 | F-002 | Configure single/group combinations | Implemented; group calculation needs production alignment |
| F-002.3 | F-002 | View request configuration | Implemented |
| F-003.1 | F-003 | Preview shared Robot availability | Implemented |
| F-003.2 | F-003 | Auto-create and auto-schedule experiments | Implemented as simulation |
| F-003.3 | F-003 | View Robot and Tester schedules | Implemented as simulation |
| F-004.1 | F-004 | View Robot capacity and utilization | Implemented |
| F-004.2 | F-004 | Maintain Robot status and blocked time | Implemented as simulation |
| F-004.3 | F-004 | Batch work/rest/duration configuration | Implemented as simulation |
| F-004.4 | F-004 | Maintain default/backup Tester mapping | Implemented; formal qualification model pending |
| F-005.1 | F-005 | Requester views linked experiments | Implemented as simulation |
| F-005.2 | F-005 | Manager inspects source request and allocation | Implemented |
| F-006.1 | F-006 | Full personal workday queue | Validated |
| F-007.1 | F-007 | Start experiment and timer | Implemented as simulation |
| F-007.2 | F-007 | Finish experiment | Implemented as simulation |
| F-008.1 | F-008 | Submit and view leave request | Implemented as simulation |
| F-008.2 | F-008 | Review Tester leave | Implemented as simulation |
| F-008.3 | F-008 | Start and end temporary Break | Implemented as simulation |
| F-009.1 | F-009 | Requester views conflict/recalculation | Partial |
| F-009.2 | F-009 | Manager resolves missing Tester | Implemented; qualification validation pending |
| F-009.3 | F-009 | Tester views recalculated assignment/time | Implemented as simulation |
