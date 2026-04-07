import { test, expect } from "@playwright/test";
import { setupAuthenticatedPage } from "./helpers/auth.setup";
import { mockVapiNetworkCalls, mockBackendAPI } from "./helpers/vapi.mock";

test.describe("Setup Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await setupAuthenticatedPage(page);
    await mockVapiNetworkCalls(page);
    await mockBackendAPI(page);
    await page.goto("/setup");
    await expect(page.getByText("Configure Your Interview")).toBeVisible({ timeout: 10000 });
  });

  test("renders all configuration controls", async ({ page }) => {
    // Role selection dropdown
    await expect(page.locator("select")).toBeVisible();

    // Question type toggle buttons
    await expect(page.getByRole("button", { name: "Behavioral" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Technical" })).toBeVisible();

    // Sliders
    await expect(page.getByText("Question Difficulty")).toBeVisible();
    await expect(page.getByText("Interviewer Strictness")).toBeVisible();
    await expect(page.getByText("Experience Level")).toBeVisible();

    // Interviewer section
    await expect(page.getByText("Your Interviewer")).toBeVisible();
    await expect(page.getByText("Cassidy")).toBeVisible();

    // Start button
    await expect(page.getByRole("button", { name: "Start Interview" })).toBeVisible();
  });

  test("role selection dropdown has all engineering roles", async ({ page }) => {
    const select = page.locator("select");
    const options = select.locator("option");
    await expect(options).toHaveCount(8);

    const expectedRoles = [
      "Frontend Engineer",
      "Backend Engineer",
      "Full-Stack Engineer",
      "Machine Learning Engineer",
      "Mobile Developer",
      "DevOps Engineer",
      "Cybersecurity Engineer",
      "Systems Engineer",
    ];

    for (const role of expectedRoles) {
      await expect(select.locator(`option:has-text("${role}")`)).toBeAttached();
    }
  });

  test("switching to technical shows language selection and topic filter", async ({
    page,
  }) => {
    await expect(page.getByText("Focus Topics")).not.toBeVisible();

    await page.getByRole("button", { name: "Technical" }).click();

    await expect(page.getByText("Focus Topics")).toBeVisible();
  });

  test("language options change based on selected role", async ({ page }) => {
    await page.getByRole("button", { name: "Technical" }).click();

    // Default role from URL param is backend — should show Node.js, Python, Java
    await expect(page.getByRole("button", { name: "Node.js" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Python" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Java" })).toBeVisible();

    // Switch to frontend
    await page.locator("select").selectOption("frontend");

    await expect(page.getByRole("button", { name: "JavaScript" })).toBeVisible();
    await expect(page.getByRole("button", { name: "TypeScript" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Java", exact: true })).not.toBeVisible();
  });

  test("interviewer selection cycles through three interviewers", async ({ page }) => {
    await expect(page.getByText("Cassidy")).toBeVisible();
    await expect(page.getByText("Conversational")).toBeVisible();

    // The 3 small avatar circles for interviewer selection (w-12 h-12 rounded-full)
    const interviewerCircles = page.locator("button.rounded-full").filter({
      has: page.locator("[class*='bg-gradient-to-br']"),
    });
    // There should be at least 3 (the small selector circles)
    // They are 12x12 (w-12 h-12), filter by size to avoid matching the large avatar
    const smallCircles = page.locator("button[class*='w-12'][class*='h-12']");

    // Click Alex (second)
    await smallCircles.nth(1).click();
    await expect(page.getByText("Alex")).toBeVisible();
    await expect(page.getByText("Formal")).toBeVisible();

    // Click Jordan (third)
    await smallCircles.nth(2).click();
    await expect(page.getByText("Jordan")).toBeVisible();
    await expect(page.getByText("Analytical")).toBeVisible();
  });

  test("start interview navigates to voice interview for behavioral", async ({ page }) => {
    await page.getByRole("button", { name: "Start Interview" }).click();
    await page.waitForURL("/interview/voice");
  });

  test("start interview navigates to technical interview page", async ({ page }) => {
    await page.getByRole("button", { name: "Technical" }).click();
    await page.getByRole("button", { name: "Start Interview" }).click();
    await page.waitForURL("/technical-interview");
  });

  test("topic filter allows selecting and clearing topics", async ({ page }) => {
    await page.getByRole("button", { name: "Technical" }).click();

    await expect(page.getByText("All topics")).toBeVisible();

    // Find topic buttons within the Focus Topics section
    const focusSection = page.getByText("Focus Topics").locator("..").locator("..");
    const topicButtons = focusSection.locator("button.rounded-full");
    await topicButtons.first().click();

    await expect(page.getByText("1 selected")).toBeVisible();

    await page.getByText("Clear selection").click();
    await expect(page.getByText("All topics")).toBeVisible();
  });
});
