# Summary — 2026-09-02

Robot scheduling and Robot management were decoupled from Tester staffing. Tester-specific availability and task handling remain in their own views.

Robot management now uses a responsive four-column card grid. A header settings action applies one shared schedule configuration to all Robots, while each Robot detail shows the global baseline and supports an isolated override using the same fields. Automatic was renamed Online and the additional unavailable-period editor was removed.

Following browser feedback, the large Robot Management wrapper panel was removed; its header and card grid now sit directly on the page content canvas.

The manager Operations page now uses a 40px grid gap between its direct content sections.

The Robot settings drawer no longer shows the introductory callout or the repeated online-status helper sentence.

Detail-drawer section titles now use the design-system Heading 3 token. Active experiment details no longer expose Tester data or Tester-dependent actions and copy.

Robot cards now show their effective work and downtime periods directly below the Robot name and no longer display configuration-source labels.

Every Robot card now separates the current-experiment row with an 8px top inset and the standard design-system divider.

Robot detail Current Information now focuses on the operating overview and today's experiments; daily schedule configuration remains in Settings only.

Robot shared configuration is now labeled Batch Settings throughout the UI and current product documentation. Each card can be selected, the Header can select all Robots in the current filter, and the action applies only to selected Robots while preserving unselected configurations.

Typecheck, lint, production build/tests, and browser interaction checks passed. The browser confirmed four columns at the desktop viewport, global apply across all mock Robots, isolated per-Robot override, global reset, and removal of the extra unavailable-period editor.

The final batch-selection correction also passed browser interaction checks: the action is disabled with no selection, one selected Robot updates without changing an unselected Robot, and select-all selects all 10 Robots in the current filtered list. The responsive grid now switches to two columns through 1439px so checkbox-equipped cards remain readable, while wider desktop screens retain four columns.

Robot card icons now use a 40px container with a 32px glyph to span the name and schedule lines. The select-all control, status filter, and Settings button are aligned to a uniform 40px height.

The select-all label and Robot status filter now share the same Caption font size, semibold weight, and secondary text color.

PRD-004 FR-009 now also includes the confirmed Requirement cancellation notification. Cancellation notifies the pre-cancellation current owner and the Feishu group while retaining Requirement and Experiment records; Experiment disposition and resource release remain TBD.

PRD-004 now defines the new Requirement-lifecycle RBAC roles, their responsibilities, and the supplied functional-permission matrix. The role inventory is synchronized with the product structure and global roles-and-permissions document. Three conflicts between the supplied matrix, role responsibilities, and FR-009 remain explicitly marked for product confirmation.

Robot scheduling analysis recommends separating time-bound operational outages/maintenance from recurring daily availability templates. Emergency shutdown blocks new starts immediately; planned maintenance follows its configured interval; recurring daily-hours changes default to the next scheduling day. High-impact same-day changes require an impact preview and explicit confirmation, and schedule publication should be atomic with rollback to the last legal plan on failure. The review also identified current prototype conflicts around fallback-Robot reassignment, forced minimum capacity, and combined status/template saving.

PRD-005 was reconciled with the current manager App. It now documents the three-page manager information architecture, page-specific KPIs, selection-based Robot settings, separated Robot and Tester schedules, Requirement processing through pending delivery confirmation, and the role-scoped application notification center. Formal Scope was corrected against the product structure and feature workbook. Confirmed business rules remain authoritative, while nine current prototype deviations are explicitly listed for future implementation work.
