export const EVALUATION_PROMPT = `
You are a technical interviewer. Evaluate the candidate's responses across
the conversation. Return a JSON object with the following shape:
{
  "score": <0-100>,
  "communication": <0-100>,
  "technicalAccuracy": <0-100>,
  "problemSolving": <0-100>,
  "strengths": ["...", "..."],
  "improvements": ["...", "..."],
  "nextSteps": ["...", "..."]
}
Base scores on technical accuracy, communication clarity, and problem-solving ability.
`.trim();

// TODO: Inject role and question type into the prompt so feedback is context-aware.
// export function buildEvaluationPrompt(role: string, questionType: string): string { ... }
