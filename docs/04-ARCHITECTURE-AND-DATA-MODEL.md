# Architecture & Data Model Specification

## 1. System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Client Browser (Desktop & Mobile)                   │
│  ┌─────────────────────┐  ┌─────────────────────────┐  ┌────────────────┐  │
│  │ Public Marketing    │  │ Authenticated Workspace │  │ Public Client  │  │
│  │ (/, /pricing, etc.) │  │ (/dashboard, /p/[slug], │  │ Share Views    │  │
│  │                     │  │  /storyboards, /scripts)│  │ (/s, /sc, /ps) │  │
│  └──────────┬──────────┘  └────────────┬────────────┘  └───────┬────────┘  │
└─────────────┼──────────────────────────┼───────────────────────┼───────────┘
              │                          │                       │
              ▼                          ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Next.js App Router Server & API Layer                  │
│  ┌─────────────────────┐  ┌─────────────────────────┐  ┌────────────────┐  │
│  │ Auth.js / NextAuth  │  │ RBAC & Invite Guard     │  │ Audit Logger   │  │
│  │ Session & Password  │  │ (Owner/Admin/Creator/   │  │ (Immutable     │  │
│  │ Verification        │  │  Member/Reviewer)       │  │  Event Stream) │  │
│  └──────────┬──────────┘  └────────────┬────────────┘  └───────┬────────┘  │
└─────────────┼──────────────────────────┼───────────────────────┼───────────┘
              │                          │                       │
              ▼                          ▼                       ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                    Prisma ORM Data Access Layer                            │
│  • Local Dev & Automated Tests: SQLite (prisma/schema.prisma)              │
│  • Production Environment:      PostgreSQL (prisma/schema.postgres.prisma) │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Entity-Relationship Data Model

### 2.1 Core Entities

1. **`User`**
   - `id` (String, CUID PK)
   - `name` (String)
   - `email` (String, Unique)
   - `username` (String?, Unique)
   - `passwordHash` (String)
   - `avatarUrl` (String?)
   - `twoFactorEnabled` (Boolean, default `false`)
   - `receiveCommentNotifications` (Boolean, default `true`)
   - `receiveMentionNotifications` (Boolean, default `true`)
   - `followNewScriptsByDefault` (Boolean, default `true`)
   - `followNewStoryboardsByDefault` (Boolean, default `true`)
   - `aiImageModel` (String, default `"core"`)
   - `activeTeamId` (String?)
   - `createdAt`, `updatedAt`

2. **`Team`**
   - `id` (String, CUID PK)
   - `hashId` (String, Unique, e.g. `zNFAmwg`)
   - `name` (String)
   - `logoUrl` (String?)
   - `planName` (String, default `"Free"`)
   - `planSlug` (String, default `"v2026_free"`)
   - `customDomain` (String?)
   - `slackWebhookUrl` (String?)
   - `aiTokenBalance` (Int, default `8`)
   - `createdAt`, `updatedAt`

3. **`TeamMembership`**
   - `id` (String, CUID PK)
   - `teamId` (String, FK → `Team.id`)
   - `userId` (String, FK → `User.id`)
   - `role` (String: `"OWNER" | "ADMIN" | "CREATOR" | "MEMBER" | "REVIEWER"`)
   - `canAccessAllProjects` (Boolean, default `true`)
   - `projectIdsJson` (String, default `"[]"`)
   - `revokedAt` (DateTime?)
   - `createdAt`, `updatedAt`
   - Unique constraint: `(teamId, userId)`

4. **`InvitationCode`** (Invite-Only Registration & Access Control)
   - `id` (String, CUID PK)
   - `code` (String, Unique — cryptographically random token e.g. `INV-XXXX-XXXX-XXXX`)
   - `teamId` (String, FK → `Team.id`)
   - `email` (String? — optional email lock; if set, only that email can redeem)
   - `role` (String: `"ADMIN" | "CREATOR" | "MEMBER" | "REVIEWER"`)
   - `maxUses` (Int, default `1` for single-use invitations)
   - `usedCount` (Int, default `0`)
   - `expiresAt` (DateTime)
   - `revokedAt` (DateTime?)
   - `revokedById` (String?, FK → `User.id`)
   - `createdById` (String, FK → `User.id`)
   - `redeemedByUserId` (String?, FK → `User.id`)
   - `redeemedAt` (DateTime?)
   - `projectIdsJson` (String, default `"[]"`)
   - `note` (String?)
   - `createdAt`, `updatedAt`

5. **`WorkflowStatus`**
   - `id` (String, CUID PK)
   - `teamId` (String, FK → `Team.id`)
   - `name` (String: e.g. `"Draft"`, `"In progress"`, `"In review"`, `"Changes requested"`, `"Approved"`)
   - `category` (String: `"draft" | "in_progress" | "review_needed" | "changes_required" | "approved"`)
   - `position` (Int, default `0`)
   - `isDefault` (Boolean, default `false`)
   - `createdAt`, `updatedAt`

6. **`StoryboardTemplate`**
   - `id` (String, CUID PK)
   - `teamId` (String, FK → `Team.id`)
   - `name` (String: e.g. `"Commercial"`, `"Social (Reels)"`, `"Social (Square)"`, `"Short Film"`)
   - `aspectRatio` (String: `"16x9" | "9x16" | "1x1" | "4:5" | "2.39:1"`)
   - `frameCount` (Int, default `6`)
   - `fieldsJson` (String — JSON array of `{ id, icon, label, isEnabled }`)
   - `hasComments` (Boolean, default `true`)
   - `createdAt`, `updatedAt`

7. **`Project`**
   - `id` (String, CUID PK)
   - `teamId` (String, FK → `Team.id`)
   - `parentId` (String?, self-FK → `Project.id` for nested sub-projects)
   - `name` (String)
   - `slug` (String, Unique)
   - `description` (String?)
   - `isStarred` (Boolean, default `false`)
   - `shareSlug` (String, Unique)
   - `shareEnabled` (Boolean, default `true`)
   - `shareWithDescription` (Boolean, default `false`)
   - `shareWithSubProjects` (Boolean, default `true`)
   - `shareWithPassword` (Boolean, default `false`)
   - `sharePassword` (String?)
   - `shareExpiresAt` (DateTime?)
   - `templateId` (String?)
   - `archivedAt` (DateTime?)
   - `createdAt`, `updatedAt`

8. **`Storyboard`**
   - `id` (String, CUID PK)
   - `teamId` (String, FK → `Team.id`)
   - `projectId` (String, FK → `Project.id`)
   - `name` (String)
   - `slug` (String, Unique)
   - `shortSlug` (String, Unique)
   - `aspectRatio` (String, default `"16x9"`)
   - `versionNumber` (Int, default `1`)
   - `versionsJson` (String, default `"[]"`)
   - `statusCategory` (String, default `"draft"`)
   - `teamStatusId` (String?)
   - `fieldsJson` (String — enabled frame metadata fields)
   - `shareEnabled` (Boolean, default `true`)
   - `sharePassphrase` (String?)
   - `allowComments` (Boolean, default `true`)
   - `hideCompletedComments` (Boolean, default `true`)
   - `allowCommentsInOldVersions` (Boolean, default `false`)
   - `shareWithVersionNumber` (Boolean, default `false`)
   - `shareAsGrid` (Boolean, default `false`)
   - `shareAnimatic` (Boolean, default `true`)
   - `showFrameNumbers` (Boolean, default `true`)
   - `showLabelText` (Boolean, default `true`)
   - `showIcons` (Boolean, default `true`)
   - `showFrameStatus` (Boolean, default `false`)
   - `agentChatJson` (String, default `"[]"`)
   - `archivedAt` (DateTime?)
   - `createdAt`, `updatedAt`

9. **`StoryboardFrame`**
   - `id` (String, CUID PK)
   - `storyboardId` (String, FK → `Storyboard.id`)
   - `position` (Int)
   - `label` (String, default `""`)
   - `duration` (Float, default `3.0`)
   - `imageUrl` (String?)
   - `sketchDataUrl` (String?)
   - `soundText` (String, default `""`)
   - `actionText` (String, default `""`)
   - `cameraText` (String, default `""`)
   - `notesText` (String, default `""`)
   - `promptText` (String, default `""`)
   - `stylePreset` (String, default `"Sketch"`)
   - `frameStatus` (String, default `"none"`)
   - `createdAt`, `updatedAt`

10. **`Script`** & **`ScriptScene`**
    - `Script`: `id`, `teamId`, `projectId`, `name`, `slug`, `shortSlug`, `scriptType` (`"av" | "blank"`), `freeformContent`, `wpm` (Int, default `130`), `versionNumber` (Int, default `1`), `statusCategory` (default `"draft"`), `teamStatusId`, `sharePassphrase`, `allowComments`, `hideCompletedComments`, `allowGuestDownloads`, `showWordCount`, `archivedAt`, `createdAt`, `updatedAt`
    - `ScriptScene`: `id`, `scriptId`, `position`, `audioText`, `visualText`, `notesText`, `createdAt`, `updatedAt`

11. **`AssetFolder`** & **`LibraryAsset`**
    - `AssetFolder`: `id`, `teamId`, `name` (`"Characters"`, `"Locations"`, `"Props"`, `"Unfiled"`), `position`
    - `LibraryAsset`: `id`, `teamId`, `folderId`, `filename`, `mentionHandle` (e.g. `alex`, `office`), `alt`, `imageUrl`, `thumbnailUrl`, `position`, `createdAt`, `updatedAt`

12. **`Comment`**
    - `id`, `teamId`, `storyboardId?`, `frameId?`, `scriptId?`, `authorId?`, `guestName?`, `guestEmail?`, `body`, `visibility` (`"everyone" | "team"`), `isCompleted`, `annotationDataUrl?`, `versionNumber`, `createdAt`, `updatedAt`

13. **`Notification`**
    - `id`, `userId`, `teamId`, `title`, `body`, `linkUrl`, `status` (`"unread" | "read" | "archived"`), `createdAt`

14. **`ApiKey`** & **`WebhookEndpoint`**
    - `ApiKey`: `id`, `teamId`, `name`, `keyPrefix`, `keyHash`, `createdById`, `lastUsedAt`, `revokedAt`, `createdAt`
    - `WebhookEndpoint`: `id`, `teamId`, `url`, `eventsJson`, `secret`, `isActive`, `createdAt`

15. **`AuditLog`**
    - `id` (String, CUID PK)
    - `teamId` (String?)
    - `actorId` (String?)
    - `actorEmail` (String?)
    - `action` (String: e.g. `"auth.bootstrap"`, `"auth.login"`, `"invite.created"`, `"invite.redeemed"`, `"invite.revoked"`, `"member.role_changed"`, `"member.revoked"`, `"project.created"`, `"storyboard.created"`, `"script.created"`, `"status.updated"`, etc.)
    - `targetType` (String)
    - `targetId` (String?)
    - `projectId` (String?)
    - `metadataJson` (String, default `"{}"`)
    - `ipAddress` (String?)
    - `createdAt` (DateTime)
