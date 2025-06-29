import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Volume2, VolumeX } from 'lucide-react';
import { Message } from '../types';
import { ttsEngine } from '../utils/textToSpeech';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  isSpeaking?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing,
  isSpeaking = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSpeakMessage = (content: string) => {
    if (ttsEngine.isSpeaking()) {
      ttsEngine.stop();
    } else {
      ttsEngine.speak(content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto scrollbar-hide p-6 space-y-4">
        <AnimatePresence>
          {messages.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-3 max-w-3xl ${
                message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
              }`}>
                {/* Avatar */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-jarvis-blue to-cyan-400'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5 text-white" />
                  ) : (
                    <Bot className="w-5 h-5 text-white" />
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`glass-effect rounded-2xl px-4 py-3 relative group ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30' 
                    : 'bg-gradient-to-r from-jarvis-blue/20 to-cyan-400/20 border-jarvis-blue/30'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-400">
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    
                    {/* Voice Control for Assistant Messages */}
                    {message.type === 'assistant' && (
                      <motion.button
                        onClick={() => handleSpeakMessage(message.content)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-jarvis-blue/20"
                        title={ttsEngine.isSpeaking() ? 'Stop speaking' : 'Speak message'}
                      >
                        {ttsEngine.isSpeaking() ? (
                          <VolumeX className="w-3 h-3 text-jarvis-blue" />
                        ) : (
                          <Volume2 className="w-3 h-3 text-jarvis-blue" />
                        )}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-jarvis-blue to-cyan-400 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="glass-effect rounded-2xl px-4 py-3 bg-gradient-to-r from-jarvis-blue/20 to-cyan-400/20 border-jarvis-blue/30">
                <div className="flex space-x-1">
                  <div className="typing-indicator"></div>
                  <div className="typing-indicator"></div>
                  <div className="typing-indicator"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Speaking Indicator */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-start space-x-3 max-w-3xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-r from-jarvis-blue to-cyan-400 flex items-center justify-center">
                <Volume2 className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="glass-effect rounded-2xl px-4 py-3 bg-gradient-to-r from-jarvis-blue/20 to-cyan-400/20 border-jarvis-blue/30">
                <div className="flex items-center space-x-2">
                  <div className="flex space-x-1">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 h-4 bg-jarvis-blue rounded-full"
                        animate={{
                          scaleY: [1, 2, 1],
                          opacity: [0.5, 1, 0.5]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-jarvis-blue">Speaking...</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-white/10 p-6">
        <form onSubmit={handleSubmit} className="flex space-x-4">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice command..."
              disabled={isProcessing}
              className="w-full glass-effect rounded-xl px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jarvis-blue/50 disabled:opacity-50"
            />
          </div>
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-6 py-3 bg-gradient-to-r from-jarvis-blue to-cyan-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-jarvis-blue/25 transition-all duration-200"
          >
            <Send className="w-5 h-5" />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;