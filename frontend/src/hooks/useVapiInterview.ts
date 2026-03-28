import { useEffect, useRef, useState } from "react";
import { vapi } from "../lib/vapi";

interface VapiTranscriptMessage {
  type: string;
  transcriptType?: string;
  role: "assistant" | "user";
  transcript: string;
}

interface VapiError {
  message?: string;
  code?: string;
}

export interface TranscriptMessage {
  role: "assistant" | "user";
  text: string;
  timestamp: number;
}

export type CallStatus = "idle" | "connecting" | "active" | "ended";

export function useVapiInterview() {
  const [status, setStatus] = useState<CallStatus>("idle");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [messages, setMessages] = useState<TranscriptMessage[]>([]);
  const listenersAttached = useRef(false);

  useEffect(() => {
    if (listenersAttached.current) return;
    listenersAttached.current = true;

    const onCallStart = () => {
      console.log("Call started");
      setStatus("active");
      setIsListening(true);
    };

    const onCallEnd = () => {
      console.log("Call ended");
      setStatus("ended");
      setIsSpeaking(false);
      setIsListening(false);
    };

    const onSpeechStart = () => {
      console.log("Assistant started speaking");
      setIsSpeaking(true);
      setIsListening(false);
    };

    const onSpeechEnd = () => {
      console.log("Assistant stopped speaking");
      setIsSpeaking(false);
      setIsListening(true);
    };

    const onError = (e: VapiError) => {
      console.error("Vapi error:", e);
    };

    const onMessage = (msg: VapiTranscriptMessage) => {
      if (msg.type === "transcript" && msg.transcriptType === "final") {
        setMessages((prev) => [
          ...prev,
          {
            role: msg.role,
            text: msg.transcript,
            timestamp: Date.now(),
          },
        ]);
      }
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("message", onMessage);
    vapi.on("error", onError);

    return () => {
      vapi.removeAllListeners();
      listenersAttached.current = false;
    };
  }, []);

  const start = async () => {
    setStatus("connecting");
    setMessages([]);

    // Unlock browser audio context — must happen inside a user-gesture handler
    const AudioContextConstructor =
      window.AudioContext ||
      (window as unknown as Record<string, typeof AudioContext>)
        .webkitAudioContext;
    const audioContext = new AudioContextConstructor();
    await audioContext.resume();

    // Start Vapi AFTER audio is unlocked
    vapi.start(import.meta.env.VITE_VAPI_ASSISTANT_ID);
  };

  const stop = () => {
    vapi.stop();
    setStatus("ended");
    setIsSpeaking(false);
    setIsListening(false);
  };

  return { status, isSpeaking, isListening, messages, start, stop };
}
