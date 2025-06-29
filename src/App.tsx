import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import VoiceVisualizer from './components/VoiceVisualizer';
import StatusBar from './components/StatusBar';
import WelcomeScreen from './components/WelcomeScreen';
import { useJarvisState } from './hooks/useJarvisState';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
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
    changeVoiceProfile
  } = useJarvisState();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      // Speak welcome message after the welcome screen
      setTimeout(() => {
        speakResponse("Welcome to JARVIS version 4.0, your advanced AI assistant with powerful automation capabilities. I can now execute complex command chains, control multiple applications, and understand natural language commands. Try saying 'Open Google and search AI news' or 'Research machine learning' to experience my enhanced automation features.", 'excited');
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [speakResponse]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-jarvis-dark via-gray-900 to-black overflow-hidden relative">
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
            className="h-full flex flex-col"
          >
            {/* Enhanced Status Bar */}
            <StatusBar 
              status={currentStatus}
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
              currentVoiceProfile={currentVoiceProfile}
              onVoiceProfileChange={changeVoiceProfile}
            />

            {/* Main Content */}
            <div className="flex-1 flex">
              {/* Chat Interface */}
              <div className="flex-1 flex flex-col">
                <ChatInterface 
                  messages={messages}
                  onSendMessage={sendMessage}
                  isProcessing={isProcessing}
                  isSpeaking={isSpeaking}
                />
              </div>

              {/* Enhanced Voice Visualizer Sidebar */}
              <div className="w-80 border-l border-white/10 glass-effect">
                <VoiceVisualizer 
                  isListening={isListening}
                  isProcessing={isProcessing}
                  onToggleListening={isListening ? stopListening : startListening}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;