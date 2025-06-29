import { VoiceCommand } from '../types';
import { AutomationCommand } from './automationEngine';

export class EnhancedCommandProcessor {
  private static automationCommands = [
    // Application Control
    { pattern: /^(open|launch|start)\s+(.+)$/i, type: 'open', targetKey: 'target' },
    { pattern: /^(close|exit|quit)\s+(.+)$/i, type: 'close', targetKey: 'target' },
    
    // Browser Control
    { pattern: /^(refresh|reload)\s*(page|browser)?$/i, type: 'browser', action: 'refresh' },
    { pattern: /^(go\s+)?(back|backward)$/i, type: 'browser', action: 'back' },
    { pattern: /^(go\s+)?(forward|ahead)$/i, type: 'browser', action: 'forward' },
    { pattern: /^(enter\s+)?fullscreen$/i, type: 'browser', action: 'fullscreen' },
    { pattern: /^zoom\s+(in|out|\d+%?)$/i, type: 'browser', action: 'zoom', paramKey: 'level' },
    
    // Scrolling Commands
    { pattern: /^scroll\s+(up|down|left|right|top|bottom)$/i, type: 'scroll', actionKey: 'action' },
    { pattern: /^(scroll\s+)?(up|down)\s+(\d+)?\s*(pixels?|px)?$/i, type: 'scroll', actionKey: 'action', paramKey: 'amount' },
    { pattern: /^(go\s+to\s+)?(top|bottom)\s+of\s+page$/i, type: 'scroll', actionKey: 'action' },
    
    // Media Control
    { pattern: /^(play|start)\s+(music|video|media|song)$/i, type: 'media', action: 'play' },
    { pattern: /^(pause|stop)\s+(music|video|media|song)$/i, type: 'media', action: 'pause' },
    { pattern: /^(set\s+)?(volume|sound)\s+(to\s+)?(\d+)%?$/i, type: 'media', action: 'volume', paramKey: 'level' },
    { pattern: /^(mute|unmute)\s+(volume|sound|audio)$/i, type: 'system', action: 'volume', paramKey: 'action' },
    
    // System Control
    { pattern: /^(take\s+)?(screenshot|screen\s+capture)$/i, type: 'system', action: 'screenshot' },
    { pattern: /^(set\s+)?brightness\s+(to\s+)?(\d+)%?$/i, type: 'system', action: 'brightness', paramKey: 'level' },
    
    // Search and Navigation
    { pattern: /^(search|find|look\s+for)\s+(.+)$/i, type: 'search', targetKey: 'query' },
    { pattern: /^(go\s+to|navigate\s+to|visit)\s+(.+)$/i, type: 'open', targetKey: 'target' },
    
    // YouTube specific
    { pattern: /^(play|search)\s+(on\s+)?youtube\s+(.+)$/i, type: 'youtube', targetKey: 'query' },
    
    // Google specific
    { pattern: /^(search\s+)?google\s+(for\s+)?(.+)$/i, type: 'google', targetKey: 'query' },
    
    // General queries
    { pattern: /^(what|how|when|where|why|who)\s+(.+)$/i, type: 'general', targetKey: 'query' },
    { pattern: /^(tell\s+me\s+about|explain|describe)\s+(.+)$/i, type: 'general', targetKey: 'query' },
    
    // Time and weather
    { pattern: /^(what('s|\s+is)\s+the\s+)?(time|current\s+time)(\s+now)?$/i, type: 'time' },
    { pattern: /^(what('s|\s+is)\s+the\s+)?weather(\s+(today|now|like))?$/i, type: 'weather' },
    
    // Image generation
    { pattern: /^(generate|create|make)\s+(an?\s+)?image\s+(of\s+)?(.+)$/i, type: 'generateImage', targetKey: 'prompt' },
    { pattern: /^(draw|paint|sketch)\s+(me\s+)?(.+)$/i, type: 'generateImage', targetKey: 'prompt' },
    
    // Conversation
    { pattern: /^(hello|hi|hey)\s*(jarvis|there)?$/i, type: 'greeting' },
    { pattern: /^(goodbye|bye|see\s+you|farewell)$/i, type: 'farewell' },
    { pattern: /^(thank\s+you|thanks)$/i, type: 'thanks' },
    { pattern: /^(help|what\s+can\s+you\s+do)$/i, type: 'help' }
  ];

  public static parseCommand(input: string): VoiceCommand | null {
    const cleanInput = input.trim();
    
    for (const cmd of this.automationCommands) {
      const match = cleanInput.match(cmd.pattern);
      if (match) {
        const command: VoiceCommand = {
          command: cmd.type,
          confidence: 0.9,
          parameters: {}
        };

        // Handle different parameter extraction methods
        if (cmd.targetKey && match[2]) {
          command.parameters![cmd.targetKey] = match[2].trim();
        }
        
        if (cmd.actionKey && match[1]) {
          command.parameters![cmd.actionKey] = match[1].trim();
        }
        
        if (cmd.paramKey && match[3]) {
          const paramValue = match[3].trim();
          // Try to parse as number if it looks like one
          command.parameters![cmd.paramKey] = isNaN(Number(paramValue)) ? paramValue : Number(paramValue);
        }
        
        // Handle specific action assignment
        if (cmd.action) {
          command.parameters!.action = cmd.action;
        }

        return command;
      }
    }

    // If no specific command matches, treat as general query
    return {
      command: 'general',
      parameters: { query: cleanInput },
      confidence: 0.5
    };
  }

  public static convertToAutomationCommand(voiceCommand: VoiceCommand): AutomationCommand | null {
    const { command, parameters } = voiceCommand;

    switch (command) {
      case 'open':
        return {
          type: 'open',
          target: parameters?.target || parameters?.query
        };
        
      case 'close':
        return {
          type: 'close',
          target: parameters?.target || parameters?.query
        };
        
      case 'browser':
        return {
          type: 'browser',
          action: parameters?.action,
          parameters: parameters
        };
        
      case 'scroll':
        return {
          type: 'scroll',
          action: parameters?.action,
          parameters: {
            amount: parameters?.amount,
            smooth: true
          }
        };
        
      case 'media':
        return {
          type: 'media',
          action: parameters?.action,
          parameters: parameters
        };
        
      case 'system':
        return {
          type: 'system',
          action: parameters?.action,
          parameters: parameters
        };
        
      default:
        return null;
    }
  }

  public static getCommandExamples(): string[] {
    return [
      // Application Control
      "Open Chrome",
      "Open Google",
      "Open YouTube",
      "Open Facebook",
      "Open Notepad",
      "Open Calculator",
      "Close Chrome",
      
      // Browser Control
      "Refresh page",
      "Go back",
      "Go forward",
      "Enter fullscreen",
      "Zoom in",
      "Zoom to 150%",
      
      // Scrolling
      "Scroll down",
      "Scroll up",
      "Scroll to top",
      "Scroll to bottom",
      "Scroll down 500 pixels",
      
      // Media Control
      "Play music",
      "Pause video",
      "Set volume to 50%",
      "Mute volume",
      
      // Search and Navigation
      "Search for restaurants",
      "Go to GitHub",
      "Search Google for weather",
      "Play on YouTube relaxing music",
      
      // Information
      "What's the time?",
      "What's the weather?",
      "Tell me about artificial intelligence",
      
      // Image Generation
      "Generate image of a sunset",
      "Create an image of a cat",
      "Draw me a landscape",
      
      // Conversation
      "Hello Jarvis",
      "Thank you",
      "What can you do?",
      "Help"
    ];
  }

  public static getAutomationHelp(): string {
    return `
I can help you with various automation tasks:

**Application Control:**
- Open/close applications and websites
- Examples: "Open Chrome", "Open Google", "Close Notepad"

**Browser Control:**
- Navigate and control browser functions
- Examples: "Refresh page", "Go back", "Enter fullscreen"

**Scrolling:**
- Control page scrolling
- Examples: "Scroll down", "Scroll to top", "Scroll up 300 pixels"

**Media Control:**
- Control audio/video playback
- Examples: "Play music", "Pause video", "Set volume to 75%"

**Search & Information:**
- Search the web and get information
- Examples: "Search for news", "What's the weather?", "Tell me about AI"

**Image Generation:**
- Create images from text descriptions
- Examples: "Generate image of a sunset", "Draw me a cat"

Just speak naturally, and I'll understand what you want to do!
    `.trim();
  }
}