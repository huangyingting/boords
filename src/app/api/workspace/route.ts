import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const teamId = ctx.team.id;

  const [
    memberships,
    statuses,
    templates,
    projects,
    storyboards,
    scripts,
    assetFolders,
    assets,
    notifications,
    invites,
    auditLogs,
  ] = await Promise.all([
    prisma.teamMembership.findMany({
      where: { teamId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            username: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.workflowStatus.findMany({
      where: { teamId },
      orderBy: { position: "asc" },
    }),
    prisma.storyboardTemplate.findMany({
      where: { teamId },
      orderBy: { createdAt: "asc" },
    }),
    prisma.project.findMany({
      where: { teamId },
      include: {
        _count: {
          select: { storyboards: true, scripts: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.storyboard.findMany({
      where: { teamId },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        frames: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            position: true,
            imageUrl: true,
            aspectRatio: true,
            durationSec: true,
          },
        },
        _count: {
          select: { frames: true, comments: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.script.findMany({
      where: { teamId },
      include: {
        project: { select: { id: true, name: true, slug: true } },
        scenes: {
          orderBy: { position: "asc" },
        },
        _count: {
          select: { scenes: true, comments: true },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.assetFolder.findMany({
      where: { teamId },
      orderBy: { position: "asc" },
    }),
    prisma.libraryAsset.findMany({
      where: { teamId },
      include: { folder: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.notification.findMany({
      where: { userId: ctx.user.id },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.invitationCode.findMany({
      where: { teamId },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        redeemedBy: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.findMany({
      where: { teamId },
      include: {
        actor: {
          select: { id: true, name: true, email: true, avatarUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  return NextResponse.json({
    user: {
      id: ctx.user.id,
      name: ctx.user.name,
      email: ctx.user.email,
      username: ctx.user.username,
      avatarUrl: ctx.user.avatarUrl,
      twoFactorEnabled: ctx.user.twoFactorEnabled,
      notifyEmailComments: ctx.user.notifyEmailComments,
      notifyEmailMentions: ctx.user.notifyEmailMentions,
      notifyEmailStatusChanges: ctx.user.notifyEmailStatusChanges,
      notifyInAppAll: ctx.user.notifyInAppAll,
    },
    team: ctx.team,
    role: ctx.role,
    memberships,
    statuses,
    templates,
    projects,
    storyboards,
    scripts,
    assetFolders,
    assets,
    notifications,
    invites,
    auditLogs,
  });
}
