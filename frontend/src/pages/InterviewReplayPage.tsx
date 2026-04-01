import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { ArrowLeft, Calendar, Code2, Mic } from "lucide-react";
import { getInterview } from "../services/api";
import type { ReplayInterview } from "../services/api";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Derive a flat message list from questionBreakdown so we can render a
// back-and-forth transcript even though raw voice messages aren't stored.
interface ReplayMessage {
  role: "assistant" | "user";
  text: string;
  score?: number;
  feedback?: string;
}

function buildMessages(interview: ReplayInterview): ReplayMessage[] {
  const breakdown = interview.result?.questionBreakdown ?? [];
  const messages: ReplayMessage[] = [];
  for (const entry of breakdown) {
    if (entry.question) {
      messages.push({ role: "assistant", text: entry.question });
    }
    if (entry.candidateAnswer) {
      messages.push({
        role: "user",
        text: entry.candidateAnswer,
        score: entry.score,
        feedback: entry.feedback,
      });
    }
  }
  return messages;
}

function hasCode(text: string): boolean {
  return text.includes("```") || /\n {2,}/.test(text) || /\t/.test(text);
}

function MessageBubble({ msg, index }: { msg: ReplayMessage; index: number }) {
  const isAssistant = msg.role === "assistant";
  const looksLikeCode = !isAssistant && hasCode(msg.text);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className={`flex ${isAssistant ? "justify-start" : "justify-end"}`}
    >
      <div className={`max-w-[78%] ${isAssistant ? "" : "items-end flex flex-col"}`}>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 mb-1 px-1">
          {isAssistant ? "Interviewer" : "You"}
        </span>

        {looksLikeCode ? (
          <pre className="bg-gray-900 text-green-300 rounded-xl p-4 text-xs font-mono whitespace-pre-wrap break-words shadow-sm overflow-x-auto max-w-full">
            <code>{msg.text}</code>
          </pre>
        ) : (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
              isAssistant
                ? "bg-white/70 text-gray-800 border border-white/60 rounded-tl-sm"
                : "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-tr-sm"
            }`}
          >
            {msg.text}
          </div>
        )}

        {/* Score + feedback badge on user messages */}
        {!isAssistant && msg.score != null && (
          <div className="mt-1.5 flex items-center gap-2 px-1">
            <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
              Score {msg.score}
            </span>
            {msg.feedback && (
              <span className="text-[10px] text-gray-400 italic truncate max-w-[240px]">
                {msg.feedback}
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export function InterviewReplayPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [interview, setInterview] = useState<ReplayInterview | null>(null);
  const [messages, setMessages] = useState<ReplayMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getInterview(id)
      .then((iv) => {
        console.log("Replay interview:", iv);
        setInterview(iv);
        setMessages(buildMessages(iv));
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id]);

  // Scroll to bottom once messages are ready
  useEffect(() => {
    if (messages.length > 0 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !interview) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-600 font-medium mb-4">{error ?? "Interview not found"}</p>
          <button
            onClick={() => navigate("/interviews")}
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to interviews
          </button>
        </div>
      </div>
    );
  }

  const roleLabel = interview.role.charAt(0).toUpperCase() + interview.role.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 backdrop-blur-lg bg-white/40 border-b border-white/50 shadow-sm">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/interviews")}
            className="p-2 rounded-full hover:bg-white/60 transition-colors"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4 text-gray-600" />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-gray-900 truncate">{roleLabel} Engineer Interview</h1>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-gray-500">
                {interview.question_type === "technical" ? (
                  <Code2 className="w-3 h-3" />
                ) : (
                  <Mic className="w-3 h-3" />
                )}
                <span className="capitalize">{interview.question_type}</span>
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Calendar className="w-3 h-3" />
                {formatDate(interview.date)}
              </span>
              {interview.result?.score != null && (
                <>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs font-semibold text-purple-600">
                    Overall score {interview.result.score}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto dark-scrollbar" ref={scrollRef}>
        <div className="max-w-3xl mx-auto px-6 py-8 space-y-5">
          {messages.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-16">
              No conversation data available for this interview.
            </p>
          ) : (
            messages.map((msg, i) => (
              <MessageBubble key={i} msg={msg} index={i} />
            ))
          )}
        </div>
      </div>

      {/* Footer summary bar */}
      {interview.result && (
        <div className="sticky bottom-0 backdrop-blur-lg bg-white/40 border-t border-white/50">
          <div className="max-w-3xl mx-auto px-6 py-3 flex items-center gap-6 overflow-x-auto">
            {[
              { label: "Score", value: interview.result.score },
              { label: "Communication", value: interview.result.communication },
              { label: "Technical", value: interview.result.technicalAccuracy },
              { label: "Problem Solving", value: interview.result.problemSolving },
            ].map(({ label, value }) =>
              value != null ? (
                <div key={label} className="shrink-0 text-center">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-sm font-bold text-gray-900">{value}</p>
                </div>
              ) : null,
            )}
          </div>
        </div>
      )}
    </div>
  );
}
