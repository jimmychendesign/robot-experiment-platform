# Summary — 2026-08-21

The project template has been adapted to the existing RobotOps repository. Existing source code remains under `app/`; no historical release was created. Template folders and operational documentation were added, and project-specific content replaced generic placeholders.

## Preserved

- Existing application source and design system
- Existing package dependencies and build scripts
- Existing OpenAI Sites / Cloudflare configuration
- User's uncommitted UI changes

## Added or Updated

- `AGENTS.md`, `PROJECT.md`, and project-specific `README.md`
- `docs/`, `prompts/`, `sessions/`, `assets/`, and `output/`
- Safe, idempotent `bootstrap.sh` and `npm run bootstrap`
- Output ignore rules that preserve directory placeholders
- Visual specification archived at `docs/design.md`, with a documentation index in `docs/README.md`
- Portable release `v0.1.0` with local assets and release notes
- Versioned project documentation export for `v0.1.0`
- Tester Live Queue now renders the full workday with stable row geometry for populated and empty slots.
- Tester leave submission now has one clear entry point instead of duplicated controls.
- Manager leave approvals use a compact fixed card layout with a short semantic status badge and grouped actions.
- Portable Release `v0.1.2` captures the latest Tester queue and manager leave-approval refinements.
- Current development now includes a keyboard-accessible Chinese/English switcher with browser-local preference persistence.

## Verification

- Bootstrap script and package JSON validated.
- TypeScript and ESLint checks passed.
- Production build passed.
- 2/2 automated tests passed.
- No whitespace errors were reported by `git diff --check`.
- Portable release HTTP verification passed: homepage plus 7/7 referenced assets loaded successfully.
- No accidental absolute local filesystem paths were found in the release HTML.
- Project rules now include the updated template's product-documentation lifecycle, requirement states, acceptance criteria, product commands, and mandatory interactive release validation.
- Corrected Portable Release v0.1.1 uses a direct React browser bundle instead of an SSR HTML snapshot.
- v0.1.1 passed representative real-browser interaction testing with no browser console errors.
- Current-source browser checks confirmed the tester queue structure, equal row heights, single leave entry, and a clean console.
- v0.1.2 passed typecheck, lint, the production build, 2/2 automated tests, and portable bundle generation; exact-artifact browser validation is recorded in the release manifest.
- Exact-artifact browser checks covered all three roles, administrator filtering and detail tabs, request-form open/cancel, the 18-row Tester queue, Break start/end, and leave-form open/cancel with a clean console.
- Current-source browser checks confirmed bilingual switching across all three roles, English preference persistence after reload, correct `lang`/title updates, successful return to Chinese, and no console warnings or errors.
- English-mode source and browser audits now report zero untranslated Chinese strings across static copy, template-driven feedback, mock data, conditional controls, forms, dialogs, tooltips, and accessibility metadata.
