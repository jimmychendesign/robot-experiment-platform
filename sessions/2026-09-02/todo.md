# Todo — 2026-09-02

- Define production ownership and qualification rules for Tester assignment outside Robot management.
- Confirm how Requirement cancellation affects created, assigned, running, and completed Experiments and when reserved Robot/Tester capacity is released.
- Confirm whether Experiment Requirement Verifier should receive “开始验证”“验证通过 / 不通过”“选择 Policy / JSON 问题” permissions; the supplied matrix currently grants them to no role.
- Reconcile FR-009 “Policy修复完成” ownership with the functional-permission matrix.
- Reconcile FR-009 “待确认 → 已完成” ownership with the functional-permission matrix.
- Confirm the proposed Robot availability model: emergency outage, administrative pause, and time-bounded planned maintenance as separate exception types.
- Confirm that recurring daily working-hour changes default to the next scheduling day and require explicit high-impact confirmation for same-day application.
- Define running-Experiment handling for a physical emergency shutdown (recommended: preserve the assignment, mark execution interrupted/exceptional, and require explicit recovery rather than silent rescheduling).
- Reconcile the prototype with the fixed-Robot queue rule and remove fallback-Robot reassignment when implementation is requested.
- Remove the forced minimum capacity of 1 and add impact-preview/atomic-reschedule behavior when implementation is requested.
- Reconcile the remaining PRD-005 prototype deviations when implementation is requested: T+1 scheduling, time-range validation, date-bound schedule loading, page-scoped search, pending-confirmation header status, notification persistence, and production RBAC enforcement.
