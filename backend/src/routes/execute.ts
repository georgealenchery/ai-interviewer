import { Router } from "express";
import type { Request, Response } from "express";
import { validateCodeExecution } from "../middleware/validate";
import { executeJava, executeCpp, executeBash } from "../services/codeExecutionService";
import type { TestCase, TestResult } from "../services/codeExecutionService";

const router = Router();

router.post("/", validateCodeExecution, async (req: Request, res: Response) => {
  const { language, code, functionName, testCases } = req.body as {
    language: string;
    code: string;
    functionName: string;
    testCases: TestCase[];
  };

  try {
    let results: TestResult[];

    switch (language.toLowerCase()) {
      case "java":
        results = await executeJava(code, functionName, testCases);
        break;
      case "c++":
      case "cpp":
        results = await executeCpp(code, functionName, testCases);
        break;
      case "bash":
        results = await executeBash(code, functionName, testCases);
        break;
      default:
        res.status(400).json({ error: `Unsupported language for backend execution: ${language}` });
        return;
    }

    res.json({ results });
  } catch (err) {
    console.error("Execution error:", err);
    res.status(500).json({ error: "Code execution failed" });
  }
});

export default router;
