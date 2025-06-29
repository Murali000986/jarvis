import { VoiceCommand } from '../types';
import { AdvancedAutomationCommand } from './advancedAutomationEngine';

export class AICommandProcessor {
  private static advancedCommands = [
    // Chained automation commands
    { 
      pattern: /^open\s+(.+)\s+and\s+search\s+(.+)$/i, 
      type: 'openAndSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'openAndSearch',
        target: match[1].trim(),
        parameters: { query: match[2].trim() }
      })
    },
    
    // Smart search commands
    { 
      pattern: /^search\s+(.+)\s+on\s+(.+)$/i, 
      type: 'smartSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'smartSearch',
        parameters: { query: match[1].trim(), platform: match[2].trim() }
      })
    },
    
    // Music and entertainment
    { 
      pattern: /^(play|find|search)\s+(song|music|songs)\s+(.+)$/i, 
      type: 'smartSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'smartSearch',
        parameters: { query: match[3].trim(), platform: 'youtube' }
      })
    },
    
    // YouTube specific commands
    { 
      pattern: /^(search\s+)?youtube\s+(for\s+)?(.+)$/i, 
      type: 'openAndSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'openAndSearch',
        target: 'youtube',
        parameters: { query: match[3].trim() }
      })
    },
    
    // Google specific commands
    { 
      pattern: /^(search\s+)?google\s+(for\s+)?(.+)$/i, 
      type: 'openAndSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'openAndSearch',
        target: 'google',
        parameters: { query: match[3].trim() }
      })
    },
    
    // Multi-platform commands
    { 
      pattern: /^open\s+all\s+social\s+media$/i, 
      type: 'socialMedia',
      handler: () => ({
        type: 'socialMedia',
        action: 'openAll'
      })
    },
    
    // Productivity commands
    { 
      pattern: /^open\s+(my\s+)?workspace$/i, 
      type: 'productivity',
      handler: () => ({
        type: 'productivity',
        action: 'openWorkspace'
      })
    },
    
    // Advanced web automation
    { 
      pattern: /^auto\s+scroll\s+(up|down|left|right)$/i, 
      type: 'webAutomation',
      handler: (match: RegExpMatchArray) => ({
        type: 'webAutomation',
        action: 'autoScroll',
        parameters: { direction: match[1].trim(), speed: 1000 }
      })
    },
    
    // AI-assisted commands
    { 
      pattern: /^summarize\s+(this\s+)?page$/i, 
      type: 'aiAssisted',
      handler: () => ({
        type: 'aiAssisted',
        action: 'contentSummary'
      })
    },
    
    { 
      pattern: /^translate\s+(this\s+)?page\s+to\s+(.+)$/i, 
      type: 'aiAssisted',
      handler: (match: RegExpMatchArray) => ({
        type: 'aiAssisted',
        action: 'translatePage',
        parameters: { targetLanguage: match[2].trim() }
      })
    },
    
    // Complex chained commands
    { 
      pattern: /^research\s+(.+)$/i, 
      type: 'multiTab',
      handler: (match: RegExpMatchArray) => {
        const query = match[1].trim();
        return {
          type: 'multiTab',
          parameters: {
            tabs: [
              { url: `https://www.google.com/search?q=${encodeURIComponent(query)}` },
              { url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(query)}` },
              { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}` }
            ]
          }
        };
      }
    },
    
    // Shopping commands
    { 
      pattern: /^(shop|buy|find|search)\s+(.+)\s+on\s+amazon$/i, 
      type: 'openAndSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'openAndSearch',
        target: 'amazon',
        parameters: { query: match[2].trim() }
      })
    },
    
    // Entertainment commands
    { 
      pattern: /^watch\s+(.+)$/i, 
      type: 'openAndSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'openAndSearch',
        target: 'youtube',
        parameters: { query: match[1].trim() }
      })
    },
    
    // Learning commands
    { 
      pattern: /^learn\s+(about\s+)?(.+)$/i, 
      type: 'multiTab',
      handler: (match: RegExpMatchArray) => {
        const topic = match[2].trim();
        return {
          type: 'multiTab',
          parameters: {
            tabs: [
              { url: `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}` },
              { url: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}` },
              { url: `https://www.google.com/search?q=${encodeURIComponent(topic + ' guide')}` }
            ]
          }
        };
      }
    }
  ];

  public static parseAdvancedCommand(input: string): AdvancedAutomationCommand | null {
    const cleanInput = input.trim();
    
    for (const cmd of this.advancedCommands) {
      const match = cleanInput.match(cmd.pattern);
      if (match) {
        return cmd.handler(match);
      }
    }

    return null;
  }

  public static getAdvancedCommandExamples(): string[] {
    return [
      // Basic automation
      "Open Google and search artificial intelligence",
      "Open YouTube and search relaxing music",
      "Search songs on Spotify",
      "Watch cooking tutorials",
      
      // Advanced automation
      "Research quantum computing",
      "Learn about machine learning",
      "Open my workspace",
      "Open all social media",
      
      // AI-powered commands
      "Auto scroll down",
      "Summarize this page",
      "Translate this page to Spanish",
      "Shop laptops on Amazon",
      
      // Entertainment
      "Play jazz music",
      "Find funny videos",
      "Search Netflix for movies",
      "Watch latest tech news",
      
      // Productivity
      "Open Gmail and Calendar",
      "Search GitHub for React projects",
      "Find Stack Overflow solutions",
      "Open Notion workspace"
    ];
  }

  public static getAIAutomationHelp(): string {
    return `
🤖 **AI-Powered Automation Commands**

**🔗 Chained Commands:**
- "Open Google and search [topic]"
- "Open YouTube and search [music/videos]"
- "Research [topic]" - Opens multiple relevant sources

**🎵 Music & Entertainment:**
- "Play [song/artist] music"
- "Search songs on [platform]"
- "Watch [topic] videos"
- "Find [genre] music"

**🛍️ Smart Shopping:**
- "Shop [item] on Amazon"
- "Find [product] prices"
- "Buy [item] online"

**📚 Learning & Research:**
- "Learn about [topic]"
- "Research [subject]"
- "Find tutorials for [skill]"

**💼 Productivity:**
- "Open my workspace" - Gmail, Calendar, Drive, Docs
- "Open all social media"
- "Search GitHub for [project]"

**🌐 Web Automation:**
- "Auto scroll [direction]"
- "Summarize this page"
- "Translate page to [language]"
- "Take screenshot"

**🎯 Platform-Specific:**
- "Search YouTube for [query]"
- "Google [search term]"
- "Find on Wikipedia [topic]"
- "Search Reddit for [discussion]"

Just speak naturally - I understand context and can chain multiple actions together!
    `.trim();
  }
}