import { test, expect } from "@playwright/test";
import { mockSupabaseAuth, setupAuthenticatedPage } from "./helpers/auth.setup";

test.describe("Authentication Flow", () => {
  test("login page renders with email and password fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByRole("heading", { name: "Welcome back" })).toBeVisible();
    await expect(page.getByPlaceholder("you@example.com")).toBeVisible();
    await expect(page.getByPlaceholder("••••••••")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Create one" })).toBeVisible();
  });

  test("login form has required fields", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByPlaceholder("you@example.com")).toHaveAttribute("required", "");
    await expect(page.getByPlaceholder("••••••••")).toHaveAttribute("required", "");
  });

  test("login page shows error on invalid credentials", async ({ page }) => {
    await page.route("**/auth/v1/token*", (route) => {
      route.fulfill({
        status: 400,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid login credentials",
        }),
      });
    });

    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill("wrong@example.com");
    await page.getByPlaceholder("••••••••").fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    await expect(page.getByText("Invalid login credentials")).toBeVisible();
  });

  test("successful login redirects to home page", async ({ page }) => {
    await mockSupabaseAuth(page);

    await page.goto("/login");

    await page.getByPlaceholder("you@example.com").fill("test@example.com");
    await page.getByPlaceholder("••••••••").fill("password123");
    await page.getByRole("button", { name: "Sign in" }).click();

    await page.waitForURL("/", { timeout: 10000 });
  });

  test("login page links to signup page", async ({ page }) => {
    await page.goto("/login");

    await page.getByRole("link", { name: "Create one" }).click();
    await page.waitForURL("/signup");
  });

  test("unauthenticated user is redirected to login from protected routes", async ({
    page,
  }) => {
    await page.goto("/setup");
    await page.waitForURL("/login");
  });

  test("authenticated user can access protected routes", async ({ page }) => {
    await setupAuthenticatedPage(page);

    await page.goto("/setup");

    await expect(page.getByText("Configure Your Interview")).toBeVisible({ timeout: 10000 });
  });
});
