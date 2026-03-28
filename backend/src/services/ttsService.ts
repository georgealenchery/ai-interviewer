// Browser-native TTS is handled on the frontend via the Web Speech API.
// This file is a placeholder for any server-side TTS if needed in the future
// (e.g. OpenAI TTS: openai.audio.speech.create).

export async function generateSpeech(_text: string): Promise<Buffer> {
  // TODO (optional): replace with OpenAI TTS (model: "tts-1", voice: "alloy")
  // if browser-native Web Speech API quality is not sufficient.
  // const mp3 = await openai.audio.speech.create({ model: "tts-1", voice: "alloy", input: text });
  // return Buffer.from(await mp3.arrayBuffer());
  return Buffer.from("");
}
