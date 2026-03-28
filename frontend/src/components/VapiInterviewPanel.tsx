import { useVapiInterview } from "../hooks/useVapiInterview";

export function VapiInterviewPanel() {
  const { status, isSpeaking, isListening, messages, start, stop } =
    useVapiInterview();

  const statusLabel = isSpeaking
    ? "Speaking"
    : isListening
      ? "Listening"
      : status === "connecting"
        ? "Connecting…"
        : status === "ended"
          ? "Ended"
          : "Idle";

  

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <span
          style={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            backgroundColor:
              status === "active"
                ? isSpeaking
                  ? "#f59e0b"
                  : "#22c55e"
                : status === "connecting"
                  ? "#3b82f6"
                  : "#9ca3af",
            display: "inline-block",
          }}
        />
        <span style={{ fontWeight: 600 }}>{statusLabel}</span>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        <button
          onClick={start}
          disabled={status === "active" || status === "connecting"}
        >
          Start Interview
        </button>
        <button onClick={stop} disabled={status !== "active"}>
          End Interview
        </button>
      </div>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 8,
          padding: 16,
          minHeight: 300,
          maxHeight: 500,
          overflowY: "auto",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#9ca3af" }}>Transcript will appear here…</p>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              marginBottom: 12,
              textAlign: msg.role === "user" ? "right" : "left",
            }}
          >
            <span
              style={{
                display: "inline-block",
                padding: "8px 12px",
                borderRadius: 12,
                backgroundColor:
                  msg.role === "user" ? "#3b82f6" : "#f3f4f6",
                color: msg.role === "user" ? "#fff" : "#111",
                maxWidth: "80%",
              }}
            >
              {msg.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
