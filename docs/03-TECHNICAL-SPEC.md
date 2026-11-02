# Technical Specification — Boords Replica

## 1. Technology Stack

- **Runtime**: Node.js `>=20` (`v24.22.0` in environment)
- **Framework**: Next.js (App Router, TypeScript, Server & Client Components, Route Handlers)
- **Authentication**: Auth.js / NextAuth (`next-auth`) with Credentials provider, `bcryptjs` password hashing, JWT/database session enforcement, and custom Invite-Only Registration guard
- **Database & ORM**: Prisma ORM (`@prisma/client`, `prisma`)
  - Local Development & Automated Testing: **SQLite** (`file:./dev.db`)
  - Production Deployment: **PostgreSQL** (`postgresql://...`)
- **Styling & UI**: Tailwind CSS + custom Boords design tokens (`#F6F6F0` surface, `#121212` primary ink, `#F4BD64` brand amber, `#E5E4DE` borders, Lucide icons)
- **Testing**: Vitest / Jest for unit & integration tests + Playwright for end-to-end (E2E) browser verification

---

## 2. Application Route Map

### 2.1 Public Marketing Routes
- `GET /` — Marketing Homepage (or Authenticated Workspace Home when logged in or via `/dashboard`)
- `GET /pricing` — Plans & Pricing with Monthly/Annual & Currency toggles
- `GET /storyboard-software` — Storyboard product showcase
- `GET /script-editor` — Script Editor product showcase
- `GET /animatic-software` — Animatic product showcase
- `GET /collaborate` — Collaboration & Review showcase
- `GET /customers` — Customer stories

### 2.2 Authentication & Onboarding Routes
- `GET /login` — Sign in with email & password
- `GET /register` — Invite-only registration (requires valid `inviteCode`; supports `?code=...` query prefill)
- `GET /setup` — First-run workspace bootstrap (active **only** when `User.count() === 0`; creates the initial Owner user and workspace team without any dummy/demo accounts)

### 2.3 Authenticated Workspace Routes
- `GET /dashboard` (and `/` when authenticated) — Workspace Home (`All`, `Storyboards`, `Scripts`; `Grid`, `Board`, `List` views)
- `GET /p/[slug]` — Project Detail View (sub-projects, storyboards, scripts, `Grid | Board | List` views, project share & settings)
- `GET /storyboards/[slug]` — Storyboard Editor (`Edit | Review` modes, `Storyboard | Shot list` views, `Boords Agent`, `Sketch` canvas, `Animatic` player, `Export` modal, `Share` panel)
- `GET /scripts/[slug]` — Script Editor (`Edit | Review` modes, `Two-column AV script` & `Blank script`, WPM runtime calculator, `-> Storyboard` converter, `Export` menu)
- `GET /library` — Shared Asset Library (`Library` folders: `Characters`, `Locations`, `Props`, `Unfiled` + `Image Playground`)
- `GET /activity` — Team Activity & Security Audit Log with project, user, event-type, and date filters
- `GET /archive` — Archived Projects, Storyboards, and Scripts with Restore & Permanent Delete
- `GET /settings/team/manage` (alias `/people`) — Team Members & Invitation Codes management (create single-use/expiring codes, revoke codes, update member roles, remove members)
- `GET /settings/team/general` — Team Name & Logo settings
- `GET /settings/team/statuses` — Custom Workflow Statuses across the 5 lifecycle categories
- `GET /settings/team/templates` — Reusable Storyboard Templates
- `GET /settings/team/domain` — Custom Share Domain configuration
- `GET /settings/team/usage` — AI Credit & Workspace Usage metrics
- `GET /settings/team/api` — Personal/Team API Keys & Webhook endpoints
- `GET /settings/team/connections` — Slack & third-party webhook integrations
- `GET /settings/account/profile` — User Profile (Name, Email, Avatar, Delete account)
- `GET /settings/account/password` — Password update & Two-Factor Authentication toggle
- `GET /settings/account/notification` — Email & in-app notification preferences
- `GET /settings/account/membership` — Team memberships overview
- `GET /settings/billing/plan` — Plan & Billing management

### 2.4 Public Client Share Routes (No Account Required)
- `GET /s/[shortSlug]` & `GET /s/[shortSlug]/frame` — Public Storyboard Review (grid, frame-by-frame slideshow, animatic playback, passphrase check, guest commenting)
- `GET /sc/[shortSlug]` — Public Script Review (read-only AV script table, guest commenting)
- `GET /ps/[shareSlug]` — Public Project Portal (shared project overview with accessible storyboards & scripts)

---

## 3. REST API Specification

| Endpoint | Methods | Auth / Role | Description |
|---|---|---|---|
| `/api/auth/[...nextauth]` | `GET, POST` | Public | NextAuth session & credentials authentication endpoints |
| `/api/auth/bootstrap` | `GET, POST` | Public (Only when `users === 0`) | Checks bootstrap state or initializes the first `OWNER` user & team |
| `/api/auth/register` | `POST` | Public (Requires valid `inviteCode`) | Validates single-use/expiring invitation code, creates user & membership, increments `usedCount`, writes audit log |
| `/api/invites` | `GET, POST` | `OWNER`, `ADMIN` | Lists team invitation codes; creates a new single-use or expiring invitation code with role & project scope |
| `/api/invites/[id]` | `PATCH, DELETE` | `OWNER`, `ADMIN` | Revokes an active invitation code (`revokedAt = now()`) and logs `invite.revoked` |
| `/api/team` | `GET, PATCH` | Authenticated (`PATCH`: `OWNER`, `ADMIN`) | Retrieves or updates team profile, domain, Slack connection, and settings |
| `/api/team/members` | `GET, PATCH, DELETE` | `OWNER`, `ADMIN` | Updates member role (`OWNER`, `ADMIN`, `CREATOR`, `MEMBER`, `REVIEWER`) or revokes membership |
| `/api/team/statuses` | `GET, POST, PATCH, DELETE` | Authenticated (`POST/PATCH/DELETE`: `OWNER`, `ADMIN`) | Manages workflow statuses across the 5 fixed categories |
| `/api/team/templates` | `GET, POST, PATCH, DELETE` | Authenticated | Manages storyboard templates (`aspect_ratio`, `frame_count`, custom `fields`) |
| `/api/team/api-keys` | `GET, POST, DELETE` | `OWNER`, `ADMIN` | Generates or revokes API keys and webhooks |
| `/api/projects` | `GET, POST` | Authenticated | Lists accessible projects; creates a new project or sub-project |
| `/api/projects/[id]` | `GET, PATCH, DELETE` | Authenticated (RBAC checked) | Updates project name, description, star, template, share settings, or archives/deletes |
| `/api/storyboards` | `GET, POST` | Authenticated | Lists storyboards or creates a new storyboard (blank, from template, or from imported script) |
| `/api/storyboards/[id]` | `GET, PATCH, DELETE` | Authenticated | Updates storyboard metadata, status, version, share settings, or archives/deletes |
| `/api/storyboards/[id]/frames` | `GET, POST, PUT, PATCH, DELETE` | Authenticated | Adds, updates, reorders, duplicates, or deletes storyboard frames (including sketch/image data, duration, sound, action, camera, notes, status) |
| `/api/storyboards/[id]/generate` | `POST` | Authenticated | Boords Agent / Frame Sketch Generator: generates frames from prompt/script or synthesizes SVG storyboard artwork for a frame |
| `/api/scripts` | `GET, POST` | Authenticated | Lists or creates scripts (`av` two-column or `blank`) |
| `/api/scripts/[id]` | `GET, PATCH, DELETE` | Authenticated | Updates script content, scenes, speaking rate (`wpm`), status, share settings, or converts to storyboard |
| `/api/assets` | `GET, POST, PATCH, DELETE` | Authenticated | Manages Team Asset Library folders and assets (`@mention_handle`, image, category) |
| `/api/comments` | `GET, POST, PATCH, DELETE` | Authenticated or Guest on Shared Resource | Creates, resolves (`isCompleted`), or deletes comments on frames or scripts |
| `/api/notifications` | `GET, PATCH` | Authenticated | Lists inbox notifications (`All`, `Unread`, `Read`, `Archived`) and marks as read/archived |
| `/api/audit-logs` | `GET` | Authenticated | Queries immutable audit trail (`team`, `project`, `user`, `action`, `from`, `to`) |
| `/api/share/[type]/[slug]` | `GET, POST` | Public (Passphrase verified if enabled) | Resolves public project/storyboard/script share payload and guest comment submission |
