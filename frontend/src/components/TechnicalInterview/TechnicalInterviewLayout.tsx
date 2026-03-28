import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { TechnicalToolbar } from "./TechnicalToolbar";
import { TechnicalPromptCard } from "./TechnicalPromptCard";
import { TechnicalChatPanel } from "./TechnicalChatPanel";
import { TechnicalCodeEditor } from "./TechnicalCodeEditor";
import { useInterview } from "../../hooks/useInterview";
import type { InterviewConfig, InterviewMode } from "../../types/interview";

const MOCK_PROMPT = {
  title: "Two Sum",
  difficulty: "Medium" as const,
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
    },
  ],
  constraints: [
    "2 ≤ nums.length ≤ 10⁴",
    "-10⁹ ≤ nums[i] ≤ 10⁹",
    "-10⁹ ≤ target ≤ 10⁹",
    "Only one valid answer exists.",
  ],
};

export function TechnicalInterviewLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [time, setTime] = useState(0);
  const {
    messages,
    isLoading,
    status,
    result,
    error,
    startInterview,
    sendAnswer,
  } = useInterview();

  // Pick up config passed from SetupDashboard via router state
  const state = location.state as {
    role?: string;
    questionType?: string;
    difficulty?: number;
    strictness?: number;
    experienceLevel?: number;
    interviewer?: string;
  } | null;

  const role = state?.role ?? "frontend";
  const mode = (state?.questionType === "hybrid" ? "hybrid" : "technical") as InterviewMode;
  const difficultyValue = state?.difficulty ?? 50;
  const difficultyLabel = (() => {
    if (difficultyValue < 34) return "Easy";
    if (difficultyValue < 67) return "Medium";
    return "Hard";
  })();

  // Start interview on mount
  useEffect(() => {
    const config: InterviewConfig = {
      mode,
      questionType: mode,
      role,
      difficulty: difficultyValue,
      strictness: state?.strictness ?? 50,
      experienceLevel: state?.experienceLevel ?? 2,
      interviewer: state?.interviewer ?? "Cassidy",
    };
    startInterview(config);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const timer = setInterval(() => setTime((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // Navigate to analytics when finished
  useEffect(() => {
    if (status === "finished" && result) {
      navigate("/analytics", { state: { result } });
    }
  }, [status, result, navigate]);

  // Map messages to transcript format for chat panel
  const transcript = messages.map((m) => ({
    speaker: (m.role === "assistant" ? "AI" : "You") as "AI" | "You",
    text: m.content,
  }));

  return (
    <div className="h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white flex flex-col p-4 overflow-hidden">
      {/* Error Banner */}
      {error && (
        <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-xs">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <TechnicalToolbar
        role={role}
        difficulty={difficultyLabel}
        questionNumber={1}
        totalQuestions={3}
        time={time}
        mode={mode === "hybrid" ? "hybrid" : "technical"}
        onEnd={() => navigate("/analytics", { state: { result } })}
      />

      {/* Split Layout */}
      <div className="flex-1 grid lg:grid-cols-[2fr_3fr] gap-4 min-h-0">
        {/* Left Panel — Prompt + Chat */}
        <div className="flex flex-col gap-4 min-h-0">
          <TechnicalPromptCard
            prompt={MOCK_PROMPT}
            questionNumber={1}
            totalQuestions={3}
          />
          <div className="flex-1 min-h-0">
            <TechnicalChatPanel
              transcript={transcript}
              isAISpeaking={isLoading}
              isLoading={isLoading}
              onSendAnswer={sendAnswer}
            />
          </div>
        </div>

        {/* Right Panel — Code Editor */}
        <div className="backdrop-blur-lg bg-gray-900/80 rounded-2xl border border-white/10 shadow-xl overflow-hidden flex flex-col min-h-0">
          <TechnicalCodeEditor />
        </div>
      </div>
    </div>
  );
}
