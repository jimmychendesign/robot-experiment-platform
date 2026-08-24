# System States

## Experiment Request

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 待审核（原型旧标签） | Request is scheduling or waiting for resources; it is not awaiting manager approval | Inspect | 已排期, 冲突 |
| 已排期 | Resources and time assigned | Inspect, execute downstream | 进行中, 冲突 |
| 进行中 | Related experiment execution active | Inspect | 已完成, 冲突 |
| 已完成 | Request work completed | Inspect | — |
| 冲突 | Resource or schedule issue exists | Recalculate, reassign | 已排期, 进行中 |

## Experiment

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 未排期 | No slot assigned | Schedule | 可排期, 已排期 |
| 可排期 | Eligible resources/slot available | Schedule | 已排期 |
| 已排期 / 待执行 | Ready for execution | Start | 进行中, 冲突 |
| 进行中 | Tester is executing | Finish | 已完成 |
| 已完成 | Execution finished | Inspect | — |
| 冲突 / 等待资源 | Required resource unavailable | Assign, recalculate | 已排期 / 待执行 |

## Robot

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 运行中 | Currently operating | Pause, maintain, inspect | 空闲, 已暂停, 维护中 |
| 空闲 | Available for assignment | Schedule, pause, maintain | 运行中, 已暂停, 维护中 |
| 已暂停 | Temporarily unavailable | Resume, maintain | 空闲, 运行中, 维护中 |
| 维护中 | Unavailable for maintenance | Restore | 空闲, 运行中 |

## Leave Request

| State | Meaning | Available Actions | Valid Next States |
|---|---|---|---|
| 待审批 | Submitted for review | Approve, reject | 已批准, 已拒绝 |
| 已批准 | Leave accepted | Inspect | — |
| 已拒绝 | Leave declined | Inspect or resubmit separately | — |

## Tester Break

- Inactive → Active when the tester starts Break.
- Active → Ended when the tester ends Break.
- Active Break affects simulated availability and schedule recalculation.

## Canonical Scheduling State Clarifications

The three role PRDs define the target scheduling semantics below. Current prototype labels remain documented above where they still appear in code.

### Experiment Request

| Canonical State | Meaning | Valid Next States |
|---|---|---|
| 排期中 | Request accepted; experiments and allocations are being calculated | 已排期, 部分待资源, 冲突 |
| 已排期 | All linked experiments have legal Robot, Tester, and time assignments | 进行中, 部分待资源, 已完成 |
| 部分待资源 | Some linked experiments are scheduled and some lack legal resources | 已排期, 进行中, 冲突 |
| 进行中 | At least one linked experiment is running | 已完成, 部分待资源, 冲突 |
| 已完成 | All linked experiments are complete | — |
| 冲突 | No legal schedule exists for at least one affected experiment | 已排期, 部分待资源 |

`待审核` in the current prototype is not a manager-approval step. It is a legacy UI label covering part of `排期中 / 部分待资源` and should be migrated when implementation is updated.

### Tester Availability

| State | Meaning | Scheduling Effect |
|---|---|---|
| Available | Eligible for new work, subject to qualification | Can be matched |
| Busy | Running an experiment | Cannot be double-booked |
| Break | Temporarily unavailable immediately | Recalculate affected not-started work |
| Leave Pending | Leave awaits manager decision | No formal schedule change |
| On Leave | Approved leave interval | Cannot be matched within the interval |
