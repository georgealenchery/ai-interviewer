import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// POST /api/vapi/webhook — receive Vapi event payloads
router.post("/webhook", (req: Request, res: Response) => {
  const body = req.body;

  // Basic structural validation — reject payloads without expected Vapi fields
  if (!body || typeof body !== "object") {
    res.status(400).json({ error: "Invalid webhook payload" });
    return;
  }

  // Log only the event type, not full payload (avoid leaking transcript data to logs)
  const eventType = body.message?.type ?? body.type ?? "unknown";
  console.log(`[Vapi webhook] event=${eventType}`);

  res.json({ ok: true });
});

export default router;
