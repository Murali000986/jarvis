import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings, HelpCircle, Zap, Bot } from 'lucide-react';
import { AICommandProcessor } from '../utils/aiCommandProcessor';

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
  const [showAdvancedExamples, setShowAdvancedExamples] = useState(false);

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

  const basicExamples = [
    "Open Chrome",
    "Scroll down",
    "What's the time?",
    "Search for restaurants",
    "Help"
  ];

  const advancedExamples = AICommandProcessor.getAdvancedCommandExamples();

  return (
    <div className="h-full flex flex-col p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-semibold flex items-center">
          <Bot className="w-6 h-6 mr-2 text-jarvis-blue" />
          AI Voice Control
        </h2>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => setShowAdvancedExamples(!showAdvancedExamples)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              showAdvancedExamples 
                ? 'bg-jarvis-blue/20 text-jarvis-blue border-jarvis-blue/30' 
                : 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:text-jarvis-blue hover:border-jarvis-blue/30'
            }`}
            title="Show advanced automation examples"
          >
            <Zap className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={() => setShowHelp(!showHelp)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              showHelp 
                ? 'bg-jarvis-blue/20 text-jarvis-blue border-jarvis-blue/30' 
                : 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:text-jarvis-blue hover:border-jarvis-blue/30'
            }`}
            title="Show basic command examples"
          >
            <HelpCircle className="w-4 h-4" />
          </motion.button>
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
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready for AI Commands'}
          </p>
          <p className="text-sm text-gray-400">
            {isListening 
              ? 'Speak your advanced automation command' 
              : 'Click the microphone to start AI-powered voice control'
            }
          </p>
        </div>

        {/* Command Examples */}
        {showAdvancedExamples ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-4 w-full max-h-64 overflow-y-auto scrollbar-hide"
          >
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Zap className="w-4 h-4 mr-2 text-jarvis-blue" />
              Advanced AI Automation
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {advancedExamples.slice(0, 16).map((example, index) => (
                <div key={index} className="py-1 px-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors">
                  "{example}"
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600/30">
              <p className="text-xs text-gray-500">
                🤖 AI-powered automation with intelligent command chaining and context understanding!
              </p>
            </div>
          </motion.div>
        ) : showHelp ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-4 w-full max-h-64 overflow-y-auto scrollbar-hide"
          >
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Volume2 className="w-4 h-4 mr-2 text-jarvis-blue" />
              Basic Commands
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {basicExamples.map((example, index) => (
                <div key={index} className="py-1 px-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors">
                  "{example}"
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-600/30">
              <p className="text-xs text-gray-500">
                💡 Click the ⚡ button to see advanced AI automation commands!
              </p>
            </div>
          </motion.div>
        ) : (
          <div className="glass-effect rounded-xl p-4 w-full">
            <h3 className="text-sm font-medium mb-3 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-jarvis-blue" />
              AI-Powered Quick Commands
            </h3>
            <div className="space-y-2 text-xs text-gray-400">
              <div>"Open Google and search AI news"</div>
              <div>"Research machine learning"</div>
              <div>"Play relaxing music"</div>
              <div>"Open my workspace"</div>
              <div>"Change voice to ChatGPT"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizer;