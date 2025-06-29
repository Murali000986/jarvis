import { VoiceCommand } from '../types';

export class CommandProcessor {
  private static commands = [
    { pattern: /^(open|launch)\s+(.+)$/i, action: 'open', paramKey: 'app' },
    { pattern: /^(play|start)\s+(.+)$/i, action: 'play', paramKey: 'query' },
    { pattern: /^(search|find)\s+(.+)$/i, action: 'search', paramKey: 'query' },
    { pattern: /^(generate|create)\s+image\s+(.+)$/i, action: 'generateImage', paramKey: 'prompt' },
    { pattern: /^what('s|\s+is)\s+the\s+time$/i, action: 'getTime' },
    { pattern: /^what('s|\s+is)\s+the\s+weather$/i, action: 'getWeather' },
    { pattern: /^(close|exit|quit)\s+(.+)$/i, action: 'close', paramKey: 'app' },
    { pattern: /^(volume|sound)\s+(up|down|mute)$/i, action: 'volume', paramKey: 'control' },
  ];

  public static parseCommand(input: string): VoiceCommand | null {
    const cleanInput = input.trim();
    
    for (const cmd of this.commands) {
      const match = cleanInput.match(cmd.pattern);
      if (match) {
        const command: VoiceCommand = {
          command: cmd.action,
          confidence: 0.9,
          parameters: {}
        };

        if (cmd.paramKey && match[2]) {
          command.parameters![cmd.paramKey] = match[2].trim();
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

  public static getCommandSuggestions(): string[] {
    return [
      "Open Chrome",
      "Play some music",
      "What's the time?",
      "Search for restaurants nearby",
      "Generate image of a sunset",
      "What's the weather?",
      "Close Notepad",
      "Volume up"
    ];
  }
}