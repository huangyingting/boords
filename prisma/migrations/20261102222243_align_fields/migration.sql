-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_ApiKey" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "keyPrefix" TEXT NOT NULL,
    "keyHash" TEXT NOT NULL,
    "createdById" TEXT,
    "lastUsedAt" DATETIME,
    "revokedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ApiKey_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ApiKey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_ApiKey" ("createdAt", "createdById", "id", "keyHash", "keyPrefix", "lastUsedAt", "name", "revokedAt", "teamId") SELECT "createdAt", "createdById", "id", "keyHash", "keyPrefix", "lastUsedAt", "name", "revokedAt", "teamId" FROM "ApiKey";
DROP TABLE "ApiKey";
ALTER TABLE "new_ApiKey" RENAME TO "ApiKey";
CREATE UNIQUE INDEX "ApiKey_keyHash_key" ON "ApiKey"("keyHash");
CREATE INDEX "ApiKey_teamId_idx" ON "ApiKey"("teamId");
CREATE TABLE "new_Comment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "storyboardId" TEXT,
    "frameId" TEXT,
    "scriptId" TEXT,
    "sceneId" TEXT,
    "authorId" TEXT,
    "guestName" TEXT,
    "guestEmail" TEXT,
    "body" TEXT NOT NULL,
    "visibility" TEXT NOT NULL DEFAULT 'everyone',
    "isResolved" BOOLEAN NOT NULL DEFAULT false,
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
INSERT INTO "new_Comment" ("annotationDataUrl", "authorId", "body", "createdAt", "frameId", "guestEmail", "guestName", "id", "isCompleted", "scriptId", "storyboardId", "teamId", "updatedAt", "versionNumber", "visibility") SELECT "annotationDataUrl", "authorId", "body", "createdAt", "frameId", "guestEmail", "guestName", "id", "isCompleted", "scriptId", "storyboardId", "teamId", "updatedAt", "versionNumber", "visibility" FROM "Comment";
DROP TABLE "Comment";
ALTER TABLE "new_Comment" RENAME TO "Comment";
CREATE INDEX "Comment_storyboardId_idx" ON "Comment"("storyboardId");
CREATE INDEX "Comment_frameId_idx" ON "Comment"("frameId");
CREATE INDEX "Comment_scriptId_idx" ON "Comment"("scriptId");
CREATE TABLE "new_LibraryAsset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "folderId" TEXT,
    "name" TEXT NOT NULL DEFAULT '',
    "mentionName" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT 'character',
    "prompt" TEXT,
    "isStarter" BOOLEAN NOT NULL DEFAULT false,
    "filename" TEXT NOT NULL DEFAULT '',
    "mentionHandle" TEXT NOT NULL DEFAULT '',
    "alt" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL DEFAULT '',
    "assetType" TEXT NOT NULL DEFAULT 'default',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LibraryAsset_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LibraryAsset_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "AssetFolder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_LibraryAsset" ("alt", "assetType", "createdAt", "filename", "folderId", "id", "imageUrl", "mentionHandle", "position", "teamId", "thumbnailUrl", "updatedAt") SELECT "alt", "assetType", "createdAt", "filename", "folderId", "id", "imageUrl", "mentionHandle", "position", "teamId", "thumbnailUrl", "updatedAt" FROM "LibraryAsset";
DROP TABLE "LibraryAsset";
ALTER TABLE "new_LibraryAsset" RENAME TO "LibraryAsset";
CREATE INDEX "LibraryAsset_teamId_idx" ON "LibraryAsset"("teamId");
CREATE INDEX "LibraryAsset_folderId_idx" ON "LibraryAsset"("folderId");
CREATE TABLE "new_Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL DEFAULT '',
    "body" TEXT NOT NULL DEFAULT '',
    "linkUrl" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'unread',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Notification_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Notification" ("body", "createdAt", "id", "linkUrl", "status", "teamId", "title", "userId") SELECT "body", "createdAt", "id", "linkUrl", "status", "teamId", "title", "userId" FROM "Notification";
DROP TABLE "Notification";
ALTER TABLE "new_Notification" RENAME TO "Notification";
CREATE INDEX "Notification_userId_status_idx" ON "Notification"("userId", "status");
CREATE TABLE "new_Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashId" TEXT,
    "teamId" TEXT NOT NULL,
    "parentId" TEXT,
    "createdById" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
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
INSERT INTO "new_Project" ("archivedAt", "createdAt", "description", "emailForComments", "id", "isStarred", "name", "parentId", "shareEnabled", "shareExpiresAt", "sharePassword", "shareSlug", "shareWithDescription", "shareWithPassword", "shareWithSubProjects", "slug", "teamId", "templateId", "updatedAt", "watchInApp") SELECT "archivedAt", "createdAt", "description", "emailForComments", "id", "isStarred", "name", "parentId", "shareEnabled", "shareExpiresAt", "sharePassword", "shareSlug", "shareWithDescription", "shareWithPassword", "shareWithSubProjects", "slug", "teamId", "templateId", "updatedAt", "watchInApp" FROM "Project";
DROP TABLE "Project";
ALTER TABLE "new_Project" RENAME TO "Project";
CREATE UNIQUE INDEX "Project_slug_key" ON "Project"("slug");
CREATE UNIQUE INDEX "Project_shareSlug_key" ON "Project"("shareSlug");
CREATE INDEX "Project_teamId_idx" ON "Project"("teamId");
CREATE INDEX "Project_parentId_idx" ON "Project"("parentId");
CREATE TABLE "new_Script" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashId" TEXT,
    "teamId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Untitled Script',
    "name" TEXT NOT NULL DEFAULT 'Untitled Script',
    "slug" TEXT NOT NULL,
    "shortSlug" TEXT NOT NULL,
    "mode" TEXT NOT NULL DEFAULT 'UNSELECTED',
    "scriptType" TEXT NOT NULL DEFAULT 'av',
    "blankContent" TEXT NOT NULL DEFAULT '',
    "freeformContent" TEXT NOT NULL DEFAULT '',
    "wordsPerMinute" INTEGER NOT NULL DEFAULT 130,
    "wpm" INTEGER NOT NULL DEFAULT 130,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "statusCategory" TEXT NOT NULL DEFAULT 'draft',
    "statusLabel" TEXT NOT NULL DEFAULT 'Draft',
    "teamStatusId" TEXT,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "sharePassword" TEXT,
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
    CONSTRAINT "Script_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Script" ("allowComments", "allowCommentsInOldVersions", "allowGuestDownloads", "archivedAt", "createdAt", "freeformContent", "hideCompletedCommentsEdit", "hideCompletedCommentsPresent", "id", "isSendingCommentEmails", "name", "projectId", "scriptType", "sharePassphrase", "shareWithVersionNotification", "shareWithVersionNumber", "shareWithVersionSwitching", "shortSlug", "showWordCount", "slug", "statusCategory", "statusLabel", "teamId", "teamStatusId", "updatedAt", "versionNumber", "wpm") SELECT "allowComments", "allowCommentsInOldVersions", "allowGuestDownloads", "archivedAt", "createdAt", "freeformContent", "hideCompletedCommentsEdit", "hideCompletedCommentsPresent", "id", "isSendingCommentEmails", "name", "projectId", "scriptType", "sharePassphrase", "shareWithVersionNotification", "shareWithVersionNumber", "shareWithVersionSwitching", "shortSlug", "showWordCount", "slug", "statusCategory", "statusLabel", "teamId", "teamStatusId", "updatedAt", "versionNumber", "wpm" FROM "Script";
DROP TABLE "Script";
ALTER TABLE "new_Script" RENAME TO "Script";
CREATE UNIQUE INDEX "Script_slug_key" ON "Script"("slug");
CREATE UNIQUE INDEX "Script_shortSlug_key" ON "Script"("shortSlug");
CREATE INDEX "Script_teamId_idx" ON "Script"("teamId");
CREATE INDEX "Script_projectId_idx" ON "Script"("projectId");
CREATE TABLE "new_ScriptScene" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "scriptId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "sceneTitle" TEXT NOT NULL DEFAULT 'Scene 1',
    "audioText" TEXT NOT NULL DEFAULT '',
    "visualText" TEXT NOT NULL DEFAULT '',
    "notesText" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ScriptScene_scriptId_fkey" FOREIGN KEY ("scriptId") REFERENCES "Script" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ScriptScene" ("audioText", "createdAt", "id", "notesText", "position", "scriptId", "updatedAt", "visualText") SELECT "audioText", "createdAt", "id", "notesText", "position", "scriptId", "updatedAt", "visualText" FROM "ScriptScene";
DROP TABLE "ScriptScene";
ALTER TABLE "new_ScriptScene" RENAME TO "ScriptScene";
CREATE INDEX "ScriptScene_scriptId_position_idx" ON "ScriptScene"("scriptId", "position");
CREATE TABLE "new_Storyboard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashId" TEXT,
    "teamId" TEXT NOT NULL,
    "projectId" TEXT,
    "createdById" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Untitled Storyboard',
    "name" TEXT NOT NULL DEFAULT 'Untitled Storyboard',
    "slug" TEXT NOT NULL,
    "shortSlug" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "frameNumberFormat" TEXT NOT NULL DEFAULT '1, 2, 3',
    "version" INTEGER NOT NULL DEFAULT 1,
    "versionNumber" INTEGER NOT NULL DEFAULT 1,
    "versionsJson" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "statusCategory" TEXT NOT NULL DEFAULT 'draft',
    "statusLabel" TEXT NOT NULL DEFAULT 'Draft',
    "teamStatusId" TEXT,
    "fieldsJson" TEXT NOT NULL DEFAULT '[]',
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "isShared" BOOLEAN NOT NULL DEFAULT true,
    "shareEnabled" BOOLEAN NOT NULL DEFAULT true,
    "sharePassword" TEXT,
    "sharePassphrase" TEXT,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "hideCompletedComments" BOOLEAN NOT NULL DEFAULT true,
    "allowCommentsInOldVersions" BOOLEAN NOT NULL DEFAULT false,
    "shareWithVersionNumber" BOOLEAN NOT NULL DEFAULT false,
    "shareAsGrid" BOOLEAN NOT NULL DEFAULT false,
    "shareAnimatic" BOOLEAN NOT NULL DEFAULT true,
    "showImageBorder" BOOLEAN NOT NULL DEFAULT false,
    "showFrameNumbers" BOOLEAN NOT NULL DEFAULT true,
    "showVoiceover" BOOLEAN NOT NULL DEFAULT true,
    "showAction" BOOLEAN NOT NULL DEFAULT true,
    "showCamera" BOOLEAN NOT NULL DEFAULT true,
    "showNotes" BOOLEAN NOT NULL DEFAULT true,
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
    CONSTRAINT "Storyboard_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Storyboard" ("agentChatJson", "allowComments", "allowCommentsInOldVersions", "archivedAt", "aspectRatio", "createdAt", "fieldsJson", "hideCompletedComments", "id", "name", "projectId", "shareAnimatic", "shareAsGrid", "shareEnabled", "sharePassphrase", "shareWithVersionNumber", "shortSlug", "showFrameNumbers", "showFrameStatus", "showIcons", "showImageBorder", "showLabelText", "showStatusPill", "slug", "statusCategory", "statusLabel", "teamId", "teamStatusId", "updatedAt", "versionNumber", "versionsJson", "wordCountDisplay") SELECT "agentChatJson", "allowComments", "allowCommentsInOldVersions", "archivedAt", "aspectRatio", "createdAt", "fieldsJson", "hideCompletedComments", "id", "name", "projectId", "shareAnimatic", "shareAsGrid", "shareEnabled", "sharePassphrase", "shareWithVersionNumber", "shortSlug", "showFrameNumbers", "showFrameStatus", "showIcons", "showImageBorder", "showLabelText", "showStatusPill", "slug", "statusCategory", "statusLabel", "teamId", "teamStatusId", "updatedAt", "versionNumber", "versionsJson", "wordCountDisplay" FROM "Storyboard";
DROP TABLE "Storyboard";
ALTER TABLE "new_Storyboard" RENAME TO "Storyboard";
CREATE UNIQUE INDEX "Storyboard_slug_key" ON "Storyboard"("slug");
CREATE UNIQUE INDEX "Storyboard_shortSlug_key" ON "Storyboard"("shortSlug");
CREATE INDEX "Storyboard_teamId_idx" ON "Storyboard"("teamId");
CREATE INDEX "Storyboard_projectId_idx" ON "Storyboard"("projectId");
CREATE TABLE "new_StoryboardFrame" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyboardId" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "label" TEXT DEFAULT '',
    "shotType" TEXT NOT NULL DEFAULT 'Medium Shot',
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "duration" REAL NOT NULL DEFAULT 3.0,
    "durationSec" REAL NOT NULL DEFAULT 3.0,
    "imageUrl" TEXT,
    "imagePrompt" TEXT,
    "imageStyle" TEXT NOT NULL DEFAULT 'sketch',
    "sketchDataUrl" TEXT,
    "voiceoverText" TEXT NOT NULL DEFAULT '',
    "soundText" TEXT NOT NULL DEFAULT '',
    "actionText" TEXT NOT NULL DEFAULT '',
    "cameraNotes" TEXT NOT NULL DEFAULT '',
    "cameraText" TEXT NOT NULL DEFAULT '',
    "productionNotes" TEXT NOT NULL DEFAULT '',
    "notesText" TEXT NOT NULL DEFAULT '',
    "promptText" TEXT NOT NULL DEFAULT '',
    "stylePreset" TEXT NOT NULL DEFAULT 'Sketch',
    "frameStatus" TEXT NOT NULL DEFAULT 'none',
    "audioUrl" TEXT,
    "annotationsJson" TEXT NOT NULL DEFAULT '',
    "cropJson" TEXT NOT NULL DEFAULT '',
    "mentionedAssets" TEXT NOT NULL DEFAULT '[]',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "StoryboardFrame_storyboardId_fkey" FOREIGN KEY ("storyboardId") REFERENCES "Storyboard" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_StoryboardFrame" ("actionText", "cameraText", "createdAt", "duration", "frameStatus", "id", "imageUrl", "label", "notesText", "position", "promptText", "sketchDataUrl", "soundText", "storyboardId", "stylePreset", "updatedAt") SELECT "actionText", "cameraText", "createdAt", "duration", "frameStatus", "id", "imageUrl", "label", "notesText", "position", "promptText", "sketchDataUrl", "soundText", "storyboardId", "stylePreset", "updatedAt" FROM "StoryboardFrame";
DROP TABLE "StoryboardFrame";
ALTER TABLE "new_StoryboardFrame" RENAME TO "StoryboardFrame";
CREATE INDEX "StoryboardFrame_storyboardId_position_idx" ON "StoryboardFrame"("storyboardId", "position");
CREATE TABLE "new_StoryboardTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "aspectRatio" TEXT NOT NULL DEFAULT '16:9',
    "frameNumberFormat" TEXT NOT NULL DEFAULT '1, 2, 3',
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
INSERT INTO "new_StoryboardTemplate" ("allowCommentsInOldVersions", "aspectRatio", "createdAt", "fieldsJson", "frameCount", "hasComments", "hasPassword", "id", "name", "shareWithStatusUpdates", "shareWithVersionNotification", "shareWithVersionNumber", "shareWithVersionSwitching", "teamId", "updatedAt") SELECT "allowCommentsInOldVersions", "aspectRatio", "createdAt", "fieldsJson", "frameCount", "hasComments", "hasPassword", "id", "name", "shareWithStatusUpdates", "shareWithVersionNotification", "shareWithVersionNumber", "shareWithVersionSwitching", "teamId", "updatedAt" FROM "StoryboardTemplate";
DROP TABLE "StoryboardTemplate";
ALTER TABLE "new_StoryboardTemplate" RENAME TO "StoryboardTemplate";
CREATE INDEX "StoryboardTemplate_teamId_idx" ON "StoryboardTemplate"("teamId");
CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "hashId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "planName" TEXT NOT NULL DEFAULT 'Free',
    "planSlug" TEXT NOT NULL DEFAULT 'v2026_free',
    "customDomain" TEXT,
    "slackWebhookUrl" TEXT,
    "brandDarkMode" BOOLEAN NOT NULL DEFAULT false,
    "customFooterText" TEXT,
    "billingEmail" TEXT,
    "billingDetails" TEXT,
    "aiTokenBalance" INTEGER NOT NULL DEFAULT 8,
    "aiCreditsRemaining" INTEGER NOT NULL DEFAULT 30,
    "aiCreditsTotal" INTEGER NOT NULL DEFAULT 30,
    "sharedInviteToken" TEXT NOT NULL,
    "isSharedInviteEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Team" ("aiTokenBalance", "createdAt", "customDomain", "hashId", "id", "isSharedInviteEnabled", "logoUrl", "name", "planName", "planSlug", "sharedInviteToken", "slackWebhookUrl", "updatedAt") SELECT "aiTokenBalance", "createdAt", "customDomain", "hashId", "id", "isSharedInviteEnabled", "logoUrl", "name", "planName", "planSlug", "sharedInviteToken", "slackWebhookUrl", "updatedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_hashId_key" ON "Team"("hashId");
CREATE TABLE "new_User" (
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
    "notifyEmailComments" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmailMentions" BOOLEAN NOT NULL DEFAULT true,
    "notifyEmailStatusChanges" BOOLEAN NOT NULL DEFAULT true,
    "notifyInAppAll" BOOLEAN NOT NULL DEFAULT true,
    "aiImageModel" TEXT NOT NULL DEFAULT 'core',
    "activeTeamId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("activeTeamId", "aiImageModel", "avatarUrl", "createdAt", "email", "followNewScriptsByDefault", "followNewStoryboardsByDefault", "id", "name", "passwordHash", "receiveCommentNotifications", "receiveMentionNotifications", "twoFactorEnabled", "updatedAt", "username") SELECT "activeTeamId", "aiImageModel", "avatarUrl", "createdAt", "email", "followNewScriptsByDefault", "followNewStoryboardsByDefault", "id", "name", "passwordHash", "receiveCommentNotifications", "receiveMentionNotifications", "twoFactorEnabled", "updatedAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE TABLE "new_WorkflowStatus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'draft',
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT '#3B82F6',
    "position" INTEGER NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WorkflowStatus_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_WorkflowStatus" ("category", "createdAt", "id", "isDefault", "name", "position", "teamId", "updatedAt") SELECT "category", "createdAt", "id", "isDefault", "name", "position", "teamId", "updatedAt" FROM "WorkflowStatus";
DROP TABLE "WorkflowStatus";
ALTER TABLE "new_WorkflowStatus" RENAME TO "WorkflowStatus";
CREATE INDEX "WorkflowStatus_teamId_idx" ON "WorkflowStatus"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
