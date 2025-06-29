import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Wifi, Battery, Clock, Volume2, Menu } from 'lucide-react';
import VoiceControls from './VoiceControls';
import VoiceProfileSelector from './VoiceProfileSelector';

interface StatusBarProps {
  status: string;
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking?: boolean;
  currentVoiceProfile?: string;
  onVoiceProfileChange?: (profile: string) => void;
  isMobile?: boolean;
  isTablet?: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ 
  status, 
  isListening, 
  isProcessing, 
  isSpeaking = false,
  currentVoiceProfile = 'jarvis',
  onVoiceProfileChange,
  isMobile = false,
  isTablet = false
}) => {
  const [currentTime, setCurrentTime] = React.useState(new Date());
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

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

  const getContainerClasses = () => {
    if (isMobile) {
      return 'glass-effect border-b border-white/10 px-3 py-2 mobile-status-bar safe-area-top';
    }
    return 'glass-effect border-b border-white/10 px-4 py-3 sm:px-6';
  };

  const getStatusTextSize = () => {
    return isMobile ? 'text-xs' : 'text-sm';
  };

  const getSystemInfoSize = () => {
    return isMobile ? 'text-xs' : 'text-sm';
  };

  if (isMobile) {
    return (
      <div className={getContainerClasses()}>
        <div className="flex items-center justify-between">
          {/* Left Side - Status (Mobile) */}
          <div className="flex items-center space-x-2">
            <motion.div 
              className={`flex items-center space-x-1 ${getStatusColor()}`}
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {getStatusIcon()}
              <span className={`font-medium ${getStatusTextSize()}`}>
                {status.length > 15 ? status.substring(0, 15) + '...' : status}
              </span>
            </motion.div>
          </div>

          {/* Right Side - Time and Menu */}
          <div className="flex items-center space-x-3">
            <div className={`flex items-center space-x-1 text-gray-400 ${getSystemInfoSize()}`}>
              <Clock className="w-3 h-3" />
              <span>{currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
            
            <motion.button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-1 rounded-lg bg-gray-600/20 text-gray-400 border border-gray-600/30"
            >
              <Menu className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {showMobileMenu && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 p-3 glass-effect rounded-lg border border-white/10"
          >
            <div className="space-y-3">
              {/* Voice Profile Selector */}
              {onVoiceProfileChange && (
                <div>
                  <label className="text-xs text-gray-400 mb-1 block">Voice Profile</label>
                  <VoiceProfileSelector
                    currentProfile={currentVoiceProfile}
                    onProfileChange={onVoiceProfileChange}
                    className="w-full"
                  />
                </div>
              )}
              
              {/* System Info */}
              <div className="flex items-center justify-between text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Wifi className="w-3 h-3 text-green-400" />
                  <span>Connected</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Battery className="w-3 h-3 text-green-400" />
                  <span>100%</span>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 text-center">
                JARVIS AI System v4.0
              </div>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className={getContainerClasses()}>
      <div className="flex items-center justify-between">
        {/* Left Side - Status */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className={`flex items-center space-x-2 ${getStatusColor()}`}
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            {getStatusIcon()}
            <span className={`font-medium ${getStatusTextSize()}`}>{status}</span>
          </motion.div>
          
          <div className="h-4 w-px bg-white/20"></div>
          
          <div className={`text-gray-400 ${getSystemInfoSize()}`}>
            JARVIS AI System v4.0 - Advanced Automation
          </div>
        </div>

        {/* Right Side - Controls & System Info */}
        <div className="flex items-center space-x-4 sm:space-x-6">
          {/* Voice Profile Selector */}
          {onVoiceProfileChange && !isTablet && (
            <VoiceProfileSelector
              currentProfile={currentVoiceProfile}
              onProfileChange={onVoiceProfileChange}
            />
          )}
          
          {!isMobile && <VoiceControls />}
          
          <div className={`flex items-center space-x-2 text-gray-400 ${getSystemInfoSize()}`}>
            <Wifi className="w-4 h-4 text-green-400" />
            <span>Connected</span>
          </div>
          
          <div className={`flex items-center space-x-2 text-gray-400 ${getSystemInfoSize()}`}>
            <Battery className="w-4 h-4 text-green-400" />
            <span>100%</span>
          </div>
          
          <div className={`flex items-center space-x-2 text-gray-400 ${getSystemInfoSize()}`}>
            <Clock className="w-4 h-4" />
            <span>{currentTime.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;