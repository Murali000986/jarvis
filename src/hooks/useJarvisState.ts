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
      content: 'Good day. I am JARVIS, your advanced artificial intelligence assistant with sophisticated automation capabilities. I can execute complex command sequences, control multiple applications simultaneously, and provide intelligent responses with my authentic voice system. Try saying "Open Google and search AI news" or "Research machine learning" to experience my enhanced automation features.',
      timestamp: new Date()
    }
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speakResponse = useCallback((text: string, emotion?: 'neutral' | 'excited' | 'calm' | 'urgent' | 'authoritative') => {
    setIsSpeaking(true);
    setCurrentStatus('Speaking...');
    
    // Use authoritative emotion for JARVIS by default
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
      // Check for voice profile changes with enhanced JARVIS detection
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

      // Parse advanced automation command
      const advancedCommand = AICommandProcessor.parseAdvancedCommand(transcript);
      
      if (advancedCommand) {
        setCurrentStatus('Executing advanced automation...');
        const automationResult = await advancedAutomationEngine.executeAdvancedCommand(advancedCommand);
        
        let response = '';
        let emotion: 'neutral' | 'excited' | 'calm' | 'urgent' | 'authoritative' = 'authoritative';
        
        if (automationResult.success) {
          // JARVIS-style responses
          const jarvisResponses = [
            "Certainly. ",
            "Of course. ",
            "Very well. ",
            "Affirmative. ",
            "Indeed. "
          ];
          
          const prefix = currentVoiceProfile.includes('jarvis') ? 
            jarvisResponses[Math.floor(Math.random() * jarvisResponses.length)] : '';
          
          response = prefix + automationResult.message;
          emotion = 'authoritative';
          
          // Add contextual responses for different automation types
          if (advancedCommand.type === 'openAndSearch') {
            response += '. The search results should be loading momentarily.';
          } else if (advancedCommand.type === 'multiTab') {
            response += '. All requested tabs have been opened for your research.';
          } else if (advancedCommand.type === 'socialMedia') {
            response += '. Your social media platforms are now accessible.';
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
          const helpResponse = AICommandProcessor.getAIAutomationHelp();
          
          const assistantMessage: Message = {
            type: 'assistant',
            content: helpResponse,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          setIsProcessing(false);
          setCurrentStatus('Ready');
          
          const jarvisHelpResponse = currentVoiceProfile.includes('jarvis') ? 
            'Certainly. I can assist you with advanced automation, web control, and intelligent command chaining. Please review the detailed examples in the chat interface.' :
            'I can help you with advanced automation, web control, and intelligent command chaining. Check the chat for detailed examples.';
          
          speakResponse(jarvisHelpResponse, 'authoritative');
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
          
          // Add JARVIS-style formality to AI responses if using JARVIS voice
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
      console.error('Advanced Command Processing Error:', error);
      
      const jarvisErrorMessage = currentVoiceProfile.includes('jarvis') ? 
        `I regret to inform you that I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please attempt the command again.` :
        `I apologize, but I encountered an error while processing your advanced request: ${error.message || 'Unknown error'}. Please try again with a different command.`;
      
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
    await processAdvancedCommand(content);
  }, [processAdvancedCommand]);

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
    availableVoiceProfiles: enhancedTtsEngine.getAvailableProfiles()
  };
};