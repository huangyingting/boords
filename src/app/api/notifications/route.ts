import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedContext } from "@/lib/auth/session";

export async function GET() {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: ctx.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({ notifications });
}

export async function PATCH(request: Request) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();

  if (body.markAllRead) {
    await prisma.notification.updateMany({
      where: { userId: ctx.user.id, isRead: false },
      data: { isRead: true },
    });
    return NextResponse.json({ updated: true });
  }

  if (body.id) {
    await prisma.notification.updateMany({
      where: { id: String(body.id), userId: ctx.user.id },
      data: { isRead: Boolean(body.isRead ?? true) },
    });
  }

  return NextResponse.json({ updated: true });
}
