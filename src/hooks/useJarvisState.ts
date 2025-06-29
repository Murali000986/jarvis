import { useState, useCallback, useRef } from 'react';
import { Message } from '../types';

export const useJarvisState = () => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'assistant',
      content: 'Hello! I\'m JARVIS, your enhanced AI assistant. How can I help you today?',
      timestamp: new Date()
    }
  ]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

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

    // Simulate AI processing
    setTimeout(() => {
      const response = generateResponse(transcript);
      const assistantMessage: Message = {
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
    }, 1500);
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    setIsProcessing(true);
    setCurrentStatus('Processing...');
    
    const userMessage: Message = {
      type: 'user',
      content,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);

    // Simulate AI processing
    setTimeout(() => {
      const response = generateResponse(content);
      const assistantMessage: Message = {
        type: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
    }, 1500);
  }, []);

  const generateResponse = (input: string): string => {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! How can I assist you today?';
    }
    
    if (lowerInput.includes('weather')) {
      return 'I\'d be happy to help with weather information. However, I need access to weather APIs to provide real-time data. For now, I recommend checking your local weather service.';
    }
    
    if (lowerInput.includes('time')) {
      return `The current time is ${new Date().toLocaleTimeString()}.`;
    }
    
    if (lowerInput.includes('open')) {
      const app = lowerInput.replace('open', '').trim();
      return `I would open ${app} for you. This feature requires integration with your system's application launcher.`;
    }
    
    if (lowerInput.includes('play')) {
      const query = lowerInput.replace('play', '').trim();
      return `I would play ${query} for you. This feature requires integration with music services.`;
    }
    
    if (lowerInput.includes('search')) {
      const query = lowerInput.replace('search', '').trim();
      return `I would search for "${query}" for you. This feature requires integration with search engines.`;
    }
    
    if (lowerInput.includes('generate image')) {
      const prompt = lowerInput.replace('generate image', '').trim();
      return `I would generate an image of ${prompt} for you. This feature requires integration with image generation APIs.`;
    }
    
    return 'I understand your request. This enhanced JARVIS interface is ready for integration with your existing backend services to provide full functionality.';
  };

  return {
    isListening,
    isProcessing,
    currentStatus,
    messages,
    startListening,
    stopListening,
    sendMessage
  };
};