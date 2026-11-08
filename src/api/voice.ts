import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { GoogleGenAI } from "@google/genai";

const router = Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function withRetry<T>(fn: () => Promise<T>, maxRetries = 3, baseDelayMs = 2000): Promise<T> {
  let attempt = 0;
  while (attempt < maxRetries) {
    try {
      return await fn();
    } catch (error: any) {
      const isRetriable = error?.status === 503 || error?.status === 429 || error?.status === "RESOURCE_EXHAUSTED" || 
                    error?.status === 'UNAVAILABLE' || 
                    (error?.message && error.message.includes('503')) || 
                    (error?.message && error.message.includes('UNAVAILABLE')) || (error?.message && error.message.includes('429')) || (error?.message && error.message.includes('RESOURCE_EXHAUSTED'));
      
      if (isRetriable) {
        attempt++;
        if (attempt >= maxRetries) throw error;
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        console.warn(`[Gemini API] Rate limit or service busy. Retrying in ${delay}ms... (Attempt ${attempt}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } else {
        throw error;
      }
    }
  }
  throw new Error("Maximum retries reached");
}

// Sentence splitter to make sure each chunk is under the Google TTS 160 character CDN limit
const splitTextIntoChunks = (text: string, limit = 150): string[] => {
  // Split by sentence boundaries cleanly
  const sentences = text.match(/[^.!?\s]+[^.!?]*(?:[.!?]|$)/g) || [text];
  const chunks: string[] = [];
  let currentChunk = "";
  
  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    if (!trimmedSentence) continue;
    
    if ((currentChunk + " " + trimmedSentence).trim().length > limit) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }
      // If a single sentence exceeds the limit, hard slice it so it doesn't cause a 400 error
      if (trimmedSentence.length > limit) {
        let remaining = trimmedSentence;
        while (remaining.length > limit) {
          chunks.push(remaining.slice(0, limit).trim());
          remaining = remaining.slice(limit);
        }
        currentChunk = remaining;
      } else {
        currentChunk = trimmedSentence;
      }
    } else {
      currentChunk = currentChunk ? (currentChunk + " " + trimmedSentence) : trimmedSentence;
    }
  }
  
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
};

// Global in-memory TTS cache for 0ms repeat speech delivery
const ttsMemoryCache = new Map<string, string>();

router.post('/tts', requireAuth, async (req: Request, res: Response) => {
  try {
    const { text, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Missing text for TTS' });
    }

    const cacheKey = `${language || 'English'}:${text.trim().substring(0, 300)}`;
    if (ttsMemoryCache.has(cacheKey)) {
      return res.json({ audio: ttsMemoryCache.get(cacheKey) });
    }

    let base64Audio = '';
    let voiceName = 'Zephyr';
    if (language === 'Hindi') voiceName = 'Kore';
    if (language === 'Marathi') voiceName = 'Charon';
    if (language === 'Tamil') voiceName = 'Puck';
    if (language === 'Kannada') voiceName = 'Fenrir';
    if (language === 'Telugu') voiceName = 'Puck';
    if (language === 'Malayalam') voiceName = 'Zephyr';

    // 1. Try Gemini high-fidelity speech synthesis
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash-lite-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: ["AUDIO" as any],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName }
            }
          }
        }
      });
      
      base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data || '';
    } catch (_) {
      // Fallback quickly to high-speed parallel Google Translate TTS without long retries
    }

    // 2. Fetch and merge Google Translate TTS MP3 chunks in parallel
    if (!base64Audio) {
      const langCodes: Record<string, string> = {
        'English': 'en',
        'Kannada': 'kn',
        'Hindi': 'hi',
        'Marathi': 'mr',
        'Tamil': 'ta',
        'Telugu': 'te',
        'Malayalam': 'ml'
      };
      const tl = langCodes[language] || 'en';
      
      const chunks = splitTextIntoChunks(text, 150);
      
      // Fetch all audio chunks in parallel for maximum speed
      const bufferResults = await Promise.all(
        chunks.map(async (chunk) => {
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${tl}&client=tw-ob&q=${encodeURIComponent(chunk)}`;
          try {
            const ttsRes = await fetch(ttsUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            if (!ttsRes.ok) return null;
            const arrayBuffer = await ttsRes.arrayBuffer();
            return Buffer.from(arrayBuffer);
          } catch {
            return null;
          }
        })
      );
      
      const validBuffers = (bufferResults.filter(Boolean) as Buffer[]);
      if (validBuffers.length > 0) {
        const mergedBuffer = Buffer.concat(validBuffers);
        base64Audio = mergedBuffer.toString('base64');
      } else {
        throw new Error("All Google TTS chunk loads failed.");
      }
    }

    // Store in cache for 0ms subsequent plays
    if (base64Audio) {
      if (ttsMemoryCache.size > 200) {
        const firstKey = ttsMemoryCache.keys().next().value;
        if (firstKey) ttsMemoryCache.delete(firstKey);
      }
      ttsMemoryCache.set(cacheKey, base64Audio);
    }

    res.json({ audio: base64Audio });
  } catch (error: any) {
    console.error('TTS Generation Error:', error);
    res.status(500).json({ error: 'Failed to generate audio' });
  }
});

router.post('/translate', requireAuth, async (req: Request, res: Response) => {
  try {
    const { text, targetLanguage } = req.body;
    if (!text || !targetLanguage) {
      return res.status(400).json({ error: 'Missing text or targetLanguage' });
    }

    const response = await withRetry(() => ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: `Translate the following agricultural advisory into ${targetLanguage}. Ensure it sounds natural for a local farmer and keeps technical terms understandable: "${text}"`
    }));

    res.json({ translatedText: response.text });
  } catch (error: any) {
    console.error('Translation Error:', error);
    res.status(500).json({ error: 'Failed to translate text' });
  }
});

export default router;
