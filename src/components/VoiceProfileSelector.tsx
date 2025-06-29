import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronDown, Mic, Bot, User, Zap, Heart, Shield, Cpu } from 'lucide-react';
import { enhancedTtsEngine } from '../utils/enhancedTextToSpeech';

interface VoiceProfileSelectorProps {
  currentProfile: string;
  onProfileChange: (profile: string) => void;
  className?: string;
}

const VoiceProfileSelector: React.FC<VoiceProfileSelectorProps> = ({
  currentProfile,
  onProfileChange,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const profiles = enhancedTtsEngine.getAvailableProfiles();

  const getProfileIcon = (profileName: string) => {
    switch (profileName.toLowerCase()) {
      case 'jarvis':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'jarvis mark ii':
      case 'jarvis-mk2':
        return <Shield className="w-4 h-4 text-cyan-400" />;
      case 'friday':
        return <Cpu className="w-4 h-4 text-purple-400" />;
      case 'chatgpt':
        return <Bot className="w-4 h-4 text-green-400" />;
      case 'assistant':
        return <User className="w-4 h-4 text-yellow-400" />;
      case 'robotic':
        return <Mic className="w-4 h-4 text-gray-400" />;
      case 'friendly':
        return <Heart className="w-4 h-4 text-pink-400" />;
      default:
        return <Volume2 className="w-4 h-4" />;
    }
  };

  const getProfileColor = (profileName: string) => {
    switch (profileName.toLowerCase()) {
      case 'jarvis':
        return 'border-blue-500/50 bg-blue-500/10';
      case 'jarvis mark ii':
      case 'jarvis-mk2':
        return 'border-cyan-500/50 bg-cyan-500/10';
      case 'friday':
        return 'border-purple-500/50 bg-purple-500/10';
      case 'chatgpt':
        return 'border-green-500/50 bg-green-500/10';
      case 'assistant':
        return 'border-yellow-500/50 bg-yellow-500/10';
      case 'robotic':
        return 'border-gray-500/50 bg-gray-500/10';
      case 'friendly':
        return 'border-pink-500/50 bg-pink-500/10';
      default:
        return 'border-jarvis-blue/50 bg-jarvis-blue/10';
    }
  };

  const testVoice = (profileName: string) => {
    const testMessages = {
      'jarvis': 'Good day. I am JARVIS, your advanced artificial intelligence assistant. All systems are operational and ready to serve.',
      'jarvis-mk2': 'Greetings. I am JARVIS Mark Two. Enhanced capabilities are now online. How may I assist you today?',
      'friday': 'Hello. I am FRIDAY, your efficient AI assistant. Ready to help with your tasks.',
      'chatgpt': 'Hi there! I\'m here to help you with anything you need in a friendly, conversational way.',
      'assistant': 'Hello! I\'m your helpful AI assistant, ready to assist you with clear and precise responses.',
      'robotic': 'Greetings, human. I am your robotic assistant. How may I serve you today?',
      'friendly': 'Hey! I\'m so excited to help you today! What can we work on together?'
    };

    enhancedTtsEngine.speak(
      testMessages[profileName.toLowerCase() as keyof typeof testMessages] || 'Hello, this is a test of the voice profile.',
      { 
        profile: profileName,
        emotion: profileName.toLowerCase().includes('jarvis') ? 'authoritative' : 'neutral'
      }
    );
  };

  const currentProfileData = profiles.find(p => p.name.toLowerCase() === currentProfile.toLowerCase());

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center space-x-2 px-4 py-2 glass-effect rounded-lg border transition-all duration-200 ${
          currentProfile.toLowerCase().includes('jarvis') 
            ? 'border-blue-500/50 hover:border-blue-400/70' 
            : 'border-white/20 hover:border-jarvis-blue/50'
        }`}
      >
        {getProfileIcon(currentProfile)}
        <span className="text-sm font-medium">
          {currentProfileData?.name || 'JARVIS'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-12 left-0 w-96 glass-effect rounded-xl border border-white/20 p-4 z-50 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-4 text-jarvis-blue flex items-center">
              <Zap className="w-5 h-5 mr-2" />
              JARVIS Voice Profiles
            </h3>
            
            <div className="space-y-2">
              {profiles.map((profile) => (
                <motion.div
                  key={profile.name}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
                    profile.name.toLowerCase() === currentProfile.toLowerCase()
                      ? getProfileColor(profile.name)
                      : 'bg-white/5 hover:bg-white/10 border-transparent hover:border-white/20'
                  }`}
                  onClick={() => {
                    onProfileChange(profile.name.toLowerCase());
                    setIsOpen(false);
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        profile.name.toLowerCase() === currentProfile.toLowerCase()
                          ? 'bg-current/20'
                          : 'bg-gray-600/30'
                      }`}>
                        {getProfileIcon(profile.name)}
                      </div>
                      <div>
                        <div className="font-medium flex items-center">
                          {profile.name}
                          {profile.name.toLowerCase().includes('jarvis') && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                              MCU
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">
                          {profile.description}
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        testVoice(profile.name);
                      }}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 rounded-lg bg-gray-600/30 hover:bg-jarvis-blue/30 transition-colors duration-200"
                      title="Test voice"
                    >
                      <Volume2 className="w-4 h-4" />
                    </motion.button>
                  </div>
                  
                  {/* Voice characteristics */}
                  <div className="mt-2 flex space-x-4 text-xs text-gray-400">
                    <span>Rate: {profile.rate.toFixed(1)}x</span>
                    <span>Pitch: {profile.pitch.toFixed(1)}</span>
                    <span>Style: {profile.style}</span>
                  </div>
                  
                  {/* Special indicators for JARVIS voices */}
                  {profile.name.toLowerCase().includes('jarvis') && (
                    <div className="mt-2 flex items-center space-x-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-blue-400">Authentic Iron Man AI Voice</span>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-600/30">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-400">JARVIS Features</span>
              </div>
              <ul className="text-xs text-gray-400 space-y-1">
                <li>• Deep, authoritative voice like Tony Stark's AI</li>
                <li>• Sophisticated speech patterns and vocabulary</li>
                <li>• Lower pitch for that authentic JARVIS sound</li>
                <li>• Professional and formal communication style</li>
              </ul>
              
              <div className="mt-3 p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-xs text-blue-300">
                  💡 Try: "Change voice to JARVIS" or "Switch to JARVIS Mark II" for voice control
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceProfileSelector;