# Session — 2026-08-21

## Goal

Align the existing Robot Experiment Platform repository with the shared project template while preserving the current application and user changes.

## Work

- Audited the template and current repository.
- Kept `app/` as the active vinext source instead of creating a competing `src/` tree.
- Added and adapted project governance, documentation, prompts, output folders, session records, and bootstrap support.
- Updated the project README and package script without touching the modified UI source files.
- Completed a placement audit and moved the visual specification from root `DESIGN.md` to `docs/design.md`.
- Added `docs/README.md` as a documentation routing index and updated all project references.
- Created the first portable release at `output/html/2026-08-21_v0.1.0/`.
- Exported a matching documentation snapshot at `output/exports/2026-08-21_v0.1.0-project-docs/`.
- Re-read the updated project template and synchronized missing product-management and interactive-release rules into the project `AGENTS.md`.
- Added the formal product documentation set required by the updated template.
- Added a dedicated browser-only Portable Release build path under `tools/portable/` and `vite.portable.config.ts`.
- Created corrected Portable Release `output/html/2026-08-21_v0.1.1/` without overwriting v0.1.0.
- Refined the tester Live Queue to always show the complete 10:00–19:00 workday in 18 equal-height 30-minute rows.
- Removed the duplicate leave-request button from the availability card while preserving the primary entry in the tester hero.
- Consolidated the manager leave-approval card into compact information, status, and action regions using design-system spacing and warning tokens.
- Created Portable Release `output/html/2026-08-21_v0.1.2/` from the current active source without overwriting prior releases.
- Added a persistent, accessible Chinese/English interface switcher and localized the shared console experience without changing business-state values.

## Verification

- `npm run bootstrap`: passed; safe to run repeatedly.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm test`: passed; production build completed and 2 tests passed.
- `git diff --check`: passed.
- Portable release served successfully over local HTTP; the homepage and 7 referenced assets returned HTTP 200.
- Release path, documentation manifest, relative asset paths, and accidental local filesystem references were checked.
- v0.1.1 source validation passed: typecheck, lint, production build, and 2/2 automated tests.
- The exact v0.1.1 delivery folder passed real-browser validation for all three role consoles, administrator tabs, Robot drawer tabs, request modal, Tester Break, leave modal/form, status filter, and client-state updates.
- Browser console validation reported no JavaScript, hydration, module-loading, or resource errors.
- Current-source browser validation confirmed one leave-request entry, 18 queue rows, consistent 60px row heights, a final 18:30–19:00 empty row, and no console errors.
- v0.1.2 source validation passed: typecheck, lint, production build, 2/2 automated tests, and the dedicated portable bundle build.
- The exact v0.1.2 folder passed HTTP asset checks and real-browser validation across administrator, requester, and tester roles; browser console checks found no errors or warnings.
- Chinese/English switching passed real-browser validation for all three roles, language metadata and document title changes, local preference persistence across reload, return to Chinese, and a clean browser console.
- Expanded localization validation to require zero Han characters in English-mode visible text, form values, placeholders, titles, and ARIA labels; covered all primary screens, conditional group editors, dropdowns, drawers, modals, Break/task state changes, and leave submission/approval states.
