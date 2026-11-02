import { prisma } from "@/lib/prisma";

export interface AuditEventInput {
  teamId?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  targetType: string;
  targetId?: string | null;
  projectId?: string | null;
  metadata?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function recordAuditLog(input: AuditEventInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        teamId: input.teamId ?? null,
        actorId: input.actorId ?? null,
        actorEmail: input.actorEmail ?? null,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId ?? null,
        projectId: input.projectId ?? null,
        metadataJson: JSON.stringify(input.metadata ?? {}),
        ipAddress: input.ipAddress ?? null,
      },
    });
  } catch (err) {
    console.error("Failed to record audit log:", err);
    return null;
  }
}
