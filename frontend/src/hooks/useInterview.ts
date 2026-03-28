import { useState, useCallback } from "react";
import type { Message, InterviewConfig, EvaluationResult, InterviewStatus } from "../types/interview";
import { startInterview as apiStart, nextStep as apiNext } from "../services/api";

export function useInterview() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [question, setQuestion] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [config, setConfig] = useState<InterviewConfig | null>(null);
  const [status, setStatus] = useState<InterviewStatus>("idle");
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startInterview = useCallback(async (interviewConfig: InterviewConfig) => {
    try {
      setIsLoading(true);
      setError(null);
      setConfig(interviewConfig);
      const data = await apiStart(interviewConfig);
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: data.question,
        timestamp: new Date(),
      };
      setMessages([aiMsg]);
      setQuestion(data.question);
      setStep(data.step);
      setStatus("running");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const sendAnswer = useCallback(async (text: string) => {
    if (!config || !text.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);

    try {
      setIsLoading(true);
      setError(null);

      // Strip id/timestamp for backend
      const backendMessages = updatedMessages.map(({ role, content }) => ({ role, content }));
      const data = await apiNext(backendMessages, step + 1, config);

      if (data.done) {
        setResult(data.result);
        setStatus("finished");
      } else {
        const aiMsg: Message = {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.question,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, aiMsg]);
        setQuestion(data.question);
        setStep(data.step);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send answer");
    } finally {
      setIsLoading(false);
    }
  }, [config, messages, step]);

  const resetInterview = useCallback(() => {
    setMessages([]);
    setQuestion("");
    setStep(0);
    setConfig(null);
    setStatus("idle");
    setResult(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    messages,
    question,
    isLoading,
    step,
    config,
    status,
    result,
    error,
    startInterview,
    sendAnswer,
    resetInterview,
  };
}
