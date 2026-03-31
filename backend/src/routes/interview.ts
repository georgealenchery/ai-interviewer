import { Router } from "express";
import type { Request, Response } from "express";
import { startInterview, nextStep } from "../services/interviewEngine";
import type { InterviewConfig, Message } from "../types/interview";
import { pool } from "../db";

const router = Router();

async function getUserRole(userId: string): Promise<string> {
  const result = await pool.query("SELECT role FROM users WHERE id = $1", [userId]);
  return (result.rows[0]?.role as string | undefined) ?? "fullstack";
}

// POST /api/start — begin a new interview session
router.post("/start", async (req: Request, res: Response) => {
  try {
    const { config } = req.body as { config: InterviewConfig };

    if (!config) {
      return res.status(400).json({ error: "Missing required field: config" });
    }

    if (!config.mode) {
      return res.status(400).json({ error: "Missing required config field: mode" });
    }

    // Resolve role: use user's stored role unless the client explicitly provided one
    if (!config.role) {
      config.role = await getUserRole(req.user!.id);
    }

    const result = await startInterview(config);
    res.json(result);
  } catch (err) {
    console.error("Error starting interview:", err);
    res.status(500).json({ error: "Failed to start interview" });
  }
});

// POST /api/next — advance interview by one step (follow-up or evaluation)
router.post("/next", async (req: Request, res: Response) => {
  try {
    const { messages, step, config } = req.body as {
      messages: Message[];
      step: number;
      config: InterviewConfig;
    };

    if (!messages || step == null || !config) {
      res.status(400).json({ error: "Missing required fields: messages, step, config" });
      return;
    }

    // Ensure role is always resolved for follow-up prompts
    if (!config.role) {
      config.role = await getUserRole(req.user!.id);
    }

    const result = await nextStep({ messages, step, config });
    res.json(result);
  } catch (err) {
    console.error("Error advancing interview:", err);
    res.status(500).json({ error: "Failed to advance interview" });
  }
});

export default router;
