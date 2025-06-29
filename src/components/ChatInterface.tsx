import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Volume2, VolumeX, ChevronDown } from 'lucide-react';
import { Message } from '../types';
import { enhancedTtsEngine } from '../utils/enhancedTextToSpeech';

interface ChatInterfaceProps {
  messages: Message[];
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
  isSpeaking?: boolean;
  isMobile?: boolean;
  isTablet?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  onSendMessage, 
  isProcessing,
  isSpeaking = false,
  isMobile = false,
  isTablet = false
}) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Check if user has scrolled up manually
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
      setAutoScroll(isAtBottom);
    }
  };

  // Auto-scroll when messages change
  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, isProcessing, isSpeaking]);

  // Re-enable auto-scroll when user reaches bottom
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
      setAutoScroll(true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSpeakMessage = (content: string) => {
    if (enhancedTtsEngine.isSpeaking()) {
      enhancedTtsEngine.stop();
    } else {
      enhancedTtsEngine.speak(content);
    }
  };

  // Responsive classes
  const getContainerClasses = () => {
    if (isMobile) {
      return 'flex flex-col h-full mobile-chat-container';
    }
    return 'flex flex-col h-full';
  };

  const getMessagesContainerClasses = () => {
    const baseClasses = 'flex-1 overflow-y-auto chat-scrollbar space-y-2';
    if (isMobile) {
      return `${baseClasses} p-3 sm:p-4`;
    } else if (isTablet) {
      return `${baseClasses} p-4 sm:p-6`;
    }
    return `${baseClasses} p-6`;
  };

  const getMessageBubbleClasses = (messageType: 'user' | 'assistant') => {
    const baseClasses = 'glass-effect rounded-2xl px-3 py-2 relative group';
    const sizeClasses = isMobile ? 'text-sm' : 'text-sm sm:text-base';
    
    if (messageType === 'user') {
      return `${baseClasses} ${sizeClasses} bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-blue-500/30`;
    }
    return `${baseClasses} ${sizeClasses} bg-gradient-to-r from-jarvis-blue/20 to-cyan-400/20 border-jarvis-blue/30`;
  };

  const getAvatarSize = () => {
    return isMobile ? 'w-8 h-8' : 'w-10 h-10';
  };

  const getInputAreaClasses = () => {
    if (isMobile) {
      return 'border-t border-white/10 p-3 safe-area-bottom';
    }
    return 'border-t border-white/10 p-4 sm:p-6';
  };

  return (
    <div className={getContainerClasses()}>
      {/* Messages Container with Auto-Scroll */}
      <div 
        ref={messagesContainerRef}
        className={getMessagesContainerClasses()}
        style={{ scrollBehavior: 'smooth' }}
      >
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
              <div className={`flex items-start space-x-2 sm:space-x-3 ${
                isMobile ? 'max-w-[85%]' : isTablet ? 'max-w-[80%]' : 'max-w-3xl'
              } ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                {/* Avatar with Voice Animation */}
                <div className={`flex-shrink-0 ${getAvatarSize()} rounded-full flex items-center justify-center relative ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-r from-jarvis-blue to-cyan-400'
                }`}>
                  {message.type === 'user' ? (
                    <User className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                  ) : (
                    <>
                      <Bot className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                      {/* Voice Animation Ring for Assistant */}
                      {isSpeaking && message === messages[messages.length - 1] && (
                        <>
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
                            animate={{
                              scale: [1, 1.3, 1],
                              opacity: [0.8, 0.3, 0.8]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border-2 border-cyan-400"
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.6, 0.2, 0.6]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.3
                            }}
                          />
                          <motion.div
                            className="absolute inset-0 rounded-full border border-white"
                            animate={{
                              scale: [1, 1.7, 1],
                              opacity: [0.4, 0.1, 0.4]
                            }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "easeInOut",
                              delay: 0.6
                            }}
                          />
                        </>
                      )}
                    </>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={getMessageBubbleClasses(message.type)}>
                  <p className="leading-relaxed">{message.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                      {message.timestamp.toLocaleTimeString()}
                    </span>
                    
                    {/* Voice Control for Assistant Messages */}
                    {message.type === 'assistant' && !isMobile && (
                      <motion.button
                        onClick={() => handleSpeakMessage(message.content)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1 rounded-full hover:bg-jarvis-blue/20"
                        title={enhancedTtsEngine.isSpeaking() ? 'Stop speaking' : 'Speak message'}
                      >
                        {enhancedTtsEngine.isSpeaking() ? (
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
            <div className={`flex items-start space-x-2 sm:space-x-3 ${
              isMobile ? 'max-w-[85%]' : 'max-w-3xl'
            }`}>
              <div className={`flex-shrink-0 ${getAvatarSize()} rounded-full bg-gradient-to-r from-jarvis-blue to-cyan-400 flex items-center justify-center relative`}>
                <Bot className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white`} />
                {/* Processing Animation */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
                  animate={{
                    rotate: 360,
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                  }}
                />
              </div>
              <div className="glass-effect rounded-2xl px-3 py-2 bg-gradient-to-r from-jarvis-blue/20 to-cyan-400/20 border-jarvis-blue/30">
                <div className="flex space-x-1">
                  <div className="typing-indicator"></div>
                  <div className="typing-indicator"></div>
                  <div className="typing-indicator"></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Speaking Indicator with Siri-like Animation */}
        {isSpeaking && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className={`flex items-start space-x-2 sm:space-x-3 ${
              isMobile ? 'max-w-[85%]' : 'max-w-3xl'
            }`}>
              <div className={`flex-shrink-0 ${getAvatarSize()} rounded-full bg-gradient-to-r from-jarvis-blue to-cyan-400 flex items-center justify-center relative`}>
                <Volume2 className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'} text-white animate-pulse`} />
                {/* Siri-like Voice Animation */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
                  animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.8, 0.2, 0.8]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-cyan-400"
                  animate={{
                    scale: [1, 1.6, 1],
                    opacity: [0.6, 0.1, 0.6]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2
                  }}
                />
                <motion.div
                  className="absolute inset-0 rounded-full border border-white"
                  animate={{
                    scale: [1, 1.8, 1],
                    opacity: [0.4, 0.05, 0.4]
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.4
                  }}
                />
              </div>
              <div className="glass-effect rounded-2xl px-3 py-2 bg-gradient-to-r from-jarvis-blue/20 to-cyan-400/20 border-jarvis-blue/30">
                <div className="flex items-center space-x-2 sm:space-x-3">
                  {/* Siri-like Voice Bars */}
                  <div className="flex space-x-1">
                    {[...Array(isMobile ? 6 : 8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="w-1 bg-jarvis-blue rounded-full"
                        animate={{
                          height: [6, isMobile ? 16 : 24, 6],
                          opacity: [0.4, 1, 0.4]
                        }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          delay: i * 0.1,
                          ease: "easeInOut"
                        }}
                      />
                    ))}
                  </div>
                  <span className={`text-jarvis-blue font-medium ${isMobile ? 'text-xs' : 'text-xs sm:text-sm'}`}>
                    JARVIS is speaking...
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Auto-scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Auto-scroll indicator */}
      {!autoScroll && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          onClick={() => {
            setAutoScroll(true);
            scrollToBottom();
          }}
          className={`absolute ${
            isMobile ? 'bottom-20 right-4' : 'bottom-24 right-8'
          } px-3 py-2 glass-effect rounded-full bg-jarvis-blue/20 border border-jarvis-blue/30 text-xs text-jarvis-blue hover:bg-jarvis-blue/30 transition-all duration-200 z-10`}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      )}

      {/* Input Area */}
      <div className={getInputAreaClasses()}>
        <form onSubmit={handleSubmit} className={`flex ${isMobile ? 'space-x-2' : 'space-x-4'}`}>
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or use voice command..."
              disabled={isProcessing}
              className={`w-full glass-effect rounded-xl px-3 py-2 sm:px-4 sm:py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-jarvis-blue/50 disabled:opacity-50 ${
                isMobile ? 'text-base' : 'text-sm sm:text-base'
              }`}
            />
          </div>
          <motion.button
            type="submit"
            disabled={!inputValue.trim() || isProcessing}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`bg-gradient-to-r from-jarvis-blue to-cyan-400 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-jarvis-blue/25 transition-all duration-200 ${
              isMobile ? 'px-4 py-2' : 'px-6 py-3'
            }`}
          >
            <Send className={`${isMobile ? 'w-4 h-4' : 'w-5 h-5'}`} />
          </motion.button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;