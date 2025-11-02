import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const ChatBot: React.FC = () => {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: t('chatbot.welcome'),
      sender: 'bot',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateBotResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Simple pattern matching for common guitar questions
    if (lowerMessage.includes('chord') || lowerMessage.includes('akord')) {
      return "Great question about chords! Start with basic open chords like C, G, D, Am, and Em. Practice transitioning smoothly between them. Remember to keep your fingers arched and press firmly just behind the frets.";
    }
    if (lowerMessage.includes('practice') || lowerMessage.includes('trénink') || lowerMessage.includes('cvičit')) {
      return "Practice regularly for 20-30 minutes daily rather than long sessions once a week. Focus on accuracy first, then speed. Use a metronome to develop your timing. Break down difficult passages into smaller parts.";
    }
    if (lowerMessage.includes('beginner') || lowerMessage.includes('začátečník')) {
      return "Welcome! As a beginner, focus on: 1) Proper posture and hand positioning, 2) Learning basic chords (C, G, D, Am, Em), 3) Simple strumming patterns, 4) Practicing chord transitions. Be patient - everyone starts slow!";
    }
    if (lowerMessage.includes('rhythm') || lowerMessage.includes('rytmus')) {
      return "Rhythm is crucial! Start by counting out loud: 1-2-3-4. Use a metronome starting at slow tempo (60-80 BPM). Practice with simple down strokes first, then add up strokes. Tap your foot to keep time.";
    }
    if (lowerMessage.includes('finger') || lowerMessage.includes('prst')) {
      return "Proper finger technique: Keep your thumb behind the neck for support. Use your fingertips to press strings. Keep fingers arched like holding a ball. Build calluses gradually - don't overdo it!";
    }
    if (lowerMessage.includes('tune') || lowerMessage.includes('ladit')) {
      return "Standard tuning from thickest to thinnest string: E-A-D-G-B-E. Use a tuner app or the built-in pitch detection in this app! Tune regularly as strings detune with playing and temperature changes.";
    }
    if (lowerMessage.includes('scale') || lowerMessage.includes('stupnice')) {
      return "Start with the pentatonic scale - it's the most versatile for rock, blues, and pop. Practice scales slowly, focus on clean notes. Use alternate picking (down-up-down-up). Memorize patterns across the fretboard.";
    }
    if (lowerMessage.includes('barre') || lowerMessage.includes('baré')) {
      return "Barre chords are challenging but essential! Tips: 1) Press your index finger flat across strings, 2) Position it close to the fret, 3) Keep your thumb behind the neck, 4) Start with F major. Build strength gradually!";
    }
    if (lowerMessage.includes('pain') || lowerMessage.includes('bolest')) {
      return "Some discomfort is normal when starting, but sharp pain isn't! Take breaks every 20 minutes. Your fingertips will develop calluses in 2-3 weeks. If pain persists, check your posture and hand position.";
    }
    if (lowerMessage.includes('song') || lowerMessage.includes('píseň') || lowerMessage.includes('skladba')) {
      return "Choose songs you love! Good beginner songs: 'Knockin' on Heaven's Door', 'Horse with No Name', 'Stand By Me'. Import them as MusicXML in this app and practice with the interactive fretboard!";
    }
    if (lowerMessage.includes('help') || lowerMessage.includes('pomoc')) {
      return "I'm here to help with guitar questions! Ask me about: chords, scales, practice tips, technique, tuning, reading tabs, song recommendations, or any guitar-related topic. What would you like to know?";
    }
    
    // Default responses
    const defaultResponses = [
      "That's an interesting question! Could you be more specific? I can help with chords, scales, technique, practice routines, and more.",
      "I'd love to help! Try asking about: chord progressions, fingering techniques, practice schedules, or specific songs you want to learn.",
      "Great to hear from you! What aspect of guitar playing would you like to explore? Rhythm, lead, chords, or techniques?",
    ];
    
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSend = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Simulate bot thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: generateBotResponse(inputText),
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl border border-amber-700/30">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-800 to-amber-900 p-4 rounded-t-lg border-b border-amber-700/50">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🎸</div>
          <div>
            <h3 className="text-lg font-bold text-white">{t('chatbot.title')}</h3>
            <p className="text-xs text-amber-200">Your personal guitar assistant</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border border-amber-700/30'
              }`}
            >
              {message.sender === 'bot' && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🎵</span>
                  <span className="text-xs text-amber-300 font-semibold">AI Tutor</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
              <span className="text-xs opacity-60 mt-1 block">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-r from-gray-700 to-gray-800 rounded-2xl px-4 py-3 border border-amber-700/30">
              <div className="flex items-center gap-2">
                <span className="text-lg">🎵</span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-gray-800/50 border-t border-amber-700/30 rounded-b-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t('chatbot.placeholder')}
            className="flex-1 bg-gray-700 text-white px-4 py-3 rounded-xl border border-gray-600 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all"
          />
          <button
            onClick={handleSend}
            disabled={!inputText.trim()}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-amber-500/20"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;