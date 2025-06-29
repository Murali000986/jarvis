import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, ChevronDown, Mic, Bot, User, Zap, Heart } from 'lucide-react';
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
        return <Zap className="w-4 h-4" />;
      case 'chatgpt':
        return <Bot className="w-4 h-4" />;
      case 'assistant':
        return <User className="w-4 h-4" />;
      case 'robotic':
        return <Mic className="w-4 h-4" />;
      case 'friendly':
        return <Heart className="w-4 h-4" />;
      default:
        return <Volume2 className="w-4 h-4" />;
    }
  };

  const getProfileDescription = (profileName: string) => {
    switch (profileName.toLowerCase()) {
      case 'jarvis':
        return 'Professional AI assistant voice';
      case 'chatgpt':
        return 'Warm and conversational';
      case 'assistant':
        return 'Clear and helpful';
      case 'robotic':
        return 'Mechanical and precise';
      case 'friendly':
        return 'Warm and approachable';
      default:
        return 'Custom voice profile';
    }
  };

  const testVoice = (profileName: string) => {
    const testMessages = {
      'jarvis': 'Hello, I am JARVIS, your advanced AI assistant.',
      'chatgpt': 'Hi there! I\'m here to help you with anything you need.',
      'assistant': 'Hello! I\'m your helpful AI assistant, ready to assist you.',
      'robotic': 'Greetings. I am your robotic assistant. How may I serve you?',
      'friendly': 'Hey! I\'m so excited to help you today!'
    };

    enhancedTtsEngine.speak(
      testMessages[profileName.toLowerCase() as keyof typeof testMessages] || 'Hello, this is a test of the voice profile.',
      { profile: profileName }
    );
  };

  const currentProfileData = profiles.find(p => p.name.toLowerCase() === currentProfile.toLowerCase());

  return (
    <div className={`relative ${className}`}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center space-x-2 px-4 py-2 glass-effect rounded-lg border border-white/20 hover:border-jarvis-blue/50 transition-all duration-200"
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
            className="absolute top-12 left-0 w-80 glass-effect rounded-xl border border-white/20 p-4 z-50 shadow-2xl"
          >
            <h3 className="text-lg font-semibold mb-4 text-jarvis-blue">Voice Profiles</h3>
            
            <div className="space-y-2">
              {profiles.map((profile) => (
                <motion.div
                  key={profile.name}
                  whileHover={{ scale: 1.02 }}
                  className={`p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                    profile.name.toLowerCase() === currentProfile.toLowerCase()
                      ? 'bg-jarvis-blue/20 border border-jarvis-blue/50'
                      : 'bg-white/5 hover:bg-white/10 border border-transparent'
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
                          ? 'bg-jarvis-blue/30'
                          : 'bg-gray-600/30'
                      }`}>
                        {getProfileIcon(profile.name)}
                      </div>
                      <div>
                        <div className="font-medium">{profile.name}</div>
                        <div className="text-xs text-gray-400">
                          {getProfileDescription(profile.name)}
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
                </motion.div>
              ))}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-600/30">
              <p className="text-xs text-gray-400">
                💡 Try saying "Change voice to ChatGPT" or "Switch voice to friendly" for voice control
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VoiceProfileSelector;