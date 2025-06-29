import { VoiceCommand } from '../types';
import { EnhancedAutomationCommand } from './enhancedAutomationEngine';
import { advancedScrollEngine } from './advancedScrollEngine';

export class EnhancedCommandProcessor {
  private static enhancedCommands = [
    // Enhanced scroll commands
    { 
      pattern: /^(auto\s+)?scroll\s+(up|down|left|right)\s*(slowly|fast|quickly)?$/i, 
      type: 'scroll',
      handler: (match: RegExpMatchArray) => ({
        type: 'scroll',
        action: match[1] ? 'autoScroll' : 'scroll',
        parameters: { 
          direction: match[2].trim(),
          speed: match[3] ? (match[3].includes('slow') ? 3000 : 500) : 1000
        }
      })
    },
    
    { 
      pattern: /^scroll\s+to\s+(top|bottom|beginning|end)$/i, 
      type: 'scroll',
      handler: (match: RegExpMatchArray) => ({
        type: 'scroll',
        action: 'scroll',
        parameters: { 
          direction: match[1].includes('top') || match[1].includes('beginning') ? 'top' : 'bottom'
        }
      })
    },
    
    { 
      pattern: /^scroll\s+to\s+(.+)$/i, 
      type: 'scroll',
      handler: (match: RegExpMatchArray) => ({
        type: 'scroll',
        action: 'smartScroll',
        parameters: { 
          target: match[1].trim(),
          direction: 'down'
        }
      })
    },
    
    { 
      pattern: /^(keep\s+scrolling|auto\s+scroll)\s+(up|down)\s*(for\s+(\d+)\s+seconds?)?$/i, 
      type: 'scroll',
      handler: (match: RegExpMatchArray) => ({
        type: 'scroll',
        action: 'autoScroll',
        parameters: { 
          direction: match[2].trim(),
          continuous: true,
          speed: 1500,
          duration: match[4] ? parseInt(match[4]) * 1000 : 10000
        }
      })
    },
    
    { 
      pattern: /^smart\s+scroll\s+(up|down)$/i, 
      type: 'scroll',
      handler: (match: RegExpMatchArray) => ({
        type: 'scroll',
        action: 'smartScroll',
        parameters: { 
          direction: match[1].trim()
        }
      })
    },
    
    { 
      pattern: /^scroll\s+(\d+)\s*(px|pixels?|percent|%)?$/i, 
      type: 'scroll',
      handler: (match: RegExpMatchArray) => {
        const value = parseInt(match[1]);
        const unit = match[2];
        
        if (unit && (unit.includes('%') || unit.includes('percent'))) {
          return {
            type: 'scroll',
            action: 'scrollToPercentage',
            parameters: { percentage: value }
          };
        }
        
        return {
          type: 'scroll',
          action: 'scroll',
          parameters: { 
            direction: 'down',
            amount: value
          }
        };
      }
    },
    
    // Enhanced automation commands
    { 
      pattern: /^open\s+(.+)\s+and\s+search\s+(.+)$/i, 
      type: 'openAndSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'openAndSearch',
        target: match[1].trim(),
        parameters: { query: match[2].trim() }
      })
    },
    
    { 
      pattern: /^search\s+(.+)\s+on\s+multiple\s+platforms$/i, 
      type: 'multiSearch',
      handler: (match: RegExpMatchArray) => ({
        type: 'multiSearch',
        parameters: { 
          query: match[1].trim(),
          platforms: ['google', 'youtube', 'wikipedia', 'reddit']
        }
      })
    },
    
    { 
      pattern: /^research\s+(.+)\s+(academically|for\s+market|in\s+depth)$/i, 
      type: 'researchAssistant',
      handler: (match: RegExpMatchArray) => {
        const researchType = match[2].includes('academic') ? 'academicResearch' : 'marketResearch';
        return {
          type: 'researchAssistant',
          action: researchType,
          parameters: { topic: match[1].trim() }
        };
      }
    },
    
    { 
      pattern: /^open\s+(my\s+)?(daily\s+)?workspace$/i, 
      type: 'automatedWorkflow',
      handler: () => ({
        type: 'automatedWorkflow',
        action: 'dailyStartup'
      })
    },
    
    { 
      pattern: /^start\s+(research\s+mode|research)\s+(for\s+)?(.+)$/i, 
      type: 'automatedWorkflow',
      handler: (match: RegExpMatchArray) => ({
        type: 'automatedWorkflow',
        action: 'researchMode',
        parameters: { topic: match[3].trim() }
      })
    },
    
    { 
      pattern: /^open\s+all\s+(social\s+media|social)$/i, 
      type: 'socialMediaManager',
      handler: () => ({
        type: 'socialMediaManager',
        action: 'openAll'
      })
    },
    
    { 
      pattern: /^open\s+(professional|work)\s+social\s+media$/i, 
      type: 'socialMediaManager',
      handler: () => ({
        type: 'socialMediaManager',
        action: 'openProfessional'
      })
    },
    
    { 
      pattern: /^open\s+(personal|casual)\s+social\s+media$/i, 
      type: 'socialMediaManager',
      handler: () => ({
        type: 'socialMediaManager',
        action: 'openPersonal'
      })
    },
    
    { 
      pattern: /^(start|open)\s+(meeting\s+mode|meetings)$/i, 
      type: 'productivitySuite',
      handler: () => ({
        type: 'productivitySuite',
        action: 'openMeetingMode'
      })
    },
    
    { 
      pattern: /^(start|open)\s+(project\s+mode|projects)$/i, 
      type: 'productivitySuite',
      handler: () => ({
        type: 'productivitySuite',
        action: 'openProjectMode'
      })
    },
    
    { 
      pattern: /^open\s+(dev\s+environment|developer\s+tools)$/i, 
      type: 'developerTools',
      handler: () => ({
        type: 'developerTools',
        action: 'openDevEnvironment'
      })
    },
    
    { 
      pattern: /^open\s+cloud\s+services$/i, 
      type: 'developerTools',
      handler: () => ({
        type: 'developerTools',
        action: 'openCloudServices'
      })
    },
    
    { 
      pattern: /^open\s+(streaming\s+services|entertainment)$/i, 
      type: 'entertainmentHub',
      handler: () => ({
        type: 'entertainmentHub',
        action: 'openStreamingServices'
      })
    },
    
    { 
      pattern: /^open\s+music\s+services$/i, 
      type: 'entertainmentHub',
      handler: () => ({
        type: 'entertainmentHub',
        action: 'openMusicServices'
      })
    },
    
    // Content analysis commands
    { 
      pattern: /^(analyze|extract|get)\s+(page\s+info|page\s+information)$/i, 
      type: 'contentAnalysis',
      handler: () => ({
        type: 'contentAnalysis',
        action: 'pageInfo'
      })
    },
    
    { 
      pattern: /^(find|count|get)\s+(all\s+)?links$/i, 
      type: 'contentAnalysis',
      handler: () => ({
        type: 'contentAnalysis',
        action: 'findLinks'
      })
    },
    
    { 
      pattern: /^(find|count|get)\s+(all\s+)?images$/i, 
      type: 'contentAnalysis',
      handler: () => ({
        type: 'contentAnalysis',
        action: 'findImages'
      })
    },
    
    { 
      pattern: /^extract\s+text\s+(from\s+)?(.+)$/i, 
      type: 'contentAnalysis',
      handler: (match: RegExpMatchArray) => ({
        type: 'contentAnalysis',
        action: 'extractText',
        parameters: { selector: match[2].trim() }
      })
    },
    
    // Smart navigation commands
    { 
      pattern: /^(go\s+back|navigate\s+back|back)$/i, 
      type: 'smartNavigation',
      handler: () => ({
        type: 'smartNavigation',
        action: 'goBack'
      })
    },
    
    { 
      pattern: /^(go\s+forward|navigate\s+forward|forward)$/i, 
      type: 'smartNavigation',
      handler: () => ({
        type: 'smartNavigation',
        action: 'goForward'
      })
    },
    
    { 
      pattern: /^(refresh|reload)\s+(page|browser)?$/i, 
      type: 'smartNavigation',
      handler: () => ({
        type: 'smartNavigation',
        action: 'refresh'
      })
    },
    
    { 
      pattern: /^(open\s+)?new\s+tab(\s+with\s+(.+))?$/i, 
      type: 'smartNavigation',
      handler: (match: RegExpMatchArray) => ({
        type: 'smartNavigation',
        action: 'newTab',
        parameters: match[3] ? { url: match[3].trim() } : {}
      })
    },
    
    { 
      pattern: /^(enter\s+)?fullscreen$/i, 
      type: 'smartNavigation',
      handler: () => ({
        type: 'smartNavigation',
        action: 'fullscreen'
      })
    },
    
    { 
      pattern: /^(exit\s+)?fullscreen$/i, 
      type: 'smartNavigation',
      handler: () => ({
        type: 'smartNavigation',
        action: 'exitFullscreen'
      })
    }
  ];

  public static parseEnhancedCommand(input: string): EnhancedAutomationCommand | null {
    const cleanInput = input.trim();
    
    // First check for scroll commands using the scroll engine
    const scrollCommand = advancedScrollEngine.parseScrollCommand(cleanInput);
    if (scrollCommand) {
      return {
        type: 'scroll',
        action: scrollCommand.type,
        parameters: {
          direction: scrollCommand.direction,
          amount: scrollCommand.amount,
          speed: scrollCommand.speed,
          smooth: scrollCommand.smooth,
          target: scrollCommand.target,
          continuous: scrollCommand.continuous
        }
      };
    }
    
    // Then check for other enhanced commands
    for (const cmd of this.enhancedCommands) {
      const match = cleanInput.match(cmd.pattern);
      if (match) {
        return cmd.handler(match);
      }
    }

    return null;
  }

  public static getEnhancedCommandExamples(): string[] {
    return [
      // Scroll commands
      "Auto scroll down",
      "Scroll to top",
      "Smart scroll down",
      "Keep scrolling up for 10 seconds",
      "Scroll to main content",
      "Scroll 500 pixels",
      "Scroll to 75%",
      
      // Enhanced automation
      "Open Google and search artificial intelligence",
      "Search machine learning on multiple platforms",
      "Research quantum computing academically",
      "Open my daily workspace",
      "Start research mode for blockchain",
      "Open all social media",
      "Open professional social media",
      "Start meeting mode",
      "Open dev environment",
      "Open streaming services",
      
      // Content analysis
      "Get page info",
      "Find all links",
      "Extract text from article",
      "Count images",
      
      // Smart navigation
      "Go back",
      "Refresh page",
      "Open new tab with GitHub",
      "Enter fullscreen",
      
      // Advanced workflows
      "Open cloud services",
      "Start project mode",
      "Open music services",
      "Research AI for market analysis"
    ];
  }

  public static getScrollCommandHelp(): string {
    return `
🎯 **Advanced Scroll Commands**

**📜 Basic Scrolling:**
- "Scroll up/down/left/right"
- "Scroll to top/bottom"
- "Scroll 500 pixels"
- "Scroll to 75%" (percentage of page)

**🤖 Auto Scrolling:**
- "Auto scroll down" - Continuous scrolling
- "Keep scrolling up for 10 seconds"
- "Auto scroll down slowly/fast"

**🧠 Smart Scrolling:**
- "Smart scroll down" - Scrolls to next content section
- "Scroll to main content" - Finds and scrolls to specific elements
- "Scroll to next article" - Intelligent content detection

**⚡ Advanced Features:**
- Automatic content detection
- Smooth scrolling animations
- Speed control (slow/medium/fast)
- Percentage-based scrolling
- Element targeting by name or selector

**🎮 Voice Control Examples:**
- "Auto scroll down slowly"
- "Smart scroll to next section"
- "Keep scrolling up for 30 seconds"
- "Scroll to the comments section"
    `.trim();
  }

  public static getEnhancedAutomationHelp(): string {
    return `
🚀 **Enhanced AI Automation Commands**

**🔗 Multi-Platform Operations:**
- "Search [topic] on multiple platforms"
- "Research [topic] academically"
- "Open Google and search [query]"

**💼 Productivity Workflows:**
- "Open my daily workspace" - Gmail, Calendar, Drive, Docs
- "Start meeting mode" - Calendar, Zoom, Teams, Slack
- "Start project mode" - Trello, Asana, Notion, Drive

**👥 Social Media Management:**
- "Open all social media"
- "Open professional social media" - LinkedIn, Twitter
- "Open personal social media" - Facebook, Instagram

**💻 Developer Tools:**
- "Open dev environment" - GitHub, Stack Overflow, CodePen
- "Open cloud services" - AWS, Vercel, Netlify, Heroku

**🎬 Entertainment Hub:**
- "Open streaming services" - Netflix, YouTube, Hulu
- "Open music services" - Spotify, Apple Music, SoundCloud

**📊 Content Analysis:**
- "Get page info" - Extract page details
- "Find all links" - List all page links
- "Extract text from article" - Get text content
- "Count images" - Count page images

**🧭 Smart Navigation:**
- "Go back/forward" - Browser navigation
- "Refresh page" - Reload current page
- "Open new tab with [URL]" - Smart tab management
- "Enter/exit fullscreen" - Display control

**🔬 Research Assistant:**
- "Research [topic] academically" - Scholar, JSTOR, PubMed
- "Research [topic] for market" - Trends, Statista, Crunchbase

**⚡ Advanced Scroll Control:**
- "Auto scroll down slowly"
- "Smart scroll to next section"
- "Scroll to [element name]"
- "Keep scrolling for [time]"

Just speak naturally - I understand context and can chain multiple actions together!
    `.trim();
  }
}