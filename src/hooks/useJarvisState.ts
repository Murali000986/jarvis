import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';
import { enhancedTtsEngine } from '../utils/enhancedTextToSpeech';
import { aiService } from '../services/aiProviders';
import { AICommandProcessor } from '../utils/aiCommandProcessor';
import { advancedAutomationEngine } from '../utils/advancedAutomationEngine';

export const useJarvisState = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [currentVoiceProfile, setCurrentVoiceProfile] = useState('jarvis');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Hello! I\'m JARVIS, your advanced AI assistant with powerful automation capabilities. I can open applications, search multiple platforms, control your browser, and execute complex command chains. Try saying "Open Google and search AI news" or "Research machine learning" to see my advanced automation in action!',
      timestamp: new Date()
    }
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speakResponse = useCallback((text: string, emotion?: 'neutral' | 'excited' | 'calm' | 'urgent') => {
    setIsSpeaking(true);
    setCurrentStatus('Speaking...');
    
    enhancedTtsEngine.speak(text, {
      profile: currentVoiceProfile,
      emotion: emotion || 'neutral',
      onStart: () => {
        setIsSpeaking(true);
        setCurrentStatus('Speaking...');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentStatus('Ready');
      },
      onError: (error) => {
        if (error.error !== 'interrupted') {
          console.error('TTS Error:', error);
        }
        setIsSpeaking(false);
        setCurrentStatus('Ready');
      }
    });
  }, [currentVoiceProfile]);

  const startListening = useCallback(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setCurrentStatus('Listening...');
        enhancedTtsEngine.stop();
        setIsSpeaking(false);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          processAdvancedCommand(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        setCurrentStatus('Error occurred');
      };

      recognition.onend = () => {
        setIsListening(false);
        setCurrentStatus('Ready');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } else {
      alert('Speech recognition not supported in this browser');
    }
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
    setCurrentStatus('Ready');
  }, []);

  const processAdvancedCommand = useCallback(async (transcript: string) => {
    setIsProcessing(true);
    setCurrentStatus('Processing...');
    
    const userMessage: Message = {
      type: 'user',
      content: transcript,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Check for voice profile changes
      if (transcript.toLowerCase().includes('change voice to') || transcript.toLowerCase().includes('switch voice to')) {
        const voiceMatch = transcript.match(/(?:change|switch)\s+voice\s+to\s+(\w+)/i);
        if (voiceMatch) {
          const requestedProfile = voiceMatch[1].toLowerCase();
          const availableProfiles = enhancedTtsEngine.getAvailableProfiles();
          const profile = availableProfiles.find(p => p.name.toLowerCase().includes(requestedProfile));
          
          if (profile) {
            setCurrentVoiceProfile(requestedProfile);
            enhancedTtsEngine.setVoiceProfile(requestedProfile);
            const response = `Voice changed to ${profile.name} profile.`;
            
            const assistantMessage: Message = {
              type: 'assistant',
              content: response,
              timestamp: new Date()
            };
            
            setMessages(prev => [...prev, assistantMessage]);
            setIsProcessing(false);
            setCurrentStatus('Ready');
            speakResponse(response);
            return;
          }
        }
      }

      // Parse advanced automation command
      const advancedCommand = AICommandProcessor.parseAdvancedCommand(transcript);
      
      if (advancedCommand) {
        setCurrentStatus('Executing advanced automation...');
        const automationResult = await advancedAutomationEngine.executeAdvancedCommand(advancedCommand);
        
        let response = '';
        let emotion: 'neutral' | 'excited' | 'calm' | 'urgent' = 'neutral';
        
        if (automationResult.success) {
          response = automationResult.message;
          emotion = 'excited';
          
          // Add contextual responses for different automation types
          if (advancedCommand.type === 'openAndSearch') {
            response += '. The search results should be loading now.';
          } else if (advancedCommand.type === 'multiTab') {
            response += '. All tabs have been opened for your research.';
          } else if (advancedCommand.type === 'socialMedia') {
            response += '. Your social media platforms are now accessible.';
          }
        } else {
          response = `I encountered an issue: ${automationResult.message}. Let me try a different approach.`;
          emotion = 'calm';
        }
        
        const assistantMessage: Message = {
          type: 'assistant',
          content: response,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        setIsProcessing(false);
        setCurrentStatus('Ready');
        speakResponse(response, emotion);
      } else {
        // Handle special commands
        if (transcript.toLowerCase().includes('help') || transcript.toLowerCase().includes('what can you do')) {
          const helpResponse = AICommandProcessor.getAIAutomationHelp();
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: helpResponse,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
          speakResponse('I can help you with advanced automation, web control, and intelligent command chaining. Check the chat for detailed examples.', 'excited');
        } else {
          // Use AI service for general queries
          setCurrentStatus('Thinking...');
          const aiResponse = await aiService.generateResponse(transcript);
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: aiResponse.content,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
          speakResponse(aiResponse.content);
        }
      }
    } catch (error: any) {
      console.error('Advanced Command Processing Error:', error);
      
      const errorMessage: Message = {
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your advanced request: ${error.message || 'Unknown error'}. Please try again with a different command.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      setCurrentStatus('Error occurred');
      speakResponse('I apologize for the error. Please try again.', 'calm');
    }
  }, [speakResponse, currentVoiceProfile]);

  const sendMessage = useCallback(async (content: string) => {
    await processAdvancedCommand(content);
  }, [processAdvancedCommand]);

  const changeVoiceProfile = useCallback((profileName: string) => {
    const success = enhancedTtsEngine.setVoiceProfile(profileName);
    if (success) {
      setCurrentVoiceProfile(profileName);
      const profile = enhancedTtsEngine.getCurrentProfile();
      speakResponse(`Voice changed to ${profile.name} profile.`);
    }
  }, [speakResponse]);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    currentStatus,
    currentVoiceProfile,
    messages,
    startListening,
    stopListening,
    sendMessage,
    speakResponse,
    changeVoiceProfile,
    availableVoiceProfiles: enhancedTtsEngine.getAvailableProfiles()
  };
};