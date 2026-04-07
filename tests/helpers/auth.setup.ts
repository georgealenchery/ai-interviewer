import { type Page } from "@playwright/test";

const FAKE_USER = {
  id: "test-user-id-123",
  email: "test@example.com",
  name: "Test User",
};

const FAKE_SESSION = {
  access_token: "fake-access-token",
  refresh_token: "fake-refresh-token",
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
  token_type: "bearer",
  user: {
    id: FAKE_USER.id,
    email: FAKE_USER.email,
    user_metadata: { name: FAKE_USER.name },
    aud: "authenticated",
    role: "authenticated",
    created_at: new Date().toISOString(),
  },
};

export async function mockSupabaseAuth(page: Page) {
  // Intercept all Supabase auth API calls
  await page.route("**/auth/v1/token*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_SESSION),
    });
  });

  await page.route("**/auth/v1/user*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(FAKE_SESSION.user),
    });
  });

  await page.route("**/auth/v1/signup*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ user: FAKE_SESSION.user, session: FAKE_SESSION }),
    });
  });

  await page.route("**/rest/v1/profiles*", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([
        { id: FAKE_USER.id, email: FAKE_USER.email, name: FAKE_USER.name, role: "fullstack" },
      ]),
    });
  });
}

export async function injectAuthSession(page: Page) {
  // Monkey-patch localStorage so that any sb-*-auth-token key returns a fake session.
  // This runs before any app JS, so when Supabase calls getSession() it finds a valid token.
  await page.addInitScript(() => {
    const fakeSession = {
      access_token: "fake-access-token",
      refresh_token: "fake-refresh-token",
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      token_type: "bearer",
      user: {
        id: "test-user-id-123",
        email: "test@example.com",
        user_metadata: { name: "Test User" },
        aud: "authenticated",
        role: "authenticated",
        created_at: new Date().toISOString(),
      },
    };
    const serialized = JSON.stringify(fakeSession);

    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key: string) {
      if (typeof key === "string" && key.startsWith("sb-") && key.endsWith("-auth-token")) {
        return serialized;
      }
      return originalGetItem.call(this, key);
    };
  });
}

export async function setupAuthenticatedPage(page: Page) {
  await mockSupabaseAuth(page);
  await injectAuthSession(page);
}

export { FAKE_USER, FAKE_SESSION };
