import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import express from "express";
import analysisRoutes from "../../routes/analysis";
import executeRoutes from "../../routes/execute";
import { authMiddleware } from "../../middleware/auth";
import {
  validateQuestionGeneration,
  validateTranscriptEvaluation,
  validateCodeExecution,
} from "../../middleware/validate";

// Mock services
vi.mock("../../services/aiService", () => ({
  analyzeVapiTranscript: vi.fn().mockResolvedValue({ score: 80 }),
  generateInterviewQuestions: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../services/storageService", () => ({
  saveInterview: vi.fn().mockResolvedValue({ id: "test-id" }),
  getInterviews: vi.fn().mockResolvedValue([]),
}));
vi.mock("../../services/supabase", () => ({
  supabase: { auth: { getUser: vi.fn() } },
}));

import { supabase } from "../../services/supabase";
const mockGetUser = vi.mocked(supabase.auth.getUser);

const VALID_TOKEN = "Bearer valid-jwt-token";

function buildApp() {
  const app = express();
  app.use(express.json({ limit: "1mb" }));
  app.use("/api/analysis", authMiddleware, analysisRoutes);
  app.use("/api/execute", authMiddleware, executeRoutes);
  return app;
}

beforeEach(() => {
  vi.clearAllMocks();
  mockGetUser.mockResolvedValue({
    data: { user: { id: "user-123", email: "test@test.com" } },
    error: null,
  } as never);
});

// ---------------------------------------------------------------------------
describe("Input validation: /api/analysis/questions", () => {
  const app = buildApp();

  it("rejects invalid role", async () => {
    const res = await request(app)
      .post("/api/analysis/questions")
      .set("Authorization", VALID_TOKEN)
      .send({ role: "hacker", difficulty: "easy", level: "junior" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/role/i);
  });

  it("rejects invalid difficulty", async () => {
    const res = await request(app)
      .post("/api/analysis/questions")
      .set("Authorization", VALID_TOKEN)
      .send({ role: "frontend", difficulty: "impossible", level: "junior" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/difficulty/i);
  });

  it("rejects invalid level", async () => {
    const res = await request(app)
      .post("/api/analysis/questions")
      .set("Authorization", VALID_TOKEN)
      .send({ role: "frontend", difficulty: "easy", level: "godtier" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/level/i);
  });

  it("rejects invalid language", async () => {
    const res = await request(app)
      .post("/api/analysis/questions")
      .set("Authorization", VALID_TOKEN)
      .send({ role: "frontend", difficulty: "easy", level: "junior", language: "brainfuck" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/language/i);
  });

  it("accepts valid request with all fields", async () => {
    const res = await request(app)
      .post("/api/analysis/questions")
      .set("Authorization", VALID_TOKEN)
      .send({ role: "backend", difficulty: "hard", level: "senior", language: "python" });
    expect(res.status).toBe(200);
  });

  it("accepts valid request without optional language", async () => {
    const res = await request(app)
      .post("/api/analysis/questions")
      .set("Authorization", VALID_TOKEN)
      .send({ role: "frontend", difficulty: "easy", level: "junior" });
    expect(res.status).toBe(200);
  });
});

// ---------------------------------------------------------------------------
describe("Input validation: /api/analysis/evaluate — transcript limits", () => {
  const app = buildApp();

  const validConfig = {
    role: "frontend",
    questionType: "behavioral",
    difficulty: 50,
    experienceLevel: 50,
    strictness: 50,
  };

  it("rejects transcript with invalid role in entry", async () => {
    const res = await request(app)
      .post("/api/analysis/evaluate")
      .set("Authorization", VALID_TOKEN)
      .send({
        transcript: [{ role: "admin", text: "hello", timestamp: 1 }],
        config: validConfig,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/role/i);
  });

  it("rejects transcript entry with empty text", async () => {
    const res = await request(app)
      .post("/api/analysis/evaluate")
      .set("Authorization", VALID_TOKEN)
      .send({
        transcript: [{ role: "assistant", text: "", timestamp: 1 }],
        config: validConfig,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/text/i);
  });

  it("rejects oversized transcript (>200 entries)", async () => {
    const bigTranscript = Array.from({ length: 201 }, (_, i) => ({
      role: i % 2 === 0 ? "assistant" : "user",
      text: "message",
      timestamp: i,
    }));
    const res = await request(app)
      .post("/api/analysis/evaluate")
      .set("Authorization", VALID_TOKEN)
      .send({ transcript: bigTranscript, config: validConfig });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too large|maximum/i);
  });

  it("rejects transcript entry with text exceeding 10k chars", async () => {
    const res = await request(app)
      .post("/api/analysis/evaluate")
      .set("Authorization", VALID_TOKEN)
      .send({
        transcript: [
          { role: "user", text: "x".repeat(10_001), timestamp: 1 },
          { role: "assistant", text: "ok", timestamp: 2 },
        ],
        config: validConfig,
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/character limit/i);
  });

  it("rejects invalid questionType in config", async () => {
    const res = await request(app)
      .post("/api/analysis/evaluate")
      .set("Authorization", VALID_TOKEN)
      .send({
        transcript: [
          { role: "assistant", text: "hi", timestamp: 1 },
          { role: "user", text: "hello", timestamp: 2 },
        ],
        config: { ...validConfig, questionType: "malicious" },
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/questionType/i);
  });
});

// ---------------------------------------------------------------------------
describe("Input validation: /api/execute", () => {
  const app = buildApp();

  it("rejects unsupported language", async () => {
    const res = await request(app)
      .post("/api/execute")
      .set("Authorization", VALID_TOKEN)
      .send({
        language: "ruby",
        code: "puts 1",
        functionName: "foo",
        testCases: [{ input: [], expectedOutput: 1 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/unsupported|language/i);
  });

  it("rejects code exceeding 50k characters", async () => {
    const res = await request(app)
      .post("/api/execute")
      .set("Authorization", VALID_TOKEN)
      .send({
        language: "java",
        code: "x".repeat(50_001),
        functionName: "foo",
        testCases: [{ input: [], expectedOutput: 1 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/maximum length/i);
  });

  it("rejects functionName with invalid characters (injection prevention)", async () => {
    const res = await request(app)
      .post("/api/execute")
      .set("Authorization", VALID_TOKEN)
      .send({
        language: "java",
        code: "return 1;",
        functionName: "foo; rm -rf /",
        testCases: [{ input: [], expectedOutput: 1 }],
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/functionName|identifier/i);
  });

  it("rejects too many test cases (>50)", async () => {
    const res = await request(app)
      .post("/api/execute")
      .set("Authorization", VALID_TOKEN)
      .send({
        language: "java",
        code: "return 1;",
        functionName: "foo",
        testCases: Array.from({ length: 51 }, () => ({ input: [], expectedOutput: 1 })),
      });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/too many|maximum/i);
  });

  it("rejects empty testCases array", async () => {
    const res = await request(app)
      .post("/api/execute")
      .set("Authorization", VALID_TOKEN)
      .send({ language: "java", code: "return 1;", functionName: "foo", testCases: [] });
    expect(res.status).toBe(400);
  });

  it("rejects missing code field", async () => {
    const res = await request(app)
      .post("/api/execute")
      .set("Authorization", VALID_TOKEN)
      .send({
        language: "java",
        functionName: "foo",
        testCases: [{ input: [], expectedOutput: 1 }],
      });
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
describe("Error response safety", () => {
  const app = buildApp();

  it("500 errors do not leak stack traces or internal details", async () => {
    const { analyzeVapiTranscript } = await import("../../services/aiService");
    vi.mocked(analyzeVapiTranscript).mockRejectedValueOnce(
      new Error("OpenAI API key invalid: sk-proj-secret123"),
    );

    const res = await request(app)
      .post("/api/analysis/evaluate")
      .set("Authorization", VALID_TOKEN)
      .send({
        transcript: [
          { role: "assistant", text: "hi", timestamp: 1 },
          { role: "user", text: "hello", timestamp: 2 },
        ],
        config: {
          role: "frontend",
          questionType: "behavioral",
          difficulty: 50,
          experienceLevel: 50,
          strictness: 50,
        },
      });

    expect(res.status).toBe(500);
    // Error message must NOT contain the API key or stack trace
    const body = JSON.stringify(res.body);
    expect(body).not.toContain("sk-proj");
    expect(body).not.toContain("stack");
    expect(body).not.toContain("at ");
  });
});

// ---------------------------------------------------------------------------
describe("Validation middleware unit tests", () => {
  function mockReqResNext(body: Record<string, unknown>) {
    const req = { body } as express.Request;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as express.Response;
    const next = vi.fn();
    return { req, res, next };
  }

  it("validateQuestionGeneration calls next() for valid input", () => {
    const { req, res, next } = mockReqResNext({
      role: "frontend",
      difficulty: "easy",
      level: "junior",
    });
    validateQuestionGeneration(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("validateTranscriptEvaluation rejects non-object config", () => {
    const { req, res, next } = mockReqResNext({
      transcript: [{ role: "user", text: "hi" }],
      config: "not-an-object",
    });
    validateTranscriptEvaluation(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("validateCodeExecution rejects non-alphanumeric functionName", () => {
    const { req, res, next } = mockReqResNext({
      language: "java",
      code: "return 1;",
      functionName: "foo()",
      testCases: [{ input: [], expectedOutput: 1 }],
    });
    validateCodeExecution(req, res, next);
    expect(next).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
