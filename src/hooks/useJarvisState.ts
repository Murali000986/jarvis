import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Message } from '../types/index';

// Voice profiles for different interaction modes
export type VoiceProfile = 'authoritative' | 'friendly' | 'professional' | 'casual';

export interface JarvisState {
  isListening: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  currentStatus: string;
  currentVoiceProfile: VoiceProfile;
  messages: Message[];
  startListening: () => void;
  stopListening: () => void;
  sendMessage: (message: string) => void;
  speakResponse: (text: string, profile?: VoiceProfile) => void;
  changeVoiceProfile: (profile: VoiceProfile) => void;
  loadChatSession: (sessionId: string) => void;
  startNewChat: () => void;
}

export const useJarvisState = (): JarvisState => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('Ready');
  const [currentVoiceProfile, setCurrentVoiceProfile] = useState<VoiceProfile>('authoritative');
  const [messages, setMessages] = useState<Message[]>([]);
  
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);
  const currentUtterance = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  const startListening = useCallback(() => {
    setIsListening(true);
    setCurrentStatus('Listening...');
    
    // Simulate voice recognition
    setTimeout(() => {
      setIsListening(false);
      setIsProcessing(true);
      setCurrentStatus('Processing...');
      
      setTimeout(() => {
        setIsProcessing(false);
        setCurrentStatus('Ready');
      }, 2000);
    }, 3000);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setCurrentStatus('Ready');
  }, []);

  const sendMessage = useCallback((messageText: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      content: messageText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setIsProcessing(true);
    setCurrentStatus('Processing...');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand your request. Let me process that for you.",
        "Analyzing your input and preparing a response.",
        "Command received. Executing your request now.",
        "I'm on it. Processing your request with advanced algorithms.",
        "Your request has been noted. Implementing solution now."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const jarvisMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        sender: 'jarvis',
        timestamp: new Date(),
        type: 'response'
      };

      setMessages(prev => [...prev, jarvisMessage]);
      setIsProcessing(false);
      setCurrentStatus('Ready');
      
      // Speak the response
      speakResponse(randomResponse, currentVoiceProfile);
    }, 1500);
  }, [currentVoiceProfile]);

  const speakResponse = useCallback((text: string, profile: VoiceProfile = 'authoritative') => {
    if (!speechSynthesis.current) return;

    // Stop any current speech
    speechSynthesis.current.cancel();
    
    setIsSpeaking(true);
    setCurrentStatus('Speaking...');

    const utterance = new SpeechSynthesisUtterance(text);
    currentUtterance.current = utterance;

    // Configure voice based on profile
    const voices = speechSynthesis.current.getVoices();
    let selectedVoice = voices.find(voice => voice.lang.startsWith('en'));

    switch (profile) {
      case 'authoritative':
        utterance.rate = 0.9;
        utterance.pitch = 0.8;
        utterance.volume = 0.9;
        selectedVoice = voices.find(voice => 
          voice.name.includes('Male') || voice.name.includes('Daniel') || voice.name.includes('Alex')
        ) || selectedVoice;
        break;
      case 'friendly':
        utterance.rate = 1.0;
        utterance.pitch = 1.1;
        utterance.volume = 0.8;
        break;
      case 'professional':
        utterance.rate = 0.95;
        utterance.pitch = 0.9;
        utterance.volume = 0.85;
        break;
      case 'casual':
        utterance.rate = 1.1;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        break;
    }

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentStatus('Ready');
      currentUtterance.current = null;
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentStatus('Ready');
      currentUtterance.current = null;
    };

    speechSynthesis.current.speak(utterance);
  }, []);

  const changeVoiceProfile = useCallback((profile: VoiceProfile) => {
    setCurrentVoiceProfile(profile);
    setCurrentStatus(`Voice profile changed to ${profile}`);
    
    // Reset status after a moment
    setTimeout(() => {
      setCurrentStatus('Ready');
    }, 2000);
  }, []);

  const loadChatSession = useCallback((sessionId: string) => {
    // Simulate loading a chat session
    setCurrentStatus('Loading chat session...');
    
    setTimeout(() => {
      // Mock loaded messages
      const mockMessages: Message[] = [
        {
          id: '1',
          content: 'Hello JARVIS, how are you today?',
          sender: 'user',
          timestamp: new Date(Date.now() - 3600000),
          type: 'text'
        },
        {
          id: '2',
          content: 'Good day. I am functioning optimally and ready to assist you.',
          sender: 'jarvis',
          timestamp: new Date(Date.now() - 3590000),
          type: 'response'
        }
      ];
      
      setMessages(mockMessages);
      setCurrentStatus('Chat session loaded');
      
      setTimeout(() => {
        setCurrentStatus('Ready');
      }, 2000);
    }, 1000);
  }, []);

  const startNewChat = useCallback(() => {
    setMessages([]);
    setCurrentStatus('New chat started');
    
    setTimeout(() => {
      setCurrentStatus('Ready');
    }, 1500);
  }, []);

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
    loadChatSession,
    startNewChat
  };
};