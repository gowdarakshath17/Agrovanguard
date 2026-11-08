import { GoogleGenAI, Type } from "@google/genai";
import * as dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function test() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ role: 'user', parts: [{ text: "Hello" }] }],
    });
    console.log("Success:", response.text);
  } catch (e: any) {
    console.error("ERROR", e.status, e.message);
  }
}
test();
