# Acceptance Criteria

## AC-1: Zero Dummy Data & First-Run Bootstrap
- **Given** a fresh database after running Prisma migrations
- **When** querying `User`, `Project`, `Storyboard`, and `Script` tables before any user interaction
- **Then** all tables contain `0` rows (no pre-seeded dummy users or fake accounts).
- **When** the first visitor opens `/register` or `/setup` on an empty database
- **Then** they can bootstrap the initial `OWNER` account and workspace team, which automatically initializes default workflow statuses (`Draft`, `In progress`, `In review`, `Changes requested`, `Approved`), default templates (`Commercial`, `Social (Reels)`, `Social (Square)`, `Short Film`), and default asset library folders (`Characters`, `Locations`, `Props`, `Unfiled`), and logs `auth.bootstrap` in `AuditLog`.

## AC-2: Invite-Only Registration, Single-Use, Expiration & Revocation
- **Given** an initialized workspace with at least 1 `OWNER` user
- **When** an unauthenticated visitor submits `/register` without an invitation code or with an invalid code
- **Then** registration is rejected with HTTP `400/403` and an explicit error message.
- **When** an `OWNER` or `ADMIN` creates a single-use invitation code (`maxUses = 1`, `role = "CREATOR"`, `expiresAt = +7d`) in `/settings/team/manage`
- **Then** the code appears in the pending invitations list and `invite.created` is recorded in `AuditLog`.
- **When** User B registers using that invitation code
- **Then** User B is created and added to the team with role `CREATOR`, `usedCount` becomes `1`, and `invite.redeemed` is recorded in `AuditLog`.
- **When** User C attempts to reuse the same single-use invitation code
- **Then** registration is rejected with `"Invitation code has already been used"`.
- **When** an `OWNER` or `ADMIN` revokes an active invitation code (`revokedAt` set) or when `expiresAt` is in the past
- **Then** any attempt to register with that code is rejected with `"Invitation code has been revoked"` or `"Invitation code has expired"`.

## AC-3: Role-Based Access Control (RBAC)
- **Given** a user with role `REVIEWER`
- **When** they view a project or storyboard
- **Then** they can view frames, play animatics, post comments, and update review status, but calls to `POST /api/invites`, `DELETE /api/projects/[id]`, or `PATCH /api/team` are rejected with HTTP `403 Forbidden`.

## AC-4: Projects & Views (`Grid`, `Board`, `List`)
- **Given** an authenticated `OWNER`, `ADMIN`, or `CREATOR`
- **When** they create a project (e.g. `Demo Project`) and navigate to `/p/[slug]`
- **Then** they see the empty state cards (`New storyboard`, `New script`) when empty, and once items exist they can filter by `All`, `Storyboards`, `Scripts` and switch between `Grid`, `Board` (Kanban columns by status), and `List` views.

## AC-5: Storyboard Editor, Sketch Canvas, Shot List & Animatic
- **Given** a user in `/p/[slug]` clicking `New -> Storyboard`
- **When** they select `Blank Storyboard`
- **Then** `Create Storyboard →` is disabled until `Name` is entered; once submitted, they land on `/storyboards/[slug]`.
- **When** the storyboard has `0` frames
- **Then** the Boords Agent start screen is shown (`What are we storyboarding?`, `Sketch`, `Import script`, `Add frames`) and `Export` / `Review` are disabled.
- **When** the user adds frames (via `Add frames` or prompt)
- **Then** frames are rendered in the responsive grid with `Label`, `Sound`, `Action`, `Duration`, and `Quick Generate` controls; `Export` and `Review` become enabled; the user can sketch on a frame canvas, generate frame artwork, switch to `Shot list` view, play the `Animatic` timeline, and export to PDF/CSV.

## AC-6: Script Editor & AV Script-to-Storyboard Conversion
- **Given** a user in `/scripts/[slug]`
- **When** they click `Two-column AV script` and enter voiceover and visual text across scenes
- **Then** per-scene and total word count and speaking runtime (`MM:SS RT` at the selected `WPM`) update automatically.
- **When** they click `Storyboard` (`-> Storyboard`)
- **Then** a new Storyboard is created with frames populated from each script scene's `AUDIO / VOICEOVER` and `VISUAL` columns.

## AC-7: Public Share & Client Review Links
- **Given** a storyboard with short slug `abc123` and a script with short slug `xyz789`
- **When** an unauthenticated client visits `/s/abc123/frame` or `/sc/xyz789`
- **Then** they can step through frames or read the AV script and post guest comments (if `allowComments` is enabled and any configured passphrase is provided).
