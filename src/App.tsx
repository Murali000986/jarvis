import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './components/ChatInterface';
import VoiceVisualizer from './components/VoiceVisualizer';
import StatusBar from './components/StatusBar';
import WelcomeScreen from './components/WelcomeScreen';
import { useJarvisState } from './hooks/useJarvisState';
import { ttsEngine } from './utils/textToSpeech';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);
  const { 
    isListening, 
    isProcessing, 
    isSpeaking,
    currentStatus, 
    messages, 
    startListening, 
    stopListening,
    sendMessage,
    speakResponse
  } = useJarvisState();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
      // Speak welcome message after the welcome screen
      setTimeout(() => {
        speakResponse("Welcome to JARVIS, your enhanced AI assistant. I'm ready to help you with voice and text commands.");
      }, 1000);
    }, 3000);

    return () => clearTimeout(timer);
  }, [speakResponse]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-jarvis-dark via-gray-900 to-black overflow-hidden relative">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-jarvis-blue/5 via-transparent to-transparent"></div>
      
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
            {/* Status Bar */}
            <StatusBar 
              status={currentStatus}
              isListening={isListening}
              isProcessing={isProcessing}
              isSpeaking={isSpeaking}
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

              {/* Voice Visualizer Sidebar */}
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