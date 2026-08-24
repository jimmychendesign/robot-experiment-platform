# Product Documentation Changelog

## 2026-08-24 — Role-based scheduling PRDs

- Change: Split the implemented scheduling product into requester, Experiment Manager, and Tester PRDs using the V10 required structure.
- Reason: Establish a coherent cross-role contract for automatic experiment creation, Robot/Tester/time matching, Urgent/Normal precedence, and availability-driven recalculation.
- Affected modules: Requests, Scheduling, Robot Management, Tester Operations, Availability, Conflict Handling.
- Related version: Current development; no release created.

## 2026-08-21 — Chinese/English interface switching

- Change: Added a persistent Chinese/English language switcher to the shared command bar and completed English coverage for all role consoles, mock data, forms, drawers, dialogs, tooltips, dynamic feedback, and accessibility labels without resetting in-memory workflow state.
- Reason: Support bilingual teams using the same operational prototype.
- Affected modules: Shared navigation, administrator console, requester console, tester console, accessibility metadata.
- Related version: Current development (unreleased).

## 2026-08-21 — Tester queue and leave approval refinement

- Change: Expanded the tester Live Queue to the full workday with equal-height rows, removed the duplicate leave-request entry, and consolidated manager leave approval information, status, and actions into one compact card.
- Reason: Improve information hierarchy, remove redundant controls, and keep empty and populated states visually stable.
- Affected modules: Tester Operations, Tester Availability, Admin Tester Management.
- Related version: Current development (unreleased).

## 2026-08-21 — v0.1.1 documentation baseline

- Change: Added formal product overview, PRD, feature inventory, user flows, business rules, roles/permissions, states, and decision history.
- Reason: Synchronize the project with the updated project template.
- Affected modules: Project-wide documentation and release governance.
- Related version: v0.1.1.

## 2026-08-21 — Interactive release validation

- Change: Added mandatory browser-based hydration and interaction checks for Portable Releases.
- Reason: Prevent server-rendered static shells from being treated as functional releases.
- Affected modules: Release workflow.
- Related version: v0.1.1.
