import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import interviewRoutes from "./routes/interview";
import vapiRoutes from "./routes/vapi";

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
    res.send("Hello, AI Interviewer!");
});

app.use("/api", interviewRoutes);
app.use("/api/vapi", vapiRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
