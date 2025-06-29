import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';
import { ttsEngine } from '../utils/textToSpeech';
import { aiService } from '../services/aiProviders';
import { EnhancedCommandProcessor } from '../utils/enhancedCommandProcessor';
import { automationEngine } from '../utils/automationEngine';

export const useJarvisState = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Hello! I\'m JARVIS, your enhanced AI assistant with automation capabilities. I can help you open applications, control your browser, search the web, and much more. Try saying "Open Chrome" or "What can you do?" to get started.',
      timestamp: new Date()
    }
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const speakResponse = useCallback((text: string) => {
    setIsSpeaking(true);
    setCurrentStatus('Speaking...');
    
    ttsEngine.speak(text, {
      onStart: () => {
        setIsSpeaking(true);
        setCurrentStatus('Speaking...');
      },
      onEnd: () => {
        setIsSpeaking(false);
        setCurrentStatus('Ready');
      },
      onError: (error) => {
        // Check if the error is just an interruption (expected behavior)
        if (error.error === 'interrupted') {
          // Log as info instead of error, or don't log at all since it's expected
          console.info('TTS interrupted (expected behavior)');
        } else {
          // Log genuine errors
          console.error('TTS Error:', error);
        }
        setIsSpeaking(false);
        setCurrentStatus('Ready');
      }
    });
  }, []);

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
        // Stop any current speech when starting to listen
        ttsEngine.stop();
        setIsSpeaking(false);
      };

      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0])
          .map(result => result.transcript)
          .join('');

        if (event.results[event.results.length - 1].isFinal) {
          processVoiceCommand(transcript);
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

  const processVoiceCommand = useCallback(async (transcript: string) => {
    setIsProcessing(true);
    setCurrentStatus('Processing...');
    
    // Add user message
    const userMessage: Message = {
      type: 'user',
      content: transcript,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Parse the command using enhanced command processor
      const voiceCommand = EnhancedCommandProcessor.parseCommand(transcript);
      
      if (!voiceCommand) {
        throw new Error('Could not understand the command');
      }

      let response = '';

      // Handle automation commands
      const automationCommand = EnhancedCommandProcessor.convertToAutomationCommand(voiceCommand);
      if (automationCommand) {
        setCurrentStatus('Executing automation...');
        const automationResult = await automationEngine.executeCommand(automationCommand);
        
        if (automationResult.success) {
          response = automationResult.message;
        } else {
          response = `I couldn't complete that automation: ${automationResult.message}`;
        }
      } else {
        // Handle special commands
        switch (voiceCommand.command) {
          case 'help':
            response = EnhancedCommandProcessor.getAutomationHelp();
            break;
            
          case 'greeting':
            response = "Hello! I'm JARVIS, ready to assist you with automation and information. What would you like me to do?";
            break;
            
          case 'farewell':
            response = "Goodbye! It was a pleasure assisting you today.";
            break;
            
          case 'thanks':
            response = "You're welcome! I'm always here to help.";
            break;
            
          case 'time':
            const now = new Date();
            response = `The current time is ${now.toLocaleTimeString()}.`;
            break;
            
          case 'weather':
            response = "I'd be happy to help with weather information, but I need access to a weather API. For now, I recommend checking your local weather app or website.";
            break;
            
          case 'youtube':
            const youtubeQuery = voiceCommand.parameters?.query;
            if (youtubeQuery) {
              const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;
              window.open(youtubeUrl, '_blank');
              response = `Searching YouTube for "${youtubeQuery}"`;
            } else {
              response = "What would you like me to search for on YouTube?";
            }
            break;
            
          case 'google':
            const googleQuery = voiceCommand.parameters?.query;
            if (googleQuery) {
              const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
              window.open(googleUrl, '_blank');
              response = `Searching Google for "${googleQuery}"`;
            } else {
              response = "What would you like me to search for on Google?";
            }
            break;
            
          case 'search':
            const searchQuery = voiceCommand.parameters?.query;
            if (searchQuery) {
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
              window.open(searchUrl, '_blank');
              response = `Searching for "${searchQuery}"`;
            } else {
              response = "What would you like me to search for?";
            }
            break;
            
          case 'generateImage':
            const imagePrompt = voiceCommand.parameters?.prompt;
            if (imagePrompt) {
              response = `I understand you want to generate an image of "${imagePrompt}". Image generation would require integration with an AI image service like DALL-E, Midjourney, or Stable Diffusion.`;
            } else {
              response = "What kind of image would you like me to generate?";
            }
            break;
            
          case 'general':
          default:
            // Use AI service for general queries
            setCurrentStatus('Thinking...');
            const aiResponse = await aiService.generateResponse(transcript);
            response = aiResponse.content;
            break;
        }
      }
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
      
      // Speak the response
      speakResponse(response);
    } catch (error: any) {
      console.error('Command Processing Error:', error);
      
      const errorMessage: Message = {
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      setCurrentStatus('Error occurred');
      
      speakResponse('I apologize, but I encountered an error. Please try again.');
    }
  }, [speakResponse]);

  const sendMessage = useCallback(async (content: string) => {
    setIsProcessing(true);
    setCurrentStatus('Processing...');
    
    const userMessage: Message = {
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    try {
      // Parse the command using enhanced command processor
      const voiceCommand = EnhancedCommandProcessor.parseCommand(content);
      
      if (!voiceCommand) {
        throw new Error('Could not understand the command');
      }

      let response = '';

      // Handle automation commands
      const automationCommand = EnhancedCommandProcessor.convertToAutomationCommand(voiceCommand);
      if (automationCommand) {
        setCurrentStatus('Executing automation...');
        const automationResult = await automationEngine.executeCommand(automationCommand);
        
        if (automationResult.success) {
          response = automationResult.message;
        } else {
          response = `I couldn't complete that automation: ${automationResult.message}`;
        }
      } else {
        // Handle special commands (same logic as processVoiceCommand)
        switch (voiceCommand.command) {
          case 'help':
            response = EnhancedCommandProcessor.getAutomationHelp();
            break;
            
          case 'greeting':
            response = "Hello! I'm JARVIS, ready to assist you with automation and information. What would you like me to do?";
            break;
            
          case 'farewell':
            response = "Goodbye! It was a pleasure assisting you today.";
            break;
            
          case 'thanks':
            response = "You're welcome! I'm always here to help.";
            break;
            
          case 'time':
            const now = new Date();
            response = `The current time is ${now.toLocaleTimeString()}.`;
            break;
            
          case 'weather':
            response = "I'd be happy to help with weather information, but I need access to a weather API. For now, I recommend checking your local weather app or website.";
            break;
            
          case 'youtube':
            const youtubeQuery = voiceCommand.parameters?.query;
            if (youtubeQuery) {
              const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(youtubeQuery)}`;
              window.open(youtubeUrl, '_blank');
              response = `Searching YouTube for "${youtubeQuery}"`;
            } else {
              response = "What would you like me to search for on YouTube?";
            }
            break;
            
          case 'google':
            const googleQuery = voiceCommand.parameters?.query;
            if (googleQuery) {
              const googleUrl = `https://www.google.com/search?q=${encodeURIComponent(googleQuery)}`;
              window.open(googleUrl, '_blank');
              response = `Searching Google for "${googleQuery}"`;
            } else {
              response = "What would you like me to search for on Google?";
            }
            break;
            
          case 'search':
            const searchQuery = voiceCommand.parameters?.query;
            if (searchQuery) {
              const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
              window.open(searchUrl, '_blank');
              response = `Searching for "${searchQuery}"`;
            } else {
              response = "What would you like me to search for?";
            }
            break;
            
          case 'generateImage':
            const imagePrompt = voiceCommand.parameters?.prompt;
            if (imagePrompt) {
              response = `I understand you want to generate an image of "${imagePrompt}". Image generation would require integration with an AI image service like DALL-E, Midjourney, or Stable Diffusion.`;
            } else {
              response = "What kind of image would you like me to generate?";
            }
            break;
            
          case 'general':
          default:
            // Use AI service for general queries
            setCurrentStatus('Thinking...');
            const aiResponse = await aiService.generateResponse(content);
            response = aiResponse.content;
            break;
        }
      }
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
      
      // Speak the response
      speakResponse(response);
    } catch (error: any) {
      console.error('Message Processing Error:', error);
      
      const errorMessage: Message = {
        type: 'assistant',
        content: `I apologize, but I encountered an error while processing your request: ${error.message || 'Unknown error'}. Please try again.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      setIsProcessing(false);
      setCurrentStatus('Error occurred');
      
      speakResponse('I apologize, but I encountered an error. Please try again.');
    }
  }, [speakResponse]);

  return {
    isListening,
    isProcessing,
    isSpeaking,
    currentStatus,
    messages,
    startListening,
    stopListening,
    sendMessage,
    speakResponse
  };
};