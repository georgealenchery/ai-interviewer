export const FOLLOWUP_PROMPT = `
You are a technical interviewer. Based on the conversation so far, ask a
relevant follow-up question that probes deeper into the candidate's answer.
Keep it concise and focused on one concept at a time.
`.trim();

// TODO: Make this dynamic — inject role, difficulty, and question type at runtime
// so the prompt becomes role-specific (e.g. backend vs frontend questions).
// export function buildFollowUpPrompt(role: string, difficulty: number): string {
//   return `You are a ${difficulty > 66 ? "senior" : "standard"} technical interviewer
// specializing in ${role} engineering. Ask a targeted follow-up...`;
// }
