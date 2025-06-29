import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings, HelpCircle } from 'lucide-react';
import { EnhancedCommandProcessor } from '../utils/enhancedCommandProcessor';

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
  const [showHelp, setShowHelp] = useState(false);

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

  const commandExamples = EnhancedCommandProcessor.getCommandExamples();

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold">Voice Control</h2>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => setShowHelp(!showHelp)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-600/20 text-gray-400 border border-gray-600/30 hover:text-jarvis-blue hover:border-jarvis-blue/30 transition-all duration-200"
            title="Show command examples"
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>
          <Settings className="w-5 h-5 text-gray-400 cursor-pointer hover:text-jarvis-blue transition-colors" />
        </div>
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

        {/* Command Examples or Help */}
        {showHelp ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-4 w-full max-h-64 overflow-y-auto scrollbar-hide"
          >
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Volume2 className="w-4 h-4 mr-2 text-jarvis-blue" />
              Command Examples
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {commandExamples.slice(0, 12).map((example, index) => (
                <div key={index} className="py-1 px-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors">
                  "{example}"
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600/30">
              <p className="text-xs text-gray-500">
                Try any of these commands or ask me anything naturally!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="glass-effect rounded-xl p-4 w-full">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Volume2 className="w-4 h-4 mr-2 text-jarvis-blue" />
              Quick Commands
            </h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div>"Open Chrome"</div>
              <div>"Scroll down"</div>
              <div>"What's the time?"</div>
              <div>"Search for restaurants"</div>
              <div>"Help" - Show all commands</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizer;