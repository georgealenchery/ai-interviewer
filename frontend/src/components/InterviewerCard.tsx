import { Volume2, Loader2 } from "lucide-react";

type InterviewerDisplay = {
  style: string;
  description: string;
  traits: string[];
  badgeClass: string;
  accentClass: string;
};

const INTERVIEWER_DISPLAY: Record<string, InterviewerDisplay> = {
  cassidy: {
    style: "Conversational",
    description:
      "Builds rapport quickly and makes you feel at ease — then turns up the heat with pointed follow-ups. Warm and supportive on the surface, but won't let vague or weak answers slide.",
    traits: ["Warm", "Encouraging", "Probing", "Personable"],
    badgeClass: "bg-purple-100 text-purple-700",
    accentClass: "text-purple-500",
  },
  alex: {
    style: "Formal",
    description:
      "Direct, precise, and strictly technical. Expects structured thinking and concise answers. Has no patience for hand-waving — if your answer is incomplete, you'll hear about it.",
    traits: ["Direct", "Precise", "Technical", "Demanding"],
    badgeClass: "bg-blue-100 text-blue-700",
    accentClass: "text-blue-500",
  },
  jordan: {
    style: "Analytical",
    description:
      "Calm and methodical, with a deep curiosity about how you think. Asks things like \"walk me through your reasoning\" and \"what would change if the requirements shifted?\"",
    traits: ["Curious", "Methodical", "Patient", "Thoughtful"],
    badgeClass: "bg-green-100 text-green-700",
    accentClass: "text-green-500",
  },
};

interface InterviewerCardProps {
  interviewerName: string;
  isPreviewing: boolean;
  onPreviewVoice: () => void;
}

export function InterviewerCard({
  interviewerName,
  isPreviewing,
  onPreviewVoice,
}: InterviewerCardProps) {
  const key = interviewerName.toLowerCase();
  const display = INTERVIEWER_DISPLAY[key]!;

  return (
    <div className="rounded-xl bg-white/30 border border-white/50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/40">
        <span className={`text-xs font-semibold uppercase tracking-widest ${display.accentClass}`}>
          {display.style}
        </span>
        <div className="flex gap-1">
          {display.traits.map((trait) => (
            <span
              key={trait}
              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${display.badgeClass}`}
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      <p className="px-4 py-3 text-sm text-gray-600 leading-relaxed">
        {display.description}
      </p>

      <div className="px-4 pb-4">
        <button
          onClick={onPreviewVoice}
          disabled={isPreviewing}
          className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all
            ${isPreviewing
              ? "bg-white/40 border-white/40 text-gray-400 cursor-not-allowed"
              : "bg-white/60 hover:bg-white/80 border-white/50 text-gray-700 shadow-sm"
            }`}
        >
          {isPreviewing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Playing sample…
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              Preview voice
            </>
          )}
        </button>
      </div>
    </div>
  );
}
