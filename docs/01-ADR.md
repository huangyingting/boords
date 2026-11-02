# Architecture Decision Records (ADR)

## ADR-001: Full-Stack Framework — Next.js App Router with TypeScript

- **Status**: Accepted
- **Context**: Boords comprises both a high-conversion public marketing site (`boords.com`) and a rich, interactive single-page-feel SaaS workspace (`app.boords.com`) with REST/JSON APIs, public share routes (`/s/[slug]`, `/sc/[slug]`, `/ps/[slug]`), and server-enforced authentication/authorization.
- **Decision**: Build a unified Next.js (latest stable App Router) + TypeScript application serving both marketing routes, authenticated workspace routes, public review routes, and `/api/*` REST endpoints.
- **Consequences**:
  - Shared design tokens, typography, and component primitives across marketing and workspace views.
  - Server Components and Route Handlers enforce authentication, RBAC, and audit logging on the server before data reaches the client.

---

## ADR-002: Dual-Database Prisma Architecture (SQLite Local Dev, PostgreSQL Production)

- **Status**: Accepted
- **Context**: The project requires zero-friction local development and automated testing using SQLite while supporting PostgreSQL in production deployments.
- **Decision**: Use Prisma ORM with portable schema types (String UUID/CUID primary keys, ISO timestamps, JSON/text serialization where appropriate) and provide both `prisma/schema.prisma` (SQLite default for local development/CI) and `prisma/schema.postgres.prisma` + migration scripts for PostgreSQL production deployments.
- **Consequences**:
  - Local development and E2E tests run out-of-the-box against a local SQLite database file without external container dependencies.
  - Production deployments switch seamlessly to PostgreSQL via `DATABASE_URL`.

---

## ADR-003: Authentication & Invite-Only Registration with Single-Use / Expiring Invitation Codes

- **Status**: Accepted
- **Context**: The application must be production-ready with **no dummy data or demo user accounts**, and must enforce **invite-only registration** with single-use or expiring invitation codes, role assignment, revocation, and full audit logging.
- **Decision**:
  1. Integrate **Auth.js / NextAuth** (Credentials provider with `bcryptjs` password hashing + session management) alongside custom invitation validation.
  2. Registration (`/register`) requires a valid **Invitation Code** (`code` / `token`).
  3. Bootstrap Flow: When the database has zero users (`COUNT(User) = 0`), a one-time bootstrap CLI/endpoint or initial setup screen generates or accepts a cryptographically random bootstrap Owner invitation code (or allows the very first user to initialize the workspace with a generated bootstrap code) without seeding any fake/demo user accounts.
  4. Invitation Codes support:
     - **Single-use (`maxUses = 1`)** or configurable multi-use limits (`usedCount < maxUses`)
     - **Expiration timestamp (`expiresAt`)**
     - **Target Role (`OWNER`, `ADMIN`, `CREATOR`, `REVIEWER`, `MEMBER`)** and optional **Project-scoped access**
     - **Immediate Revocation (`revokedAt`, `revokedById`)** — revoked or expired codes are rejected at registration with a clear error state and logged in the audit trail.

---

## ADR-004: Role-Based Access Control (RBAC) & Project-Level Permissions

- **Status**: Accepted
- **Context**: Boords supports team-level roles (`Admin`, `Member`, `Creator`, `Reviewer`) and granular action permissions (`storyboards.create`, `storyboards.rename`, `storyboards.move`, `storyboards.delete`, `projects.create`, `projects.move`, `projects.rename`, `projects.delete`, `team.view`, `team.manage`, `team.billing`) plus project-specific access restrictions.
- **Decision**: Implement a hierarchical RBAC policy engine in `src/lib/auth/rbac.ts`:
  - `OWNER` / `ADMIN`: Full access to team settings, member invitations, invitation revocation, statuses, templates, API keys, webhooks, billing, and all projects.
  - `CREATOR` / `MEMBER`: Can create, edit, move, and archive projects, storyboards, scripts, frames, and library assets they have access to.
  - `REVIEWER`: Can view assigned projects/storyboards/scripts, post comments, and update review statuses, but cannot delete projects or manage team settings.

---

## ADR-005: Comprehensive Immutable Audit Logging

- **Status**: Accepted
- **Context**: Both security requirements (tracking invite creation, redemption, revocation, role changes, login attempts, API key generation) and Boords' native `Activity` feed (`/activity/:teamHash` and storyboard/script `Activity` tabs) require structured event logging.
- **Decision**: Create an `AuditLog` model in Prisma that records every security and workspace event (`actorId`, `teamId`, `projectId`, `storyboardId`, `scriptId`, `action`, `targetType`, `targetId`, `metadata`, `ipAddress`, `userAgent`, `createdAt`) and expose it both in the Team Activity dashboard (`/activity`) and per-document Activity sidebars.

---

## ADR-006: Interactive Storyboard Canvas, Freehand Sketching, Shot List & Animatic Player

- **Status**: Accepted
- **Context**: Boords' core value proposition is its fluid Storyboard Editor featuring:
  - Grid view with zoom slider (1–6 columns) & Shot List tabular view
  - Per-frame HTML5 canvas freehand drawing/sketching tool, image upload, `@` Library Asset reference insertion, and procedural/AI SVG storyboard frame generator
  - Custom frame fields (`Label`, `Duration`, `Sound` / `Voiceover`, `Action`, `Camera`, `Notes`) and per-frame status
  - Interactive Animatic player with timeline scrubbing, per-frame duration timing, audio/voiceover synthesis or upload, and export to PDF / CSV Shot List / JSON / HTML Slideshow.
- **Decision**: Build native client-side interactive canvas drawing (`<canvas>` with brush, eraser, shapes, colors, undo/redo, exported as PNG data URL), drag-and-drop/button frame reordering, real-time Animatic playback engine (`requestAnimationFrame` timer synced to frame durations), and client/server PDF & Shot List export.

---

## ADR-007: Two-Column AV Script Editor with Real-Time Runtime Calculation & Script-to-Storyboard Sync

- **Status**: Accepted
- **Context**: In `app.boords.com/scripts/:slug`, scripts support both freeform rich text and a structured **Two-Column AV Script** (`SCENE`, `AUDIO / VOICEOVER`, `VISUAL`) that computes word count and speaking runtime (`Total RT`, `Audio words`, configurable `WPM` e.g. `130 WPM`) and converts scenes directly into Storyboard frames (`-> Storyboard`).
- **Decision**: Model `Script` and `ScriptScene` in Prisma, calculate word count and `MM:SS` runtime per scene and total script dynamically based on the selected WPM rate (`100`, `130`, `150`, `180 WPM`), and provide 1-click **Generate Storyboard from Script** that maps each `ScriptScene` into a `StoryboardFrame` with pre-populated `Sound/VO`, `Action/Visual`, and calculated `Duration`.
