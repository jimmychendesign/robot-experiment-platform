# Business Rules

| Rule ID | Trigger | Logic | Result | Exceptions |
|---|---|---|---|---|
| BR-001 | Schedule generation | Use 30-minute slots within the configured work period | Experiments occupy available slots | Default rest and blocked periods cannot be scheduled |
| BR-002 | Daily Robot capacity | Derive capacity from available working slots | Capacity and utilization are displayed | Maintenance or paused status makes the Robot unavailable |
| BR-003 | Default rest | Time falls within 12:00–13:00 | Mark the slot as blocked | Administrator configuration may evolve in a future backend |
| BR-004 | Robot manual availability override | Administrator selects paused or maintenance | Prevent new scheduling and recalculate affected mock results | Completed and running experiments remain historical |
| BR-004A | Robot is set online | Administrator selects online | Derive running or idle from the current schedule and restore calculated capacity | Running and idle cannot be selected manually |
| BR-005 | Robot / Tester resource separation | Generate Robot schedules from Robot capacity, blocked periods, and occupancy only | Robot schedule contains no Tester field or Tester-driven conflict | Tester assignment remains in the independent personnel workflow |
| BR-005A | Robot batch schedule settings are applied | Administrator selects one or more Robots and saves the header batch settings | Apply the same daily working period, downtime period, and average duration only to selected Robots and reset their prior per-Robot overrides | Batch action is disabled until at least one Robot is selected; select-all targets the current filtered list |
| BR-005B | A Robot schedule setting is overridden | Administrator saves daily schedule fields in one Robot detail | Apply the override only to that Robot and recalculate its capacity | The current batch setting remains visible; no additional blocked-period editor is provided |
| BR-006 | Tester Break | Tester starts a temporary Break | Immediate unavailability and simulated downstream recalculation | End Break restores availability |
| BR-007 | Leave request | Tester submits leave | Create a pending approval record | Approval workflow is simulated |
| BR-008 | Priority | Sort by Urgent > Normal, then Requirement creation time FIFO, then Experiment creation order within one Requirement | Reorder only not-started work without interrupting running or completed work | None |
| BR-009 | Request combinations | Multiple objects/backgrounds are configured | Preserve selected single/group relationship when creating experiments | Maximum production combination limits remain TBD |
| BR-010 | Prototype persistence | Browser reload occurs | Restore initial mock state | No durable persistence is currently connected |
| BR-011 | Initial scheduling date | A Requirement creates Experiments | Start scheduling no earlier than the day after Requirement creation (T+1) | Capacity overflow continues to the next available date |
| BR-012 | Robot unavailable | A not-started Experiment's specified Robot is unavailable | Keep the Experiment in the same Robot queue and delay it | Never auto-switch Robot |
| BR-013 | Request deletion/cancellation | Requester deletes Pending or initiates cancellation | Pending deletion requires confirmation; processing/testing requests cannot be deleted; supported active-stage cancellation marks the request cancelled and retains records | Experiment handling, resource release, and production notifications remain TBD |
| BR-014 | Policy or JSON repair | Validation identifies a Policy or experiment JSON problem | Update the original Experiment and continue validation | Failed repair stays in Request Validation and does not recreate the Experiment |

## Unified Scheduling Rules

The role PRDs use the following confirmed cross-role rules. These rules supersede narrower wording above where a conflict exists.

| Rule ID | Trigger | Logic | Result | Current Implementation Note |
|---|---|---|---|---|
| BR-SCH-001 | Valid request submitted | Set the request to “待处理”; do not create experiments yet | Requester may edit every field through the fully prefilled submission modal until processing begins; save preserves request ID and status | Implemented in client state |
| BR-SCH-001A | Manager starts processing | Change to “处理中” and lock submitted content | Requester receives a read-only view | Implemented in client state |
| BR-SCH-001B | Creation script runs | Carry the request ID, create experiments, and link results to the source request | Request remains “处理中”; successful creation enters “需求验证 / 待验证” | Implemented as simulation |
| BR-SCH-001C | Creation or linking fails | Keep the request in “处理中” and show cause/retry only to the manager | No return-to-requester state is created | Implemented as simulation |
| BR-SCH-001D | Manager validates request | After every expected experiment exists, run initial validation; route failures to Policy / JSON repair and re-validation | A validation pass makes the request “已排期” and moves the Stepper to “测试执行 / 待测试” | Implemented as simulation |
| BR-SCH-002 | Experiment requires Robot scheduling | Keep the Robot specified by the Requirement combination and find that Robot's earliest available capacity | A legal Robot time is assigned without a Tester dependency | Implemented in the Robot schedule mock |
| BR-SCH-003 | Robot management renders | Do not expose default/backup Tester configuration or Tester assignment | Robot list, detail, settings, and schedule remain device-only | Implemented |
| BR-SCH-004 | Experiments compete in one Robot queue | Sort by Urgent > Normal, same-priority Requirement creation time FIFO, then Experiment creation order within one Requirement | Later not-started work may be delayed without overlap; running and completed work stay fixed | Priority UI/list ordering exists; full queue reorder is not implemented |
| BR-SCH-005 | Robot or Tester availability changes | Robot changes recalculate Robot schedule; Tester changes recalculate personnel tasks only | The two resource schedules do not rewrite one another | Partially simulated |
| BR-SCH-006 | Leave is submitted | Pending approval does not change formal availability | Schedule remains valid until approval | Implemented in prototype |
| BR-SCH-007 | Leave is approved | Mark only the approved interval unavailable and rematch affected work | Backup qualified Tester, new time, or waiting resource | Prototype currently applies a simplified rematch |
| BR-SCH-008 | Break starts/ends | Break is immediately unavailable; end time fixes actual duration | Subsequent not-started work is recalculated | Simulated in prototype |
| BR-SCH-009 | Any schedule changes | Publish one authoritative result keyed by Experiment ID | Requester, manager, and Tester views show the same assignment and status | Target contract; current Mock views are not fully normalized |
| BR-SCH-010 | Manager operates the console | Manager starts work, reviews creation results, retries failures, validates, classifies Policy / JSON issues, confirms repair, and re-validates | Current manual triggers can later be replaced by automation without changing request states | Confirmed role boundary |
| BR-SCH-011 | Request detail Stepper renders | Map the current workflow Status to one of six fixed Stages; DEBUG, re-export, and re-validation remain inside Request Validation | Earlier Stages are Completed, the current Stage is Active with its Status, and later Stages are Pending | Display mapping does not create new public request states |
| BR-SCH-012 | Requester or manager Requirement list/status filter renders | Derive one Requirement Status through the shared workflow mapping: Stages 1–2 → 待处理; Stage 3 → 处理中; Stages 4–5 → 测试中; Stage 6 → 已完成; cancellation → 已取消 | Both role lists show the same status; requester filtering also exposes 已取消 | Never duplicate the mapping or copy a single linked Experiment status; detail retains granular Stage + Status |
| BR-SCH-013 | Requester uploads an Excel request file | Validate the entire `.xlsx` against the current form schema and catalogs; parse semicolon-delimited selections and `+`-delimited group members | One valid non-empty row creates one Pending Requirement; any row error rejects the whole file with row-specific feedback | Blank rows are ignored; maximum 200 requests per import; current prototype uses in-memory persistence |
| BR-SCH-014 | Experiments enter scheduling | Use T+1 as the earliest date; overflow moves to the next available date of the same specified Robot | Every Experiment remains in its Robot queue | Current prototype does not fully enforce T+1 |
| BR-SCH-015 | Validation requires Policy or JSON repair | Update the original Experiment and continue validation; failed repair loops within Request Validation | No new Experiment is created and workflow does not return to Experiment Creation | State transitions and issue notes are simulated; external update APIs remain TBD |
| BR-SCH-016 | Requester deletes or cancels | Allow confirmed deletion only before manager processing; later supported active stages accept cancellation | Processing/testing records cannot be deleted; cancellation retains records and displays 已取消 | Resource release and production notifications remain TBD |
