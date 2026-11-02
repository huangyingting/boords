# Feature-Parity Matrix (`boords.com` & `app.boords.com` vs. Local Production Replica)

| Category | Feature / Workflow | Original Boords (`boords.com` / `app.boords.com`) | Replica Implementation | Status |
|---|---|---|---|---|
| **Marketing Site** | Homepage (`/`) with interactive workflow tabs (`Generate`, `Script`, `Storyboard`, `Edit`, `Animatic`, `Share`) | Yes | Yes | Full Parity |
| **Marketing Site** | Pricing page (`/pricing`) with Monthly/Annual toggle, USD/EUR/GBP currency switcher, AI credit pack selector, 5 tiers & FAQ | Yes | Yes | Full Parity |
| **Marketing Site** | Product pages (`/storyboard-software`, `/script-editor`, `/animatic-software`, `/collaborate`, `/customers`) | Yes | Yes | Full Parity |
| **Marketing Site** | Free Voiceover Script Timer (`/tools/script-timer`) & Storyboard Templates Gallery (`/storyboard-templates`) | Yes | Yes | Full Parity |
| **Auth & Security** | Email & Password Sign-In (`/login`) | Yes | Yes (Auth.js / NextAuth) | Full Parity |
| **Auth & Security** | Zero Dummy Data / First-Run Owner Bootstrap (`/setup`) | N/A | Yes (Strict zero-dummy-data policy) | Enhanced |
| **Auth & Security** | Invite-Only Registration with Single-Use & Expiring Invitation Codes (`/register`, `/api/invites`) | Shared team invite token | Yes (Single-use/multi-use, expiration, email lock, role assignment, immediate revocation) | Enhanced |
| **Auth & Security** | Role-Based Access Control (`OWNER`, `ADMIN`, `CREATOR`, `MEMBER`, `REVIEWER`) & Project-level permissions | Yes | Yes | Full Parity |
| **Auth & Security** | Immutable Audit Logging (`/activity`, `/api/audit-logs`) | Team events feed | Full security + workspace audit log with filters | Enhanced |
| **App Shell** | Far-left Icon Rail (Team Avatar, Inbox popover with All/Unread/Read/Archived tabs, What's New, Help, User Avatar) | Yes | Yes | Full Parity |
| **App Shell** | Collapsible 240px Sidebar (Team dropdown, Home, Assets, Activity, Team, Archive, Projects tree) & `Ctrl+K` Search | Yes | Yes | Full Parity |
| **Projects** | Projects & nested sub-projects (`/p/[slug]`), star, inline description, Move, Archive | Yes | Yes | Full Parity |
| **Projects** | Project views: `All / Storyboards / Scripts` filter tabs + `Grid`, `Board` (Kanban by status), `List` views | Yes | Yes | Full Parity |
| **Storyboards** | New Storyboard modal (`Import Script` tab & `Blank Storyboard` tab with aspect ratios `16:9`, `9:16`, `1:1`, `4:5`) | Yes | Yes | Full Parity |
| **Storyboards** | Empty Storyboard Boords Agent start screen (`What are we storyboarding?`, `@` mentions, `Sketch`, `Import script`, `Add frames`) | Yes | Yes | Full Parity |
| **Storyboards** | Frame Grid Editor with zoom slider, `View options`, `Label`, `Sound`, `Action`, `Duration`, `Quick Generate`, reorder/delete | Yes | Yes | Full Parity |
| **Storyboards** | Freehand Frame Sketch Canvas (`<canvas>` drawing tools), Image Upload & Library Asset insertion | Yes | Yes | Full Parity |
| **Storyboards** | `Shot list` tabular view with per-frame status & CSV/PDF Shot List export | Yes | Yes | Full Parity |
| **Storyboards** | Interactive `Animatic` timeline player with frame timing & captions | Yes | Yes | Full Parity |
| **Storyboards** | 6-tab Right Sidebar (`Boords Agent`, `Comments`, `Script`, `Library Assets`, `Settings`, `Activity`) & Version switching (`v1`, `v2`) | Yes | Yes | Full Parity |
| **Storyboards** | `Export` menu (`PDF`, `Slides`, `Animatic`, `Images`, `After Effects`, `Premiere / Resolve`, `Script`, `Google Sheets`) | Yes | Yes | Full Parity |
| **Scripts** | Script Editor (`/scripts/[slug]`) with `Two-column AV script` & `Blank script`, rich-text toolbar | Yes | Yes | Full Parity |
| **Scripts** | Real-time word count & WPM speaking runtime (`Total RT`, `Audio words`, `130 WPM`) & 1-click `-> Storyboard` conversion | Yes | Yes | Full Parity |
| **Assets** | Shared Asset Library (`/library`, `/library/[teamHash]`, `/library/[teamHash]/playground`) with `Characters`, `Locations`, `Props`, `@handle` mentions & `Playground` | Yes | Yes | Full Parity |
| **Archive** | Workspace Archive (`/archive`, `/archive/[teamHash]`) + In-Editor Archived Read-Only Protection Banner (`Restore Storyboard`) | Yes | Yes | Full Parity |
| **Sharing & Review** | `Edit | Review` toggle & Public Share views (`/s/[shortSlug]`, `/s/[shortSlug]/frame`, `/sc/[shortSlug]`, `/ps/[shareSlug]`) with passphrase & guest comments | Yes | Yes | Full Parity |
| **Settings** | Team Settings (`team/members`, `team/manage`, `team/general`, `team/branding`, `team/statuses`, `team/templates`, `team/api`) & Account Settings (`account/details`, `account/profile`, `account/security`, `account/notifications`, `account/teams`) | Yes | Yes | Full Parity |
| **Database** | SQLite for local dev & automated tests + PostgreSQL for production | PostgreSQL | Dual Prisma setup (SQLite + PostgreSQL) | Full Parity |
