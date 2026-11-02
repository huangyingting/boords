-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT,
    "passwordHash" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "receiveCommentNotifications" BOOLEAN NOT NULL DEFAULT true,
    "receiveMentionNotifications" BOOLEAN NOT NULL DEFAULT true,
    "followNewScriptsByDefault" BOOLEAN NOT NULL DEFAULT true,
    "followNewStoryboardsByDefault" BOOLEAN NOT NULL DEFAULT true,
    "aiImageModel" TEXT NOT NULL DEFAULT 'core',
    "activeTeamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "planName" TEXT NOT NULL DEFAULT 'Free',
    "planSlug" TEXT NOT NULL DEFAULT 'v2026_free',
    "customDomain" TEXT,
    "slackWebhookUrl" TEXT,
    "aiTokenBalance" INTEGER NOT NULL DEFAULT 8,
    "sharedInviteToken" TEXT NOT NULL,
    "isSharedInviteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "canAccessAllProjects" BOOLEAN NOT NULL DEFAULT true,
    "projectIdsJson" TEXT NOT NULL DEFAULT '[]',
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamMembership_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TeamMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "InvitationCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "email" TEXT,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "maxUses" INTEGER NOT NULL DEFAULT 1,
    "usedCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" DATETIME NOT NULL,
    "revokedAt" DATETIME,
    "revokedById" TEXT,
    "createdById" TEXT NOT NULL,
    "redeemedByUserId" TEXT,
    "redeemedAt" DATETIME,
    "projectIdsJson" TEXT NOT NULL DEFAULT '[]',
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "InvitationCode_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvitationCode_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "InvitationCode_redeemedByUserId_fkey" FOREIGN KEY ("redeemedByUserId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "InvitationCode_revokedById_fkey" FOREIGN KEY ("revokedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkflowStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkflowStatus_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryboardTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '16x9',
    "frameCount" INTEGER NOT NULL DEFAULT 6,
    "fieldsJson" TEXT NOT NULL DEFAULT '[]',
    "hasComments" BOOLEAN NOT NULL DEFAULT true,
    "hasPassword" BOOLEAN NOT NULL DEFAULT false,
    "allowCommentsInOldVersions" BOOLEAN NOT NULL DEFAULT false,
    "shareWithVersionNumber" BOOLEAN NOT NULL DEFAULT false,
    "shareWithVersionSwitching" BOOLEAN NOT NULL DEFAULT false,
    "shareWithVersionNotification" BOOLEAN NOT NULL DEFAULT true,
    "shareWithStatusUpdates" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryboardTemplate_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "parentId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isStarred" BOOLEAN NOT NULL DEFAULT false,
    "watchInApp" BOOLEAN NOT NULL DEFAULT false,
    "emailForComments" BOOLEAN NOT NULL DEFAULT false,
    "shareSlug" TEXT NOT NULL,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT true,
    "shareWithDescription" BOOLEAN NOT NULL DEFAULT false,
    "shareWithSubProjects" BOOLEAN NOT NULL DEFAULT true,
    "shareWithPassword" BOOLEAN NOT NULL DEFAULT false,
    "sharePassword" TEXT,
    "shareExpiresAt" DATETIME,
    "templateId" TEXT,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Project_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Project_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Storyboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortSlug" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '16x9',
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "versionsJson" TEXT NOT NULL DEFAULT '[]',
    "statusCategory" TEXT NOT NULL DEFAULT 'draft',
    "statusLabel" TEXT NOT NULL DEFAULT 'Draft',
    "teamStatusId" TEXT,
    "fieldsJson" TEXT NOT NULL DEFAULT '[]',
    "shareEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sharePassphrase" TEXT,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "hideCompletedComments" BOOLEAN NOT NULL DEFAULT true,
    "allowCommentsInOldVersions" BOOLEAN NOT NULL DEFAULT false,
    "shareWithVersionNumber" BOOLEAN NOT NULL DEFAULT false,
    "shareAsGrid" BOOLEAN NOT NULL DEFAULT false,
    "shareAnimatic" BOOLEAN NOT NULL DEFAULT true,
    "showImageBorder" BOOLEAN NOT NULL DEFAULT false,
    "showFrameNumbers" BOOLEAN NOT NULL DEFAULT true,
    "showLabelText" BOOLEAN NOT NULL DEFAULT true,
    "showIcons" BOOLEAN NOT NULL DEFAULT true,
    "showFrameStatus" BOOLEAN NOT NULL DEFAULT false,
    "showStatusPill" BOOLEAN NOT NULL DEFAULT false,
    "wordCountDisplay" TEXT NOT NULL DEFAULT 'off',
    "agentChatJson" TEXT NOT NULL DEFAULT '[]',
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Storyboard_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Storyboard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "StoryboardFrame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyboardId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT NOT NULL DEFAULT '',
    "duration" REAL NOT NULL DEFAULT 3.0,
    "imageUrl" TEXT,
    "sketchDataUrl" TEXT,
    "soundText" TEXT NOT NULL DEFAULT '',
    "actionText" TEXT NOT NULL DEFAULT '',
    "cameraText" TEXT NOT NULL DEFAULT '',
    "notesText" TEXT NOT NULL DEFAULT '',
    "promptText" TEXT NOT NULL DEFAULT '',
    "stylePreset" TEXT NOT NULL DEFAULT 'Sketch',
    "frameStatus" TEXT NOT NULL DEFAULT 'none',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryboardFrame_storyboardId_fkey" FOREIGN KEY ("storyboardId") REFERENCES "Storyboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Script" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "shortSlug" TEXT NOT NULL,
    "scriptType" TEXT NOT NULL DEFAULT 'av',
    "freeformContent" TEXT NOT NULL DEFAULT '',
    "wpm" INTEGER NOT NULL DEFAULT 130,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "statusCategory" TEXT NOT NULL DEFAULT 'draft',
    "statusLabel" TEXT NOT NULL DEFAULT 'Draft',
    "teamStatusId" TEXT,
    "sharePassphrase" TEXT,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "hideCompletedCommentsPresent" BOOLEAN NOT NULL DEFAULT false,
    "allowCommentsInOldVersions" BOOLEAN NOT NULL DEFAULT true,
    "shareWithVersionNumber" BOOLEAN NOT NULL DEFAULT true,
    "shareWithVersionSwitching" BOOLEAN NOT NULL DEFAULT false,
    "shareWithVersionNotification" BOOLEAN NOT NULL DEFAULT false,
    "allowGuestDownloads" BOOLEAN NOT NULL DEFAULT false,
    "showWordCount" BOOLEAN NOT NULL DEFAULT false,
    "hideCompletedCommentsEdit" BOOLEAN NOT NULL DEFAULT false,
    "isSendingCommentEmails" BOOLEAN NOT NULL DEFAULT true,
    "archivedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Script_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ScriptScene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scriptId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "audioText" TEXT NOT NULL DEFAULT '',
    "visualText" TEXT NOT NULL DEFAULT '',
    "notesText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScriptScene_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AssetFolder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AssetFolder_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LibraryAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "folderId" TEXT,
    "filename" TEXT NOT NULL,
    "mentionHandle" TEXT NOT NULL,
    "alt" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "assetType" TEXT NOT NULL DEFAULT 'default',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LibraryAsset_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryAsset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "AssetFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "storyboardId" TEXT,
    "frameId" TEXT,
    "scriptId" TEXT,
    "authorId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "body" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'everyone',
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "annotationDataUrl" TEXT,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Comment_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_storyboardId_fkey" FOREIGN KEY ("storyboardId") REFERENCES "Storyboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_frameId_fkey" FOREIGN KEY ("frameId") REFERENCES "StoryboardFrame" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "linkUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WebhookEndpoint" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "eventsJson" TEXT NOT NULL DEFAULT '[]',
    "secret" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WebhookEndpoint_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT,
    "actorId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT,
    "projectId" TEXT,
    "metadataJson" TEXT NOT NULL DEFAULT '{}',
    "ipAddress" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AuditLog_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Team_hashId_key" ON "Team"("hashId");

-- CreateIndex
CREATE INDEX "TeamMembership_userId_idx" ON "TeamMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMembership_teamId_userId_key" ON "TeamMembership"("teamId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationCode_code_key" ON "InvitationCode"("code");

-- CreateIndex
CREATE INDEX "InvitationCode_teamId_idx" ON "InvitationCode"("teamId");

-- CreateIndex
CREATE INDEX "InvitationCode_code_idx" ON "InvitationCode"("code");

-- CreateIndex
CREATE INDEX "WorkflowStatus_teamId_idx" ON "WorkflowStatus"("teamId");

-- CreateIndex
CREATE INDEX "StoryboardTemplate_teamId_idx" ON "StoryboardTemplate"("teamId");

-- CreateIndex
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Project_shareSlug_key" ON "Project"("shareSlug");

-- CreateIndex
CREATE INDEX "Project_teamId_idx" ON "Project"("teamId");

-- CreateIndex
CREATE INDEX "Project_parentId_idx" ON "Project"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Storyboard_slug_key" ON "Storyboard"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Storyboard_shortSlug_key" ON "Storyboard"("shortSlug");

-- CreateIndex
CREATE INDEX "Storyboard_teamId_idx" ON "Storyboard"("teamId");

-- CreateIndex
CREATE INDEX "Storyboard_projectId_idx" ON "Storyboard"("projectId");

-- CreateIndex
CREATE INDEX "StoryboardFrame_storyboardId_position_idx" ON "StoryboardFrame"("storyboardId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Script_slug_key" ON "Script"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Script_shortSlug_key" ON "Script"("shortSlug");

-- CreateIndex
CREATE INDEX "Script_teamId_idx" ON "Script"("teamId");

-- CreateIndex
CREATE INDEX "Script_projectId_idx" ON "Script"("projectId");

-- CreateIndex
CREATE INDEX "ScriptScene_scriptId_position_idx" ON "ScriptScene"("scriptId", "position");

-- CreateIndex
CREATE INDEX "AssetFolder_teamId_idx" ON "AssetFolder"("teamId");

-- CreateIndex
CREATE INDEX "LibraryAsset_teamId_idx" ON "LibraryAsset"("teamId");

-- CreateIndex
CREATE INDEX "LibraryAsset_folderId_idx" ON "LibraryAsset"("folderId");

-- CreateIndex
CREATE INDEX "Comment_storyboardId_idx" ON "Comment"("storyboardId");

-- CreateIndex
CREATE INDEX "Comment_frameId_idx" ON "Comment"("frameId");

-- CreateIndex
CREATE INDEX "Comment_scriptId_idx" ON "Comment"("scriptId");

-- CreateIndex
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");

-- CreateIndex
CREATE INDEX "ApiKey_teamId_idx" ON "ApiKey"("teamId");

-- CreateIndex
CREATE INDEX "WebhookEndpoint_teamId_idx" ON "WebhookEndpoint"("teamId");

-- CreateIndex
CREATE INDEX "AuditLog_teamId_createdAt_idx" ON "AuditLog"("teamId", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");
