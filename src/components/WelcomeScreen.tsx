import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, Mic } from 'lucide-react';

const WelcomeScreen: React.FC = () => {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="h-full flex items-center justify-center relative safe-area-top safe-area-bottom"
    >
      {/* Animated Background */}
      <div className="absolute inset-0">
        {[...Array(isMobile ? 10 : 20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-jarvis-blue rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{ 
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              delay: Math.random() * 2,
              repeat: Infinity,
              repeatDelay: Math.random() * 3
            }}
          />
        ))}
      </div>

      <div className="text-center z-10 px-4">
        {/* Main Logo */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, type: "spring", stiffness: 100 }}
          className="mb-6 sm:mb-8"
        >
          <div className="relative">
            <div className={`${
              isMobile ? 'w-24 h-24' : 'w-32 h-32'
            } mx-auto rounded-full border-4 border-jarvis-blue animate-pulse-slow neon-glow`}></div>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className={`absolute ${
                isMobile ? 'inset-3' : 'inset-4'
              } border-2 border-jarvis-blue/50 rounded-full`}
            ></motion.div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Zap className={`${isMobile ? 'w-8 h-8' : 'w-12 h-12'} text-jarvis-blue`} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className={`font-bold mb-3 sm:mb-4 neon-text ${
            isMobile ? 'text-4xl' : 'text-6xl'
          }`}
        >
          JARVIS
        </motion.h1>

        <motion.p
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className={`text-gray-300 mb-6 sm:mb-8 ${
            isMobile ? 'text-base px-4' : 'text-xl'
          }`}
        >
          Just A Rather Very Intelligent System
        </motion.p>

        {/* Feature Icons */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.8 }}
          className={`flex justify-center ${
            isMobile ? 'space-x-6' : 'space-x-8'
          }`}
        >
          <div className="flex flex-col items-center">
            <Brain className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-jarvis-blue mb-2`} />
            <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>AI Powered</span>
          </div>
          <div className="flex flex-col items-center">
            <Mic className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-jarvis-blue mb-2`} />
            <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Voice Control</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap className={`${isMobile ? 'w-6 h-6' : 'w-8 h-8'} text-jarvis-blue mb-2`} />
            <span className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>Real-time</span>
          </div>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className={`${isMobile ? 'mt-8' : 'mt-12'}`}
        >
          <div className="flex justify-center space-x-2">
            <div className="typing-indicator"></div>
            <div className="typing-indicator"></div>
            <div className="typing-indicator"></div>
          </div>
          <p className={`text-gray-400 mt-4 ${isMobile ? 'text-sm' : 'text-sm'}`}>
            Initializing systems...
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default WelcomeScreen;