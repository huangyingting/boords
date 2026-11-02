import { test, expect } from '@playwright/test';

async function loginAs(page: any, email: string, password = 'StrongPass123!') {
  await page.goto('/login');
  await page.locator('#login-email').fill(email);
  await page.locator('#login-password').fill(password);
  await page.getByRole('button', { name: /Log in to Workspace/i }).click();
  await page.waitForURL('**/dashboard', { timeout: 25000 });
}

test.describe.serial('Boords Full-Stack Exhaustive E2E Feature & Workflow Suite', () => {
  let singleUseInviteCode = '';
  let revokedInviteCode = '';
  let sharedStoryboardSlug = '';
  let sharedScriptSlug = '';
  let sharedProjectSlug = '';
  let archivedStoryboardUrl = '';

  test('1. Marketing Site, Pricing Currency/Credit Switchers, Storyboard Templates & Free Script Timer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toContainText('Pre-production for modern video teams');
    await expect(page.getByRole('link', { name: 'Pricing' }).first()).toBeVisible();

    // Navigate to Pricing page and test interactive Billing Interval, Currency Switcher, and AI Credit Pack Selector
    await page.goto('/pricing');
    await expect(page.locator('h1')).toContainText('Simple, transparent pricing');
    await expect(page.getByText('Free').first()).toBeVisible();
    await expect(page.getByText('Standard').first()).toBeVisible();
    await expect(page.getByText('Workflow').first()).toBeVisible();

    // Switch currency to EUR and GBP
    await page.getByRole('button', { name: 'EUR', exact: true }).click();
    await expect(page.getByText(/€/).first()).toBeVisible();
    await page.getByRole('button', { name: 'GBP', exact: true }).click();
    await expect(page.getByText(/£/).first()).toBeVisible();
    await page.getByRole('button', { name: 'USD', exact: true }).click();

    // Switch AI Credit Pack Tier
    await page.getByRole('button', { name: '3,000 credits' }).click();
    await expect(page.getByText('3,000 AI image credits / mo').first()).toBeVisible();

    // Visit Storyboard Templates gallery and filter categories
    await page.goto('/storyboard-templates');
    await expect(page.locator('h1')).toContainText('Storyboard Templates for Every Video Format');
    await page.getByRole('button', { name: 'Advertising', exact: true }).click();
    await expect(page.getByText('30-Second TV & Social Commercial')).toBeVisible();
    await page.getByRole('button', { name: 'Film & TV', exact: true }).click();
    await expect(page.getByText('Narrative Film & Episodic Scene Breakdown')).toBeVisible();

    // Visit Free Voiceover Script Timer tool and test WPM calculation + sample loader
    await page.goto('/tools/script-timer');
    await expect(page.locator('h1')).toContainText('Voiceover Script Timer & Word Calculator');
    await page.getByRole('button', { name: '60s Explainer Intro' }).click();
    await expect(page.getByText('Estimated Spoken Runtime')).toBeVisible();
    await page.getByRole('button', { name: 'Fast Promo (170 WPM)' }).click();

    // Test Feature pages & Mobile viewport responsiveness
    for (const route of ['/storyboard-software', '/script-editor', '/animatic-software', '/collaborate', '/customers']) {
      const res = await page.goto(route);
      expect(res?.status()).toBe(200);
      await expect(page.locator('h1')).toBeVisible();
    }

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('2. Zero-Dummy-Data Verification & First-User Owner Bootstrap (/setup)', async ({ page, request }) => {
    const bootRes = await request.get('/api/auth/bootstrap');
    const bootData = await bootRes.json();
    expect(bootData.userCount).toBe(0);
    expect(bootData.needsBootstrap).toBe(true);

    // Visit /setup and create the initial Workspace Owner account
    await page.goto('/setup');
    await expect(page.getByText('Initialize Owner Account')).toBeVisible();

    await page.locator('#setup-name').fill('Alex Director');
    await page.locator('#setup-team').fill('Studio Meridian');
    await page.locator('#setup-email').fill('alex@studio-boords.local');
    await page.locator('#setup-password').fill('StrongPass123!');

    await page.getByRole('button', { name: /Initialize Owner & Workspace/i }).click();

    await page.waitForURL('**/dashboard', { timeout: 25000 });
    await expect(page.getByText('Studio Meridian').first()).toBeVisible();

    // Verify bootstrap is now permanently locked
    const bootAfter = await (await request.get('/api/auth/bootstrap')).json();
    expect(bootAfter.needsBootstrap).toBe(false);
    expect(bootAfter.userCount).toBe(1);

    await page.goto('/setup');
    await expect(page.getByText('Workspace Already Initialized')).toBeVisible();
  });

  test('3. Custom Storyboard Modal Validation, AI Frame Generation with @Mentions, Interactive SVG Sketch Canvas, Frame Duplicate & Shot List', async ({ page }) => {
    await loginAs(page, 'alex@studio-boords.local');

    // Open "+ Custom Storyboard..." modal and verify "Create Storyboard →" is disabled when name is empty
    await page.getByRole('button', { name: /\+ Custom Storyboard/i }).click();
    const createBtn = page.getByRole('button', { name: /Create Storyboard →/i });
    await expect(createBtn).toBeDisabled();

    // Select 2.39:1 Anamorphic aspect ratio and 1A, 1B numbering
    await page.getByRole('button', { name: '2.39:1' }).click();
    await page.getByPlaceholder(/e.g. Nike Air Commercial v1/i).fill('Anamorphic Hero Spot');
    await expect(createBtn).toBeEnabled();
    await createBtn.click();

    await page.waitForURL('**/storyboards/**', { timeout: 20000 });
    await expect(page.locator('input[aria-label="Storyboard Title"]')).toHaveValue('Anamorphic Hero Spot');

    // Insert a Library @Character mention from the right sidebar and generate AI frames
    const promptInput = page.getByPlaceholder(/A 4-shot commercial/i);
    await expect(promptInput).toBeVisible();
    await promptInput.fill(
      'Wide shot of a coastal lighthouse at sunset with @astronaut. Close-up of the keeper turning on the lantern beam. Aerial drone shot pulling back over the ocean waves.'
    );
    await page.getByRole('button', { name: /Generate Storyboard/i }).click();

    await expect(page.getByText(/Wide shot of a coastal lighthouse/i).first()).toBeVisible({ timeout: 15000 });

    // Open the Interactive SVG Freehand Sketch & Annotation Canvas on Frame 1
    await page.locator('button[title="Annotate Frame"]').first().click();
    await expect(page.getByText('Frame Annotation, Freehand Sketch & Camera Direction')).toBeVisible();

    // Draw a freehand stroke on the SVG canvas
    const svgCanvas = page.locator('[data-testid="frame-sketch-svg"]');
    await expect(svgCanvas).toBeVisible();
    const box = await svgCanvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 80, box.y + 80);
      await page.mouse.down();
      await page.mouse.move(box.x + 250, box.y + 150, { steps: 5 });
      await page.mouse.up();
    }

    // Switch to Direction Arrow tool and draw a motion arrow
    await page.getByRole('button', { name: /Direction Arrow/i }).click();
    if (box) {
      await page.mouse.move(box.x + 120, box.y + 180);
      await page.mouse.down();
      await page.mouse.move(box.x + 320, box.y + 180, { steps: 5 });
      await page.mouse.up();
    }

    // Save the composite sketch onto the frame
    await page.getByRole('button', { name: /Save Annotation/i }).click();
    await expect(page.getByText('Frame Annotation, Freehand Sketch & Camera Direction')).toBeHidden();

    // Test Frame Duplication
    await page.locator('button[title="Duplicate Frame"]').first().click();

    // Test switching to Shot list table view and back
    await page.getByRole('button', { name: 'Shot list' }).click();
    await expect(page.locator('table')).toBeVisible();
    await page.getByRole('button', { name: 'Storyboard', exact: true }).click();

    // Test Version Branching (v1 -> v2)
    await page.getByRole('button', { name: 'v1' }).click();
    await page.getByRole('button', { name: /\+ Create new version/i }).click();
    await expect(page.getByRole('button', { name: 'v2' })).toBeVisible({ timeout: 15000 });

    // Test opening Animatic Player modal
    await page.getByRole('button', { name: /Animatic/i }).click();
    await expect(page.getByText(/Animatic Preview/i)).toBeVisible();
    await page.getByRole('button', { name: /Pause|Play/i }).first().click();
    await page.locator('.fixed button').first().click();

    // Enable Public Share Link with password protection ("review123")
    await page.getByRole('button', { name: /Share/i }).first().click();
    await expect(page.getByRole('heading', { name: 'Share storyboard' })).toBeVisible();
    await page.getByPlaceholder(/Leave blank for open access/i).fill('review123');
    await page.getByRole('button', { name: /Copy link/i }).click();

    const shareInputValue = await page.locator('input[readonly]').first().inputValue();
    const match = shareInputValue.match(/\/s\/([a-zA-Z0-9_-]+)/);
    expect(match?.[1]).toBeTruthy();
    sharedStoryboardSlug = match![1];
  });

  test('4. Password-Protected Public Storyboard Share (/s/[shortSlug] & /s/[shortSlug]/frame), Client Approval & Guest Commenting', async ({ browser }) => {
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();

    // Visit password-protected storyboard share link
    await guestPage.goto(`/s/${sharedStoryboardSlug}/frame`);
    await expect(guestPage.getByText('Password Protected Storyboard')).toBeVisible();

    // Enter wrong password first
    await guestPage.getByPlaceholder('Enter share password').fill('wrongpass');
    await guestPage.getByRole('button', { name: /Unlock Storyboard/i }).click();
    await expect(guestPage.getByText(/Incorrect password/i)).toBeVisible();

    // Unlock with correct password ("review123")
    await guestPage.getByPlaceholder('Enter share password').fill('review123');
    await guestPage.getByRole('button', { name: /Unlock Storyboard/i }).click();
    await expect(guestPage.getByText('Anamorphic Hero Spot')).toBeVisible();
    await expect(guestPage.getByText(/Client Feedback/i)).toBeVisible();

    await guestPage.getByPlaceholder('Your Name').fill('Client Reviewer');
    await guestPage.getByPlaceholder('Leave feedback on this frame...').fill('Love the sketched motion arrow on this opening shot!');
    await guestPage.getByRole('button', { name: /Submit Feedback/i }).click();
    await expect(guestPage.getByText('Love the sketched motion arrow on this opening shot!')).toBeVisible();

    await guestContext.close();
  });

  test('5. Project Creation, Star/Description, Kanban Board View & Password-Protected Project Share (/ps/[shareSlug])', async ({ page, browser }) => {
    await loginAs(page, 'alex@studio-boords.local');

    // Create a Project from sidebar
    await page.getByRole('button', { name: 'New Project' }).click();
    await page.locator('#new-project-name').fill('Summer Brand Campaign');
    await page.getByRole('button', { name: 'Create project' }).click();

    await page.getByRole('link', { name: /Summer Brand Campaign/i }).first().click();
    await page.waitForURL('**/p/**', { timeout: 20000 });

    // Star project and add inline description
    await page.getByRole('button', { name: 'Star project' }).click();
    const descInput = page.getByPlaceholder(/Click here to add a description/i);
    await descInput.fill('Q3 Global TV + Social deliverables');
    await descInput.blur();

    // Create a storyboard inside this project
    await page.getByRole('button', { name: /New storyboard/i }).click();
    await page.waitForURL('**/storyboards/**');
    archivedStoryboardUrl = page.url();

    // Return to project page and configure Project Share with password
    await page.goto('/dashboard');
    await page.getByRole('link', { name: /Summer Brand Campaign/i }).first().click();

    await page.getByRole('button', { name: /Share/i }).first().click();
    await page.getByPlaceholder(/Leave blank for open link/i).fill('projsecret');
    await page.getByRole('button', { name: /Copy link/i }).click();

    const projShareInput = await page.locator('input[readonly]').first().inputValue();
    const match = projShareInput.match(/\/ps\/([a-zA-Z0-9_-]+)/);
    expect(match?.[1]).toBeTruthy();
    sharedProjectSlug = match![1];

    // Verify Project Share link in guest context
    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(`/ps/${sharedProjectSlug}`);
    await expect(guestPage.getByText('Protected Project Folder')).toBeVisible();
    await guestPage.getByPlaceholder('Enter password').fill('projsecret');
    await guestPage.getByRole('button', { name: /Unlock Project/i }).click();
    await expect(guestPage.getByText('Summer Brand Campaign').first()).toBeVisible();
    await guestContext.close();
  });

  test('6. Script Editor (Two-Column AV & Blank Modes), WPM Pacing, Public Script Share (/sc/[shortSlug]) & -> Storyboard Conversion', async ({ page, browser }) => {
    await loginAs(page, 'alex@studio-boords.local');

    await page.getByRole('button', { name: /New Script/i }).first().click();
    await page.waitForURL('**/scripts/**');

    // Select Two-column AV script mode
    await expect(page.getByText('Choose your script format')).toBeVisible();
    await page.getByText('Two-column AV script', { exact: true }).click();
    await expect(page.getByText('Total RT')).toBeVisible();

    // Enable Script Public Share and test /sc/[shortSlug]
    await page.getByRole('button', { name: /Share script/i }).click();
    await page.getByRole('button', { name: /Copy link/i }).click();
    const scShareVal = await page.locator('input[readonly]').first().inputValue();
    const scMatch = scShareVal.match(/\/sc\/([a-zA-Z0-9_-]+)/);
    expect(scMatch?.[1]).toBeTruthy();
    sharedScriptSlug = scMatch![1];
    await page.locator('.fixed button').first().click();

    const guestContext = await browser.newContext();
    const guestPage = await guestContext.newPage();
    await guestPage.goto(`/sc/${sharedScriptSlug}`);
    await expect(guestPage.getByText(/SCENE/i).first()).toBeVisible();
    await guestContext.close();

    // Convert script scenes directly into a Storyboard
    await page.getByRole('button', { name: /-> Storyboard/i }).click();
    await page.waitForURL('**/storyboards/**', { timeout: 20000 });
    await expect(page.getByRole('button', { name: 'Shot list' })).toBeVisible();
  });

  test('7. Asset Library (/library & /library/[teamHash]/playground), Custom Folders & AI Character Playground', async ({ page }) => {
    await loginAs(page, 'alex@studio-boords.local');

    await page.goto('/library/studio-meridian/playground');
    await expect(page.getByText('Asset Playground Generator')).toBeVisible();

    // Generate a new AI Concept Frame in the Playground
    await page.getByRole('button', { name: /Generate & Save to Library/i }).click();
    await expect(page.getByText(/Recent Playground Generations \(1\)/i)).toBeVisible({ timeout: 15000 });
  });

  test('8. Archive Lifecycle & Archived Read-Only Storyboard Protection Banner', async ({ page }) => {
    await loginAs(page, 'alex@studio-boords.local');

    // Capture the first storyboard link on Dashboard before archiving it
    const firstSbHref = await page.locator('a[href^="/storyboards/"]').first().getAttribute('href');
    expect(firstSbHref).toBeTruthy();

    // Archive a storyboard from Dashboard
    await page.getByRole('button', { name: 'Storyboard options' }).first().click();
    await page.getByRole('button', { name: /Move to Archive/i }).click();

    // Visit the archived storyboard directly and verify the Archived Read-Only Protection Banner
    await page.goto(firstSbHref!);
    await expect(page.getByText(/You are viewing archived items\. Please restore them to edit\./i)).toBeVisible();

    // Visit /archive/studio-meridian and verify item is listed, then restore it
    await page.goto('/archive/studio-meridian');
    await expect(page.getByRole('heading', { name: 'Archive' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Restore/i }).first()).toBeVisible();

    await page.getByRole('button', { name: /Restore/i }).first().click();
  });

  test('9. Invite-Only Registration, Single-Use/Revoked Invites, Role Changes (REVIEWER), Member Revocation & Settings Hub', async ({ page, browser }) => {
    await loginAs(page, 'alex@studio-boords.local');

    // Test Settings Route Alias (/settings/team/manage -> /settings/team/members)
    await page.goto('/settings/team/manage');
    await expect(page.getByText('Invite-Only Registration Codes')).toBeVisible();

    // 1) Generate an invite code and immediately REVOKE it
    await page.getByRole('button', { name: /Generate Invite Code/i }).click();
    const firstCodeEl = page.locator('td.font-mono div').filter({ hasText: /^BOORDS-/ }).first();
    await expect(firstCodeEl).toBeVisible();
    revokedInviteCode = (await firstCodeEl.textContent())?.trim() || '';
    await page.getByRole('button', { name: /Revoke/i }).first().click();
    await expect(page.getByText('Revoked').first()).toBeVisible();

    // 2) Generate a second single-use invite code that stays ACTIVE
    await page.getByRole('button', { name: /Generate Invite Code/i }).click();
    const allCodeEls = page.locator('td.font-mono div').filter({ hasText: /^BOORDS-/ });
    await expect(allCodeEls).toHaveCount(2);
    singleUseInviteCode = (await allCodeEls.first().textContent())?.trim() || '';
    expect(singleUseInviteCode).not.toEqual(revokedInviteCode);

    // Open a new browser context to test registration
    const inviteeContext = await browser.newContext();
    const inviteePage = await inviteeContext.newPage();

    // Verify the REVOKED invite code is rejected
    await inviteePage.goto(`/register?code=${revokedInviteCode}`);
    await inviteePage.locator('#reg-name').fill('Revoked Tester');
    await inviteePage.locator('#reg-email').fill('revoked@studio-boords.local');
    await inviteePage.locator('#reg-password').fill('SamPass123!');
    await inviteePage.getByRole('button', { name: /Redeem Code & Create Account/i }).click();
    await expect(inviteePage.getByText(/revoked/i)).toBeVisible();

    // Redeem the valid single-use invite code
    await inviteePage.locator('#invite-code').fill(singleUseInviteCode);
    await inviteePage.locator('#reg-name').fill('Sam Storyboarder');
    await inviteePage.locator('#reg-email').fill('sam@studio-boords.local');
    await inviteePage.locator('#reg-password').fill('SamPass123!');
    await inviteePage.getByRole('button', { name: /Redeem Code & Create Account/i }).click();

    await inviteePage.waitForURL('**/dashboard', { timeout: 25000 });
    await expect(inviteePage.getByText('Studio Meridian').first()).toBeVisible();

    // Verify single-use code is exhausted when a third user tries to reuse it
    const thirdContext = await browser.newContext();
    const thirdPage = await thirdContext.newPage();
    await thirdPage.goto(`/register?code=${singleUseInviteCode}`);
    await thirdPage.locator('#reg-name').fill('Third Person');
    await thirdPage.locator('#reg-email').fill('third@studio-boords.local');
    await thirdPage.locator('#reg-password').fill('ThirdPass123!');
    await thirdPage.getByRole('button', { name: /Redeem Code & Create Account/i }).click();
    await expect(thirdPage.getByText(/already been used/i)).toBeVisible();
    await thirdContext.close();

    // Back in Owner's session: reload /settings/team/members, change Sam's role to REVIEWER, then REVOKE Sam's membership
    await page.reload();
    const samRoleSelect = page.getByLabel('Role for sam@studio-boords.local');
    await expect(samRoleSelect).toBeVisible();
    await samRoleSelect.selectOption('REVIEWER');

    // Click "Revoke Member" for Sam and verify Sam's active session is blocked on /api/workspace
    await page.getByRole('button', { name: 'Revoke Member' }).click();
    await expect(page.getByText('(Access Revoked)')).toBeVisible();

    const samWsRes = await inviteePage.request.get('/api/workspace');
    expect(samWsRes.status()).toBe(401);

    // Restore Sam's access and verify
    await page.getByRole('button', { name: 'Restore Access' }).click();
    await inviteeContext.close();

    // Visit remaining Team, Billing & Account Settings pages & aliases
    for (const settingsRoute of [
      '/settings/team/general',
      '/settings/team/branding',
      '/settings/team/statuses',
      '/settings/team/templates',
      '/settings/team/api',
      '/settings/billing/plan',
      '/settings/account/profile',
      '/settings/account/password',
      '/settings/account/notification',
      '/settings/account/membership',
    ]) {
      await page.goto(settingsRoute);
      await expect(page.locator('h1')).toBeVisible();
    }

    // Verify Activity & Audit Log records all security events (invite.created, invite.revoked, invite.redeemed, member.revoked)
    await page.goto('/activity/studio-meridian');
    await expect(page.getByText('Activity & Audit Log')).toBeVisible();
    await expect(page.getByText('invite.created').first()).toBeVisible();
    await expect(page.getByText('invite.revoked').first()).toBeVisible();
    await expect(page.getByText('invite.redeemed').first()).toBeVisible();
    await expect(page.getByText('member.revoked').first()).toBeVisible();
  });
});

