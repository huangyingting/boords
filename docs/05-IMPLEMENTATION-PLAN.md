# Phased Implementation Plan

## Phase 1: Exploration & Reverse Engineering (`COMPLETED`)
- Authenticated against `https://app.boords.com` using `.cred` cookies and explored `https://boords.com`.
- Captured 55+ desktop and mobile screenshots in `docs/exploration/screenshots/`.
- Extracted DOM structures, computed CSS styles, and REST/JSON API payloads in `docs/exploration/data/`.
- Restored the live account state by cleaning up temporary test items.

## Phase 2: Architecture & Product Documentation (`COMPLETED`)
- Authored Exploration Coverage Report (`00-EXPLORATION-REPORT.md`), ADR (`01-ADR.md`), PRD (`02-PRD.md`), Technical Spec (`03-TECHNICAL-SPEC.md`), Architecture & Data Model (`04-ARCHITECTURE-AND-DATA-MODEL.md`), Implementation Plan (`05-IMPLEMENTATION-PLAN.md`), Task Backlog (`06-TASK-BACKLOG.md`), Acceptance Criteria (`07-ACCEPTANCE-CRITERIA.md`), and Feature-Parity Matrix (`08-FEATURE-PARITY-MATRIX.md`).

## Phase 3: Project Scaffolding & Dual-DB Prisma Setup
- Initialize Next.js (App Router, TypeScript, Tailwind CSS) in `/data/boords`.
- Configure Prisma with SQLite (`prisma/schema.prisma`) for local development/testing and PostgreSQL (`prisma/schema.postgres.prisma`) for production.
- Run Prisma migrations (`npx prisma migrate dev --name init`) and generate Prisma Client.
- Enforce zero dummy data / zero demo accounts in the database initialization.

## Phase 4: Authentication, Invite-Only Registration, RBAC, Revocation & Audit Logging
- Implement Auth.js / NextAuth credentials authentication and session helpers.
- Implement First-Run Workspace Bootstrap (`/setup` and `/api/auth/bootstrap`) when `User.count() === 0`, generating initial default workflow statuses, storyboard templates, and asset folders upon workspace creation without any fake users.
- Implement Invite-Only Registration (`/register` and `/api/auth/register`) validating single-use (`maxUses`), expiration (`expiresAt`), email lock, and revocation (`revokedAt`).
- Implement RBAC authorization guards (`OWNER`, `ADMIN`, `CREATOR`, `MEMBER`, `REVIEWER`) and immutable `AuditLog` recording.

## Phase 5: Public Marketing Website (`boords.com` Parity)
- Implement responsive marketing navigation, Hero with interactive pipeline tabs (`Generate`, `Script`, `Storyboard`, `Edit`, `Animatic`, `Share`), customer logo strip, feature blocks, FAQ accordion, and dark footer.
- Implement `/pricing` (Monthly/Annual toggle, USD/EUR/GBP selector, 4 plan tiers, comparison matrix), `/storyboard-software`, `/script-editor`, `/animatic-software`, `/collaborate`, and `/customers`.

## Phase 6: Core Workspace, Storyboard Editor, Script Editor, Assets & Settings (`app.boords.com` Parity)
- Implement the persistent 2-tier App Shell (Far-left Icon Rail with Inbox popover, What's New, Help, User Avatar + Collapsible 240px Sidebar with Team dropdown, Nav links, and Projects tree + `Ctrl+K` Search modal).
- Implement Workspace Home (`/dashboard`) and Project Detail (`/p/[slug]`) with `All / Storyboards / Scripts` filter tabs, `Grid / Board (Kanban) / List` views, project sharing modal, and bulk selection toolbar.
- Implement Storyboard Editor (`/storyboards/[slug]`) with:
  - Empty state Boords Agent prompt bar + quick actions (`Import script`, `Add frames`, `See what's possible`)
  - Frame Grid view with zoom slider, `View options`, frame numbering, inline fields (`Label`, `Duration`, `Sound`, `Action`, `Camera`, `Notes`), drag/button reordering, and `Quick Generate`
  - Interactive HTML5 Freehand Sketch Canvas & Image Upload modal
  - `Shot list` tabular view with inline status and CSV export
  - Interactive `Animatic` timeline player with play/pause, scrubbing, and voiceover/caption display
  - 6-tab right sidebar (`Boords Agent`, `Comments`, `Script`, `Library Assets`, `Storyboard Settings`, `Activity`)
  - `Export` menu (`PDF`, `Slides`, `Animatic`, `Images`, `After Effects`, `Premiere / Resolve`, `Script`, `Google Sheets`)
  - `Edit | Review` mode toggle and Version History (`v1`, `v2`, ...)
- Implement Script Editor (`/scripts/[slug]`) with `Two-column AV script` table, automatic word count & WPM runtime calculation (`Total RT`, `Audio words`, `130 WPM`), rich-text formatting toolbar, `-> Storyboard` conversion, `Export` menu (`PDF`, `Word`, `Markdown`, `Plain text`), and `Edit | Review` modes.
- Implement Shared Asset Library (`/library` with `Library` folders & `@mention_handle` and `Playground`), Activity Log (`/activity`), Archive (`/archive`), and all Team & Account Settings pages (`/settings/team/*`, `/settings/account/*`, `/settings/billing/plan`).
- Implement Public Share & Guest Review routes (`/s/[shortSlug]`, `/s/[shortSlug]/frame`, `/sc/[shortSlug]`, `/ps/[shareSlug]`).

## Phase 7: Automated Testing, Verification & Deployment Config
- Write and run unit/integration tests and Playwright E2E tests covering bootstrap, invite creation, single-use/expired/revoked invite enforcement, RBAC, project/storyboard/script creation, AV script-to-storyboard conversion, animatic playback, public share links, and audit logging.
- Add production deployment configuration (`Dockerfile`, `docker-compose.yml`, `.env.example`, PostgreSQL migration scripts).
