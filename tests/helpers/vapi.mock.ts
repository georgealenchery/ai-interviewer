import { type Page } from "@playwright/test";

export async function mockVapiSDK(page: Page) {
  await page.addInitScript(() => {
    // Create a mock Vapi instance that the app will use
    // The real Vapi SDK is imported as a singleton in lib/vapi.ts
    // We override window.__VAPI_MOCK__ and patch the module at runtime
    const listeners: Record<string, Array<(...args: unknown[]) => void>> = {};

    (window as unknown as Record<string, unknown>).__vapiMock = {
      listeners,
      emit(event: string, ...args: unknown[]) {
        (listeners[event] ?? []).forEach((fn) => fn(...args));
      },
    };
  });
}

export async function emitVapiEvent(page: Page, event: string, data?: unknown) {
  await page.evaluate(
    ({ event, data }) => {
      const mock = (window as unknown as Record<string, unknown>).__vapiMock as {
        listeners: Record<string, Array<(...args: unknown[]) => void>>;
      };
      if (!mock) return;
      (mock.listeners[event] ?? []).forEach((fn) => fn(data));
    },
    { event, data },
  );
}

export async function mockVapiNetworkCalls(page: Page) {
  // Block real Vapi API calls
  await page.route("**/api.vapi.ai/**", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: "mock-call-id", status: "queued" }),
    });
  });

  // Block real Vapi WebSocket connections
  await page.route("**/vapi.ai/**", (route) => {
    if (route.request().resourceType() === "websocket") {
      route.abort();
    } else {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({}),
      });
    }
  });
}

export async function mockBackendAPI(page: Page) {
  // Mock the evaluation endpoint
  await page.route("**/api/analysis/evaluate", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        result: {
          overallScore: 78,
          summary: "Good performance overall with room for improvement.",
          strengths: ["Clear communication", "Strong technical knowledge"],
          improvements: ["Could provide more specific examples"],
          questionBreakdown: [
            {
              question: "Tell me about a challenging project",
              score: 80,
              feedback: "Good use of STAR method",
            },
          ],
        },
        id: "mock-interview-id-123",
      }),
    });
  });

  // Mock interview history
  await page.route("**/api/interviews", (route) => {
    if (route.request().method() === "GET") {
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    } else {
      route.continue();
    }
  });

  // Mock analysis history
  await page.route("**/api/analysis/history", (route) => {
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify([]),
    });
  });
}
