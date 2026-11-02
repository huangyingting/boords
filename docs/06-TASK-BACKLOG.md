# Engineering Task Backlog

## Epic 1: Foundation, Database & Authentication
- **[TASK-101]** Initialize Next.js TypeScript project with Tailwind CSS and Boords design tokens (`#F6F6F0`, `#121212`, `#F4BD64`).
- **[TASK-102]** Author Prisma schema (`prisma/schema.prisma` for SQLite and `prisma/schema.postgres.prisma` for PostgreSQL) and run initial migration.
- **[TASK-103]** Implement Auth.js / NextAuth configuration (`src/lib/auth/options.ts`), password hashing (`bcryptjs`), and session helpers.
- **[TASK-104]** Implement First-Run Workspace Bootstrap (`/setup` & `/api/auth/bootstrap`) with zero dummy/demo accounts.
- **[TASK-105]** Implement Invite-Only Registration (`/register` & `/api/auth/register`) enforcing single-use (`maxUses`), expiration (`expiresAt`), email lock, and revocation (`revokedAt`).
- **[TASK-106]** Implement RBAC middleware/helpers (`src/lib/auth/rbac.ts`) and immutable Audit Logger (`src/lib/audit.ts`).

## Epic 2: Public Marketing Website (`boords.com`)
- **[TASK-201]** Build Marketing Header (dropdown menus for Product, Solutions, Resources, Pricing, Sign in, Get started) and Footer.
- **[TASK-202]** Build Marketing Homepage (`/`) with interactive workflow showcase tabs (`Generate`, `Script`, `Storyboard`, `Edit`, `Animatic`, `Share`), social proof, and FAQ accordion.
- **[TASK-203]** Build `/pricing` with Monthly/Annual billing toggle, USD/EUR/GBP currency selector, plan cards, and feature comparison table.
- **[TASK-204]** Build product marketing pages (`/storyboard-software`, `/script-editor`, `/animatic-software`, `/collaborate`, `/customers`).

## Epic 3: Workspace Shell, Projects & Navigation (`app.boords.com`)
- **[TASK-301]** Build persistent 2-tier App Shell: Far-left Icon Rail (Team Avatar, Inbox popover with All/Unread/Read/Archived tabs, What's New, Help, User Avatar) + Collapsible 240px Sidebar (Team dropdown, Home, Assets, Activity, Team, Archive, and Projects tree).
- **[TASK-302]** Build Global Search modal (`Ctrl+K`) and `+ New` creation modal (`Storyboard`, `Script`, `Project`).
- **[TASK-303]** Build Workspace Home (`/dashboard`) and Project Detail View (`/p/[slug]`) with `All / Storyboards / Scripts` tabs, `Grid / Board (Kanban) / List` views, inline description, project actions menu, and project Share modal.
- **[TASK-304]** Build Archive page (`/archive`) with search, read-only banner, restore, and permanent delete.

## Epic 4: Storyboard Editor, Sketch Canvas, Shot List & Animatic
- **[TASK-401]** Build New Storyboard modal (`Import Script` tab with paste/file upload & `Blank Storyboard` tab with required `Name` and `Frame Size` selector).
- **[TASK-402]** Build Storyboard Editor (`/storyboards/[slug]`) empty state with Boords Agent prompt composer (`What are we storyboarding?`, `@` references, model/style selector, `Import script`, `Add frames`).
- **[TASK-403]** Build Storyboard Frame Grid view with zoom slider (`1–6` cols), `View options` (`Show generator`, `Show script`, `Collapse all`), frame cards (`Label`, `Duration`, `Sound`, `Action`, `Quick Generate`), drag/reorder, bulk select, and delete.
- **[TASK-404]** Build Interactive Frame Sketch/Drawing Modal (`<canvas>` with pen, brush size, color palette, shapes, eraser, undo/redo, image upload, and Library Asset picker).
- **[TASK-405]** Build `Shot list` tabular view with inline field editing, per-frame status selector, and CSV/PDF shot list export.
- **[TASK-406]** Build `Animatic` timeline player modal/view with frame duration playback, scrubber, and caption/voiceover display.
- **[TASK-407]** Build 6-tab Right Sidebar (`Boords Agent`, `Comments`, `Script`, `Library Assets`, `Storyboard Settings`, `Activity`), Version History (`v1`, `v2`), `Export` modal (`PDF`, `Slides`, `Animatic`, `Images`, `CSV`), and `Edit | Review` mode toggle.

## Epic 5: Script Editor & Shared Asset Library
- **[TASK-501]** Build Script Editor (`/scripts/[slug]`) with initial choice (`Two-column AV script` vs `Blank script`), rich-text formatting toolbar, and `Edit | Review` toggle.
- **[TASK-502]** Build Two-Column AV Script Table (`SCENE`, `AUDIO / VOICEOVER`, `VISUAL`) with real-time word count and WPM speaking runtime calculation (`100 / 130 / 150 / 180 WPM`).
- **[TASK-503]** Build 1-click `-> Storyboard` converter that creates a Storyboard populated from the script's scenes, plus Script `Export` (`PDF`, `Word`, `Markdown`, `Plain text`).
- **[TASK-504]** Build Shared Asset Library (`/library`) with `Library` tab (`Characters`, `Locations`, `Props`, `Unfiled` folders, `@handle` badges, upload/create asset) and `Playground` tab.

## Epic 6: Team/Account Settings, Invite Management, Public Sharing & Tests
- **[TASK-601]** Build Team Settings pages (`/settings/team/manage` with Invite Code generator, expiration/single-use settings, revocation, and member RBAC management; `/settings/team/general`; `/settings/team/statuses`; `/settings/team/templates`; `/settings/team/domain`; `/settings/team/usage`; `/settings/team/api`; `/settings/team/connections`).
- **[TASK-602]** Build Account Settings pages (`/settings/account/profile`, `/settings/account/password`, `/settings/account/notification`, `/settings/account/membership`, `/settings/billing/plan`) and Team Activity Log (`/activity`).
- **[TASK-603]** Build Public Share Views (`/s/[shortSlug]`, `/s/[shortSlug]/frame`, `/sc/[shortSlug]`, `/ps/[shareSlug]`) with passphrase gate, frame slideshow/grid, and guest commenting.
- **[TASK-604]** Write and execute automated tests (Vitest + Playwright E2E) and create deployment configuration (`Dockerfile`, `docker-compose.yml`, `.env.example`).
