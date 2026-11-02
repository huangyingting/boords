import { NextResponse } from "next/server";
import { getAuthenticatedContext } from "@/lib/auth/session";
import { canPerformAction } from "@/lib/auth/rbac";
import { revokeInvitationCode } from "@/lib/auth/invites";

export async function PATCH(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const ctx = await getAuthenticatedContext();
  if (!ctx) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!canPerformAction(ctx.role, "team.manage")) {
    return NextResponse.json(
      { error: "Forbidden: Only Team Admins or Owners can revoke invitations" },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    const updated = await revokeInvitationCode({
      inviteId: id,
      teamId: ctx.team.id,
      actorId: ctx.user.id,
      actorEmail: ctx.user.email,
    });
    return NextResponse.json({ invite: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to revoke invite" },
      { status: 404 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(request, context);
}
