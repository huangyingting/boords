# Product Requirements Document (PRD) — Boords Pre-Production Platform

## 1. Product Vision & Scope

Boords is a modern video pre-production platform that takes creative teams, agencies, and production studios from initial concept and scriptwriting through storyboarding, animatics, client review, and final sign-off.

This implementation delivers a **production-ready, full-stack replica** of `boords.com` and `app.boords.com`, complete with:
1. **Public Marketing & Product Pages** (`/`, `/pricing`, `/storyboard-software`, `/script-editor`, `/animatic-software`, `/collaborate`, `/customers`) matching Boords' warm editorial aesthetic (`#F6F6F0` surface, `#121212` ink, `#F4BD64` amber accent).
2. **Invite-Only Authentication, RBAC, Revocation & Audit Logging** (`/login`, `/register`, `/settings/team/*`, `/settings/account/*`, `/activity`) with single-use or expiring invitation codes and zero dummy/demo accounts.
3. **Full Workspace & Pre-Production Suite** (`Home`, `Projects` & nested sub-projects, `Storyboard Editor`, `Shot List`, `Frame Sketch & Generator`, `Animatic Timeline Player`, `Two-Column AV Script Editor`, `Shared Asset Library` with `@mentions`, `Workflow Statuses`, `Templates`, `Version History`, `Public Client Share & Review Links`, and `Archive`).

---

## 2. Target User Personas

1. **Workspace Owner / Creative Director (`OWNER` / `ADMIN`)**:
   - Sets up the team workspace, customizes workflow statuses and storyboard templates, generates single-use/expiring invitation codes for team members and freelancers, manages roles/revocation, reviews audit logs, and signs off on storyboards.
2. **Producer / Storyboard Artist / Scriptwriter (`CREATOR` / `MEMBER`)**:
   - Writes two-column AV scripts, converts scripts into storyboards, sketches or uploads frame visuals, tags `@characters` and `@locations` from the Asset Library, previews animatic timing, and exports PDFs/shot lists.
3. **Internal Reviewer (`REVIEWER`)**:
   - Reviews storyboards and scripts in `Review` mode, leaves frame-specific comments and annotations, and updates workflow statuses (`In review` → `Changes requested` or `Approved`).
4. **External Client / Guest Reviewer (Unauthenticated Share Link Visitor)**:
   - Accesses shared links (`/s/:shortSlug`, `/sc/:shortSlug`, `/ps/:shareSlug`) with optional passphrase protection, steps through frames or watches the animatic, and leaves feedback comments without needing an account.

---

## 3. Functional Requirements

### FR-1: Authentication & Invite-Only Registration
- **FR-1.1**: Users can sign in at `/login` with email and password.
- **FR-1.2**: New user registration at `/register` is strictly **invite-only** and requires a valid invitation code.
- **FR-1.3**: First-run initialization: When no users exist in the database, `/setup` (or `/register` in bootstrap mode) allows generating the initial `OWNER` account without pre-seeding any fake or demo users.
- **FR-1.4**: Admins/Owners can create invitation codes with:
  - Optional target email address
  - Assigned role (`ADMIN`, `CREATOR`, `MEMBER`, `REVIEWER`)
  - Single-use (`maxUses = 1`) or custom use count
  - Expiration date/time (`expiresAt`)
  - Optional project-scoped access list
- **FR-1.5**: Admins/Owners can immediately **revoke** any active invitation code or remove/change a member's role.

### FR-2: Workspace Shell, Navigation & Search
- **FR-2.1**: Far-left persistent icon rail (`56px`) with Team Avatar switcher, **Inbox** notification popover (`All`, `Unread`, `Read`, `Archived` tabs), **What's New** drawer, **Help & shortcuts** modal, and **User Avatar** menu.
- **FR-2.2**: Collapsible `240px` workspace sidebar with Team dropdown menu (`Invite members`, `Team settings`, `Templates`, `Help docs`), main navigation (`Home`, `Assets`, `Activity`, `Team`, `Archive`), and `PROJECTS` tree (`Select projects`, `Sort`, `Create a new project`, `Filter`, nested sub-projects).
- **FR-2.3**: Global Command/Search modal (`Ctrl+K` / `Cmd+K`) to search across all projects, storyboards, scripts, and library assets.

### FR-3: Projects & Workflow Statuses
- **FR-3.1**: Create, rename, star/favorite, describe, move, bulk-select, and archive projects and nested sub-projects (`/p/:slug`).
- **FR-3.2**: View project contents filtered by `All`, `Storyboards`, or `Scripts` in three layout modes:
  - **Grid View**: Visual cards with frame thumbnails, version count, comment count, and inline status pill dropdown.
  - **Board View (Kanban)**: Columns grouped by team workflow statuses (`Draft`, `In progress`, `In review`, `Changes requested`, `Approved`).
  - **List View**: Compact table rows with metadata and quick actions.
- **FR-3.3**: Customize team workflow statuses in `/settings/team/statuses` across the 5 core categories.

### FR-4: Storyboard Editor, Shot List, Sketching & Animatic Player
- **FR-4.1**: Create storyboards from a **Blank Storyboard** (choosing name, aspect ratio `16:9`, `9:16`, `1:1`, `4:5`, `2.39:1`, and optional template) or by **Importing a Script** (paste or upload `.txt`, `.md`, `.csv`).
- **FR-4.2**: Empty storyboard start screen featuring the **Boords Agent** prompt bar (`What are we storyboarding?`), `@` asset references, style selector (`Sketch`, `Color`, `Line Art`, `Cinematic`), and quick actions (`Import script`, `Add frames`, `See what's possible`).
- **FR-4.3**: **Storyboard Grid View**:
  - Zoom slider (`1` to `6` columns) and `View options` popover (`Show generator`, `Show script`, `Collapse all`).
  - Frame cards with aspect-ratio-accurate canvas, frame number, `Label`, `Duration (s)`, `Sound / Voiceover`, `Action / Direction`, `Camera / Notes`, and per-frame status.
  - Add, duplicate, reorder (move left/right or drag), bulk select (`Ctrl+A`), and delete frames.
- **FR-4.4**: **Frame Visual Editor**:
  - **Freehand Sketch Canvas**: Draw directly on frames with brush sizes, colors, highlighter, line/rectangle/arrow tools, undo/redo, clear, and save to frame.
  - **Image Upload**: Upload PNG/JPG/WebP/SVG images onto any frame.
  - **Library Asset Insertion**: Insert characters, locations, and props from the Team Asset Library onto a frame.
  - **Quick Generate (AI / Procedural Storyboard Sketch Generator)**: Generate visual storyboard illustrations from the frame's `Action` and `@asset` references in `Sketch`, `Color`, or `Cinematic` style.
- **FR-4.5**: **Shot List View**:
  - Tabular view (`Frame`, `Image`, `Label`, `Duration`, `Sound`, `Action`, `Camera/Notes`, `Status`) with inline editing and `Export Shot List` (CSV/PDF).
- **FR-4.6**: **Animatic Player**:
  - Full timeline player that plays through frames sequentially according to each frame's `Duration` (default `3.0s`), with Play/Pause, frame stepping, timeline scrubbing, audio/caption overlay, and total runtime display.
- **FR-4.7**: **Versions & Export**:
  - Create new storyboard versions (`v1`, `v2`, ...) with version notes and switch between versions.
  - Export storyboard as **PDF** (configurable layout, fields, paper size), **CSV Shot List**, **HTML Presentation / Slides**, **Images (ZIP/JSON)**, or **Script**.

### FR-5: Script Editor (Two-Column AV & Freeform)
- **FR-5.1**: Create scripts in a project (`/scripts/:slug`) choosing **Two-column AV script** or **Blank script**.
- **FR-5.2**: Two-column AV script table with `SCENE`, `AUDIO / VOICEOVER`, and `VISUAL` columns, per-scene word count and runtime (`0:00 RT`), total runtime & word count header, configurable speaking rate (`100`, `130`, `150`, `180 WPM`), and scene insertion/deletion/reordering.
- **FR-5.3**: Rich-text formatting toolbar (`Undo`, `Redo`, `Paragraph/Heading`, `Bold`, `Italic`, `Underline`, `Strike`, `Alignment`, `Font Size`).
- **FR-5.4**: **1-Click Script-to-Storyboard (`-> Storyboard`)**: Generates a new linked Storyboard where each script scene becomes a frame with its `AUDIO / VOICEOVER` mapped to `Sound` and `VISUAL` mapped to `Action` and calculated `Duration`.
- **FR-5.5**: Export script to **PDF**, **Word (`.doc`/`.docx`)**, **Markdown (`.md`)**, or **Plain text (`.txt`)**.

### FR-6: Shared Asset Library (`Assets`)
- **FR-6.1**: Organize reusable visual assets into folders (`Characters`, `Locations`, `Props`, `Unfiled`, plus custom folders).
- **FR-6.2**: Each asset has a `filename`, `@mention_handle` (e.g., `@alex`, `@office`), `description`/`alt`, and image.
- **FR-6.3**: Reference assets via `@handle` in storyboard frame fields and the AI/Playground generator.

### FR-7: Review Mode, Comments & Public Sharing
- **FR-7.1**: Both Storyboard Editor and Script Editor feature an `Edit | Review` segmented mode switcher.
- **FR-7.2**: Share settings configure public URLs (`/s/:shortSlug`, `/sc/:shortSlug`, `/ps/:shareSlug`), optional passphrase protection, expiration date, and granular permissions (`Allow comments`, `Hide completed`, `Allow on old versions`, `Show version number`, `Allow guest version switching`, `Allow guests to download`, `Share as grid`, `Animatic`).
- **FR-7.3**: Frame-specific and script-level comments support visibility (`Everyone` vs `Team only`), completion/resolution checkmark (`Mark as complete`), and activity notifications.
