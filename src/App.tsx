import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import VoiceVisualizer from './components/VoiceVisualizer';
import StatusBar from './components/StatusBar';
import WelcomeScreen from './components/WelcomeScreen';
import ScrollControls from './components/ScrollControls';
import FloatingScrollButton from './components/FloatingScrollButton';
import ChatHistory from './components/ChatHistory';
import { useJarvisState } from './hooks/useJarvisState';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [showScrollControls, setShowScrollControls] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  
  const { 
    isListening, 
    isProcessing, 
    isSpeaking,
    currentStatus, 
    currentVoiceProfile,
    messages, 
    startListening, 
    stopListening,
    sendMessage,
    speakResponse,
    changeVoiceProfile,
    loadChatSession,
    startNewChat
  } = useJarvisState();

  // Detect device type and orientation
  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 640);
      setIsTablet(width >= 640 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);
    window.addEventListener('orientationchange', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
      window.removeEventListener('orientationchange', checkDevice);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      setTimeout(() => {
        speakResponse("Welcome. I am JARVIS, your advanced artificial intelligence assistant. How may I assist you today?", 'authoritative');
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [speakResponse]);

  // Responsive layout classes
  const getLayoutClasses = () => {
    if (isMobile) {
      return `mobile-layout ${orientation === 'landscape' ? 'landscape-mobile' : ''}`;
    } else if (isTablet) {
      return 'tablet-layout';
    } else {
      return 'desktop-layout';
    }
  };

  const getMainContentClasses = () => {
    if (isMobile) {
      return 'mobile-main-content flex-1 flex flex-col';
    } else if (isTablet) {
      return 'tablet-main-content';
    } else {
      return 'desktop-main-content';
    }
  };

  const getVoiceSidebarClasses = () => {
    if (isMobile) {
      return 'mobile-voice-sidebar';
    } else if (isTablet) {
      return 'tablet-voice-sidebar border-l border-white/10 glass-effect';
    } else {
      return 'desktop-voice-sidebar border-l border-white/10 glass-effect';
    }
  };

  return (
    <div className={`responsive-container bg-gradient-to-br from-jarvis-dark via-gray-900 to-black relative ${getLayoutClasses()}`}>
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-jarvis-blue/5 via-transparent to-transparent"></div>
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg_at_50%_50%,_transparent_0deg,_rgba(0,212,255,0.03)_60deg,_transparent_120deg)] animate-spin" style={{ animationDuration: '60s' }}></div>
      
      <AnimatePresence mode="wait">
        {showWelcome ? (
          <WelcomeScreen key="welcome" />
        ) : (
          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            className="h-full flex flex-col safe-area-top safe-area-bottom"
          >
            {/* Enhanced Status Bar */}
            <StatusBar 
              status={currentStatus}
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              currentVoiceProfile={currentVoiceProfile}
              onVoiceProfileChange={changeVoiceProfile}
              isMobile={isMobile}
              isTablet={isTablet}
            />

            {/* Main Content with Responsive Layout */}
            <div className={getMainContentClasses()}>
              {/* Chat Interface */}
              <div className="flex-1 flex flex-col min-w-0">
                <ChatInterface 
                  messages={messages}
                  onSendMessage={sendMessage}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                  isMobile={isMobile}
                  isTablet={isTablet}
                />
              </div>

              {/* Voice Visualizer Sidebar - Hidden on mobile portrait, shown on mobile landscape and larger */}
              {(!isMobile || orientation === 'landscape') && (
                <div className={getVoiceSidebarClasses()}>
                  <VoiceVisualizer 
                    isListening={isListening}
                    isProcessing={isProcessing}
                    onToggleListening={isListening ? stopListening : startListening}
                    isMobile={isMobile}
                    isTablet={isTablet}
                    orientation={orientation}
                  />
                </div>
              )}
            </div>

            {/* Chat History */}
            <ChatHistory
              isVisible={showChatHistory}
              onToggle={() => setShowChatHistory(!showChatHistory)}
              currentMessages={messages}
              onLoadSession={loadChatSession}
              onNewChat={startNewChat}
              isMobile={isMobile}
            />

            {/* Floating Scroll Buttons */}
            <FloatingScrollButton isMobile={isMobile} />

            {/* Advanced Scroll Controls */}
            <ScrollControls 
              isVisible={showScrollControls}
              onToggle={() => setShowScrollControls(!showScrollControls)}
              isMobile={isMobile}
            />

            {/* Mobile Voice Control Button - Only shown on mobile portrait */}
            {isMobile && orientation === 'portrait' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="fixed bottom-4 right-4 z-50 safe-area-bottom"
              >
                <motion.button
                  onClick={isListening ? stopListening : startListening}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                    isListening 
                      ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-red-500/25' 
                      : 'bg-gradient-to-r from-jarvis-blue to-cyan-400 shadow-jarvis-blue/25'
                  }`}
                >
                  {/* Pulse animation when listening */}
                  {isListening && (
                    <>
                      <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-400"
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.8, 0.2, 0.8]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                      />
                      <motion.div
                        className="absolute inset-0 rounded-full border border-white"
                        animate={{
                          scale: [1, 1.8, 1],
                          opacity: [0.6, 0.1, 0.6]
                        }}
                        transition={{
                          duration: 1.5,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.3
                        }}
                      />
                    </>
                  )}
                  
                  <svg 
                    className="w-8 h-8 text-white" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    {isListening ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    )}
                  </svg>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;