import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "./helpers/auth.setup";
import { mockVapiNetworkCalls, mockBackendAPI } from "./helpers/vapi.mock";

test.describe("App Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockVapiNetworkCalls(page);
    await mockBackendAPI(page);
  });

  test("home page loads for authenticated user", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /Practice Real Interviews/i })).toBeVisible({ timeout: 10000 });
  });

  test("navbar is present on protected pages", async ({ page }) => {
    await page.goto("/setup");

    // DashboardNavbar should render with navigation links
    const nav = page.locator("nav").first();
    await expect(nav).toBeVisible();
  });

  test("setup page is reachable from navigation", async ({ page }) => {
    await page.goto("/");

    // Look for a link/button that leads to setup or practice
    const practiceLink = page.getByRole("link", { name: /practice|interview|start/i });
    if (await practiceLink.isVisible()) {
      await practiceLink.click();
      // Should navigate somewhere in the interview setup flow
      await expect(page).not.toHaveURL("/login");
    }
  });

  test("direct navigation to setup works with auth", async ({ page }) => {
    await page.goto("/setup");
    await expect(page.getByText("Configure Your Interview")).toBeVisible({ timeout: 10000 });
  });

  test("direct navigation to interviews history works", async ({ page }) => {
    await page.goto("/interviews");
    // Page should load (not redirect to login)
    await expect(page).toHaveURL("/interviews");
  });

  test("full flow: home → setup → configure → start interview", async ({ page }) => {
    await page.goto("/setup");

    // Configure interview
    await page.locator("select").selectOption("frontend");
    await page.getByRole("button", { name: "Behavioral" }).click();

    // Start interview
    await page.getByRole("button", { name: "Start Interview" }).click();

    // Should navigate to voice interview
    await page.waitForURL("/interview/voice");
    await expect(page.getByText("Engineer Interview")).toBeVisible();
  });

  test("full flow: setup → technical interview", async ({ page }) => {
    await page.goto("/setup");

    // Switch to technical
    await page.getByRole("button", { name: "Technical" }).click();

    // Start interview
    await page.getByRole("button", { name: "Start Interview" }).click();

    // Should navigate to technical interview
    await page.waitForURL("/technical-interview");
  });
});
