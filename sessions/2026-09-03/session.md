# Session — 2026-09-03

## User Request

- Publish the current version as a Portable Release.

## Context

- The latest historical release was v0.3.0 from 2026-08-28.
- Current source includes meaningful new Requirement-notification, delivery-confirmation, and Robot-management capabilities.

## Analysis

- The accumulated changes add new workflows and components, so the semantic version advances to v0.4.0.
- The release is built from the active `app/` source with the portable Vite configuration.

## Confirmed Decisions

- Release type: Portable Build.
- Release version: v0.4.0.
- Release path: `output/html/2026-09-03_v0.4.0/`.
- No deployment or Single HTML artifact is included.

## Unconfirmed Ideas

- None.

## Files Changed

- Added the v0.4.0 portable bundle, dependency-free static server, Excel template, and release manifest under `output/html/2026-09-03_v0.4.0/`.
- Updated `PROJECT.md` release status and history.
- Added the 2026-09-03 session records.

## Validation

- TypeScript typecheck: passed.
- ESLint: passed.
- Vinext production build and rendered HTML tests: passed (2/2).
- Portable Vite build: passed.
- Exact delivered folder launched with its included server: passed.
- JavaScript, CSS, and Excel-template requests returned HTTP 200 with expected content types.
- Browser confirmed client hydration, Robot selection and Batch Settings, the notification center and Requirement-detail routing, Chinese/English switching, all three role consoles, Pending Confirmation filtering, and the Request submission modal.
- Browser JavaScript errors and warnings during the checked flows: none observed.
- Authored bundle scan found no local-machine paths, localhost dependencies, or common credential patterns.

## Open Questions

- None for this release.

## Follow-up — PRD-004 FR-001 role-specific lifecycle update

### User Request

- Update PRD-004 FR-001 from the supplied screenshots.

### Changes

- Reworked the aggregate Requirement Status table into the supplied Stepper-stage and internal-status layout.
- Added the Role column to the Requirement detail Stepper and synchronized the named owners and lifecycle actions.
- Updated the Experiment Requester flow with Policy repair completion, validation-feedback visibility, cancellation during retest and pending confirmation, and final “确认已查看”.
- Replaced the mixed administrator action table with separate action matrices for Experiment Requirement Manager, Experiment Requirement Verifier, and Requirements Validation Engineer.
- Added FR-001 acceptance criteria for role-specific CTAs and retained the supplied permission inconsistencies under the existing confirmation section.
- Updated the PRD Registry and product documentation changelog.

### Validation

- Re-read the PRD writing guide, product structure, Registry, and relevant feature-workbook rows before editing.
- Confirmed the PRD retains the required section structure and a single FR-001 section.
- Documentation-only change; application source and release artifacts were not modified.
