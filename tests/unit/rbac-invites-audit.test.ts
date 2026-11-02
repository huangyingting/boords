import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '@/lib/prisma';
import { canPerformAction, isAdminOrOwner, canEditContent, canAccessProject } from '@/lib/auth/rbac';
import { generateInviteCodeString, validateInvitationCode } from '@/lib/auth/invites';
import { recordAuditLog } from '@/lib/audit';
import { generateFrameIllustrationSvg, generateAssetIllustrationSvg } from '@/lib/svg-generator';

describe('Boords Security, RBAC, Single-Use/Expiring Invites, SVG Engine & Audit Log Suite', () => {
  let testTeamId: string;
  let testOwnerId: string;

  beforeAll(async () => {
    // Clean any test artifacts before starting
    await prisma.auditLog.deleteMany({});
    await prisma.invitationCode.deleteMany({});
    await prisma.teamMembership.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.user.deleteMany({});
  });

  afterAll(async () => {
    // Restore zero-dummy-data clean state after unit tests finish
    await prisma.auditLog.deleteMany({});
    await prisma.invitationCode.deleteMany({});
    await prisma.teamMembership.deleteMany({});
    await prisma.team.deleteMany({});
    await prisma.user.deleteMany({});
  });

  it('starts with zero pre-seeded dummy users or teams', async () => {
    const userCount = await prisma.user.count();
    const teamCount = await prisma.team.count();
    expect(userCount).toBe(0);
    expect(teamCount).toBe(0);
  });

  it('enforces granular Role-Based Access Control (OWNER, ADMIN, CREATOR, MEMBER, REVIEWER)', () => {
    // OWNER and ADMIN can manage team and billing
    expect(canPerformAction('OWNER', 'team.billing')).toBe(true);
    expect(canPerformAction('OWNER', 'team.manage')).toBe(true);
    expect(isAdminOrOwner('OWNER')).toBe(true);
    expect(isAdminOrOwner('ADMIN')).toBe(true);

    // CREATOR and MEMBER can create/edit storyboards & scripts, but cannot manage team or billing
    expect(canPerformAction('CREATOR', 'storyboard.create')).toBe(true);
    expect(canPerformAction('CREATOR', 'storyboard.delete')).toBe(true);
    expect(canPerformAction('CREATOR', 'team.manage')).toBe(false);

    expect(canPerformAction('MEMBER', 'storyboard.create')).toBe(true);
    expect(canPerformAction('MEMBER', 'script.create')).toBe(true);
    expect(canPerformAction('MEMBER', 'storyboard.delete')).toBe(false);
    expect(canPerformAction('MEMBER', 'team.manage')).toBe(false);
    expect(isAdminOrOwner('MEMBER')).toBe(false);

    // REVIEWER can only view team, cannot create or edit content
    expect(canPerformAction('REVIEWER', 'team.view')).toBe(true);
    expect(canPerformAction('REVIEWER', 'storyboard.create')).toBe(false);
    expect(canEditContent('REVIEWER')).toBe(false);
    expect(canEditContent('MEMBER')).toBe(true);

    // Revoked membership cannot access projects
    expect(
      canAccessProject(
        {
          role: 'MEMBER',
          canAccessAllProjects: true,
          projectIdsJson: '[]',
          revokedAt: new Date(),
        },
        'proj_1'
      )
    ).toBe(false);
  });

  it('generates formatted cryptographic invitation codes (BOORDS-XXXXXX-XXXXXX-XXXXXX)', () => {
    const code1 = generateInviteCodeString();
    const code2 = generateInviteCodeString();
    expect(code1).toMatch(/^BOORDS-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$/);
    expect(code2).toMatch(/^BOORDS-[A-Z0-9]{6}-[A-Z0-9]{6}-[A-Z0-9]{6}$/);
    expect(code1).not.toBe(code2);
  });

  it('validates single-use, expiring, email-locked, and revoked invitation codes accurately', async () => {
    const owner = await prisma.user.create({
      data: {
        name: 'Test Owner',
        email: 'owner@test-boords.local',
        passwordHash: 'hash',
      },
    });
    testOwnerId = owner.id;

    const team = await prisma.team.create({
      data: {
        name: 'Test Studio',
        hashId: 'test-studio-hash',
      },
    });
    testTeamId = team.id;

    // 1. Valid single-use invite
    const validCode = generateInviteCodeString();
    const validInvite = await prisma.invitationCode.create({
      data: {
        code: validCode,
        teamId: team.id,
        createdById: owner.id,
        role: 'MEMBER',
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });

    const checkValid = await validateInvitationCode(validCode, 'newuser@test-boords.local');
    expect(checkValid.valid).toBe(true);

    // 2. Exhausted single-use invite (usedCount >= maxUses)
    await prisma.invitationCode.update({
      where: { id: validInvite.id },
      data: { usedCount: 1 },
    });
    const checkExhausted = await validateInvitationCode(validCode, 'another@test-boords.local');
    expect(checkExhausted.valid).toBe(false);
    if (!checkExhausted.valid) {
      expect(checkExhausted.error).toContain('already been used');
    }

    // 3. Expired invite
    const expiredCode = generateInviteCodeString();
    await prisma.invitationCode.create({
      data: {
        code: expiredCode,
        teamId: team.id,
        createdById: owner.id,
        role: 'MEMBER',
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() - 3600_000),
      },
    });
    const checkExpired = await validateInvitationCode(expiredCode);
    expect(checkExpired.valid).toBe(false);
    if (!checkExpired.valid) {
      expect(checkExpired.error).toContain('expired');
    }

    // 4. Revoked invite
    const revokedCode = generateInviteCodeString();
    await prisma.invitationCode.create({
      data: {
        code: revokedCode,
        teamId: team.id,
        createdById: owner.id,
        role: 'MEMBER',
        maxUses: 5,
        usedCount: 0,
        revokedAt: new Date(),
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const checkRevoked = await validateInvitationCode(revokedCode);
    expect(checkRevoked.valid).toBe(false);
    if (!checkRevoked.valid) {
      expect(checkRevoked.error).toContain('revoked');
    }

    // 5. Email-locked invite
    const lockedCode = generateInviteCodeString();
    await prisma.invitationCode.create({
      data: {
        code: lockedCode,
        email: 'vip@test-boords.local',
        teamId: team.id,
        createdById: owner.id,
        role: 'ADMIN',
        maxUses: 1,
        usedCount: 0,
        expiresAt: new Date(Date.now() + 3600_000),
      },
    });
    const checkWrongEmail = await validateInvitationCode(lockedCode, 'imposter@test-boords.local');
    expect(checkWrongEmail.valid).toBe(false);
    const checkMatchingEmail = await validateInvitationCode(lockedCode, 'VIP@test-boords.local');
    expect(checkMatchingEmail.valid).toBe(true);
  });

  it('writes immutable AuditLog entries with JSON metadata', async () => {
    const entry = await recordAuditLog({
      teamId: testTeamId,
      actorId: testOwnerId,
      action: 'invite.created',
      targetType: 'InvitationCode',
      targetId: 'inv_123',
      metadata: { role: 'MEMBER', maxUses: 1 },
      ipAddress: '127.0.0.1',
    });

    expect(entry?.id).toBeTruthy();
    expect(entry?.action).toBe('invite.created');

    const logs = await prisma.auditLog.findMany({ where: { teamId: testTeamId } });
    expect(logs.length).toBe(1);
    expect(JSON.parse(logs[0].metadataJson || '{}')).toEqual({ role: 'MEMBER', maxUses: 1 });
  });

  it('generates deterministic storyboard frame and library SVG illustrations', () => {
    const frameSvg = generateFrameIllustrationSvg({
      prompt: 'Wide establishing shot of a futuristic coffee shop at dawn',
      style: 'Storyboard',
      shotType: 'Wide Shot',
      frameIndex: 1,
    });
    expect(frameSvg.startsWith('data:image/svg+xml;utf8,')).toBe(true);

    const assetSvg = generateAssetIllustrationSvg('Character Hero', 'character');
    expect(assetSvg.startsWith('data:image/svg+xml;utf8,')).toBe(true);
  });
});
