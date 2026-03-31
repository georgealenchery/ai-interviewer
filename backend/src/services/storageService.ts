import { pool } from "../db";
import type { SavedInterview, VapiInterviewConfig, VapiAnalysisResult } from "../types/interview";

interface InterviewRow {
  id: string;
  date: Date;
  role: string;
  question_type: string;
  config: VapiInterviewConfig;
  result: VapiAnalysisResult;
}

function rowToInterview(row: InterviewRow): SavedInterview {
  return {
    id: row.id,
    date: row.date.toISOString ? row.date.toISOString() : String(row.date),
    role: row.role,
    questionType: row.question_type,
    config: row.config,
    result: row.result,
  };
}

export async function saveInterview(
  userId: string,
  config: VapiInterviewConfig,
  result: VapiAnalysisResult,
): Promise<SavedInterview> {
  const res = await pool.query(
    `INSERT INTO interviews (user_id, role, question_type, config, result)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, date, role, question_type, config, result`,
    [userId, config.role, config.questionType, JSON.stringify(config), JSON.stringify(result)]
  );
  return rowToInterview(res.rows[0]);
}

export async function getInterviews(userId: string): Promise<SavedInterview[]> {
  const res = await pool.query(
    "SELECT id, date, role, question_type, config, result FROM interviews WHERE user_id = $1 ORDER BY date DESC",
    [userId]
  );
  return res.rows.map(rowToInterview);
}

export async function getLatestInterview(userId: string): Promise<SavedInterview | null> {
  const res = await pool.query(
    "SELECT id, date, role, question_type, config, result FROM interviews WHERE user_id = $1 ORDER BY date DESC LIMIT 1",
    [userId]
  );
  return res.rows.length > 0 ? rowToInterview(res.rows[0]) : null;
}
