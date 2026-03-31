import { motion } from "motion/react";
import { ChevronLeft, ChevronRight, Code2, Lock, CheckCircle2 } from "lucide-react";
import type { CodingProblem } from "../../services/api";

type TechnicalPromptCardProps = {
  problem: CodingProblem | null;
  questionNumber: number;
  totalQuestions: number;
  passed: boolean;
  onPrev: () => void;
  onNext: () => void;
  nextLocked: boolean;
};

export function TechnicalPromptCard({
  problem,
  questionNumber,
  totalQuestions,
  passed,
  onPrev,
  onNext,
  nextLocked,
}: TechnicalPromptCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="backdrop-blur-lg bg-white/5 rounded-2xl border border-white/10 shadow-xl overflow-hidden"
    >
      {/* Header */}
      <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-blue-400" />
          <span className="text-xs font-semibold text-blue-400 uppercase tracking-wide">
            Problem {questionNumber} of {totalQuestions}
          </span>
          {passed && (
            <span className="flex items-center gap-1 text-xs text-green-400 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Solved
            </span>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            disabled={questionNumber <= 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Previous problem"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1 px-1">
            {Array.from({ length: totalQuestions }, (_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  i + 1 === questionNumber ? "bg-blue-400" : "bg-white/20"
                }`}
              />
            ))}
          </div>
          <button
            onClick={onNext}
            disabled={questionNumber >= totalQuestions || nextLocked}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title={nextLocked ? "Pass all tests to unlock next problem" : "Next problem"}
          >
            {nextLocked && questionNumber < totalQuestions ? (
              <Lock className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Problem Body */}
      <motion.div
        key={questionNumber}
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
        className="px-5 py-4"
      >
        {problem ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-200 leading-relaxed">{problem.prompt}</p>
            <div className="bg-gray-900/60 rounded-lg border border-white/10 p-3">
              <p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-wide">Function Signature</p>
              <pre className="text-xs text-blue-300 font-mono whitespace-pre-wrap break-all leading-relaxed">
                {problem.functionSignature}
              </pre>
            </div>
            <p className="text-xs text-gray-500">
              {problem.testCases.length} test case{problem.testCases.length !== 1 ? "s" : ""} · Pass all to continue
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="h-3 bg-white/10 rounded animate-pulse w-full" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-4/5" />
            <div className="h-3 bg-white/10 rounded animate-pulse w-3/5" />
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
