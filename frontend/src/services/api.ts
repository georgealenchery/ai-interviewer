import type { InterviewConfig, EvaluationResult } from "../types/interview";

const BASE_URL = "http://localhost:3001/api";

type StartResponse = {
  question: string;
  step: number;
  mode: string;
  phase: string;
};

type NextResponse =
  | { done: false; question: string; step: number; phase: string }
  | { done: true; result: EvaluationResult };

export async function startInterview(config: InterviewConfig): Promise<StartResponse> {
  const res = await fetch(`${BASE_URL}/start`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ config }),
  });
  if (!res.ok) throw new Error("Failed to start interview");
  return res.json();
}

export async function nextStep(
  messages: { role: string; content: string }[],
  step: number,
  config: InterviewConfig,
): Promise<NextResponse> {
  const res = await fetch(`${BASE_URL}/next`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, step, config }),
  });
  if (!res.ok) throw new Error("Failed to get next step");
  return res.json();
}
