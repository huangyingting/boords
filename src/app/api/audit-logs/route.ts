import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";

export async function GET(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId") || undefined;
  const actorId = searchParams.get("actorId") || undefined;
  const actionFilter = searchParams.get("action") || undefined;
  const days = Number(searchParams.get("days") || "30");

  const since =
    days > 0 ? new Date(Date.now() - days * 24 * 3600 * 1000) : undefined;

  const logs = await prisma.auditLog.findMany({
    where: {
      teamId: ctx.team.id,
      ...(projectId ? { projectId } : {}),
      ...(actorId ? { actorId } : {}),
      ...(actionFilter ? { action: { contains: actionFilter } } : {}),
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    include: {
      actor: { select: { id: true, name: true, email: true, avatarUrl: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ logs });
}
