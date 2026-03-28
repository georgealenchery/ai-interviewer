import { Router } from "express";
import type { Request, Response } from "express";

const router = Router();

// POST /api/vapi/webhook — receive Vapi event payloads
router.post("/webhook", (req: Request, res: Response) => {
  console.log("[Vapi webhook]", JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

export default router;
