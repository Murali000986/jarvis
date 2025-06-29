import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play, 
  Pause, 
  Square, 
  Settings,
  ArrowUp,
  ArrowDown,
  MousePointer,
  Zap,
  Target,
  Percent
} from 'lucide-react';
import { advancedScrollEngine } from '../utils/advancedScrollEngine';

interface ScrollControlsProps {
  isVisible: boolean;
  onToggle: () => void;
  isMobile?: boolean;
}

const ScrollControls: React.FC<ScrollControlsProps> = ({ 
  isVisible, 
  onToggle, 
  isMobile = false 
}) => {
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [scrollSpeed, setScrollSpeed] = useState(1000);
  const [scrollAmount, setScrollAmount] = useState(300);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [scrollPercentage, setScrollPercentage] = useState(0);

  useEffect(() => {
    const updateScrollPercentage = () => {
      setScrollPercentage(advancedScrollEngine.getScrollPercentage());
    };

    const checkScrolling = () => {
      setIsAutoScrolling(advancedScrollEngine.isCurrentlyScrolling());
    };

    const interval = setInterval(() => {
      updateScrollPercentage();
      checkScrolling();
    }, 100);

    window.addEventListener('scroll', updateScrollPercentage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', updateScrollPercentage);
    };
  }, []);

  const handleScroll = async (direction: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom') => {
    await advancedScrollEngine.executeScrollCommand({
      type: 'scroll',
      direction,
      amount: scrollAmount,
      smooth: true
    });
  };

  const handleAutoScroll = async (direction: 'up' | 'down') => {
    if (isAutoScrolling) {
      advancedScrollEngine.stopScrolling();
      setIsAutoScrolling(false);
    } else {
      await advancedScrollEngine.executeScrollCommand({
        type: 'autoScroll',
        direction,
        speed: scrollSpeed,
        continuous: true
      });
      setIsAutoScrolling(true);
    }
  };

  const handleSmartScroll = async (direction: 'up' | 'down') => {
    await advancedScrollEngine.executeScrollCommand({
      type: 'smartScroll',
      direction
    });
  };

  const handleScrollToPercentage = async (percentage: number) => {
    advancedScrollEngine.scrollToPercentage(percentage);
  };

  const stopScrolling = () => {
    advancedScrollEngine.stopScrolling();
    setIsAutoScrolling(false);
  };

  if (!isVisible) {
    return (
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`fixed ${
          isMobile ? 'bottom-20 left-4' : 'bottom-8 left-8'
        } z-50 p-3 bg-gradient-to-r from-purple-600 to-purple-700 rounded-full shadow-lg border border-purple-500/30`}
        title="Show scroll controls"
      >
        <MousePointer className="w-5 h-5 text-white" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`fixed ${
        isMobile ? 'bottom-4 left-4 right-4' : 'bottom-8 left-8'
      } z-50 glass-effect rounded-xl border border-white/20 p-4 ${
        isMobile ? 'max-w-full' : 'w-80'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <MousePointer className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-semibold text-white">Scroll Controls</h3>
        </div>
        <div className="flex items-center space-x-2">
          <motion.button
            onClick={() => setShowAdvanced(!showAdvanced)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`p-2 rounded-lg transition-colors ${
              showAdvanced 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-gray-600/20 text-gray-400 hover:text-purple-400'
            }`}
            title="Advanced options"
          >
            <Settings className="w-4 h-4" />
          </motion.button>
          <motion.button
            onClick={onToggle}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-gray-600/20 text-gray-400 hover:text-white transition-colors"
            title="Hide controls"
          >
            <ChevronLeft className="w-4 h-4" />
          </motion.button>
        </div>
      </div>

      {/* Auto-scroll status */}
      {isAutoScrolling && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <RotateCcw className="w-4 h-4 text-orange-400" />
              </motion.div>
              <span className="text-sm text-orange-400 font-medium">Auto-scrolling active</span>
            </div>
            <motion.button
              onClick={stopScrolling}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
              title="Stop auto-scrolling"
            >
              <Square className="w-4 h-4" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {/* Scroll Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Scroll Progress</span>
          <span className="text-sm text-purple-400 font-medium">
            {Math.round(scrollPercentage)}%
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <motion.div
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full"
            style={{ width: `${scrollPercentage}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="flex justify-between mt-2">
          {[0, 25, 50, 75, 100].map((percent) => (
            <motion.button
              key={percent}
              onClick={() => handleScrollToPercentage(percent)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="text-xs text-gray-400 hover:text-purple-400 transition-colors"
            >
              {percent}%
            </motion.button>
          ))}
        </div>
      </div>

      {/* Basic Controls */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        {/* Top Row */}
        <div></div>
        <motion.button
          onClick={() => handleScroll('up')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          title="Scroll up"
        >
          <ChevronUp className="w-5 h-5 mx-auto" />
        </motion.button>
        <div></div>

        {/* Middle Row */}
        <motion.button
          onClick={() => handleScroll('left')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          title="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 mx-auto" />
        </motion.button>
        <motion.button
          onClick={() => handleScroll('top')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
          title="Scroll to top"
        >
          <ArrowUp className="w-5 h-5 mx-auto" />
        </motion.button>
        <motion.button
          onClick={() => handleScroll('right')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          title="Scroll right"
        >
          <ChevronRight className="w-5 h-5 mx-auto" />
        </motion.button>

        {/* Bottom Row */}
        <div></div>
        <motion.button
          onClick={() => handleScroll('down')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-lg hover:bg-blue-500/30 transition-colors"
          title="Scroll down"
        >
          <ChevronDown className="w-5 h-5 mx-auto" />
        </motion.button>
        <motion.button
          onClick={() => handleScroll('bottom')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-lg hover:bg-purple-500/30 transition-colors"
          title="Scroll to bottom"
        >
          <ArrowDown className="w-5 h-5 mx-auto" />
        </motion.button>
      </div>

      {/* Auto-scroll Controls */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <motion.button
          onClick={() => handleAutoScroll('up')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
            isAutoScrolling 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
          }`}
          title={isAutoScrolling ? "Stop auto-scroll" : "Auto-scroll up"}
        >
          {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <ChevronUp className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => handleAutoScroll('down')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`p-3 rounded-lg border transition-colors flex items-center justify-center space-x-2 ${
            isAutoScrolling 
              ? 'bg-red-500/20 text-red-400 border-red-500/30' 
              : 'bg-green-500/20 text-green-400 border-green-500/30 hover:bg-green-500/30'
          }`}
          title={isAutoScrolling ? "Stop auto-scroll" : "Auto-scroll down"}
        >
          {isAutoScrolling ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Smart Scroll Controls */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <motion.button
          onClick={() => handleSmartScroll('up')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center justify-center space-x-2"
          title="Smart scroll to previous section"
        >
          <Zap className="w-4 h-4" />
          <ChevronUp className="w-4 h-4" />
        </motion.button>
        <motion.button
          onClick={() => handleSmartScroll('down')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-lg hover:bg-cyan-500/30 transition-colors flex items-center justify-center space-x-2"
          title="Smart scroll to next section"
        >
          <Zap className="w-4 h-4" />
          <ChevronDown className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Advanced Settings */}
      <AnimatePresence>
        {showAdvanced && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-gray-600/30 pt-4"
          >
            <h4 className="text-sm font-medium text-gray-300 mb-3">Advanced Settings</h4>
            
            {/* Scroll Speed */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">
                Auto-scroll Speed: {scrollSpeed}ms
              </label>
              <input
                type="range"
                min="500"
                max="3000"
                step="100"
                value={scrollSpeed}
                onChange={(e) => setScrollSpeed(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Fast</span>
                <span>Slow</span>
              </div>
            </div>

            {/* Scroll Amount */}
            <div className="mb-3">
              <label className="block text-xs text-gray-400 mb-1">
                Scroll Amount: {scrollAmount}px
              </label>
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={scrollAmount}
                onChange={(e) => setScrollAmount(parseInt(e.target.value))}
                className="w-full accent-purple-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Small</span>
                <span>Large</span>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-3 gap-2">
              <motion.button
                onClick={() => {
                  setScrollSpeed(3000);
                  setScrollAmount(200);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded text-xs hover:bg-blue-500/30 transition-colors"
              >
                Slow
              </motion.button>
              <motion.button
                onClick={() => {
                  setScrollSpeed(1500);
                  setScrollAmount(300);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded text-xs hover:bg-green-500/30 transition-colors"
              >
                Normal
              </motion.button>
              <motion.button
                onClick={() => {
                  setScrollSpeed(500);
                  setScrollAmount(500);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded text-xs hover:bg-red-500/30 transition-colors"
              >
                Fast
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice Commands Help */}
      <div className="mt-4 p-3 bg-gray-800/30 rounded-lg">
        <h4 className="text-xs font-medium text-gray-300 mb-2">Voice Commands:</h4>
        <div className="text-xs text-gray-400 space-y-1">
          <div>"Auto scroll down"</div>
          <div>"Smart scroll to next section"</div>
          <div>"Scroll to top"</div>
          <div>"Stop scrolling"</div>
        </div>
      </div>
    </motion.div>
  );
};

export default ScrollControls;