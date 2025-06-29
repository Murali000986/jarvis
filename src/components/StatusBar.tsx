import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, Battery, Clock, Volume2 } from 'lucide-react';
import VoiceControls from './VoiceControls';

interface StatusBarProps {
  status: string;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  status, 
  isListening, 
  isProcessing, 
  isSpeaking = false 
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = () => {
    if (isSpeaking) return 'text-green-400';
    if (isProcessing) return 'text-yellow-400';
    if (isListening) return 'text-blue-400';
    return 'text-jarvis-blue';
  };

  const getStatusIcon = () => {
    if (isSpeaking) return <Volume2 className="w-4 h-4 animate-pulse" />;
    if (isProcessing) return <Activity className="w-4 h-4 animate-pulse" />;
    if (isListening) return <Activity className="w-4 h-4 animate-bounce" />;
    return <Activity className="w-4 h-4" />;
  };

  return (
    <div className="glass-effect border-b border-white/10 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Status */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className={`flex items-center space-x-2 ${getStatusColor()}`}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getStatusIcon()}
            <span className="text-sm font-medium">{status}</span>
          </motion.div>
          
          <div className="h-4 w-px bg-white/20"></div>
          
          <div className="text-sm text-gray-400">
            JARVIS AI System v3.0
          </div>
        </div>

        {/* Right Side - System Info & Voice Controls */}
        <div className="flex items-center space-x-6">
          <VoiceControls />
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Wifi className="w-4 h-4 text-green-400" />
            <span>Connected</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Battery className="w-4 h-4 text-green-400" />
            <span>100%</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;