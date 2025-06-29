import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings } from 'lucide-react';

interface VoiceVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
  onToggleListening: () => void;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  isProcessing,
  onToggleListening
}) => {
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(20).fill(0));

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevels(prev => 
          prev.map(() => Math.random() * 100)
        );
      }, 100);
    } else {
      setAudioLevels(new Array(20).fill(0));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isListening]);

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Voice Control</h2>
        <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-jarvis-blue transition-colors" />
      </div>

      {/* Voice Visualizer */}
      <div className="flex-1 flex flex-col items-center justify-center space-y-8">
        {/* Audio Bars */}
        <div className="flex items-end justify-center space-x-1 h-32">
          {audioLevels.map((level, index) => (
            <motion.div
              key={index}
              className="w-2 bg-gradient-to-t from-jarvis-blue to-cyan-400 rounded-full"
              animate={{
                height: isListening ? `${Math.max(level, 10)}%` : '10%',
                opacity: isListening ? 1 : 0.3
              }}
              transition={{
                duration: 0.1,
                ease: "easeOut"
              }}
            />
          ))}
        </div>

        {/* Main Control Button */}
        <motion.button
          onClick={onToggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25' 
              : 'bg-gradient-to-r from-jarvis-blue to-cyan-400 shadow-lg shadow-jarvis-blue/25'
          }`}
        >
          {isListening ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-white" />
          )}
        </motion.button>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-lg font-medium mb-2">
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
          </p>
          <p className="text-sm text-gray-400">
            {isListening 
              ? 'Speak now or click to stop' 
              : 'Click the microphone to start voice input'
            }
          </p>
        </div>

        {/* Voice Commands Help */}
        <div className="glass-effect rounded-xl p-4 w-full">
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Volume2 className="w-4 h-4 mr-2 text-jarvis-blue" />
            Voice Commands
          </h3>
          <div className="space-y-2 text-xs text-gray-400">
            <div>"Hey Jarvis, open Chrome"</div>
            <div>"What's the weather today?"</div>
            <div>"Play some music"</div>
            <div>"Generate an image of..."</div>
            <div>"Search for..."</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceVisualizer;