# Roles and Permissions

| Capability | Experiment Requester | Experiment Administrator | Tester |
|---|---:|---:|---:|
| View request status | Allowed | Allowed | Limited to assigned operational context |
| Create experiment request | Allowed | Not primary workflow | Prohibited |
| View shared Robot availability | Allowed | Allowed | Limited operational view |
| Change Robot status/configuration | Prohibited | Allowed | Prohibited |
| Add Robot blocked time | Prohibited | Allowed | Prohibited |
| Assign or reassign Tester | Prohibited | Allowed | Prohibited |
| View assigned experiment queue | Prohibited | Allowed | Allowed for self |
| Start/finish experiment | Prohibited | Oversight only | Allowed for assigned work |
| Submit leave | Prohibited | Review/approval context | Allowed for self |
| Start/end temporary Break | Prohibited | Visibility and rescheduling context | Allowed for self |
| Approve/reject Tester leave | Prohibited | Allowed | Prohibited |
| Manually edit routine schedule time | Prohibited | Prohibited; system-calculated | Prohibited |
| Resolve missing Tester exception | Prohibited | Allowed, from qualified and available candidates only | Prohibited |

## Notes

- Current role switching is a prototype demonstration and is not an authorization boundary.
- Production data visibility, workspace membership, delegation, and special permissions remain TBD.
- Server-side authorization is required before any protected production action is implemented.
- “Experiment Manager / 实验管理者” is the canonical product role; the current UI label “实验管理员” refers to the same role, not the system-level `Admin` role in the architecture reference.
- The manager owns resource constraints and exception handling. The scheduling service owns routine Robot/Tester/time allocation.
