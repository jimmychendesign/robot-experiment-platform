# User Flows

## Entry and Role Selection

1. User opens RobotOps.
2. Application displays the administrator console by default.
3. User selects administrator, requester, or tester from the role navigation.
4. The corresponding console replaces the current workspace without a page reload.

## Requester: Submit and Schedule an Experiment

1. Open the requester console.
2. Open the new-request form.
3. Configure objects, backgrounds, policies, Robot choices, priority, duration, and notes.
4. Review available schedule information.
5. Submit the request.
6. The request enters “待处理”; no experiment is created yet.
7. The requester may edit while the request remains “待处理”; “修改需求” reuses the submission modal, pre-fills every saved field, and saves back to the same request ID.
8. The requester may delete a Pending request after secondary confirmation; after processing begins it cannot be deleted.
9. The requester may initiate cancellation at any stage; cancellation terminal state and Experiment handling remain TBD.
10. After the manager starts processing, the request becomes read-only for the requester.
11. “我的需求” derives and displays only the macro status 待处理、处理中、测试中 or 已完成; its filters use the same four values.
12. Opening request detail keeps the granular six-stage Stepper and current internal Status.
13. Cancel closes the form without creating a request.

## Requester: Create Requests from Excel

1. Open the requester console and click “Excel 导入” beside “提交实验需求”.
2. Download the `.xlsx` template, which mirrors the current request form fields and grouping structure.
3. Enter one Requirement per row; use semicolons between selections/groups and `+` between members of one group.
4. Upload the completed file by file picker or drag and drop.
5. The system validates the workbook, headers, required fields, catalogs, modes, grouping, and priority for every non-empty row.
6. If any row fails, show row-specific errors and create nothing.
7. If all rows pass, show the request count and create all rows as “待处理”.

## Administrator: Manage a Robot

1. Open the administrator console and Robot management area.
2. Review the four-column Robot card grid; on narrower screens it adapts to two or one column.
3. Select individual Robot cards or use “Select all” for the current filtered list. The header batch-settings icon remains disabled until at least one Robot is selected.
4. Open batch settings, edit the shared daily working period, downtime period, and average experiment duration, then apply the values only to selected Robots.
5. Select a Robot card to review capacity, status, current effective rules, and today's Robot experiments.
6. In Settings, compare the displayed platform default, then optionally override the same daily schedule fields for this Robot only; no additional blocked-period editor is available.
7. Save. The system recalculates affected not-started experiments from Robot capacity and availability only.
8. Robot management does not display, configure, or assign Testers; personnel scheduling remains in Tester management.

## Administrator: Process a Request

1. Open a request from the “待处理” list.
2. The request queue derives the same macro Requirement Status as the requester list; priority filtering remains 全部 / 紧急.
3. Click “开始处理”; the request becomes “处理中” and its content is locked.
4. Click “关联创建实验”; the creation process carries the request ID and automatically links created experiments back to the request.
5. After every expected experiment is created and linked, the Stepper enters “需求验证 / 待验证”.
6. If creation or linking fails, keep the request in the current creation flow and show only the cause and “重试” in the manager action area; hide validation actions and do not return the request to the requester.
7. After creation succeeds, show “需求验证 / 待验证” and enable “开始验证”.
8. During validation, show “通过 / 不通过”. A failure requires Policy or JSON issue classification and may include a note; repair completion leads to “待重新验证”.
9. After initial or re-validation passes, the Stepper enters “测试执行 / 待测试”, the request becomes “已排期”, and its experiments enter the tester queue while both role lists display “测试中”.

## Tester: Execute Assigned Work

1. Open the tester console.
2. Review the Live Queue and active/next task.
3. Start an eligible experiment.
4. Observe running-time feedback.
5. Finish the experiment and observe the completed state.

## Tester: Leave or Temporary Break

1. Open leave form or start a Break.
2. For leave, enter dates and reason, then submit for simulated approval handling.
3. For Break, availability changes immediately in the prototype.
4. Approved leave or an active Break updates Tester Availability and causes affected not-started experiments to show delay, conflict, or reassignment feedback.
5. End Break to restore availability.

## End-to-End Scheduling

1. A requester submits a valid requirement and it enters “待处理”.
2. The manager starts processing and locks the request.
3. The creation script generates experiments using the request ID and writes the association back.
4. The platform enters “需求验证 / 待验证” after experiment creation and linking complete.
5. The manager starts validation. Failures enter Policy repair or DEBUG and loop through re-validation; a pass enters “测试执行 / 待测试” and makes the request “已排期”.
6. Experiments enter their specified Robot queues no earlier than T+1 and sort by Urgent > Normal, Requirement creation FIFO, then Experiment creation order.
7. Capacity overflow or Robot unavailability delays work in the same Robot queue; Robot is not automatically replaced.
8. Tester execution updates the work order to “进行中” and then “已完成”.

The request-detail Stepper presents this work through six fixed Stages: 需求处理 → 实验创建 → 需求验证 → 测试执行 → 结果审核 → 测试完成. The current Status appears below its Stage; DEBUG, re-export, and re-validation remain inside 需求验证.

The requester list projects those internal stages into Requirement Status values: 需求处理/实验创建 → 待处理, 需求验证 → 处理中, 测试执行/结果审核 → 测试中, 测试完成 → 已完成, and cancellation → 已取消. Filtering uses this projected Requirement Status and never a single Experiment status.

## Recovery and Exceptions

- Invalid request forms remain unsubmitted.
- Cancel closes supported forms and dialogs without saving.
- Script, association, omission, or Robot validation failures keep the request in “处理中” and expose retry only to the manager.
- Refresh resets all in-memory changes in the current prototype.
