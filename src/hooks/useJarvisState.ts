import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';
import { ttsEngine } from '../utils/textToSpeech';
import { aiService } from '../services/aiProviders';

export const useJarvisState = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Hello! I\'m JARVIS, your enhanced AI assistant. I\'m now powered by advanced AI models and ready to help you with any questions or tasks.',
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
        console.error('TTS Error:', error);
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
      // Use AI service to generate response
      const aiResponse = await aiService.generateResponse(transcript);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
      
      // Speak the response
      speakResponse(aiResponse.content);
    } catch (error: any) {
      console.error('AI Response Error:', error);
      
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
      // Use AI service to generate response
      const aiResponse = await aiService.generateResponse(content);
      
      const assistantMessage: Message = {
        type: 'assistant',
        content: aiResponse.content,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
      
      // Speak the response
      speakResponse(aiResponse.content);
    } catch (error: any) {
      console.error('AI Response Error:', error);
      
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