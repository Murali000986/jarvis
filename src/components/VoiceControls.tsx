import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Volume2, VolumeX, Settings, Play, Pause, RotateCcw } from 'lucide-react';
import { ttsEngine } from '../utils/textToSpeech';

interface VoiceControlsProps {
  className?: string;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({ className = '' }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [rate, setRate] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [volume, setVolume] = useState(0.8);

  useEffect(() => {
    const updateVoices = () => {
      const availableVoices = ttsEngine.getAvailableVoices();
      setVoices(availableVoices);
      setSelectedVoice(ttsEngine.getCurrentVoice());
    };

    updateVoices();
    
    if (speechSynthesis.getVoices().length === 0) {
      speechSynthesis.addEventListener('voiceschanged', updateVoices);
    }

    const checkSpeaking = setInterval(() => {
      setIsSpeaking(ttsEngine.isSpeaking());
    }, 100);

    return () => {
      speechSynthesis.removeEventListener('voiceschanged', updateVoices);
      clearInterval(checkSpeaking);
    };
  }, []);

  const toggleEnabled = () => {
    const newState = !isEnabled;
    setIsEnabled(newState);
    ttsEngine.setEnabled(newState);
  };

  const handleVoiceChange = (voiceIndex: number) => {
    const voice = voices[voiceIndex];
    setSelectedVoice(voice);
    ttsEngine.setVoice(voice);
  };

  const handleRateChange = (newRate: number) => {
    setRate(newRate);
    ttsEngine.setRate(newRate);
  };

  const handlePitchChange = (newPitch: number) => {
    setPitch(newPitch);
    ttsEngine.setPitch(newPitch);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    ttsEngine.setVolume(newVolume);
  };

  const testVoice = () => {
    ttsEngine.speak("Hello, I am JARVIS, your enhanced AI assistant. How may I assist you today?");
  };

  const stopSpeaking = () => {
    ttsEngine.stop();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Controls */}
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={toggleEnabled}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`p-2 rounded-lg transition-all duration-200 ${
            isEnabled 
              ? 'bg-jarvis-blue/20 text-jarvis-blue border border-jarvis-blue/30' 
              : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
          }`}
          title={isEnabled ? 'Disable Voice' : 'Enable Voice'}
        >
          {isEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </motion.button>

        {isSpeaking && (
          <motion.button
            onClick={stopSpeaking}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 transition-all duration-200"
            title="Stop Speaking"
          >
            <Pause className="w-4 h-4" />
          </motion.button>
        )}

        <motion.button
          onClick={() => setShowSettings(!showSettings)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-2 rounded-lg bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:text-jarvis-blue hover:border-jarvis-blue/30 transition-all duration-200"
          title="Voice Settings"
        >
          <Settings className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute top-12 right-0 w-80 glass-effect rounded-xl p-4 border border-white/10 z-50"
        >
          <h3 className="text-lg font-semibold mb-4 text-jarvis-blue">Voice Settings</h3>
          
          {/* Voice Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Voice</label>
            <select
              value={voices.findIndex(v => v === selectedVoice)}
              onChange={(e) => handleVoiceChange(parseInt(e.target.value))}
              className="w-full glass-effect rounded-lg px-3 py-2 text-white bg-transparent border border-white/20 focus:border-jarvis-blue/50 focus:outline-none"
            >
              {voices.map((voice, index) => (
                <option key={index} value={index} className="bg-gray-800">
                  {voice.name} ({voice.lang})
                </option>
              ))}
            </select>
          </div>

          {/* Rate Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Speed: {rate.toFixed(1)}x
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={rate}
              onChange={(e) => handleRateChange(parseFloat(e.target.value))}
              className="w-full accent-jarvis-blue"
            />
          </div>

          {/* Pitch Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Pitch: {pitch.toFixed(1)}
            </label>
            <input
              type="range"
              min="0.5"
              max="2.0"
              step="0.1"
              value={pitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              className="w-full accent-jarvis-blue"
            />
          </div>

          {/* Volume Control */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Volume: {Math.round(volume * 100)}%
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
              className="w-full accent-jarvis-blue"
            />
          </div>

          {/* Test Button */}
          <div className="flex space-x-2">
            <motion.button
              onClick={testVoice}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-4 py-2 bg-jarvis-blue/20 text-jarvis-blue border border-jarvis-blue/30 rounded-lg hover:bg-jarvis-blue/30 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <Play className="w-4 h-4" />
              <span>Test Voice</span>
            </motion.button>
            
            <motion.button
              onClick={() => {
                setRate(1.0);
                setPitch(1.0);
                setVolume(0.8);
                ttsEngine.setRate(1.0);
                ttsEngine.setPitch(1.0);
                ttsEngine.setVolume(0.8);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-4 py-2 bg-gray-600/20 text-gray-400 border border-gray-600/30 rounded-lg hover:text-white hover:border-white/30 transition-all duration-200"
              title="Reset to defaults"
            >
              <RotateCcw className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default VoiceControls;