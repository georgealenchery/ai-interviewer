import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OPENAI_MODEL } from "../config";
import { buildFollowUpPrompt } from "../prompts/followUp";
import { buildEvaluationPrompt } from "../prompts/evaluation";
import { buildBehavioralPrompt } from "../prompts/behavioral";
import { buildTechnicalPrompt } from "../prompts/technical";
import { formatTranscript } from "../utils/formatter";
import type { Message, InterviewConfig, EvaluationResult } from "../types/interview";

const openai = new OpenAI();

const DEFAULT_EVALUATION: EvaluationResult = {
  score: 50,
  communication: 50,
  technicalAccuracy: 50,
  problemSolving: 50,
  strengths: ["Unable to fully evaluate"],
  improvements: ["Unable to fully evaluate"],
  nextSteps: ["Retry the interview for a complete evaluation"],
};

/**
 * Generate the opening question for an interview session.
 */
export async function generateFirstQuestion(config: InterviewConfig): Promise<string> {
  const { role, mode, difficulty, experienceLevel } = config;

  const prompt =
    mode === "technical"
      ? buildTechnicalPrompt(role, difficulty, experienceLevel)
      : buildBehavioralPrompt(role, experienceLevel);

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "system", content: prompt }],
  });

  return res.choices[0]?.message.content ?? "";
}

/**
 * Generate a follow-up question based on conversation history.
 */
export async function generateFollowUp(
  messages: Message[],
  config: InterviewConfig,
): Promise<string> {
  const prompt = buildFollowUpPrompt(config.role, config.difficulty);
  const transcript = formatTranscript(messages);

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: transcript },
    ],
  });

  return res.choices[0]?.message.content ?? "";
}

/**
 * Evaluate the full interview transcript and return structured feedback.
 */
export async function evaluateInterview(
  messages: Message[],
  config: InterviewConfig,
): Promise<EvaluationResult> {
  const prompt = buildEvaluationPrompt(config.role, config.questionType);
  const transcript = formatTranscript(messages);

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: transcript },
    ],
  });

  const raw = res.choices[0]?.message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as Partial<EvaluationResult>;
    return {
      score: parsed.score ?? DEFAULT_EVALUATION.score,
      communication: parsed.communication ?? DEFAULT_EVALUATION.communication,
      technicalAccuracy: parsed.technicalAccuracy ?? DEFAULT_EVALUATION.technicalAccuracy,
      problemSolving: parsed.problemSolving ?? DEFAULT_EVALUATION.problemSolving,
      strengths: parsed.strengths ?? DEFAULT_EVALUATION.strengths,
      improvements: parsed.improvements ?? DEFAULT_EVALUATION.improvements,
      nextSteps: parsed.nextSteps ?? DEFAULT_EVALUATION.nextSteps,
    };
  } catch {
    console.error("Failed to parse evaluation response:", raw);
    return DEFAULT_EVALUATION;
  }
}
