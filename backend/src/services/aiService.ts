// TODO 1: Initialize OpenAI client once OPENAI_API_KEY is in .env
// import OpenAI from "openai";
// const openai = new OpenAI(); // reads OPENAI_API_KEY from process.env automatically

import { FOLLOWUP_PROMPT } from "../prompts/followup";
import { EVALUATION_PROMPT } from "../prompts/evaluation";
import { formatTranscript } from "../utils/formatter";

type Message = { role: string; content: string };

// TODO 2: Add a generateFirstQuestion() function that takes interview config
// and returns a role-specific opening question.
// export async function generateFirstQuestion(config: InterviewConfig): Promise<string> {
//   const prompt = buildFirstQuestionPrompt(config); // inject role, difficulty into prompt
//   const res = await openai.chat.completions.create({
//     model: "gpt-4o-mini",
//     messages: [{ role: "system", content: prompt }],
//   });
//   return res.choices[0]?.message.content ?? "";
// }

// TODO 3: Wire up real OpenAI call for follow-up question generation
export async function generateFollowUp(messages: Message[]): Promise<string> {
  // TODO 3a: Uncomment below — formatTranscript is already implemented and ready
  // const transcript = formatTranscript(messages);
  // const res = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   messages: [
  //     { role: "system", content: FOLLOWUP_PROMPT },
  //     { role: "user", content: transcript },
  //   ],
  // });
  // return res.choices[0]?.message.content ?? "";
  console.log("generateFollowUp called with", messages.length, "messages");
  return "placeholder follow-up question";
}

// TODO 4: Wire up real OpenAI call for evaluation.
// Return type needs to expand from number → FeedbackResult to match AnalyticsDashboard.
// type FeedbackResult = {
//   score: number;
//   communication: number;
//   technicalAccuracy: number;
//   problemSolving: number;
//   strengths: string[];
//   improvements: string[];
//   nextSteps: string[];
// };
export async function evaluate(messages: Message[]): Promise<number> {
  // TODO 4a: Ask OpenAI to return JSON matching FeedbackResult shape above
  // const transcript = formatTranscript(messages);
  // const res = await openai.chat.completions.create({
  //   model: "gpt-4o-mini",
  //   response_format: { type: "json_object" },
  //   messages: [
  //     { role: "system", content: EVALUATION_PROMPT },
  //     { role: "user", content: transcript },
  //   ],
  // });
  // return JSON.parse(res.choices[0]?.message.content ?? "{}") as FeedbackResult;
  console.log("evaluate called with", messages.length, "messages");
  return 80;
}

// TODO 5: Add transcribeAudio() for Whisper STT once multer is set up in routes
// export async function transcribeAudio(audioBuffer: Buffer): Promise<string> {
//   const file = new File([audioBuffer], "audio.webm", { type: "audio/webm" });
//   const res = await openai.audio.transcriptions.create({
//     model: "whisper-1",
//     file,
//   });
//   return res.text;
// }
