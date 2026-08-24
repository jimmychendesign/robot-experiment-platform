# Business Rules

| Rule ID | Trigger | Logic | Result | Exceptions |
|---|---|---|---|---|
| BR-001 | Schedule generation | Use 30-minute slots within the configured work period | Experiments occupy available slots | Default rest and blocked periods cannot be scheduled |
| BR-002 | Daily Robot capacity | Derive capacity from available working slots | Capacity and utilization are displayed | Maintenance or paused status makes the Robot unavailable |
| BR-003 | Default rest | Time falls within 12:00–13:00 | Mark the slot as blocked | Administrator configuration may evolve in a future backend |
| BR-004 | Robot unavailable | Robot status becomes paused or maintenance | Prevent new scheduling and recalculate affected mock results | Completed experiments remain historical |
| BR-005 | Tester matching | Prefer the Robot's default Tester when available | Assign the default Tester | Use an eligible backup or show waiting-resource conflict |
| BR-006 | Tester Break | Tester starts a temporary Break | Immediate unavailability and simulated downstream recalculation | End Break restores availability |
| BR-007 | Leave request | Tester submits leave | Create a pending approval record | Approval workflow is simulated |
| BR-008 | Priority | Request priority is Urgent | Place the request ahead of not-started Normal work without interrupting running work | Stable ordering within the same priority remains TBD |
| BR-009 | Request combinations | Multiple objects/backgrounds are configured | Preserve selected single/group relationship when creating experiments | Maximum production combination limits remain TBD |
| BR-010 | Prototype persistence | Browser reload occurs | Restore initial mock state | No durable persistence is currently connected |

## Unified Scheduling Rules

The role PRDs use the following confirmed cross-role rules. These rules supersede narrower wording above where a conflict exists.

| Rule ID | Trigger | Logic | Result | Current Implementation Note |
|---|---|---|---|---|
| BR-SCH-001 | Valid request submitted | Convert the preserved Robot × Policy × object-group × background-group configuration into experiments | Experiments are created automatically; no manager creation step | Simulated in client state |
| BR-SCH-002 | Experiment requires scheduling | Select an allowed and available Robot, then find the intersection of Robot and Tester availability | Robot, qualified Tester, and time are assigned together | Partial Mock implementation |
| BR-SCH-003 | Tester candidate evaluated | Candidate must be available and qualified to operate the Robot | Invalid candidates are skipped; no candidate produces waiting-resource/conflict | Qualification currently approximated by default/backup lists |
| BR-SCH-004 | Urgent and Normal experiments compete | Urgent precedes all not-started Normal experiments; running work is not interrupted | Normal work may be delayed without overlap | Priority UI/list ordering exists; full queue reorder is not implemented |
| BR-SCH-005 | Robot or Tester availability changes | Recalculate only affected not-started experiments | Completed and running experiments remain unchanged | Partially simulated |
| BR-SCH-006 | Leave is submitted | Pending approval does not change formal availability | Schedule remains valid until approval | Implemented in prototype |
| BR-SCH-007 | Leave is approved | Mark only the approved interval unavailable and rematch affected work | Backup qualified Tester, new time, or waiting resource | Prototype currently applies a simplified rematch |
| BR-SCH-008 | Break starts/ends | Break is immediately unavailable; end time fixes actual duration | Subsequent not-started work is recalculated | Simulated in prototype |
| BR-SCH-009 | Any schedule changes | Publish one authoritative result keyed by Experiment ID | Requester, manager, and Tester views show the same assignment and status | Target contract; current Mock views are not fully normalized |
| BR-SCH-010 | Manager operates the console | Manager maintains constraints and handles exceptions, not routine shifts | Automatic scheduling remains the default path | Confirmed role boundary |
