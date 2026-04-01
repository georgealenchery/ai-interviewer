import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { OPENAI_MODEL } from "../config";
import { buildFollowUpPrompt } from "../prompts/followup";
import { buildEvaluationPrompt } from "../prompts/evaluation";
import { buildBehavioralPrompt } from "../prompts/behavioral";
import { buildTechnicalPrompt } from "../prompts/technical";
import { formatTranscript } from "../utils/formatter";
import type { Message, InterviewConfig, EvaluationResult, VapiTranscriptEntry, VapiInterviewConfig, VapiAnalysisResult, CodingProblem } from "../types/interview";

const openai = new OpenAI();

const DEFAULT_EVALUATION: EvaluationResult = {
  score: 50,
  communication: 50,
  technicalAccuracy: 50,
  problemSolving: 50,
  strengths: ["Unable to fully evaluate"],
  improvements: ["Unable to fully evaluate"],
  nextSteps: ["Retry the interview for a complete evaluation"],
};

/**
 * Generate the opening question for an interview session.
 */
export async function generateFirstQuestion(config: InterviewConfig): Promise<string> {
  const { role, mode, difficulty, experienceLevel } = config;

  const prompt =
    mode === "technical"
      ? buildTechnicalPrompt(role, difficulty, experienceLevel)
      : buildBehavioralPrompt(role, experienceLevel);

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "system", content: prompt }],
  });

  return res.choices[0]?.message.content ?? "";
}

/**
 * Generate a follow-up question based on conversation history.
 */
export async function generateFollowUp(
  messages: Message[],
  config: InterviewConfig,
): Promise<string> {
  const prompt = buildFollowUpPrompt(config.role, config.difficulty);
  const transcript = formatTranscript(messages);

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: transcript },
    ],
  });

  return res.choices[0]?.message.content ?? "";
}

/**
 * Evaluate the full interview transcript and return structured feedback.
 */
export async function evaluateInterview(
  messages: Message[],
  config: InterviewConfig,
): Promise<EvaluationResult> {
  const prompt = buildEvaluationPrompt(config.role, config.questionType);
  const transcript = formatTranscript(messages);

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: transcript },
    ],
  });

  const raw = res.choices[0]?.message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as Partial<EvaluationResult>;
    return {
      score: parsed.score ?? DEFAULT_EVALUATION.score,
      communication: parsed.communication ?? DEFAULT_EVALUATION.communication,
      technicalAccuracy: parsed.technicalAccuracy ?? DEFAULT_EVALUATION.technicalAccuracy,
      problemSolving: parsed.problemSolving ?? DEFAULT_EVALUATION.problemSolving,
      strengths: parsed.strengths ?? DEFAULT_EVALUATION.strengths,
      improvements: parsed.improvements ?? DEFAULT_EVALUATION.improvements,
      nextSteps: parsed.nextSteps ?? DEFAULT_EVALUATION.nextSteps,
    };
  } catch {
    console.error("Failed to parse evaluation response:", raw);
    return DEFAULT_EVALUATION;
  }
}

const DEFAULT_VAPI_ANALYSIS: VapiAnalysisResult = {
  score: 50,
  communication: 50,
  technicalAccuracy: 50,
  problemSolving: 50,
  strengths: ["Unable to fully evaluate"],
  improvements: ["Unable to fully evaluate"],
  nextSteps: ["Retry the interview for a complete evaluation"],
  questionBreakdown: [],
};

const ROLE_GUIDELINES: Record<string, string> = {
  frontend: "React, JavaScript, state management, performance, CSS",
  backend: "APIs, databases, authentication, system design",
  fullstack: "frontend + backend integration, APIs, data flow",
  machine_learning: "models, training, evaluation, data processing",
  mobile: "React Native, mobile performance, UI/UX, state",
  cybersecurity: "authentication, vulnerabilities, encryption, secure systems",
  systems: "low-level design, OS concepts, concurrency, performance",
  devops: "CI/CD, cloud infrastructure, Docker, deployment systems",
};

const FALLBACK_PROBLEMS: CodingProblem[] = [
  {
    prompt: "Write a function that takes an array of numbers and returns the two numbers that add up to a given target sum. Return them as an array in the order they appear.",
    functionName: "twoSum",
    functionSignature: "function twoSum(nums, target) {\n  // Your implementation here\n}",
    testCases: [
      { input: [[2, 7, 11, 15], 9], expectedOutput: [2, 7] },
      { input: [[3, 2, 4], 6], expectedOutput: [2, 4] },
      { input: [[1, 5, 3, 7], 8], expectedOutput: [1, 7] },
    ],
  },
  {
    prompt: "Write a function that takes a string and returns true if it is a valid palindrome (ignoring non-alphanumeric characters and case), false otherwise.",
    functionName: "isPalindrome",
    functionSignature: "function isPalindrome(s) {\n  // Your implementation here\n}",
    testCases: [
      { input: ["A man, a plan, a canal: Panama"], expectedOutput: true },
      { input: ["race a car"], expectedOutput: false },
      { input: ["Was it a car or a cat I saw?"], expectedOutput: true },
    ],
  },
  {
    prompt: "Write a function that takes an array of integers and returns the maximum sum of any contiguous subarray.",
    functionName: "maxSubarraySum",
    functionSignature: "function maxSubarraySum(nums) {\n  // Your implementation here\n}",
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expectedOutput: 6 },
      { input: [[1]], expectedOutput: 1 },
      { input: [[5, 4, -1, 7, 8]], expectedOutput: 23 },
    ],
  },
];

const SIGNATURE_GUIDE: Record<string, string> = {
  JavaScript: 'function funcName(param1, param2) {\\n  // Your implementation here\\n}',
  "Node.js":  'function funcName(param1, param2) {\\n  // Your implementation here\\n}',
  TypeScript: 'function funcName(param1: Type1, param2: Type2): ReturnType {\\n  // Your implementation here\\n}',
  Python:     'def func_name(param1, param2):\\n    # Your implementation here\\n    pass',
  Java:       'public static ReturnType funcName(Type1 param1, Type2 param2) {\\n    // Your implementation here\\n}',
  "C++":      'ReturnType funcName(Type1 param1, Type2 param2) {\\n    // Your implementation here\\n}',
  Bash:       '#!/bin/bash\\n\\n# Your implementation here',
};

/**
 * Generate 3 role-aware, language-specific coding interview problems.
 */
export async function generateInterviewQuestions(
  role: string,
  difficulty: string,
  level: string,
  language = "JavaScript",
): Promise<CodingProblem[]> {
  console.log("Role:", role);
  console.log("Language:", language);
  console.log("Difficulty:", difficulty);
  console.log("Level:", level);

  const guidelines = ROLE_GUIDELINES[role] ?? "software engineering fundamentals";
  const signatureExample = SIGNATURE_GUIDE[language] ?? SIGNATURE_GUIDE["JavaScript"]!;

  const prompt = `You are a senior ${role} engineer creating a ${level}-level ${difficulty} technical coding interview.

The candidate must write code in ${language} ONLY. Do not use any other programming language.

Focus on: ${guidelines}

Generate EXACTLY 3 coding problems. Each problem must:
- Be a realistic, role-relevant coding challenge (not a pure abstract algorithm)
- Require writing a ${language} function/solution
- Be solvable in 10-20 minutes at the ${difficulty} difficulty
- Test different concepts
- Have 3-5 concrete test cases with actual input values and expected outputs

Function signature format for ${language}:
${signatureExample}

Difficulty guide:
- easy: straightforward logic, no complex algorithms, clear requirements
- medium: requires some problem-solving, moderate complexity
- hard: requires optimized solutions, edge-case handling, or advanced patterns

Return ONLY valid JSON in this exact format (no markdown, no extra text):
[
  {
    "prompt": "Clear problem description with context and requirements...",
    "functionName": "funcName",
    "functionSignature": "<valid ${language} function signature with placeholder body>",
    "testCases": [
      { "input": [arg1, arg2], "expectedOutput": result },
      { "input": [arg1, arg2], "expectedOutput": result },
      { "input": [arg1, arg2], "expectedOutput": result }
    ]
  }
]`;

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "You are a coding interview problem generator. Always return a JSON object with a 'problems' array containing exactly 3 coding problems.",
      },
      { role: "user", content: prompt + '\n\nWrap the array in: { "problems": [...] }' },
    ],
  });

  const raw = res.choices[0]?.message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as { problems?: CodingProblem[] };
    const problems = parsed.problems;

    if (!Array.isArray(problems) || problems.length !== 3) {
      console.error("Expected 3 problems, got:", problems?.length);
      return FALLBACK_PROBLEMS;
    }

    const valid = problems.every(
      (p) =>
        typeof p.prompt === "string" &&
        typeof p.functionName === "string" &&
        typeof p.functionSignature === "string" &&
        Array.isArray(p.testCases) &&
        p.testCases.length >= 1,
    );

    if (!valid) {
      console.error("Invalid problem structure in response");
      return FALLBACK_PROBLEMS;
    }

    console.log("Generated coding problems:", problems);
    return problems;
  } catch {
    console.error("Failed to parse coding problems response:", raw);
    return FALLBACK_PROBLEMS;
  }
}

/**
 * Analyze a completed Vapi voice interview transcript.
 */
export async function analyzeVapiTranscript(
  transcript: VapiTranscriptEntry[],
  config: VapiInterviewConfig,
): Promise<VapiAnalysisResult> {
  const roleLabel = config.role.charAt(0).toUpperCase() + config.role.slice(1);

  const difficultyLabel =
    config.difficulty <= 30 ? "easy" : config.difficulty <= 60 ? "medium" : "hard";
  const strictnessLabel =
    config.strictness <= 30 ? "lenient" : config.strictness <= 60 ? "fair" : "strict";
  const experienceLabel =
    config.experienceLevel <= 30 ? "junior" : config.experienceLevel <= 60 ? "mid-level" : "senior";

  const formattedTranscript = transcript
    .map((entry) => `${entry.role === "assistant" ? "Interviewer" : "Candidate"}: ${entry.text}`)
    .join("\n");

  const prompt = `You are an expert interview evaluator. Analyze the following ${roleLabel} engineering interview transcript.

Interview settings:
- Role: ${roleLabel} engineer
- Question type: ${config.questionType}
- Difficulty: ${difficultyLabel} (${config.difficulty}/100)
- Candidate experience level: ${experienceLabel} (${config.experienceLevel}/100)
- Interviewer strictness: ${strictnessLabel} (${config.strictness}/100)

Evaluate the candidate's performance considering the difficulty and experience level. A junior candidate answering easy questions should be graded relative to junior expectations. A senior candidate answering hard questions should be graded relative to senior expectations.

Return a JSON object with exactly this structure:
{
  "score": <number 0-100, overall interview performance>,
  "communication": <number 0-100, clarity, articulation, conciseness of answers>,
  "technicalAccuracy": <number 0-100, correctness of technical content>,
  "problemSolving": <number 0-100, logical thinking, approach to problems>,
  "strengths": [<3-5 strings, specific strengths with brief examples from the transcript>],
  "improvements": [<3-5 strings, specific areas to improve with examples from the transcript>],
  "nextSteps": [<3-5 strings, actionable study or practice recommendations>],
  "questionBreakdown": [
    {
      "question": <the interviewer's question>,
      "candidateAnswer": <summary of the candidate's answer>,
      "score": <number 0-100>,
      "feedback": <specific feedback on this answer>
    }
  ]
}

Include every question-answer pair in questionBreakdown. Be specific and reference the candidate's actual words. Do not be generic.`;

  const res = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: prompt },
      { role: "user", content: formattedTranscript },
    ],
  });

  const raw = res.choices[0]?.message.content ?? "{}";

  try {
    const parsed = JSON.parse(raw) as Partial<VapiAnalysisResult>;
    return {
      score: parsed.score ?? DEFAULT_VAPI_ANALYSIS.score,
      communication: parsed.communication ?? DEFAULT_VAPI_ANALYSIS.communication,
      technicalAccuracy: parsed.technicalAccuracy ?? DEFAULT_VAPI_ANALYSIS.technicalAccuracy,
      problemSolving: parsed.problemSolving ?? DEFAULT_VAPI_ANALYSIS.problemSolving,
      strengths: parsed.strengths ?? DEFAULT_VAPI_ANALYSIS.strengths,
      improvements: parsed.improvements ?? DEFAULT_VAPI_ANALYSIS.improvements,
      nextSteps: parsed.nextSteps ?? DEFAULT_VAPI_ANALYSIS.nextSteps,
      questionBreakdown: parsed.questionBreakdown ?? DEFAULT_VAPI_ANALYSIS.questionBreakdown,
    };
  } catch {
    console.error("Failed to parse Vapi analysis response:", raw);
    return DEFAULT_VAPI_ANALYSIS;
  }
}
