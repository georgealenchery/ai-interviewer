import { generateFirstQuestion, generateFollowUp, evaluateInterview } from "./aiService";
import type {
  InterviewConfig,
  InterviewStepInput,
  InterviewStartResult,
  InterviewNextResult,
} from "../types/interview";

const MAX_BEHAVIORAL_STEPS = 5;
const MAX_TECHNICAL_STEPS = 3;

function getPhase(
  mode: InterviewConfig["mode"],
  step: number,
): "behavioral" | "technical" {
  if (mode === "behavioral") return "behavioral";
  if (mode === "technical") return "technical";
  // Hybrid: first half behavioral, second half technical
  return step < MAX_BEHAVIORAL_STEPS ? "behavioral" : "technical";
}

function getMaxSteps(mode: InterviewConfig["mode"]): number {
  if (mode === "behavioral") return MAX_BEHAVIORAL_STEPS;
  if (mode === "technical") return MAX_TECHNICAL_STEPS;
  // Hybrid: behavioral steps + technical steps
  return MAX_BEHAVIORAL_STEPS + MAX_TECHNICAL_STEPS;
}

/**
 * Start a new interview session — returns the first question.
 */
export async function startInterview(
  config: InterviewConfig,
): Promise<InterviewStartResult> {
  const question = await generateFirstQuestion(config);
  const phase = getPhase(config.mode, 0);

  return {
    question,
    step: 0,
    mode: config.mode,
    phase,
  };
}

/**
 * Advance the interview by one step — returns the next question or final evaluation.
 */
export async function nextStep(input: InterviewStepInput): Promise<InterviewNextResult> {
  const { messages, step, config } = input;
  const maxSteps = getMaxSteps(config.mode);

  if (step < maxSteps) {
    const question = await generateFollowUp(messages, config);
    const phase = getPhase(config.mode, step + 1);

    return {
      done: false,
      question,
      step: step + 1,
      phase,
    };
  }

  const result = await evaluateInterview(messages, config);
  return { done: true, result };
}
