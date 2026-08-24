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
6. The system creates request/experiment records and automatically matches Robot, qualified Tester, and time; the manager does not create experiments manually.
7. Cancel closes the form without creating a request.

## Administrator: Manage a Robot

1. Open the administrator console and Robot management area.
2. Select a Robot to open its details.
3. Review capacity, status, Tester configuration, and blocked time.
4. Change supported Robot availability, work/rest, or Tester mapping settings and save.
5. The system recalculates affected not-started experiments and updates shared scheduling information and conflict feedback.
6. The manager handles only unresolved qualified-Tester exceptions; routine shift planning remains automatic.

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

1. A requester submits a valid requirement with Urgent or Normal priority.
2. The system creates experiments from the preserved resource combinations.
3. The scheduler selects an allowed, available Robot.
4. The scheduler finds a qualified Tester whose availability overlaps the Robot slot.
5. Urgent work receives earlier legal slots than not-started Normal work; running work is not interrupted.
6. Robot or Tester availability changes trigger recalculation of affected not-started experiments only.
7. The same result is synchronized to requester, manager, and Tester views.

## Recovery and Exceptions

- Invalid request forms remain unsubmitted.
- Cancel closes supported forms and dialogs without saving.
- Robot unavailability or missing Tester authorization produces conflict/waiting-resource feedback.
- Refresh resets all in-memory changes in the current prototype.
