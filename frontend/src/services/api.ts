// TODO: Uncomment when fetch calls are implemented
// const BASE_URL = "http://localhost:3001/api";

// TODO 1: Add InterviewConfig param and return the opening question + sessionId
export async function startInterview(): Promise<void> {
  // TODO 1a: Accept config: InterviewConfig as parameter
  // TODO 1b: return { sessionId: string; question: string }
  // await fetch(`${BASE_URL}/start`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(config),
  // });
}

// TODO 2: Send accumulated messages array + current step, return next question or feedback
export async function nextStep(_answer: string): Promise<void> {
  // TODO 2a: Accept messages: Message[] and step: number as parameters
  // TODO 2b: return { done: boolean; question?: string; feedback?: FeedbackResult }
  // const res = await fetch(`${BASE_URL}/next`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ messages, step }),
  // });
  // return res.json();
}

// TODO 3: Send audio blob to Whisper STT endpoint, return transcript string
// export async function transcribeAudio(audioBlob: Blob): Promise<string> {
//   const formData = new FormData();
//   formData.append("audio", audioBlob, "audio.webm");
//   const res = await fetch(`${BASE_URL}/transcribe`, {
//     method: "POST",
//     body: formData,
//   });
//   const data = await res.json();
//   return data.transcript;
// }
