import { test, expect } from '@playwright/test';

test.describe('Header component', () => {
  test('renders the dashboard title', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('Environment Status Dashboard');
  });

  test('renders the subtitle', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('header p').first()).toHaveText(
      'Monitor deployments across all environments'
    );
  });

  test('displays last updated time', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Last updated')).toBeVisible();
    // The header "last updated" time is inside a <p> with specific class
    const lastUpdatedValue = page.locator('header p.text-sm.font-medium');
    await expect(lastUpdatedValue).toBeVisible();
    const text = await lastUpdatedValue.textContent();
    expect(text).toMatch(/ago|Just now/);
  });
});

test.describe('StatusGrid component', () => {
  test('renders the status table', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('table')).toBeVisible();
  });

  test('displays all environment column headers', async ({ page }) => {
    await page.goto('/');
    const headers = page.locator('thead th');
    await expect(headers).toHaveCount(4); // Service + 3 environments
    await expect(headers.nth(0)).toContainText('Service');
    await expect(headers.nth(1)).toContainText('Development');
    await expect(headers.nth(2)).toContainText('Staging');
    await expect(headers.nth(3)).toContainText('Production');
  });

  test('displays all service rows', async ({ page }) => {
    await page.goto('/');
    const serviceNames = ['API Gateway', 'User Service', 'Payment Service', 'Notification Service', 'Web Frontend'];
    for (const name of serviceNames) {
      await expect(page.getByText(name, { exact: true })).toBeVisible();
    }
  });

  test('displays service identifiers', async ({ page }) => {
    await page.goto('/');
    const serviceIds = ['api-gateway', 'user-service', 'payment-service', 'notification-svc', 'web-frontend'];
    for (const id of serviceIds) {
      await expect(page.getByText(id, { exact: true })).toBeVisible();
    }
  });
});

test.describe('Health indicators', () => {
  test('shows healthy indicators with green styling', async ({ page }) => {
    await page.goto('/');
    const healthyIndicators = page.locator('[role="status"][aria-label="Health: Healthy"]');
    await expect(healthyIndicators.first()).toBeVisible();
    // Check that the healthy text is present
    const healthyTexts = page.locator('span.text-green-700');
    expect(await healthyTexts.count()).toBeGreaterThan(0);
  });

  test('shows degraded indicators with yellow styling', async ({ page }) => {
    await page.goto('/');
    const degradedIndicators = page.locator('[role="status"][aria-label="Health: Degraded"]');
    await expect(degradedIndicators.first()).toBeVisible();
    const degradedTexts = page.locator('span.text-yellow-700');
    expect(await degradedTexts.count()).toBeGreaterThan(0);
  });

  test('shows down indicators with red styling', async ({ page }) => {
    await page.goto('/');
    const downIndicators = page.locator('[role="status"][aria-label="Health: Down"]');
    await expect(downIndicators.first()).toBeVisible();
    const downTexts = page.locator('span.text-red-700');
    expect(await downTexts.count()).toBeGreaterThan(0);
  });

  test('displays health status labels', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Healthy').first()).toBeVisible();
    await expect(page.getByText('Degraded').first()).toBeVisible();
    await expect(page.getByText('Down').first()).toBeVisible();
  });
});

test.describe('Drift badges', () => {
  test('shows drift badges when versions differ from production', async ({ page }) => {
    await page.goto('/');
    const driftBadges = page.locator('[role="alert"]');
    expect(await driftBadges.count()).toBeGreaterThan(0);
  });

  test('drift badges contain "drift" text', async ({ page }) => {
    await page.goto('/');
    const driftBadges = page.locator('[role="alert"]');
    const firstBadge = driftBadges.first();
    await expect(firstBadge).toContainText('drift');
  });

  test('drift badges have title with version information', async ({ page }) => {
    await page.goto('/');
    const driftBadge = page.locator('[role="alert"]').first();
    const title = await driftBadge.getAttribute('title');
    expect(title).toMatch(/Drift: v[\d.]+ → v[\d.]+/);
  });

  test('no drift badges appear in the production column', async ({ page }) => {
    await page.goto('/');
    // Production is the last environment column - check that production cells don't have drift badges
    const prodCells = page.locator('tbody tr td:last-child');
    const count = await prodCells.count();
    for (let i = 0; i < count; i++) {
      const alerts = prodCells.nth(i).locator('[role="alert"]');
      expect(await alerts.count()).toBe(0);
    }
  });
});

test.describe('Version display', () => {
  test('displays version numbers in the grid', async ({ page }) => {
    await page.goto('/');
    // Check some known versions from mock data
    await expect(page.getByText('v2.4.1').first()).toBeVisible();
    await expect(page.getByText('v2.3.5').first()).toBeVisible();
  });

  test('displays deployer names', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('alice').first()).toBeVisible();
    await expect(page.getByText('bob').first()).toBeVisible();
  });

  test('displays commit SHAs', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('a1b2c3d').first()).toBeVisible();
  });
});
