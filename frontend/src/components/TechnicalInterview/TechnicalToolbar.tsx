import { motion } from "motion/react";
import { Mic, MicOff, X } from "lucide-react";

type TechnicalToolbarProps = {
  role: string;
  difficulty: string;
  level: string;
  questionNumber: number;
  totalQuestions: number;
  timeLeft: number;
  totalTime: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onEnd: () => void;
};

export function TechnicalToolbar({
  role,
  difficulty,
  level,
  questionNumber,
  totalQuestions,
  timeLeft,
  totalTime,
  isMuted,
  onToggleMute,
  onEnd,
}: TechnicalToolbarProps) {
  const mins = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const secs = (timeLeft % 60).toString().padStart(2, "0");

  const pct = totalTime > 0 ? timeLeft / totalTime : 1;
  const timerColor =
    pct <= 0.1 ? "text-red-400" :
    pct <= 0.3 ? "text-amber-400" :
    "text-white";

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Technical Interview</h1>
          <p className="text-sm text-gray-400 capitalize">
            {role} · {difficulty} · {level} · Q{questionNumber}/{totalQuestions}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className={`text-2xl font-mono tabular-nums transition-colors duration-500 ${timerColor}`}>
          {mins}:{secs}
        </span>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToggleMute}
          className="p-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 hover:bg-white/20 transition-all"
          title={isMuted ? "Unmute microphone" : "Mute microphone"}
        >
          {isMuted ? <MicOff className="w-4 h-4 text-red-400" /> : <Mic className="w-4 h-4 text-white" />}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onEnd}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/20 backdrop-blur-lg border border-red-500/50 hover:bg-red-500/30 transition-all text-sm text-white"
        >
          <X className="w-4 h-4" />
          End Interview
        </motion.button>
      </div>
    </div>
  );
}
