import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Volume2, Loader2, Play, Square } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

interface AudioAssistantProps {
  textToRead: string;
  defaultLanguage?: string;
  preTranslatedText?: string;
  lat?: number;
  lon?: number;
}

interface CacheEntry {
  translatedText: string;
  audioBuffer: AudioBuffer | null;
}

const indianStateToLanguage = (state: string): string => {
  const s = state.toLowerCase();
  if (s.includes('karnataka')) return 'Kannada';
  if (s.includes('tamil nadu')) return 'Tamil';
  if (s.includes('maharashtra')) return 'Marathi';
  if (s.includes('andhra pradesh') || s.includes('telangana')) return 'Telugu';
  if (s.includes('kerala')) return 'Malayalam';
  if (
    s.includes('hindi') || s.includes('delhi') || s.includes('uttar pradesh') || 
    s.includes('madhya pradesh') || s.includes('bihar') || s.includes('rajasthan') || 
    s.includes('haryana') || s.includes('himachal') || s.includes('uttarakhand') || 
    s.includes('jharkhand') || s.includes('chhattisgarh')
  ) {
    return 'Hindi';
  }
  return 'English';
};

const coordinateToLanguage = (lat: number, lon: number): string => {
  if (lat >= 11.5 && lat <= 18.5 && lon >= 74.0 && lon <= 78.5) return 'Kannada';
  if (lat >= 8.0 && lat <= 13.5 && lon >= 76.2 && lon <= 80.4) return 'Tamil';
  if (lat >= 8.3 && lat <= 12.8 && lon >= 74.8 && lon <= 77.5) return 'Malayalam';
  if (lat >= 15.6 && lat <= 22.1 && lon >= 72.6 && lon <= 80.9) return 'Marathi';
  if (lat >= 12.6 && lat <= 19.9 && lon >= 76.8 && lon <= 84.8) return 'Telugu';
  return 'English';
};

// Client-side translation engine using free public Google Translate GTX single-line API
const fetchClientTranslation = async (text: string, targetLang: string): Promise<string> => {
  const langCodes: Record<string, string> = {
    'English': 'en',
    'Kannada': 'kn',
    'Hindi': 'hi',
    'Marathi': 'mr',
    'Tamil': 'ta',
    'Telugu': 'te',
    'Malayalam': 'ml'
  };
  const tl = langCodes[targetLang] || 'en';
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${tl}&dt=t&q=${encodeURIComponent(text)}`;
  
  const res = await fetch(url);
  if (!res.ok) throw new Error("Translation request failed");
  const data = await res.json();
  if (data && data[0]) {
    return data[0].map((x: any) => x[0]).join('');
  }
  throw new Error("Invalid translation format");
};

export default function AudioAssistant({ 
  textToRead, 
  defaultLanguage = 'Marathi', 
  preTranslatedText,
  lat,
  lon
}: AudioAssistantProps) {
  const { getToken } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(defaultLanguage);
  const [translatedText, setTranslatedText] = useState(textToRead);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  // Parse words list for visual highlighting
  const wordsList = useMemo(() => {
    return translatedText.split(/\s+/).filter(Boolean);
  }, [translatedText]);

  // Client-side in-memory translation/audio cache
  const audioCacheRef = useRef<Record<string, CacheEntry>>({});
  
  // Audio Context & Timer Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const highlightTimerRef = useRef<any>(null);

  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const handleLanguageChange = async (newLang: string) => {
    setLanguage(newLang);
    handleStopPlayback();

    const cached = audioCacheRef.current[newLang];
    if (cached) {
      setTranslatedText(cached.translatedText);
      return;
    }

    if (newLang === 'English') {
      setTranslatedText(textToRead);
      return;
    }

    if (newLang === defaultLanguage && preTranslatedText) {
      setTranslatedText(preTranslatedText);
      return;
    }

    setLoading(true);
    try {
      const translated = await fetchClientTranslation(textToRead, newLang);
      setTranslatedText(translated);
      audioCacheRef.current[newLang] = {
        translatedText: translated,
        audioBuffer: null
      };
    } catch (err) {
      console.warn("Client translation error:", err);
      setTranslatedText(textToRead);
    } finally {
      setLoading(false);
    }
  };

  // Detect location and pre-select local language
  useEffect(() => {
    const detectAndSetLanguage = async (latitude: number, longitude: number) => {
      const localLang = coordinateToLanguage(latitude, longitude);
      if (localLang !== 'English') {
        setLanguage(localLang);
        handleLanguageChange(localLang);
        return;
      }

      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`, {
          headers: {
            'User-Agent': 'AgroVanguardAI-AudioAssistant'
          }
        });
        if (res.ok) {
          const data = await res.json();
          const stateName = data.address?.state || '';
          const stateLang = indianStateToLanguage(stateName);
          if (stateLang !== 'English') {
            setLanguage(stateLang);
            handleLanguageChange(stateLang);
          }
        }
      } catch (err) {
        console.warn('Geocoding fallback failed:', err);
      }
    };

    if (lat !== undefined && lon !== undefined) {
      detectAndSetLanguage(lat, lon);
    } else if (navigator.permissions && navigator.geolocation) {
      navigator.permissions.query({ name: 'geolocation' as any }).then((result) => {
        if (result.state === 'granted') {
          navigator.geolocation.getCurrentPosition((position) => {
            detectAndSetLanguage(position.coords.latitude, position.coords.longitude);
          });
        }
      }).catch((e) => console.log('Geolocation permission check error:', e));
    }
  }, [lat, lon, textToRead]);

  // When primary text changes, reset and clear cache
  useEffect(() => {
    handleStopPlayback();
    audioCacheRef.current = {};
    
    let initialText = textToRead;
    if (language === defaultLanguage && preTranslatedText) {
      initialText = preTranslatedText;
    }
    setTranslatedText(initialText);
  }, [textToRead]);

  const handleStopPlayback = () => {
    setIsPlaying(false);
    setCurrentWordIndex(-1);
    
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
    
    if (activeSourceRef.current) {
      try {
        activeSourceRef.current.stop();
      } catch {}
      activeSourceRef.current = null;
    }
  };

  const playBuffer = (buffer: AudioBuffer) => {
    handleStopPlayback();

    const audioCtx = getAudioContext();
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    
    source.onended = () => {
      setIsPlaying(false);
      setCurrentWordIndex(-1);
    };

    activeSourceRef.current = source;
    source.start(0);
    setIsPlaying(true);

    // Progressive Word-by-Word blue highlighter synchronization
    const totalDuration = buffer.duration;
    const wordsCount = wordsList.length;
    const startTime = Date.now();

    highlightTimerRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const progress = elapsed / totalDuration;
      
      if (progress >= 1.0) {
        handleStopPlayback();
        return;
      }

      const wordIdx = Math.floor(progress * wordsCount);
      setCurrentWordIndex(wordIdx < wordsCount ? wordIdx : -1);
    }, 100);
  };

  const handlePlayStop = async () => {
    if (isPlaying) {
      handleStopPlayback();
      return;
    }

    // Play immediately if we already have the decoded AudioBuffer in our cache
    const cached = audioCacheRef.current[language];
    if (cached && cached.audioBuffer) {
      playBuffer(cached.audioBuffer);
      return;
    }

    setLoading(true);
    try {
      const token = await getToken();

      // Fetch speech audio base64 from backend proxy
      const ttsRes = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ text: translatedText, language })
      });
      
      if (!ttsRes.ok) {
        throw new Error("Failed to fetch audio.");
      }
      
      const ttsData = await ttsRes.json();
      
      // Convert base64 back to binary array
      const binaryString = atob(ttsData.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Decode WAV or MP3 audio data natively using the browser AudioContext
      const audioCtx = getAudioContext();
      const decodedBuffer = await audioCtx.decodeAudioData(bytes.buffer);

      // Save to cache
      audioCacheRef.current[language] = {
        translatedText,
        audioBuffer: decodedBuffer
      };

      playBuffer(decodedBuffer);
    } catch (err) {
      console.warn("Audio fetch or decoding failed, falling back to speech synthesis:", err);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(translatedText.replace(/[*#_`]/g, ''));
          if (language === 'Marathi') utterance.lang = 'mr-IN';
          else if (language === 'Hindi') utterance.lang = 'hi-IN';
          else if (language === 'Kannada') utterance.lang = 'kn-IN';
          else utterance.lang = 'en-IN';
          utterance.rate = 0.95;
          utterance.onstart = () => setIsPlaying(true);
          utterance.onend = () => {
            setIsPlaying(false);
            setCurrentWordIndex(-1);
          };
          utterance.onerror = () => {
            setIsPlaying(false);
            setCurrentWordIndex(-1);
          };
          window.speechSynthesis.speak(utterance);
        } catch (synthErr) {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (highlightTimerRef.current) {
        clearInterval(highlightTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="mt-4 bg-gray-50 border border-gray-200 p-4 rounded-xl">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-bold text-gray-700 flex items-center">
          <Volume2 className="h-4 w-4 mr-2 text-green-600 animate-pulse" />
          Voice Advisory
        </h4>
        <select
          value={language}
          onChange={(e) => handleLanguageChange(e.target.value)}
          className="text-sm border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
        >
          <option value="English">English</option>
          <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
          <option value="Hindi">Hindi (हिंदी)</option>
          <option value="Marathi">Marathi (ಮರಾठी)</option>
          <option value="Tamil">Tamil (தமிழ்)</option>
          <option value="Telugu">Telugu (తెలుగు)</option>
          <option value="Malayalam">Malayalam (മലയാളം)</option>
        </select>
      </div>
      
      {/* Precision Word-by-word visual reading tracker */}
      <div className="text-sm text-gray-600 mb-4 bg-white p-3 border border-gray-100 rounded-lg leading-relaxed select-none">
        {wordsList.map((word, idx) => {
          const isHighlighted = idx === currentWordIndex;
          return (
            <span
              key={idx}
              className={`inline-block mr-1 transition-all duration-100 ${
                isHighlighted 
                  ? 'bg-blue-100 text-blue-700 px-1 rounded font-semibold scale-105 shadow-sm' 
                  : ''
              }`}
            >
              {word}
            </span>
          );
        })}
      </div>

      <button
        onClick={handlePlayStop}
        disabled={loading}
        className={`w-full flex items-center justify-center py-2 px-4 rounded-lg font-medium transition-colors ${
          isPlaying 
            ? 'bg-red-100 text-red-700 hover:bg-red-200' 
            : 'bg-green-100 text-green-700 hover:bg-green-200'
        }`}
      >
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isPlaying ? (
          <>
            <Square className="h-4 w-4 mr-2 fill-current" /> Stop Playing
          </>
        ) : (
          <>
            <Play className="h-4 w-4 mr-2 fill-current" /> Listen in {language}
          </>
        )}
      </button>
    </div>
  );
}
