import { Router } from "express";
import type { Request, Response } from "express";
import { generateFollowUp, evaluate } from "../services/aiService";

const router = Router();

// TODO 1: Install multer and wire up Whisper STT
// npm install multer @types/multer
// import multer from "multer";
// const upload = multer({ storage: multer.memoryStorage() });
//
// POST /api/transcribe
// router.post("/transcribe", upload.single("audio"), async (req, res) => {
//   const audioBuffer = req.file!.buffer;
//   const transcript = await transcribeAudio(audioBuffer);  // see aiService
//   res.json({ transcript });
// });

// POST /api/start
// TODO 2: Accept interview config (role, questionType, difficulty, strictness, experienceLevel)
// and pass it into generateFirstQuestion() so the opening question is role-specific.
router.post("/start", (_req: Request, res: Response) => {
  // TODO 2a: const { role, questionType, difficulty } = req.body;
  // TODO 2b: const question = await generateFirstQuestion({ role, questionType, difficulty });
  // TODO 2c: return sessionId so the frontend can track state across /next calls
  res.json({ question: "placeholder question" });
});

// POST /api/next
// TODO 3: Call generateFollowUp or evaluate based on step count.
// Currently hardcoded at step < 3 — make maxSteps configurable from /start config.
router.post("/next", async (req: Request, res: Response) => {
  const { messages, step } = req.body as { messages: unknown[]; step: number };

  // TODO 3a: Replace hardcoded threshold with maxSteps from session config
  const MAX_STEPS = 5;

  if (step < MAX_STEPS) {
    // TODO 3b: Uncomment once generateFollowUp accepts typed messages
    // const question = await generateFollowUp(messages);
    // res.json({ done: false, question });
    res.json({ done: false, question: "placeholder follow-up" });
  } else {
    // TODO 3c: Uncomment once evaluate returns a structured FeedbackResult object
    // const feedback = await evaluate(messages);
    // res.json({ done: true, ...feedback });
    res.json({ done: true, score: 80 });
  }
});

export default router;
