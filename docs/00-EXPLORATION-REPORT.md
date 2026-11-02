# Boords Exploration Coverage & Observed Behavior Report

## 1. Executive Summary

Using Playwright with authenticated session cookies from `.cred`, we systematically explored both the public marketing website (`https://boords.com`) and the authenticated SaaS application (`https://app.boords.com`). We captured **55+ full-resolution screenshots** across desktop (`1440×900`) and mobile (`390×844`) viewports in `docs/exploration/screenshots/` and logged **9 phases of DOM structures, computed CSS styles, and REST/JSON network payloads** in `docs/exploration/data/`.

---

## 2. Route & Page Coverage Inventory

### 2.1 Public Marketing Website (`https://boords.com`)

| Route | Title | Screenshot | Observed Capabilities & UX |
|---|---|---|---|
| `/` | Boords: Modern Video Pre-Production Software | `01-marketing-home-desktop.png`, `06-marketing-home-mobile.png` | Warm cream background (`#F6F6F0`), top sticky nav (`Product v`, `Solutions v`, `Resources v`, `Pricing`, `Sign in`, `Get started`), hero with interactive pipeline tabs (`Generate`, `Script`, `Storyboard`, `Edit`, `Animatic`, `Share`), customer logo strip, feature showcase sections, testimonials, FAQ accordion, dark footer. |
| `/pricing` | Plans & Pricing · Boords | `02-marketing-pricing-desktop.png` | Billing toggle (`Monthly` / `Annual` with discount badge), currency selector (`USD`, `EUR`, `GBP`), 4 plan cards (`Free`, `Solo`, `Standard`, `Studio` / `Enterprise`), full feature comparison table, pricing FAQs. |
| `/storyboard-software` | Online Storyboard Software · Boords | `07-marketing-storyboard-software.png` | Deep dive into frame grid, drag-and-drop reordering, frame numbering, aspect ratios (`16:9`, `9:16`, `1:1`, `4:5`), and PDF/MP4 exports. |
| `/script-editor` | AI Script Editor & AV Script Software · Boords | `08-marketing-script-editor.png` | Two-column Audio/Visual (AV) script table, automatic runtime calculation at configurable WPM (`130 WPM`), and 1-click script-to-storyboard conversion. |
| `/animatic-software` | Animatic Maker · Boords | `09-marketing-animatic-software.png` | Timeline animatic player with per-frame durations, voiceover/soundtrack audio tracks, and MP4 export. |
| `/collaborate` | Storyboard Review & Collaboration · Boords | `09b-marketing-collaborate.png` | Password-protected client review links, frame-specific comments, status pills (`Draft`, `In progress`, `In review`, `Changes requested`, `Approved`), version switching. |
| `/customers` | Customer Stories · Boords | `09c-marketing-customers.png` | Case studies and agency/production house testimonials. |

### 2.2 Authenticated Application (`https://app.boords.com`)

| Route Pattern | Page / View | Screenshot(s) | Observed Capabilities & UX |
|---|---|---|---|
| `/` | Workspace Home | `10-app-dashboard-desktop.png`, `22-sidebar-home.png` | Time-of-day greeting (`Good evening, Joshuah`), summary counters (`0 Storyboards · 0 Scripts · 0 Comments`), type filter tabs (`All`, `Storyboards`, `Scripts`), view switcher (`Grid`, `Board`, `List`), sort selector (`Last updated`, `Date created`, `Alphabetical`). |
| `/p/:slug` | Project Detail View | `26-project-demo-project.png`, `41a-project-with-script.png`, `68a-project-grid-both.png`, `68b-project-board-kanban.png`, `68c-project-list-view.png`, `70-app-project-mobile.png`, `77-item-actions-menu.png` | Breadcrumb (`Team / Project`), contenteditable project title + star favorite toggle + `...` Project actions menu (`Rename`, `Move to`, `Project members`, `Notifications`, `Set template`, `Archive project`), inline project description (`Click here to add a description or links...`), empty state cards (`New storyboard`, `New script`) when empty, or `All / Storyboards / Scripts` filter tabs with `Grid`, `Board` (Kanban columns by status), and `List` views when populated. |
| `/storyboards/:slug` | Storyboard Editor (`Edit` & `Review` modes, `Storyboard` Grid & `Shot list` Table) | `60-storyboard-editor-grid.png`, `63a-storyboard-right-sidebar.png`, `64-storyboard-frames-grid.png`, `64b-storyboard-populated-frames.png`, `65-storyboard-export-modal.png`, `67-storyboard-review-mode.png`, `71-storyboard-editor-mobile.png`, `78-storyboard-shot-list-view.png`, `79-storyboard-view-options.png`, `82-storyboard-versions-menu.png` | Top bar with breadcrumb, editable title, version pill (`v1`), workflow status pill (`Draft`), active collaborators, `...` menu, notifications toggle, `Share storyboard`, `Export` menu (`PDF`, `Slides`, `Animatic`, `Images`, `After Effects`, `Premiere / Resolve`, `Script`, `Google Sheets`), and `Edit | Review` mode toggle. Secondary toolbar with `Storyboard | Shot list` switcher, zoom slider, `View options` (`Show generator`, `Show script`, `Collapse all`), `Select all`, `Delete`, `Animatic` player, and right-sidebar toggle (6 tabs: `Boords Agent`, `Comments`, `Script`, `Library Assets`, `Settings`, `Activity`). |
| `/scripts/:slug` | Script Editor (`Edit` & `Review` modes) | `50-script-editor.png`, `51-script-editor-av-table.png`, `52-script-export-menu.png`, `53-script-review-mode.png` | Rich-text / Two-column AV script editor. Header with breadcrumb, editable title, version (`v1`), status (`Draft`), `Export` (`PDF`, `Word`, `Markdown`, `Plain text`), `-> Storyboard` conversion button, and `Edit | Review` toggle. Formatting toolbar (`Undo`, `Redo`, `Text style`, `Bold`, `Italic`, `Underline`, `Strike`, `Color`, `Alignment`, `Insert`, `Font size`). Two-column AV script table with automatic word count & runtime (`Total RT 0:00`, `Audio words 0`, configurable `130 WPM`), `SCENE`, `AUDIO / VOICEOVER`, and `VISUAL` columns. Right sidebar with `Comments`, `Activity`, and `Script Settings`. |
| `/library/:teamHash/playground` | Assets — AI Image Playground | `11-app-assets.png`, `22-sidebar-assets.png` | Prompt composer with `@` asset mentions (`@alex`, `@sam`, `@office`, etc.), aspect ratio & model selector (`GPT Image 2.5 Flare`, `Flux`, etc.), style selector (`Sketch`, `Color`, `Storyboard`), and sample prompt recipes. |
| `/library/:teamHash` | Assets — Shared Asset Library | `22b-assets-library-tab.png` | Categorized asset folders (`All Assets`, `Characters`, `Locations`, `Props`, `Unfiled`), search bar, sort selector, `+ Upload` button, and asset cards showing thumbnail, title, and `@handle` badge (`@alex`, `@sam`, `@sarah`, `@leo`, `@office`, `@street`, `@kitchen`, `@park`, `@phone`, `@car`, `@product`, `@box`). |
| `/activity/:teamHash` | Team Activity / Audit Log | `22-sidebar-activity.png` | Chronological feed of workspace events with filters for `All projects`, `All users`, `All event types`, and date ranges (`Last 7 days`, `Last 30 days`, `All time`). |
| `/people/:teamHash` | Team Directory | `22-sidebar-team.png` | Redirects to `/settings/team/manage` showing team seat counter, `Invite members` button, and member table (`Name`, `Email`, `Role`, `2FA`, `Access`). |
| `/archive/:teamHash` | Archive | `22-sidebar-archive.png`, `84-archive-with-items.png` | Top warning banner (`You are viewing archived items. Please restore them to edit.`), search input (`Search archived items...`), sort (`Date archived`), grouped sections (`ARCHIVED PROJECTS`, `ARCHIVED STORYBOARDS`, `ARCHIVED SCRIPTS`) with Restore and Delete permanently actions. |
| `/settings/team/manage` | Team Settings — Users | `27-settings-team-users.png` | Manage active and pending team members, roles (`Admin`, `Member`, `Creator`, `Reviewer`), project access, and invitations. |
| `/settings/team/general` | Team Settings — General | `28-settings-team-general.png` | Edit Team Name (`Joshuah Powlowski Team`) and upload Team Logo. |
| `/settings/team/statuses` | Team Settings — Workflow Statuses | `19-app-settings-statuses.png` | Customize status labels and add sub-statuses across 5 fixed lifecycle categories: `Draft`, `In progress`, `In review`, `Changes requested`, `Approved`. |
| `/settings/team/domain` | Team Settings — Custom Domain | `29-settings-team-domain.png` | Configure custom branding domain (`storyboards.yourdomain.com`) for shared links. |
| `/settings/team/usage` | Team Settings — AI Usage & Credits | `30-settings-team-usage.png` | Track AI image generation credit balance, top-up credits, and per-member usage. |
| `/settings/team/api` | Team Settings — API Keys & Webhooks | `31-settings-team-api.png` | Generate Bearer API keys and register HMAC-signed Webhooks for `project.*`, `storyboard.*`, `script.*`, `frame.*`, and `comment.*` events. |
| `/settings/team/connections` | Team Settings — Integrations | `32-settings-team-connections.png` | Connect Slack workspace for real-time comment and status notifications. |
| `/settings/account/profile` | Account Settings — Profile | `33-settings-account-profile.png` | Update full name, email address, avatar, and account deletion. |
| `/settings/billing/plan` | Account Settings — Plan & Billing | `34-settings-billing-plan.png` | View current subscription tier, billing cycle, and upgrade options. |
| `/settings/account/password` | Account Settings — Security | `35-settings-account-security.png` | Change password and configure Two-Factor Authentication (2FA). |
| `/settings/account/notification` | Account Settings — Notifications | `36-settings-account-notifications.png` | Toggle email notifications for comments, `@mentions`, and default watch preferences for new storyboards and scripts. |
| `/settings/account/membership` | Account Settings — Memberships | `37-settings-account-memberships.png` | View all teams the user belongs to, their role in each team, and leave/manage buttons. |
| `/s/:shortSlug` & `/s/:shortSlug/frame` | Public Storyboard Share View | `74-public-storyboard-share-view.png` | Guest/client review interface with grid or frame-by-frame slideshow (`Frame 1 v`, `< | >`), comment thread per frame, annotation/voice/image comment composer, and optional passphrase gate. |
| `/sc/:shortSlug` | Public Script Share View | `75-public-script-share-view.png` | Guest/client script review interface with two-column AV table, word count/runtime header, and comment thread sidebar. |
| `/ps/:shareSlug` | Public Project Share View | `40-project-share-modal.png`, `76-public-project-share-view.png` | Shareable read-only project portal listing shared storyboards and scripts (or 404 when project sharing is disabled). |

---

## 3. Observed Visual Design System & Tokens

Extracted directly via `getComputedStyle` during Playwright exploration:

- **Typography**:
  - Primary UI Font: `Matter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
  - Monospace Font: `ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace`
- **Color Palette**:
  - **Primary Canvas / Page Surface**: `#F6F6F0` (`rgb(246, 246, 240)`) — signature warm cream background
  - **Secondary / Sidebar / Empty Card Surface**: `#F2F2EE` (`rgb(242, 242, 238)`) / `#ECECE6` (`rgb(236, 236, 230)`)
  - **Elevated Card / Modal Surface**: `#FFFFFF` (`rgb(255, 255, 255)`)
  - **Primary Foreground / Dark Button Surface**: `#121212` (`rgb(18, 18, 18)`)
  - **Secondary / Muted Foreground**: `#6E6D68` (`rgb(110, 109, 104)`)
  - **Subtle Border / Divider**: `#E5E4DE` (`rgb(229, 228, 222)`)
  - **Brand Amber / Gold Accent**: `#F4BD64` (`rgb(244, 189, 100)`) with soft tint `#F9E5C3` (`rgb(249, 229, 195)`)
  - **Status Colors**:
    - `Draft`: Neutral gray (`#8C8B85`)
    - `In progress`: Blue (`#3B82F6`)
    - `In review`: Amber/Orange (`#F59E0B`)
    - `Changes requested`: Red/Coral (`#EF4444`)
    - `Approved`: Emerald Green (`#10B981`)
- **App Shell Geometry**:
  - **Top Banner**: `36px` height (`#F9E5C3`)
  - **Far-left Global Icon Rail**: `56px` width (`#FFFFFF`), persistent across all app views, containing Team Avatar, Inbox popover trigger, What's New trigger, Help menu trigger, and User Profile Avatar.
  - **Collapsible Workspace Sidebar**: `240px` width (`#FFFFFF`), containing Team Switcher dropdown, primary navigation (`Home`, `Assets`, `Activity`, `Team`, `Archive`), and `PROJECTS` tree with inline actions (`Select projects`, `Sort`, `Create a new project`, `Filter`).

---

## 4. Edge Cases, Error States & Responsive Behaviors Observed

1. **404 / Archived Resource State (`20-app-settings-team.png`, `76-public-project-share-view.png`)**:
   - Displays centered black circle `B` logo, bold heading `Page not found (404 error)`, explanation `If you're looking for a storyboard, it may have been archived or had its URL changed.`, and underlined `Back to Dashboard` link.
2. **Disabled Controls Until Preconditions Met (`41b-new-storyboard-blank-tab.png`, `60-storyboard-editor-grid.png`)**:
   - In the `New storyboard` modal (`Blank Storyboard` tab), `Create Storyboard →` is disabled (`opacity-30 cursor-not-allowed`) until a non-empty `Name` is entered.
   - In the Storyboard Editor, `Export` and `Review` tabs are disabled when the storyboard has `0` frames, and immediately become enabled as soon as frames are added.
3. **Archive Read-Only Protection (`84-archive-with-items.png`)**:
   - Archived items display a persistent top banner: `You are viewing archived items. Please restore them to edit.` Editing is blocked until restored.
4. **Responsive Mobile Layout (`06-marketing-home-mobile.png`, `70-app-project-mobile.png`, `71-storyboard-editor-mobile.png`)**:
   - On `<768px` viewports, the `240px` workspace sidebar collapses into an off-canvas drawer triggered by a hamburger/back button, action buttons condense to icon-only controls, and frame grids stack into single-column cards.
