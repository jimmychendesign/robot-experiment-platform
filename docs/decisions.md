# Product Decisions

## 2026-08-24 — Automatic scheduling is a shared system capability

- Decision: Experiment requests automatically create experiments; the scheduling service assigns Robot, qualified Tester, and time. The Experiment Manager maintains resource constraints and handles unresolved exceptions instead of planning routine shifts.
- Context: The three role experiences must remain connected while Robot and Tester availability changes dynamically.
- Reason: A single scheduling owner prevents divergent role-specific schedules and reduces manual coordination.
- Impact: Requester, manager, and Tester PRDs share one scheduling contract; resource changes recalculate affected not-started experiments only; Urgent precedes not-started Normal work.
- Alternatives considered: Manager manually creates experiments and schedules shifts; independent schedules per role.
- Open questions: Stable ordering within the same priority, notification channels, audit requirements, and production persistence.

## 2026-08-21 — Use role-specific consoles in one application route

- Decision: Present administrator, requester, and tester workspaces as client-side views within the current root route.
- Context: The existing prototype is implemented in `app/page.tsx` and shares in-memory operational state.
- Reason: This supports rapid cross-role workflow simulation in one prototype.
- Impact: A single URL does not mean a single feature view; Portable Releases must preserve client hydration and view switching.
- Alternatives considered: Separate application routes for each role.
- Open questions: Whether production deep links and role-specific routes are required.

## 2026-08-21 — Portable releases require real browser interaction validation

- Decision: HTTP success alone is insufficient; exact delivered artifacts must be tested for hydration and primary interactions.
- Context: The initial `v0.1.0` release rendered the shell but did not reliably preserve interaction.
- Reason: Release quality must reflect the interactive product experience.
- Impact: Future releases require browser console checks and representative interaction testing.
- Alternatives considered: Static HTML shell checks only; rejected.
- Open questions: Whether future distribution should use a bundled local server or a pure SPA export.
