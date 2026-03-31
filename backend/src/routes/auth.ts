import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config";
import { authMiddleware } from "../middleware/auth";

const router = Router();

function generateToken(user: { id: string; email: string }): string {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

const VALID_ROLES = new Set(["frontend", "backend", "fullstack"]);

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  const { email, password, name, role } = req.body as {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
  };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  const userRole = role && VALID_ROLES.has(role) ? role : "fullstack";

  try {
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: "Email already in use" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await pool.query(
      "INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, name, role, created_at",
      [email, name ?? null, passwordHash, userRole]
    );

    const user = result.rows[0];
    const accessToken = generateToken({ id: user.id, email: user.email });

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };

  if (!email || !password) {
    res.status(400).json({ error: "Email and password are required" });
    return;
  }

  try {
    const result = await pool.query(
      "SELECT id, email, name, role, password_hash FROM users WHERE email = $1",
      [email]
    );
    if (result.rows.length === 0) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const accessToken = generateToken({ id: user.id, email: user.email });

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me (protected)
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role, created_at FROM users WHERE id = $1",
      [req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get user error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// PATCH /api/auth/me/role (protected) — update user's engineering role
router.patch("/me/role", authMiddleware, async (req, res) => {
  const { role } = req.body as { role?: string };

  if (!role || !VALID_ROLES.has(role)) {
    res.status(400).json({ error: "role must be one of: frontend, backend, fullstack" });
    return;
  }

  try {
    const result = await pool.query(
      "UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role",
      [role, req.user!.id]
    );
    if (result.rows.length === 0) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Update role error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
