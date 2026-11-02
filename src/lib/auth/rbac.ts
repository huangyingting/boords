export type TeamRole = "OWNER" | "ADMIN" | "CREATOR" | "MEMBER" | "REVIEWER";

export type BoordsAction =
  | "storyboards.create"
  | "storyboards.rename"
  | "storyboards.move"
  | "storyboards.delete"
  | "storyboard.create"
  | "storyboard.edit"
  | "storyboard.delete"
  | "script.create"
  | "script.edit"
  | "script.delete"
  | "projects.create"
  | "projects.move"
  | "projects.rename"
  | "projects.delete"
  | "project.create"
  | "project.edit"
  | "project.delete"
  | "asset.manage"
  | "team.view"
  | "team.manage"
  | "team.billing";

const ROLE_ACTIONS: Record<TeamRole, BoordsAction[]> = {
  OWNER: [
    "storyboards.create",
    "storyboards.rename",
    "storyboards.move",
    "storyboards.delete",
    "storyboard.create",
    "storyboard.edit",
    "storyboard.delete",
    "script.create",
    "script.edit",
    "script.delete",
    "projects.create",
    "projects.move",
    "projects.rename",
    "projects.delete",
    "project.create",
    "project.edit",
    "project.delete",
    "asset.manage",
    "team.view",
    "team.manage",
    "team.billing",
  ],
  ADMIN: [
    "storyboards.create",
    "storyboards.rename",
    "storyboards.move",
    "storyboards.delete",
    "storyboard.create",
    "storyboard.edit",
    "storyboard.delete",
    "script.create",
    "script.edit",
    "script.delete",
    "projects.create",
    "projects.move",
    "projects.rename",
    "projects.delete",
    "project.create",
    "project.edit",
    "project.delete",
    "asset.manage",
    "team.view",
    "team.manage",
    "team.billing",
  ],
  CREATOR: [
    "storyboards.create",
    "storyboards.rename",
    "storyboards.move",
    "storyboards.delete",
    "storyboard.create",
    "storyboard.edit",
    "storyboard.delete",
    "script.create",
    "script.edit",
    "script.delete",
    "projects.create",
    "projects.move",
    "projects.rename",
    "project.create",
    "project.edit",
    "asset.manage",
    "team.view",
  ],
  MEMBER: [
    "storyboards.create",
    "storyboards.rename",
    "storyboards.move",
    "storyboard.create",
    "storyboard.edit",
    "script.create",
    "script.edit",
    "projects.create",
    "projects.rename",
    "project.create",
    "project.edit",
    "asset.manage",
    "team.view",
  ],
  REVIEWER: ["team.view"],
};

export function normalizeRole(role?: string | null): TeamRole {
  const upper = (role || "MEMBER").toUpperCase();
  if (
    upper === "OWNER" ||
    upper === "ADMIN" ||
    upper === "CREATOR" ||
    upper === "MEMBER" ||
    upper === "REVIEWER"
  ) {
    return upper;
  }
  return "MEMBER";
}

export function getRoleActions(role?: string | null): BoordsAction[] {
  return ROLE_ACTIONS[normalizeRole(role)];
}

export function canPerformAction(
  role: string | null | undefined,
  action: BoordsAction
): boolean {
  return getRoleActions(role).includes(action);
}

export function isAdminOrOwner(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "OWNER" || r === "ADMIN";
}

export function canEditContent(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === "OWNER" || r === "ADMIN" || r === "CREATOR" || r === "MEMBER";
}

export function canAccessProject(
  membership: {
    role: string;
    canAccessAllProjects: boolean;
    projectIdsJson: string;
    revokedAt?: Date | null;
  },
  projectId: string
): boolean {
  if (membership.revokedAt) return false;
  if (isAdminOrOwner(membership.role) || membership.canAccessAllProjects) {
    return true;
  }
  try {
    const ids = JSON.parse(membership.projectIdsJson || "[]") as string[];
    return ids.length === 0 || ids.includes(projectId);
  } catch {
    return true;
  }
}
