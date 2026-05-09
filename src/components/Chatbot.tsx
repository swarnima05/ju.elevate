import { useState, useRef, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Bot, User, Sparkles } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'model',
    content: "Hi there! I'm your ju.elevate assistant. How can I help you elevate your career today?"
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      if (!chatRef.current) {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
        chatRef.current = ai.chats.create({
          model: 'gemini-3.1-flash-lite',
          config: {
            systemInstruction: "You are a helpful, premium AI assistant for an app called ju.elevate. Your role is to help users with career advice, resume building, mock tests, and HR connections. Keep responses concise, professional, yet warm and encouraging."
          }
        });
      }
      
      const response = await chatRef.current.sendMessage({ message: userMsg.content });
      
      const modelMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: response.text || "I'm sorry, I couldn't process that."
      };
      
      setMessages(prev => [...prev, modelMsg]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "I'm having trouble connecting right now. Please try again later."
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-white/20 backdrop-blur-xl border border-white/50 shadow-[0_8px_32px_rgba(31,38,135,0.15)] flex items-center justify-center text-blue-900 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200/40 via-indigo-200/40 to-sky-200/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <MessageCircle className="w-6 h-6 relative z-10" />
            <Sparkles className="w-3 h-3 absolute top-3 right-3 text-blue-400 opacity-50" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-6 right-6 z-50 w-[350px] max-w-[calc(100vw-3rem)] h-[500px] max-h-[calc(100vh-6rem)] bg-white/10 backdrop-blur-[40px] border border-white/30 rounded-3xl shadow-[0_16px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/20 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-200 to-indigo-200 flex items-center justify-center shadow-inner">
                  <Bot className="w-4 h-4 text-blue-900" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-blue-950">ju.elevate AI</h3>
                  <p className="text-[10px] text-blue-800/70 font-medium tracking-wider uppercase">Online</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 text-blue-950/50 hover:text-blue-950 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} items-end`}>
                    
                    <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-blue-100/50' : 'bg-indigo-100/50 border border-white/40'}`}>
                      {msg.role === 'user' ? <User className="w-3 h-3 text-blue-800" /> : <Bot className="w-3 h-3 text-indigo-800" />}
                    </div>
                    
                    <div className={`px-4 py-2.5 rounded-2xl text-sm font-light leading-relaxed shadow-sm backdrop-blur-md ${
                      msg.role === 'user' 
                        ? 'bg-white/40 text-blue-950 rounded-br-sm border border-white/50' 
                        : 'bg-white/20 text-blue-900 rounded-bl-sm border border-white/30'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] flex gap-2 flex-row items-end">
                    <div className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-indigo-100/50 border border-white/40">
                      <Bot className="w-3 h-3 text-indigo-800" />
                    </div>
                    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-white/20 border border-white/30 backdrop-blur-md flex items-center gap-1.5 h-10 w-16">
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-800/40" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-800/40" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 rounded-full bg-blue-800/40" animate={{ y: [0, -4, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 bg-white/5 border-t border-white/20">
              <form 
                onSubmit={handleSubmit}
                className="flex items-center gap-2 bg-white/20 backdrop-blur-xl border border-white/40 rounded-full p-1 pl-4"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything..."
                  className="flex-1 bg-transparent text-sm text-blue-950 placeholder:text-blue-950/40 outline-none font-light py-2"
                  disabled={isTyping}
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isTyping}
                  className="shrink-0 w-9 h-9 rounded-full bg-blue-100/50 hover:bg-blue-200/50 disabled:opacity-50 flex items-center justify-center text-blue-900 transition-colors"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
