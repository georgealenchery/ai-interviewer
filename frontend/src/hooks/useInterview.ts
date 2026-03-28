import { useState } from "react";
import type { Message } from "../types/interview";

// TODO 1: Import api functions once implemented
// import { startInterview, nextStep, transcribeAudio } from "../services/api";

export function useInterview() {
  const [messages, _setMessages] = useState<Message[]>([]);
  const [question, _setQuestion] = useState<string>("");
  const [isLoading, _setIsLoading] = useState(false);
  const [step, _setStep] = useState(0);

  // TODO 2: Wire up startInterview — call on mount or when user clicks "Start Interview"
  // async function start(config: InterviewConfig) {
  //   setIsLoading(true);
  //   const { question } = await startInterview(config);
  //   setQuestion(question);
  //   setMessages([{ id: crypto.randomUUID(), role: "assistant", content: question, timestamp: new Date() }]);
  //   setIsLoading(false);
  // }

  // TODO 3: Wire up sendAnswer — append user message, call nextStep, append AI response
  function sendAnswer(answer: string) {
    // TODO 3a: Append user message to messages
    // const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: answer, timestamp: new Date() };
    // setMessages((prev) => [...prev, userMsg]);

    // TODO 3b: Call nextStep with full messages array + current step
    // setIsLoading(true);
    // const result = await nextStep([...messages, userMsg], step + 1);
    // setStep((s) => s + 1);

    // TODO 3c: If done, navigate to /analytics with feedback in router state
    // if (result.done) { navigate("/analytics", { state: result.feedback }); return; }

    // TODO 3d: Append AI follow-up to messages and update question
    // const aiMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: result.question, timestamp: new Date() };
    // setMessages((prev) => [...prev, aiMsg]);
    // setQuestion(result.question);
    // setIsLoading(false);

    console.log("sendAnswer:", answer);
  }

  // TODO 4: Add recordAndTranscribe() to capture mic audio, send to Whisper, then call sendAnswer
  // async function recordAndTranscribe(audioBlob: Blob) {
  //   const transcript = await transcribeAudio(audioBlob);
  //   await sendAnswer(transcript);
  // }

  // TODO 5: Add Web Speech API TTS to speak the AI question aloud
  // function speakQuestion(text: string) {
  //   const utterance = new SpeechSynthesisUtterance(text);
  //   utterance.rate = 0.95;
  //   utterance.pitch = 1;
  //   window.speechSynthesis.speak(utterance);
  // }

  return { messages, question, isLoading, step, sendAnswer };
}
