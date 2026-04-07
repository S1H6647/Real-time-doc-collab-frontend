import { test, expect } from '@playwright/test';

test.describe('Auth and Document Creation Smoke Flow', () => {
  test('should register, login, and create a new document', async ({ page }) => {
    // Navigate to register
    await page.goto('/register');
    await page.fill('input[placeholder="Jane"]', 'John');
    await page.fill('input[placeholder="Doe"]', 'Doe');
    await page.fill('input[placeholder="name@email.com"]', 'john@test.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button:has-text("Create Account")');

    // Wait for redirect to login
    await expect(page).toHaveURL('/login');

    // Login
    await page.fill('input[placeholder="name@email.com"]', 'john@test.com');
    await page.fill('input[placeholder="••••••••"]', 'password123');
    await page.click('button:has-text("Sign In")');

    // Wait for redirect to dashboard
    await expect(page).toHaveURL('/documents');

    // Create a new document
    await page.click('button:has-text("New Document")');
    
    // Check if redirected to editor
    await expect(page).toHaveURL(/\/documents\/.+/);
    
    // Check if editor is visible
    const editor = page.locator('.tiptap');
    await expect(editor).toBeVisible();
    
    // Type in editor (simulating user interaction)
    await editor.click();
    await editor.type('Hello World from E2E Test');
    
    // Logout
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/login');
  });
});
