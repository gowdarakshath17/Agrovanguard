import { GoogleGenAI } from '@google/genai';
import * as dotenv from 'dotenv';
dotenv.config();

async function run() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-tts-preview',
    contents: 'Hello this is a test',
  });
  console.log(response.candidates?.[0]?.content?.parts?.[0]);
}
run();
