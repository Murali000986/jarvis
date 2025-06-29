import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff, Volume2, Settings, HelpCircle, Zap, Bot, Scroll, StopCircle } from 'lucide-react';
import { EnhancedCommandProcessor } from '../utils/enhancedCommandProcessor';
import { advancedScrollEngine } from '../utils/advancedScrollEngine';

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
  const [showScrollHelp, setShowScrollHelp] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

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

  // Check if auto-scrolling is active
  useEffect(() => {
    const checkScrolling = setInterval(() => {
      setIsAutoScrolling(advancedScrollEngine.isCurrentlyScrolling());
    }, 500);

    return () => clearInterval(checkScrolling);
  }, []);

  const basicExamples = [
    "Open Chrome",
    "Auto scroll down",
    "What's the time?",
    "Search for restaurants",
    "Help"
  ];

  const advancedExamples = EnhancedCommandProcessor.getEnhancedCommandExamples();
  const scrollExamples = [
    "Auto scroll down",
    "Smart scroll to next section",
    "Scroll to top",
    "Keep scrolling for 10 seconds",
    "Scroll to main content",
    "Stop scrolling"
  ];

  const stopAutoScrolling = () => {
    advancedScrollEngine.stopScrolling();
    setIsAutoScrolling(false);
  };

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
          {isMobile ? 'AI Voice' : 'Enhanced AI Control'}
        </h2>
        <div className="flex space-x-2">
          <motion.button
            onClick={() => setShowScrollHelp(!showScrollHelp)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg border transition-all duration-200 ${
              showScrollHelp 
                ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' 
                : 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:text-purple-400 hover:border-purple-500/30'
            }`}
            title="Show scroll commands"
          >
            <Scroll className="w-4 h-4" />
          </motion.button>
          
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
                  ? 'bg-green-500/20 text-green-400 border-green-500/30' 
                  : 'bg-gray-600/20 text-gray-400 border-gray-600/30 hover:text-green-400 hover:border-green-500/30'
              }`}
              title="Show basic command examples"
            >
              <HelpCircle className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </div>

      {/* Auto-scroll status indicator */}
      {isAutoScrolling && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 glass-effect rounded-lg border border-orange-500/30 bg-orange-500/10"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Scroll className="w-4 h-4 text-orange-400" />
              </motion.div>
              <span className="text-sm text-orange-400 font-medium">Auto-scrolling active</span>
            </div>
            <motion.button
              onClick={stopAutoScrolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Stop auto-scrolling"
            >
              <StopCircle className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Voice Visualizer */}
      <div className={`flex-1 flex flex-col items-center justify-center ${isMobile ? 'space-y-4' : 'space-y-8'}`}>
        {/* Enhanced Audio Visualization */}
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
          
          {/* Audio bars with enhanced animation */}
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
                scaleY: isListening ? [1, 1.2, 1] : 1,
                boxShadow: isListening ? [
                  '0 0 0px rgba(0, 212, 255, 0)',
                  '0 0 10px rgba(0, 212, 255, 0.5)',
                  '0 0 0px rgba(0, 212, 255, 0)'
                ] : '0 0 0px rgba(0, 212, 255, 0)'
              }}
              transition={{
                height: { duration: 0.1, ease: "easeOut" },
                scaleY: { 
                  duration: 0.5 + (index * 0.05), 
                  repeat: isListening ? Infinity : 0,
                  repeatType: "reverse",
                  ease: "easeInOut"
                },
                boxShadow: {
                  duration: 1,
                  repeat: isListening ? Infinity : 0,
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
          {/* Enhanced pulse animation when listening */}
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
              <motion.div
                className="absolute inset-0 rounded-full border border-red-300"
                animate={{
                  scale: [1, 2.1, 1],
                  opacity: [0.4, 0.05, 0.4]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.6
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

        {/* Enhanced Status Text */}
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
              ? 'Speak your enhanced command' 
              : 'Tap to start advanced voice control'
            }
          </p>
        </div>

        {/* Command Examples - Enhanced with categories */}
        {(showScrollHelp || showAdvancedExamples || showHelp) && !isMobile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="glass-effect rounded-xl p-4 w-full max-h-64 overflow-y-auto scrollbar-hide"
          >
            <h3 className="text-sm font-medium mb-3 flex items-center">
              {showScrollHelp ? (
                <>
                  <Scroll className="w-4 h-4 mr-2 text-purple-400" />
                  Advanced Scroll Commands
                </>
              ) : showAdvancedExamples ? (
                <>
                  <Zap className="w-4 h-4 mr-2 text-jarvis-blue" />
                  Enhanced AI Automation
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2 text-green-400" />
                  Basic Commands
                </>
              )}
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              {(showScrollHelp ? scrollExamples : 
                showAdvancedExamples ? advancedExamples.slice(0, 12) : 
                basicExamples).map((example, index) => (
                <motion.div 
                  key={index} 
                  className="py-1 px-2 rounded bg-gray-800/30 hover:bg-gray-700/30 transition-colors cursor-pointer"
                  whileHover={{ 
                    scale: 1.02, 
                    backgroundColor: showScrollHelp ? 'rgba(168, 85, 247, 0.1)' :
                                   showAdvancedExamples ? 'rgba(0, 212, 255, 0.1)' :
                                   'rgba(34, 197, 94, 0.1)'
                  }}
                >
                  "{example}"
                </motion.div>
              ))}
            </div>
            
            {showScrollHelp && (
              <div className="mt-3 pt-3 border-t border-gray-600/30">
                <p className="text-xs text-purple-300">
                  💡 Advanced scrolling with auto-scroll, smart content detection, and voice control
                </p>
              </div>
            )}
            
            {showAdvancedExamples && (
              <div className="mt-3 pt-3 border-t border-gray-600/30">
                <p className="text-xs text-jarvis-blue">
                  🚀 Multi-platform operations, workflow automation, and intelligent web control
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Mobile Quick Commands with Enhanced Categories */}
        {isMobile && (
          <div className="glass-effect rounded-xl p-3 w-full">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Bot className="w-4 h-4 mr-2 text-jarvis-blue" />
              Enhanced Commands
            </h3>
            <div className="space-y-1 text-xs text-gray-400">
              <div className="text-purple-400">"Auto scroll down"</div>
              <div className="text-jarvis-blue">"Open Google and search AI"</div>
              <div className="text-green-400">"Start research mode"</div>
              <div className="text-orange-400">"Open my workspace"</div>
              <div className="text-cyan-400">"Help" - Show all commands</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceVisualizer;