import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizeRole, type TeamRole } from "@/lib/auth/rbac";
import { recordAuditLog } from "@/lib/audit";

export function generateInviteCodeString(): string {
  const part1 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part3 = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `BOORDS-${part1}-${part2}-${part3}`;
}

export interface CreateInviteInput {
  teamId: string;
  createdById: string;
  actorEmail?: string;
  email?: string | null;
  role?: TeamRole | string;
  maxUses?: number;
  expiresInHours?: number;
  projectIds?: string[];
  note?: string | null;
}

export async function createInvitationCode(input: CreateInviteInput) {
  const code = generateInviteCodeString();
  const role = normalizeRole(input.role || "MEMBER");
  const maxUses = Math.max(1, Number(input.maxUses ?? 1));
  const expiresInHours = Math.max(1, Number(input.expiresInHours ?? 168)); // default 7 days
  const expiresAt = new Date(Date.now() + expiresInHours * 3600 * 1000);

  const invite = await prisma.invitationCode.create({
    data: {
      code,
      teamId: input.teamId,
      createdById: input.createdById,
      email: input.email ? input.email.trim().toLowerCase() : null,
      role,
      maxUses,
      expiresAt,
      projectIdsJson: JSON.stringify(input.projectIds ?? []),
      note: input.note ?? null,
    },
  });

  await recordAuditLog({
    teamId: input.teamId,
    actorId: input.createdById,
    actorEmail: input.actorEmail,
    action: "invite.created",
    targetType: "invitation_code",
    targetId: invite.id,
    metadata: {
      code: invite.code,
      role: invite.role,
      email: invite.email,
      maxUses: invite.maxUses,
      expiresAt: invite.expiresAt.toISOString(),
    },
  });

  return invite;
}

export async function validateInvitationCode(
  rawCode: string,
  candidateEmail?: string
) {
  const code = (rawCode || "").trim();
  if (!code) {
    return { valid: false as const, error: "Invitation code is required" };
  }

  const invite = await prisma.invitationCode.findUnique({
    where: { code },
    include: { team: true },
  });

  if (!invite) {
    return { valid: false as const, error: "Invalid invitation code" };
  }

  if (invite.revokedAt) {
    return { valid: false as const, error: "Invitation code has been revoked" };
  }

  if (invite.expiresAt.getTime() < Date.now()) {
    return { valid: false as const, error: "Invitation code has expired" };
  }

  if (invite.usedCount >= invite.maxUses) {
    return {
      valid: false as const,
      error: "Invitation code has already been used",
    };
  }

  if (
    invite.email &&
    candidateEmail &&
    invite.email.toLowerCase() !== candidateEmail.trim().toLowerCase()
  ) {
    return {
      valid: false as const,
      error: "Invitation code is restricted to a different email address",
    };
  }

  return { valid: true as const, invite };
}

export async function revokeInvitationCode(params: {
  inviteId: string;
  teamId: string;
  actorId: string;
  actorEmail?: string;
}) {
  const invite = await prisma.invitationCode.findFirst({
    where: { id: params.inviteId, teamId: params.teamId },
  });

  if (!invite) {
    throw new Error("Invitation code not found");
  }

  const updated = await prisma.invitationCode.update({
    where: { id: invite.id },
    data: {
      revokedAt: new Date(),
      revokedById: params.actorId,
    },
  });

  await recordAuditLog({
    teamId: params.teamId,
    actorId: params.actorId,
    actorEmail: params.actorEmail,
    action: "invite.revoked",
    targetType: "invitation_code",
    targetId: invite.id,
    metadata: {
      code: invite.code,
      email: invite.email,
      role: invite.role,
    },
  });

  return updated;
}
