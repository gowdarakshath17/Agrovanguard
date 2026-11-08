const fs = require('fs');

const content = `import React, { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Loader2, Mic, MicOff, Volume2, Square, Play } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';

// Speech Recognition API typing
const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

export default function AssistantModal({ onClose }: { onClose: () => void }) {
  const { getToken } = useAuth();
  const [messages, setMessages] = useState<{role: string, content: string, id: string}[]>([
    { role: 'assistant', content: 'Hello! I am your CropSentinel AI Assistant. How can I help you with your farm today?', id: 'welcome-msg' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState('English');
  const [isListening, setIsListening] = useState(false);
  
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
        setInput(prev => prev + ' ' + transcript);
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
      if (recognitionRef.current) recognitionRef.current.abort();
      if (audioSourceRef.current) audioSourceRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  // Update language for recognition
  useEffect(() => {
    if (recognitionRef.current) {
      if (language === 'English') recognitionRef.current.lang = 'en-US';
      if (language === 'Hindi') recognitionRef.current.lang = 'hi-IN';
      if (language === 'Marathi') recognitionRef.current.lang = 'mr-IN';
      if (language === 'Tamil') recognitionRef.current.lang = 'ta-IN';
      if (language === 'Kannada') recognitionRef.current.lang = 'kn-IN';
    }
  }, [language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!SpeechRecognition) {
        alert("Your browser does not support speech recognition.");
        return;
      }
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const playTTS = async (text: string, msgId: string) => {
    if (playingId === msgId) {
      // Stop playing
      audioSourceRef.current?.stop();
      setPlayingId(null);
      return;
    }
    
    // Stop any existing
    audioSourceRef.current?.stop();
    setPlayingId(msgId);
    
    try {
      const token = await getToken();
      const res = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ text, language })
      });
      
      if (!res.ok) throw new Error("TTS failed");
      const data = await res.json();
      
      if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
         audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const audioCtx = audioContextRef.current;
      const binaryString = atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      const buffer = new Int16Array(bytes.buffer);
      const audioBuffer = audioCtx.createBuffer(1, buffer.length, 24000);
      const channelData = audioBuffer.getChannelData(0);
      for (let i = 0; i < buffer.length; i++) {
        channelData[i] = buffer[i] / 32768.0;
      }
      
      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.onended = () => {
        if (playingId === msgId) setPlayingId(null);
      };
      source.start();
      audioSourceRef.current = source;
      
    } catch (err) {
      console.error(err);
      setPlayingId(null);
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, { role: 'user', content: userMsg, id: tempId }]);
    setInput('');
    setLoading(true);
    try {
      const token = await getToken();
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: \`Bearer \${token}\` },
        body: JSON.stringify({ message: userMsg, language })
      });
      const data = await res.json();
      if (res.ok) {
        const asstId = (Date.now() + 1).toString();
        setMessages(prev => [...prev, { role: 'assistant', content: data.text, id: asstId }]);
        // Auto-play the response
        playTTS(data.text, asstId);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, I encountered an error.', id: (Date.now()+1).toString() }]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to connect to the assistant.', id: (Date.now()+1).toString() }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden flex flex-col h-[600px] max-h-[90vh]">
        
        <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-bold">Ask Assistant</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-xs border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="English">English</option>
              <option value="Kannada">Kannada (ಕನ್ನಡ)</option>
              <option value="Hindi">Hindi (हिंदी)</option>
              <option value="Marathi">Marathi (मराठी)</option>
              <option value="Tamil">Tamil (தமிழ்)</option>
            </select>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {messages.map((m) => (
            <div key={m.id} className={\`flex \${m.role === 'user' ? 'justify-end' : 'justify-start'}\`}>
              <div className={\`px-4 py-3 rounded-2xl max-w-[85%] relative group \${m.role === 'user' ? 'bg-green-600 text-white rounded-br-none' : 'bg-white border text-gray-800 rounded-bl-none shadow-sm'}\`}>
                <div className="whitespace-pre-wrap">{m.content}</div>
                
                {m.role === 'assistant' && (
                  <button 
                    onClick={() => playTTS(m.content, m.id)}
                    className="mt-2 text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 p-1.5 rounded-full inline-flex items-center transition-colors"
                  >
                    {playingId === m.id ? (
                      <><Square className="h-3 w-3 mr-1 fill-current" /><span className="text-xs font-medium">Stop</span></>
                    ) : (
                      <><Volume2 className="h-3 w-3 mr-1" /><span className="text-xs font-medium">Listen</span></>
                    )}
                  </button>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-2 bg-white border text-gray-500 rounded-2xl rounded-bl-none shadow-sm flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleListening}
              className={\`p-3 rounded-xl transition-colors \${isListening ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}\`}
              title="Speak"
            >
              {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </button>
            <input 
              type="text" 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder={isListening ? "Listening..." : "Ask about crops, weather, pests..."}
              className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50 focus:bg-white transition-colors"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/AI/AssistantModal.tsx', content);
