import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings, HelpCircle, Zap, Bot } from 'lucide-react';
import { AICommandProcessor } from '../utils/aiCommandProcessor';

interface VoiceVisualizerProps {
  isListening: boolean;
  isProcessing: boolean;
  onToggleListening: () => void;
  isMobile?: boolean;
  isTablet?: boolean;
  orientation?: 'portrait' | 'landscape';
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({
  isListening,
  isProcessing,
  onToggleListening,
  isMobile = false,
  isTablet = false,
  orientation = 'portrait'
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

  // Responsive classes
  const getContainerClasses = () => {
    if (isMobile && orientation === 'landscape') {
      return 'h-full flex flex-col p-3 mobile-voice-container';
    } else if (isTablet) {
      return 'h-full flex flex-col p-4';
    }
    return 'h-full flex flex-col p-6';
  };

  const getHeaderClasses = () => {
    if (isMobile) {
      return 'flex items-center justify-between mb-4';
    }
    return 'flex items-center justify-between mb-6 sm:mb-8';
  };

  const getTitleClasses = () => {
    if (isMobile) {
      return 'text-lg font-semibold flex items-center';
    }
    return 'text-xl font-semibold flex items-center';
  };

  const getVisualizerHeight = () => {
    if (isMobile && orientation === 'landscape') {
      return 'h-16';
    } else if (isMobile) {
      return 'h-24';
    }
    return 'h-32';
  };

  const getButtonSize = () => {
    if (isMobile) {
      return 'w-16 h-16';
    }
    return 'w-20 h-20';
  };

  const getIconSize = () => {
    if (isMobile) {
      return 'w-6 h-6';
    }
    return 'w-8 h-8';
  };

  const getAudioBarCount = () => {
    if (isMobile) {
      return Math.min(audioLevels.length, 12);
    }
    return audioLevels.length;
  };

  return (
    <div className={getContainerClasses()}>
      {/* Header */}
      <div className={getHeaderClasses()}>
        <h2 className={getTitleClasses()}>
          <Bot className={`${isMobile ? 'w-5 h-5' : 'w-6 h-6'} mr-2 text-jarvis-blue`} />
          {isMobile ? 'Voice' : 'AI Voice Control'}
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
          {!isMobile && (
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
          )}
        </div>
      </div>

      {/* Voice Visualizer */}
      <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'space-y-4' : 'space-y-8'}`}>
        {/* Siri-like Audio Visualization */}
        <div className={`flex items-end justify-center space-x-1 ${getVisualizerHeight()} relative`}>
          {/* Background glow effect */}
          {isListening && (
            <motion.div
              className="absolute inset-0 bg-jarvis-blue/10 rounded-full blur-xl"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          )}
          
          {/* Audio bars with Siri-like animation */}
          {audioLevels.slice(0, getAudioBarCount()).map((level, index) => (
            <motion.div
              key={index}
              className={`${isMobile ? 'w-1.5' : 'w-2'} rounded-full ${
                isListening 
                  ? 'bg-gradient-to-t from-jarvis-blue via-cyan-400 to-white' 
                  : 'bg-gradient-to-t from-gray-600 to-gray-400'
              }`}
              animate={{
                height: isListening ? `${Math.max(level, 10)}%` : '10%',
                opacity: isListening ? 1 : 0.3,
                scaleY: isListening ? [1, 1.2, 1] : 1
              }}
              transition={{
                height: { duration: 0.1, ease: "easeOut" },
                scaleY: { 
                  duration: 0.5 + (index * 0.05), 
                  repeat: isListening ? Infinity : 0,
                  repeatType: "reverse",
                  ease: "easeInOut"
                }
              }}
            />
          ))}
        </div>

        {/* Main Control Button with Enhanced Animation */}
        <motion.button
          onClick={onToggleListening}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${getButtonSize()} rounded-full flex items-center justify-center transition-all duration-300 relative ${
            isListening 
              ? 'bg-gradient-to-r from-red-500 to-red-600 shadow-lg shadow-red-500/25' 
              : 'bg-gradient-to-r from-jarvis-blue to-cyan-400 shadow-lg shadow-jarvis-blue/25'
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
          
          {/* Processing animation */}
          {isProcessing && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-jarvis-blue"
              animate={{ rotate: 360 }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear"
              }}
            />
          )}

          {isListening ? (
            <MicOff className={`${getIconSize()} text-white`} />
          ) : (
            <Mic className={`${getIconSize()} text-white`} />
          )}
        </motion.button>

        {/* Status Text with Enhanced Styling */}
        <div className="text-center">
          <motion.p 
            className={`font-medium mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}
            animate={isListening ? { 
              color: ['#ffffff', '#00d4ff', '#ffffff'],
              textShadow: ['0 0 0px #00d4ff', '0 0 10px #00d4ff', '0 0 0px #00d4ff']
            } : {}}
            transition={isListening ? { duration: 2, repeat: Infinity } : {}}
          >
            {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
          </motion.p>
          <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {isListening 
              ? 'Speak your command' 
              : 'Tap to start voice control'
            }
          </p>
        </div>

        {/* Command Examples - Responsive */}
        {(showAdvancedExamples || showHelp) && !isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-4 w-full max-h-48 overflow-y-auto scrollbar-hide"
          >
            <h3 className="text-sm font-medium mb-3 flex items-center">
              {showAdvancedExamples ? (
                <>
                  <Zap className="w-4 h-4 mr-2 text-jarvis-blue" />
                  Advanced AI Automation
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2 text-jarvis-blue" />
                  Basic Commands
                </>
              )}
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {(showAdvancedExamples ? advancedExamples.slice(0, 12) : basicExamples).map((example, index) => (
                <motion.div 
                  key={index} 
                  className="py-1 px-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02, backgroundColor: 'rgba(0, 212, 255, 0.1)' }}
                >
                  "{example}"
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Mobile Quick Commands */}
        {isMobile && (
          <div className="glass-effect rounded-xl p-3 w-full">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-jarvis-blue" />
              Quick Commands
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div>"Open Google and search AI"</div>
              <div>"Play music"</div>
              <div>"What's the time?"</div>
              <div>"Help"</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizer;