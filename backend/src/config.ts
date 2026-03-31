export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export const DB_CONFIG = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "ai_interviewer",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "",
};

export const JWT_SECRET = process.env.JWT_SECRET || "";
export const JWT_EXPIRES_IN = "7d";

export function validateEnv(): void {
  const missing: string[] = [];
  if (!process.env.JWT_SECRET) missing.push("JWT_SECRET");
  if (!process.env.DB_NAME) missing.push("DB_NAME");
  if (!process.env.DB_USER) missing.push("DB_USER");
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(", ")}`);
  }
}
