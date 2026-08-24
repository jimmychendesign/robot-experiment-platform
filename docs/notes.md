# Notes

## Project Conventions

- Active source is `app/`, not the template's generic `src/` path.
- UI changes should follow `docs/design.md` and reuse `app/design-system/`.
- Primary business flows are mock-driven until persistence is explicitly connected.
- Releases are created only on explicit request and stored under `output/html/`.

## Migration Note — 2026-08-21

The existing RobotOps application was aligned with the shared project template after initial development. Governance files, documentation folders, prompt placeholders, session records, output directories, and bootstrap support were added without replacing existing application source or generated outputs.
