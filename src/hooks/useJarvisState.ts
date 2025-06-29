import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';
import { enhancedTtsEngine } from '../utils/enhancedTextToSpeech';
import { aiService } from '../services/aiProviders';
import { EnhancedCommandProcessor } from '../utils/enhancedCommandProcessor';
import { enhancedAutomationEngine } from '../utils/enhancedAutomationEngine';
import { advancedScrollEngine } from '../utils/advancedScrollEngine';

export const useJarvisState = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [currentVoiceProfile, setCurrentVoiceProfile] = useState('jarvis');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Welcome. I am JARVIS, your enhanced artificial intelligence assistant with advanced automation capabilities. I can help you with intelligent web control, multi-platform operations, smart scrolling, and comprehensive research assistance. How may I assist you today?',
      timestamp: new Date()
    }
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // Chat history management
  const loadChatSession = useCallback((sessionMessages: Message[]) => {
    setMessages(sessionMessages);
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([
      {
        type: 'assistant',
        content: 'Welcome. I am JARVIS, your enhanced artificial intelligence assistant with advanced automation capabilities. I can help you with intelligent web control, multi-platform operations, smart scrolling, and comprehensive research assistance. How may I assist you today?',
        timestamp: new Date()
      }
    ]);
    localStorage.removeItem('jarvis-current-session-id');
  }, []);

  // Auto-save messages to localStorage for persistence
  const saveMessagesToStorage = useCallback((newMessages: Message[]) => {
    try {
      localStorage.setItem('jarvis-current-messages', JSON.stringify(newMessages));
    } catch (error) {
      console.error('Error saving messages to storage:', error);
    }
  }, []);

  // Load messages from localStorage on initialization
  const loadMessagesFromStorage = useCallback(() => {
    try {
      const savedMessages = localStorage.getItem('jarvis-current-messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading messages from storage:', error);
    }
  }, []);

  // Initialize messages from storage
  React.useEffect(() => {
    loadMessagesFromStorage();
  }, [loadMessagesFromStorage]);

  // Save messages whenever they change
  React.useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      saveMessagesToStorage(messages);
    }
  }, [messages, saveMessagesToStorage]);

  const speakResponse = useCallback((text: string, emotion?: 'neutral' | 'excited' | 'calm' | 'urgent' | 'authoritative') => {
    setIsSpeaking(true);
    setCurrentStatus('Speaking...');
    
    const jarvisEmotion = currentVoiceProfile.includes('jarvis') ? 'authoritative' : (emotion || 'neutral');
    
    enhancedTtsEngine.speak(text, {
      profile: currentVoiceProfile,
      emotion: jarvisEmotion,
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
          processEnhancedCommand(transcript);
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

  const processEnhancedCommand = useCallback(async (transcript: string) => {
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
      const lowerTranscript = transcript.toLowerCase();
      if (lowerTranscript.includes('change voice') || lowerTranscript.includes('switch voice') || lowerTranscript.includes('use voice')) {
        const voicePatterns = [
          { pattern: /(?:change|switch|use)\s+voice\s+to\s+jarvis(?:\s+mark\s+(?:2|ii|two))?/i, profile: 'jarvis-mk2' },
          { pattern: /(?:change|switch|use)\s+voice\s+to\s+jarvis/i, profile: 'jarvis' },
          { pattern: /(?:change|switch|use)\s+voice\s+to\s+friday/i, profile: 'friday' },
          { pattern: /(?:change|switch|use)\s+voice\s+to\s+chatgpt/i, profile: 'chatgpt' },
          { pattern: /(?:change|switch|use)\s+voice\s+to\s+assistant/i, profile: 'assistant' },
          { pattern: /(?:change|switch|use)\s+voice\s+to\s+robotic/i, profile: 'robotic' }
        ];

        for (const { pattern, profile } of voicePatterns) {
          if (pattern.test(transcript)) {
            setCurrentVoiceProfile(profile);
            enhancedTtsEngine.setVoiceProfile(profile);
            
            const profileData = enhancedTtsEngine.getAvailableProfiles().find(p => p.name.toLowerCase().includes(profile));
            const response = `Voice profile changed to ${profileData?.name || profile}. ${profileData?.description || ''}`;
            
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

      // Check for stop scrolling command
      if (lowerTranscript.includes('stop scrolling') || lowerTranscript.includes('stop auto scroll')) {
        advancedScrollEngine.stopScrolling();
        
        const response = currentVoiceProfile.includes('jarvis') ? 
          'Certainly. Auto-scrolling has been terminated.' :
          'Auto-scrolling stopped.';
        
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

      // Parse enhanced automation command
      const enhancedCommand = EnhancedCommandProcessor.parseEnhancedCommand(transcript);
      
      if (enhancedCommand) {
        setCurrentStatus('Executing enhanced automation...');
        
        let automationResult;
        
        // Handle scroll commands specially
        if (enhancedCommand.type === 'scroll') {
          const scrollCommand = {
            type: enhancedCommand.action || 'scroll',
            direction: enhancedCommand.parameters?.direction || 'down',
            amount: enhancedCommand.parameters?.amount,
            speed: enhancedCommand.parameters?.speed,
            smooth: enhancedCommand.parameters?.smooth,
            target: enhancedCommand.parameters?.target,
            continuous: enhancedCommand.parameters?.continuous
          };
          
          automationResult = await advancedScrollEngine.executeScrollCommand(scrollCommand as any);
        } else {
          automationResult = await enhancedAutomationEngine.executeEnhancedCommand(enhancedCommand);
        }
        
        let response = '';
        let emotion: 'neutral' | 'excited' | 'calm' | 'urgent' | 'authoritative' = 'authoritative';
        
        if (automationResult.success) {
          const jarvisResponses = [
            "Certainly. ",
            "Of course. ",
            "Very well. ",
            "Affirmative. ",
            "Indeed. ",
            "Absolutely. "
          ];
          
          const prefix = currentVoiceProfile.includes('jarvis') ? 
            jarvisResponses[Math.floor(Math.random() * jarvisResponses.length)] : '';
          
          response = prefix + automationResult.message;
          emotion = 'authoritative';
          
          // Add contextual responses for different automation types
          if (enhancedCommand.type === 'openAndSearch') {
            response += '. The search results should be loading momentarily.';
          } else if (enhancedCommand.type === 'multiSearch') {
            response += '. Multiple research sources are now accessible for your review.';
          } else if (enhancedCommand.type === 'automatedWorkflow') {
            response += '. Your productivity environment is now optimized and ready.';
          } else if (enhancedCommand.type === 'scroll') {
            if (enhancedCommand.action === 'autoScroll') {
              response += '. You may say "stop scrolling" to halt the automatic scrolling at any time.';
            }
          }
        } else {
          const jarvisErrorResponses = [
            "I apologize, but I encountered an issue: ",
            "Regrettably, there was a complication: ",
            "I must report a difficulty: "
          ];
          
          const prefix = currentVoiceProfile.includes('jarvis') ? 
            jarvisErrorResponses[Math.floor(Math.random() * jarvisErrorResponses.length)] : 
            'I encountered an issue: ';
          
          response = prefix + automationResult.message + '. Allow me to attempt an alternative approach.';
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
          const helpResponse = EnhancedCommandProcessor.getEnhancedAutomationHelp();
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: helpResponse,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
          
          const jarvisHelpResponse = currentVoiceProfile.includes('jarvis') ? 
            'Certainly. I can assist you with advanced automation, intelligent web control, multi-platform operations, and comprehensive research assistance. Please review the detailed capabilities in the chat interface.' :
            'I can help you with advanced automation, web control, and intelligent command processing. Check the chat for detailed examples.';
          
          speakResponse(jarvisHelpResponse, 'authoritative');
        } else if (transcript.toLowerCase().includes('scroll help') || transcript.toLowerCase().includes('scrolling commands')) {
          const scrollHelp = EnhancedCommandProcessor.getScrollCommandHelp();
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: scrollHelp,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
          
          const jarvisScrollResponse = currentVoiceProfile.includes('jarvis') ? 
            'Certainly. I have comprehensive scrolling capabilities including auto-scroll, smart content detection, and precise navigation controls. Please review the detailed options in the chat interface.' :
            'I have advanced scrolling features including auto-scroll and smart navigation. Check the chat for all available commands.';
          
          speakResponse(jarvisScrollResponse, 'authoritative');
        } else if (transcript.toLowerCase().includes('test jarvis voice')) {
          enhancedTtsEngine.testJarvisVoice();
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: 'Testing JARVIS voice system. All vocal parameters are functioning within normal parameters.',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
        } else {
          // Use AI service for general queries
          setCurrentStatus('Thinking...');
          const aiResponse = await aiService.generateResponse(transcript);
          
          let finalResponse = aiResponse.content;
          if (currentVoiceProfile.includes('jarvis')) {
            if (!finalResponse.match(/^(Certainly|Of course|Indeed|Very well|Affirmative)/)) {
              const jarvisPrefixes = ["Certainly", "Of course", "Indeed", "Very well"];
              finalResponse = jarvisPrefixes[Math.floor(Math.random() * jarvisPrefixes.length)] + ". " + finalResponse;
            }
          }
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: finalResponse,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
          speakResponse(finalResponse);
        }
      }
    } catch (error: any) {
      console.error('Enhanced Command Processing Error:', error);
      
      const jarvisErrorMessage = currentVoiceProfile.includes('jarvis') ? 
        `I regret to inform you that I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please attempt the command again.` :
        `I apologize, but I encountered an error while processing your enhanced request: ${error.message || 'Unknown error'}. Please try again with a different command.`;
      
      const errorMessage: Message = {
        type: 'assistant',
        content: jarvisErrorMessage,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      setCurrentStatus('Error occurred');
      speakResponse('I apologize for the error. Please try again.', 'calm');
    }
  }, [speakResponse, currentVoiceProfile]);

  const sendMessage = useCallback(async (content: string) => {
    await processEnhancedCommand(content);
  }, [processEnhancedCommand]);

  const changeVoiceProfile = useCallback((profileName: string) => {
    const success = enhancedTtsEngine.setVoiceProfile(profileName);
    if (success) {
      setCurrentVoiceProfile(profileName);
      const profile = enhancedTtsEngine.getCurrentProfile();
      
      const jarvisConfirmation = profileName.includes('jarvis') ? 
        `Voice profile changed to ${profile.name}. All vocal systems are now operational with enhanced parameters.` :
        `Voice changed to ${profile.name} profile.`;
      
      speakResponse(jarvisConfirmation);
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
    availableVoiceProfiles: enhancedTtsEngine.getAvailableProfiles(),
    // Chat history functions
    loadChatSession,
    startNewChat
  };
};