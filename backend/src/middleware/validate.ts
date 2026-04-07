import type { Request, Response, NextFunction } from "express";

const VALID_ROLES = new Set([
  "frontend",
  "backend",
  "fullstack",
  "ml",
  "mobile",
  "devops",
  "security",
  "systems",
]);

const VALID_DIFFICULTIES = new Set(["easy", "medium", "hard"]);
const VALID_LEVELS = new Set(["junior", "mid", "senior"]);
const VALID_LANGUAGES = new Set([
  "javascript",
  "typescript",
  "python",
  "java",
  "c++",
  "cpp",
  "bash",
  "node.js",
]);
const VALID_QUESTION_TYPES = new Set(["behavioral", "technical"]);

const MAX_TRANSCRIPT_ENTRIES = 200;
const MAX_TRANSCRIPT_TEXT_LENGTH = 10_000;
const MAX_CODE_LENGTH = 50_000;
const MAX_TEST_CASES = 50;

export function validateQuestionGeneration(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { role, difficulty, level, language } = req.body;

  if (!role || typeof role !== "string" || !VALID_ROLES.has(role.toLowerCase())) {
    res.status(400).json({
      error: `Invalid role. Must be one of: ${[...VALID_ROLES].join(", ")}`,
    });
    return;
  }

  if (!difficulty || typeof difficulty !== "string" || !VALID_DIFFICULTIES.has(difficulty.toLowerCase())) {
    res.status(400).json({
      error: `Invalid difficulty. Must be one of: ${[...VALID_DIFFICULTIES].join(", ")}`,
    });
    return;
  }

  if (!level || typeof level !== "string" || !VALID_LEVELS.has(level.toLowerCase())) {
    res.status(400).json({
      error: `Invalid level. Must be one of: ${[...VALID_LEVELS].join(", ")}`,
    });
    return;
  }

  if (language !== undefined && (typeof language !== "string" || !VALID_LANGUAGES.has(language.toLowerCase()))) {
    res.status(400).json({
      error: `Invalid language. Must be one of: ${[...VALID_LANGUAGES].join(", ")}`,
    });
    return;
  }

  next();
}

export function validateTranscriptEvaluation(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { transcript, config } = req.body;

  if (!transcript || !Array.isArray(transcript)) {
    res.status(400).json({ error: "transcript must be a non-empty array" });
    return;
  }

  if (transcript.length === 0) {
    res.status(400).json({ error: "transcript must not be empty" });
    return;
  }

  if (transcript.length > MAX_TRANSCRIPT_ENTRIES) {
    res.status(400).json({
      error: `Transcript too large. Maximum ${MAX_TRANSCRIPT_ENTRIES} entries allowed`,
    });
    return;
  }

  for (let i = 0; i < transcript.length; i++) {
    const entry = transcript[i];
    if (!entry || typeof entry !== "object") {
      res.status(400).json({ error: `Invalid transcript entry at index ${i}` });
      return;
    }
    if (typeof entry.role !== "string" || !["assistant", "user"].includes(entry.role)) {
      res.status(400).json({
        error: `Invalid role in transcript entry ${i}. Must be "assistant" or "user"`,
      });
      return;
    }
    if (typeof entry.text !== "string" || entry.text.length === 0) {
      res.status(400).json({ error: `Empty or missing text in transcript entry ${i}` });
      return;
    }
    if (entry.text.length > MAX_TRANSCRIPT_TEXT_LENGTH) {
      res.status(400).json({
        error: `Transcript entry ${i} text exceeds ${MAX_TRANSCRIPT_TEXT_LENGTH} character limit`,
      });
      return;
    }
  }

  if (!config || typeof config !== "object") {
    res.status(400).json({ error: "config is required and must be an object" });
    return;
  }

  if (!config.role || typeof config.role !== "string") {
    res.status(400).json({ error: "config.role is required" });
    return;
  }

  if (
    !config.questionType ||
    typeof config.questionType !== "string" ||
    !VALID_QUESTION_TYPES.has(config.questionType)
  ) {
    res.status(400).json({
      error: `config.questionType must be one of: ${[...VALID_QUESTION_TYPES].join(", ")}`,
    });
    return;
  }

  next();
}

export function validateCodeExecution(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const { language, code, functionName, testCases } = req.body;

  if (!language || typeof language !== "string") {
    res.status(400).json({ error: "language is required" });
    return;
  }

  const validExecLangs = new Set(["java", "c++", "cpp", "bash"]);
  if (!validExecLangs.has(language.toLowerCase())) {
    res.status(400).json({
      error: `Unsupported language for backend execution: ${language}`,
    });
    return;
  }

  if (!code || typeof code !== "string") {
    res.status(400).json({ error: "code is required" });
    return;
  }

  if (code.length > MAX_CODE_LENGTH) {
    res.status(400).json({
      error: `Code exceeds maximum length of ${MAX_CODE_LENGTH} characters`,
    });
    return;
  }

  if (!functionName || typeof functionName !== "string" || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(functionName)) {
    res.status(400).json({
      error: "functionName is required and must be a valid identifier",
    });
    return;
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    res.status(400).json({ error: "testCases must be a non-empty array" });
    return;
  }

  if (testCases.length > MAX_TEST_CASES) {
    res.status(400).json({
      error: `Too many test cases. Maximum ${MAX_TEST_CASES} allowed`,
    });
    return;
  }

  next();
}
