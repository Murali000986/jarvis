export interface Message {
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface JarvisState {
  isListening: boolean;
  isProcessing: boolean;
  currentStatus: string;
  messages: Message[];
}

export interface VoiceCommand {
  command: string;
  parameters?: Record<string, any>;
  confidence: number;
}

export interface SystemStatus {
  cpu: number;
  memory: number;
  network: boolean;
  microphone: boolean;
}