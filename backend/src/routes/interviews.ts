import { Router } from "express";
import type { Request, Response } from "express";
import { pool } from "../db";

const router = Router();

// GET /api/interviews — all interviews for the logged-in user, newest first
router.get("/", async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, role, question_type, date, result
       FROM   interviews
       WHERE  user_id = $1
       ORDER  BY date DESC`,
      [req.user!.id],
    );
    res.json({ interviews: result.rows });
  } catch (err) {
    console.error("Error fetching interviews:", err);
    res.status(500).json({ error: "Failed to fetch interviews" });
  }
});

// GET /api/interviews/:id — single interview (ownership-checked)
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, role, question_type, date, config, result
       FROM   interviews
       WHERE  id = $1 AND user_id = $2`,
      [id, req.user!.id],
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "Interview not found" });
      return;
    }
    res.json({ interview: result.rows[0] });
  } catch (err) {
    console.error("Error fetching interview:", err);
    res.status(500).json({ error: "Failed to fetch interview" });
  }
});

export default router;
