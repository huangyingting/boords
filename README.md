# Boords — AI Storyboard, Script & Animatic Production Platform

A production-ready full-stack web application replicating **Boords** (`boords.com` & `app.boords.com`), built with **Next.js 15 (App Router, TypeScript, Tailwind CSS)**, **Auth.js / NextAuth**, and **Prisma ORM** supporting **SQLite** for local development and **PostgreSQL** for production deployment.

---

## Key Features

1. **Zero-Dummy-Data & First-User Owner Bootstrap**
   - Ships with an empty database (`0` pre-seeded demo users or dummy accounts).
   - When `User.count() === 0`, `/setup` (and `/register`) lets the first administrator create the initial **Owner** account and workspace with default Boords statuses (`Not started`, `Needs work`, `Approved`), template presets (`Default`, `Compact`), and starter illustration library assets.
2. **Invite-Only Registration with Single-Use & Expiring Codes**
   - Subsequent users can only register via a valid cryptographically random invitation code (`BRD-XXXX-XXXX-XXXX`) generated in **Settings → Team → Users & Invites**.
   - Supports **single-use** (`maxUses = 1`) or multi-use codes, configurable **expiration windows**, **optional email locking**, and **instant revocation**.
3. **Role-Based Access Control (RBAC) & Instant Session Revocation**
   - 4 granular workspace roles: `OWNER`, `ADMIN`, `MEMBER`, and `VIEWER`.
   - Every API call and JWT session refresh verifies `user.revokedAt === null` and `teamMember.status === 'ACTIVE'` in the database, immediately invalidating revoked users.
4. **Immutable Security & Collaboration Audit Logging**
   - Every sensitive mutation (`bootstrap`, `register`, `invite.created`, `invite.redeemed`, `invite.revoked`, `member.role_changed`, `member.revoked`, `project.created`, `storyboard.created`, `storyboard.ai_generated`, `script.created`, `script.to_storyboard`, `comment.created`, `api_key.created`) writes an immutable `AuditLog` entry visible in **Settings → Audit Log** and **Activity Feed**.
5. **Marketing Website (`/`, `/pricing`, `/storyboard-software`, `/script-editor`, `/animatic-software`, `/collaborate`, `/customers`)**
   - Replicates the authentic Boords warm cream (`#F6F6F0`) and amber (`#F4BD64`) design system, interactive Billing Interval + AI Credit Tier pricing matrix, FAQ accordion, and responsive mobile drawer.
6. **Workspace, Storyboard Editor, Boords Agent AI, Animatics, Script Editor & Public Share Views**
   - **Workspace**: Projects (`/dashboard`, `/p/[slug]`), Library (`/library` with `@character` mentions), Activity (`/activity`), Archive (`/archive`).
   - **Storyboard Editor (`/storyboards/[slug]`)**: Boords Agent AI prompt-to-storyboard generator, Frame Grid & Shot List table views, View Options customization, Frame Editor with SVG freehand brush/arrow/rectangle canvas annotations, 6-tab right utility dock (Frames, Generate, Library, Versions, Comments, Export), and Web-Audio synthesized **Animatic Player**.
   - **Script Editor (`/scripts/[slug]`)**: Two-column Audio/Visual table editor + Blank Script mode, live WPM duration calculator (`130`, `150`, `170` WPM), and one-click `-> Storyboard` conversion.
   - **Public Share Links (`/s/[shortSlug]`, `/s/[shortSlug]/frame`, `/sc/[shortSlug]`, `/ps/[shareSlug]`)**: Read-only presentation views with optional password protection and guest review comments.

---

## Documentation Suite (`/docs`)

- [`docs/00-EXPLORATION-REPORT.md`](docs/00-EXPLORATION-REPORT.md) — Playwright exploration report with 55+ screenshots (`docs/exploration/screenshots/`)
- [`docs/01-ADR.md`](docs/01-ADR.md) — Architecture Decision Records (ADR-001 through ADR-007)
- [`docs/02-PRD.md`](docs/02-PRD.md) — Product Requirements Document
- [`docs/03-SPEC.md`](docs/03-SPEC.md) — Technical & API Specification
- [`docs/04-ARCHITECTURE-AND-DATA-MODEL.md`](docs/04-ARCHITECTURE-AND-DATA-MODEL.md) — System Architecture & Prisma Data Model
- [`docs/05-IMPLEMENTATION-PLAN.md`](docs/05-IMPLEMENTATION-PLAN.md) — Phased Implementation Plan
- [`docs/06-TASK-BACKLOG.md`](docs/06-TASK-BACKLOG.md) — Engineering Task Backlog
- [`docs/07-ACCEPTANCE-CRITERIA.md`](docs/07-ACCEPTANCE-CRITERIA.md) — Gherkin Acceptance Criteria
- [`docs/08-FEATURE-PARITY-MATRIX.md`](docs/08-FEATURE-PARITY-MATRIX.md) — Feature Parity Matrix

---

## Getting Started

### Local Development (SQLite)

```bash
npm install
npx prisma migrate dev
npm run dev
```

Open `http://localhost:3000/setup` to bootstrap the initial **Workspace Owner** account.

### Production Deployment (PostgreSQL + Docker)

```bash
docker compose up --build -d
```

### Running Tests

```bash
# Unit & Integration Tests (Vitest: RBAC, Single-Use/Expiring Invites, Revocation, Audit Logging, Zero-Dummy-Data)
npm run test:unit

# End-to-End Tests (Playwright: Marketing, Owner Bootstrap, Invite Redemption, Storyboard, Script, Animatic, Share)
npm run test:e2e
```
