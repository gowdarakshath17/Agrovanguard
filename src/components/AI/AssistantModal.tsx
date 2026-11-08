import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Mic, MicOff, Volume2, Square, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

// Speech Recognition API typing
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

const QUICK_SUGGESTIONS = [
  'कपाशीवरील बोंडअळी कशी रोखावी?',
  'कांद्यावरील जांभळा करपा नियंत्रणासाठी काय उपाय?',
  'डाळिंबावरील तेल्या रोगावर प्रभावी औषध कोणते?',
  'सोयाबीनवरील तांबेरा रोगावर उपाय सांगा',
  'तूर पिकावरील मर रोग नियंत्रण कसे करावे?',
  'Best fertilizer dose for Cotton in black soil?'
];

export default function AssistantModal({ onClose }: { onClose: () => void }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<{role: string, content: string, id: string}[]>([
    { 
      role: 'assistant', 
      content: 'नमस्कार! मी अ‍ॅग्रो व्हॅनगार्ड (Agro Vanguard) कृषी सहाय्यक आहे. मी महाराष्ट्रातील कपाशी, सोयाबीन, कांदा, ऊस, तूर पिकांविषयी आणि हवामान/कीड व्यवस्थापनाविषयी कशी मदत करू शकतो?\n\nHello! I am your Agro Vanguard AI Agronomist for Maharashtra farming. How can I assist you today?', 
      id: 'welcome-msg' 
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('Marathi');
  const [isListening, setIsListening] = useState(false);
  const [ttsLoading, setTtsLoading] = useState(false);
  
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const recognitionRef = useRef<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (audioSourceRef.current) {
        try { audioSourceRef.current.stop(); } catch {}
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        try { audioContextRef.current.close(); } catch {}
      }
    };
  }, []);

  // Update language for recognition
  useEffect(() => {
    if (recognitionRef.current) {
      if (language === 'Marathi') recognitionRef.current.lang = 'mr-IN';
      else if (language === 'Hindi') recognitionRef.current.lang = 'hi-IN';
      else if (language === 'Kannada') recognitionRef.current.lang = 'kn-IN';
      else if (language === 'Tamil') recognitionRef.current.lang = 'ta-IN';
      else recognitionRef.current.lang = 'en-US';
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!SpeechRecognition) {
        alert("Your browser does not support voice input. Please type your message.");
        return;
      }
      setInput('');
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {
        setIsListening(false);
      }
    }
  };

  const stopPlayback = () => {
    if (audioSourceRef.current) {
      try {
        audioSourceRef.current.stop();
      } catch {}
      audioSourceRef.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {}
    }
    setPlayingId(null);
  };

  const playTTS = async (text: string, msgId: string) => {
    if (playingId === msgId) {
      stopPlayback();
      return;
    }
    
    stopPlayback();
    setPlayingId(msgId);
    setTtsLoading(true);

    const cleanText = text.replace(/[*#_`]/g, '').trim();

    const fallbackToSpeechSynthesis = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          if (language === 'Marathi') utterance.lang = 'mr-IN';
          else if (language === 'Hindi') utterance.lang = 'hi-IN';
          else if (language === 'Kannada') utterance.lang = 'kn-IN';
          else utterance.lang = 'en-IN';
          utterance.rate = 0.95;
          utterance.onend = () => {
            setPlayingId(prev => (prev === msgId ? null : prev));
          };
          utterance.onerror = () => {
            setPlayingId(prev => (prev === msgId ? null : prev));
          };
          window.speechSynthesis.speak(utterance);
          return true;
        } catch (e) {
          console.warn('Speech synthesis error:', e);
        }
      }
      return false;
    };
    
    try {
      const token = await getToken();
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: cleanText, language })
      });
      
      if (!res.ok) throw new Error("TTS endpoint error");
      const data = await res.json();
      if (!data.audio) throw new Error("No audio payload returned");

      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioCtx = audioContextRef.current;
      if (audioCtx.state === 'suspended') {
        try {
          await audioCtx.resume();
        } catch {}
      }

      // Decode base64 audio
      const binaryString = atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check if it's standard container (MP3/WAV) or raw PCM
      let audioBuffer: AudioBuffer;
      try {
        audioBuffer = await audioCtx.decodeAudioData(bytes.buffer.slice(0));
      } catch (decodeErr) {
        // Fallback for raw Int16 PCM (aligned bytes)
        const alignedLen = Math.floor(bytes.length / 2) * 2;
        const int16 = new Int16Array(bytes.buffer, 0, alignedLen / 2);
        audioBuffer = audioCtx.createBuffer(1, int16.length, 24000);
        const channelData = audioBuffer.getChannelData(0);
        for (let i = 0; i < int16.length; i++) {
          channelData[i] = int16[i] / 32768.0;
        }
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        setPlayingId(prev => (prev === msgId ? null : prev));
      };
      source.start();
      audioSourceRef.current = source;
      
    } catch (err) {
      console.warn("TTS Playback notice, activating browser speech synthesis:", err);
      const succeeded = fallbackToSpeechSynthesis();
      if (!succeeded) {
        setPlayingId(null);
      }
    } finally {
      setTtsLoading(false);
    }
  };

  const sendMessage = async (overrideText?: string, fromVoice = false) => {
    const textToSend = (overrideText || input).trim();
    if (!textToSend || loading) return;

    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { role: 'user', content: textToSend, id: tempId }]);
    setInput('');
    setLoading(true);

    try {
      const token = await getToken();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: textToSend, language })
      });
      const data = await res.json();
      if (res.ok && data.text) {
        const asstId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { role: 'assistant', content: data.text, id: asstId }]);
        // Automatically play voice if user asked with voice mic
        if (fromVoice || isListening) {
          playTTS(data.text, asstId);
        }
      } else {
        const errText = language === 'Marathi' 
          ? 'माफ करा, सर्व्हर व्यस्त आहे. कृपया पुन्हा प्रयत्न करा.' 
          : 'Sorry, the assistant is temporarily busy. Please try again.';
        setMessages(prev => [...prev, { role: 'assistant', content: errText, id: (Date.now() + 1).toString() }]);
      }
    } catch (err) {
      const errText = language === 'Marathi' 
        ? 'सर्व्हरशी संपर्क होऊ शकला नाही. कृपया इंटरनेट तपासा.' 
        : 'Failed to connect to the assistant. Please check your connection.';
      setMessages(prev => [...prev, { role: 'assistant', content: errText, id: (Date.now() + 1).toString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[650px] max-h-[92vh] border border-gray-100">
        
        {/* Header */}
        <div className="px-5 py-4 border-b flex justify-between items-center bg-gray-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900 leading-tight">Agro Vanguard AI Assistant</h3>
              <p className="text-[11px] text-emerald-700 font-medium">Maharashtra Agronomic & Pest Expert</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs font-semibold border-gray-200 rounded-xl py-1.5 px-2.5 focus:ring-emerald-500 focus:border-emerald-500 bg-white shadow-2xs cursor-pointer"
            >
              <option value="Marathi">मराठी (Marathi)</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="English">English</option>
              <option value="Kannada">ಕನ್ನಡ (Kannada)</option>
              <option value="Tamil">தமிழ் (Tamil)</option>
            </select>
            <button 
              onClick={() => { stopPlayback(); onClose(); }} 
              className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`px-4 py-3 rounded-2xl max-w-[88%] relative group ${
                m.role === 'user' 
                  ? 'bg-emerald-600 text-white rounded-br-none shadow-xs font-medium text-sm' 
                  : 'bg-white border border-gray-100 text-gray-800 rounded-bl-none shadow-xs text-sm leading-relaxed'
              }`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                
                {m.role === 'assistant' && (
                  <button 
                    onClick={() => playTTS(m.content, m.id)}
                    className="mt-2.5 text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg inline-flex items-center transition-colors text-xs font-semibold gap-1.5 shadow-2xs"
                  >
                    {playingId === m.id ? (
                      <><Square className="h-3 w-3 fill-current text-red-600" /><span>Stop Voice</span></>
                    ) : (
                      <><Volume2 className="h-3 w-3" /><span>Listen Audio</span></>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2.5 bg-white border border-gray-100 text-gray-600 rounded-2xl rounded-bl-none shadow-xs flex items-center text-xs font-medium gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-emerald-600" /> Agro Vanguard is analyzing agronomic records...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Suggestion Chips */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-gray-50/80 border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] scrollbar-none">
            {QUICK_SUGGESTIONS.map((q, idx) => (
              <button
                key={idx}
                onClick={() => sendMessage(q)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 rounded-full border border-gray-200 transition-colors shadow-2xs flex-shrink-0"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Box */}
        <div className="p-3.5 border-t bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={`p-3 rounded-2xl transition-all ${
                isListening 
                  ? 'bg-red-500 text-white animate-pulse shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
              title={isListening ? "Listening... (tap to stop)" : "Speak via Microphone"}
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={isListening ? "ऐकत आहे... बोला (Listening...)" : "पिकाविषयी प्रश्न विचारा (Ask about crops, pests, soil)..."}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white transition-colors text-sm"
            />
            <button 
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-700 disabled:opacity-40 transition-colors shadow-xs"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
