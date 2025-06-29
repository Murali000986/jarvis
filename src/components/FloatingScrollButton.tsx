import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronUp, ChevronDown, MousePointer, Zap } from 'lucide-react';
import { advancedScrollEngine } from '../utils/advancedScrollEngine';

interface FloatingScrollButtonProps {
  isMobile?: boolean;
}

const FloatingScrollButton: React.FC<FloatingScrollButtonProps> = ({ isMobile = false }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      
      setShowScrollTop(scrollTop > 300);
      setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 300);
    };

    const checkAutoScroll = () => {
      setIsAutoScrolling(advancedScrollEngine.isCurrentlyScrolling());
    };

    const interval = setInterval(checkAutoScroll, 500);
    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearInterval(interval);
    };
  }, []);

  const scrollToTop = () => {
    advancedScrollEngine.executeScrollCommand({
      type: 'scroll',
      direction: 'top',
      smooth: true
    });
  };

  const scrollToBottom = () => {
    advancedScrollEngine.executeScrollCommand({
      type: 'scroll',
      direction: 'bottom',
      smooth: true
    });
  };

  const startAutoScroll = () => {
    advancedScrollEngine.executeScrollCommand({
      type: 'autoScroll',
      direction: 'down',
      speed: 1500,
      continuous: true
    });
  };

  const smartScroll = () => {
    advancedScrollEngine.executeScrollCommand({
      type: 'smartScroll',
      direction: 'down'
    });
  };

  const stopScrolling = () => {
    advancedScrollEngine.stopScrolling();
  };

  return (
    <div className={`fixed ${isMobile ? 'bottom-24 right-4' : 'bottom-8 right-8'} z-40 flex flex-col space-y-2`}>
      {/* Auto-scroll status */}
      <AnimatePresence>
        {isAutoScrolling && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={stopScrolling}
            className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-full shadow-lg backdrop-blur-md hover:bg-red-500/30 transition-colors"
            title="Stop auto-scrolling"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <MousePointer className="w-5 h-5" />
            </motion.div>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Smart scroll button */}
      <motion.button
        onClick={smartScroll}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-3 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 rounded-full shadow-lg backdrop-blur-md hover:bg-cyan-500/30 transition-colors"
        title="Smart scroll to next section"
      >
        <Zap className="w-5 h-5" />
      </motion.button>

      {/* Auto-scroll button */}
      <motion.button
        onClick={startAutoScroll}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="p-3 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full shadow-lg backdrop-blur-md hover:bg-green-500/30 transition-colors"
        title="Start auto-scrolling"
      >
        <motion.div
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-5 h-5" />
        </motion.div>
      </motion.button>

      {/* Scroll to bottom */}
      <AnimatePresence>
        {showScrollBottom && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToBottom}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full shadow-lg backdrop-blur-md hover:bg-purple-500/30 transition-colors"
            title="Scroll to bottom"
          >
            <ChevronDown className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scroll to top */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={scrollToTop}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-3 bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded-full shadow-lg backdrop-blur-md hover:bg-blue-500/30 transition-colors"
            title="Scroll to top"
          >
            <ChevronUp className="w-5 h-5" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingScrollButton;