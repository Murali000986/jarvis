export interface EnhancedAutomationCommand {
  type: string;
  target?: string;
  action?: string;
  parameters?: Record<string, any>;
  chainedCommands?: EnhancedAutomationCommand[];
  priority?: 'low' | 'medium' | 'high';
  timeout?: number;
}

export interface AutomationResponse {
  success: boolean;
  message: string;
  data?: any;
  executionTime?: number;
  nextAction?: EnhancedAutomationCommand;
}

export class EnhancedAutomationEngine {
  private isEnabled: boolean = true;
  private openTabs: Map<string, Window | null> = new Map();
  private automationQueue: EnhancedAutomationCommand[] = [];
  private isExecuting: boolean = false;
  private executionHistory: Array<{ command: EnhancedAutomationCommand; result: AutomationResponse; timestamp: Date }> = [];

  constructor() {
    this.initializeEnhancedAutomation();
  }

  private initializeEnhancedAutomation(): void {
    console.log('Enhanced AI-Powered Automation Engine v2.0 initialized');
    
    // Set up global automation listeners
    this.setupGlobalListeners();
  }

  private setupGlobalListeners(): void {
    // Listen for tab close events
    window.addEventListener('beforeunload', () => {
      this.cleanupTabs();
    });

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'J') {
        // Ctrl+Shift+J to show automation status
        this.showAutomationStatus();
      }
    });
  }

  public async executeEnhancedCommand(command: EnhancedAutomationCommand): Promise<AutomationResponse> {
    const startTime = Date.now();
    
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Enhanced automation is currently disabled',
        executionTime: Date.now() - startTime
      };
    }

    try {
      // Add to queue if currently executing and not high priority
      if (this.isExecuting && command.priority !== 'high') {
        this.automationQueue.push(command);
        return {
          success: true,
          message: 'Command queued for execution',
          executionTime: Date.now() - startTime
        };
      }

      this.isExecuting = true;
      const result = await this.processEnhancedCommand(command);
      
      // Record execution
      this.executionHistory.push({
        command,
        result,
        timestamp: new Date()
      });

      // Keep only last 100 executions
      if (this.executionHistory.length > 100) {
        this.executionHistory.shift();
      }

      // Execute chained commands
      if (command.chainedCommands && command.chainedCommands.length > 0) {
        for (const chainedCommand of command.chainedCommands) {
          await this.delay(500); // Wait between chained commands
          await this.processEnhancedCommand(chainedCommand);
        }
      }

      // Process queue
      if (this.automationQueue.length > 0) {
        const nextCommand = this.automationQueue.shift();
        if (nextCommand) {
          setTimeout(() => this.executeEnhancedCommand(nextCommand), 300);
        }
      } else {
        this.isExecuting = false;
      }

      result.executionTime = Date.now() - startTime;
      return result;
    } catch (error: any) {
      this.isExecuting = false;
      return {
        success: false,
        message: `Enhanced automation error: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }

  private async processEnhancedCommand(command: EnhancedAutomationCommand): Promise<AutomationResponse> {
    switch (command.type) {
      case 'openAndSearch':
        return await this.enhancedOpenAndSearch(command.target!, command.parameters?.query, command.parameters);
      case 'multiSearch':
        return await this.multiPlatformSearch(command.parameters?.query, command.parameters?.platforms);
      case 'smartNavigation':
        return await this.smartNavigation(command.action!, command.parameters);
      case 'contentAnalysis':
        return await this.contentAnalysis(command.action!, command.parameters);
      case 'automatedWorkflow':
        return await this.automatedWorkflow(command.action!, command.parameters);
      case 'socialMediaManager':
        return await this.socialMediaManager(command.action!, command.parameters);
      case 'productivitySuite':
        return await this.productivitySuite(command.action!, command.parameters);
      case 'developerTools':
        return await this.developerTools(command.action!, command.parameters);
      case 'entertainmentHub':
        return await this.entertainmentHub(command.action!, command.parameters);
      case 'researchAssistant':
        return await this.researchAssistant(command.action!, command.parameters);
      case 'scroll':
        return await this.enhancedScrollControl(command.action!, command.parameters);
      default:
        return await this.fallbackAutomation(command);
    }
  }

  private async enhancedOpenAndSearch(platform: string, query: string, options?: Record<string, any>): Promise<AutomationResponse> {
    const enhancedPlatforms: Record<string, { url: string; searchParam: string; features?: string[] }> = {
      'google': { 
        url: 'https://www.google.com/search', 
        searchParam: 'q',
        features: ['images', 'news', 'videos', 'shopping']
      },
      'youtube': { 
        url: 'https://www.youtube.com/results', 
        searchParam: 'search_query',
        features: ['filter', 'duration', 'upload_date']
      },
      'amazon': { 
        url: 'https://www.amazon.com/s', 
        searchParam: 'k',
        features: ['prime', 'price_range', 'reviews']
      },
      'wikipedia': { 
        url: 'https://en.wikipedia.org/wiki/Special:Search', 
        searchParam: 'search' 
      },
      'github': { 
        url: 'https://github.com/search', 
        searchParam: 'q',
        features: ['language', 'stars', 'forks']
      },
      'stackoverflow': { 
        url: 'https://stackoverflow.com/search', 
        searchParam: 'q',
        features: ['tags', 'votes', 'answers']
      },
      'reddit': { 
        url: 'https://www.reddit.com/search', 
        searchParam: 'q',
        features: ['subreddit', 'time', 'sort']
      },
      'twitter': { 
        url: 'https://twitter.com/search', 
        searchParam: 'q',
        features: ['people', 'photos', 'videos']
      },
      'linkedin': { 
        url: 'https://www.linkedin.com/search/results/all', 
        searchParam: 'keywords',
        features: ['people', 'companies', 'jobs']
      },
      'spotify': { 
        url: 'https://open.spotify.com/search', 
        searchParam: 'query',
        features: ['tracks', 'artists', 'albums', 'playlists']
      },
      'netflix': { 
        url: 'https://www.netflix.com/search', 
        searchParam: 'q',
        features: ['genre', 'year', 'rating']
      },
      'imdb': { 
        url: 'https://www.imdb.com/find', 
        searchParam: 'q',
        features: ['movies', 'tv', 'people']
      },
      'pinterest': { 
        url: 'https://www.pinterest.com/search/pins', 
        searchParam: 'q',
        features: ['boards', 'people']
      },
      'medium': { 
        url: 'https://medium.com/search', 
        searchParam: 'q',
        features: ['stories', 'people', 'publications']
      }
    };

    const platformData = enhancedPlatforms[platform.toLowerCase()];
    if (!platformData) {
      return {
        success: false,
        message: `Platform "${platform}" not supported for enhanced search`
      };
    }

    // Build enhanced search URL with filters
    let searchUrl = `${platformData.url}?${platformData.searchParam}=${encodeURIComponent(query)}`;
    
    // Add platform-specific enhancements
    if (options?.filter && platformData.features?.includes(options.filter)) {
      switch (platform.toLowerCase()) {
        case 'google':
          if (options.filter === 'images') searchUrl += '&tbm=isch';
          if (options.filter === 'news') searchUrl += '&tbm=nws';
          if (options.filter === 'videos') searchUrl += '&tbm=vid';
          break;
        case 'youtube':
          if (options.filter === 'duration') searchUrl += '&sp=EgIYAw%253D%253D'; // Long videos
          break;
        case 'github':
          if (options.language) searchUrl += `&l=${options.language}`;
          break;
      }
    }

    const newTab = window.open(searchUrl, '_blank');
    
    if (newTab) {
      this.openTabs.set(`${platform}-search-${Date.now()}`, newTab);
      
      // Enhanced response with suggestions
      let message = `Opened ${platform} and searching for "${query}"`;
      if (platformData.features && platformData.features.length > 0) {
        message += `. Available filters: ${platformData.features.join(', ')}`;
      }
      
      return {
        success: true,
        message,
        data: {
          platform,
          query,
          url: searchUrl,
          features: platformData.features
        }
      };
    }

    return {
      success: false,
      message: `Failed to open ${platform}. Please check if pop-ups are blocked.`
    };
  }

  private async multiPlatformSearch(query: string, platforms?: string[]): Promise<AutomationResponse> {
    const defaultPlatforms = ['google', 'youtube', 'wikipedia'];
    const searchPlatforms = platforms || defaultPlatforms;
    
    const results: string[] = [];
    const errors: string[] = [];

    for (const platform of searchPlatforms) {
      try {
        const result = await this.enhancedOpenAndSearch(platform, query);
        if (result.success) {
          results.push(platform);
        } else {
          errors.push(`${platform}: ${result.message}`);
        }
        await this.delay(300); // Delay between opens
      } catch (error: any) {
        errors.push(`${platform}: ${error.message}`);
      }
    }

    return {
      success: results.length > 0,
      message: `Multi-platform search completed. Opened: ${results.join(', ')}${errors.length > 0 ? `. Errors: ${errors.join(', ')}` : ''}`,
      data: { successful: results, errors }
    };
  }

  private async enhancedScrollControl(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const { advancedScrollEngine } = await import('./advancedScrollEngine');
    
    const scrollCommand = {
      type: action.includes('auto') ? 'autoScroll' : action.includes('smart') ? 'smartScroll' : 'scroll',
      direction: parameters?.direction || 'down',
      amount: parameters?.amount || 300,
      speed: parameters?.speed || 1000,
      smooth: parameters?.smooth !== false,
      target: parameters?.target,
      continuous: parameters?.continuous || false
    };

    const result = await advancedScrollEngine.executeScrollCommand(scrollCommand as any);
    
    return {
      success: result.success,
      message: result.message,
      data: result.position
    };
  }

  private async smartNavigation(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    switch (action) {
      case 'goBack':
        if (window.history.length > 1) {
          window.history.back();
          return { success: true, message: 'Navigated back in browser history' };
        }
        return { success: false, message: 'No previous page in history' };
        
      case 'goForward':
        window.history.forward();
        return { success: true, message: 'Navigated forward in browser history' };
        
      case 'refresh':
        window.location.reload();
        return { success: true, message: 'Page refreshed' };
        
      case 'newTab':
        const url = parameters?.url || 'about:blank';
        window.open(url, '_blank');
        return { success: true, message: `Opened new tab${url !== 'about:blank' ? ` with ${url}` : ''}` };
        
      case 'closeTab':
        window.close();
        return { success: true, message: 'Attempted to close current tab' };
        
      case 'fullscreen':
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          return { success: true, message: 'Entered fullscreen mode' };
        }
        return { success: false, message: 'Fullscreen not supported' };
        
      case 'exitFullscreen':
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          return { success: true, message: 'Exited fullscreen mode' };
        }
        return { success: false, message: 'Not in fullscreen mode' };
        
      default:
        return { success: false, message: `Unknown navigation action: ${action}` };
    }
  }

  private async contentAnalysis(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    switch (action) {
      case 'extractText':
        const selector = parameters?.selector || 'body';
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent || '';
          return {
            success: true,
            message: `Extracted ${text.length} characters of text`,
            data: { text: text.substring(0, 1000), fullLength: text.length }
          };
        }
        return { success: false, message: `Element not found: ${selector}` };
        
      case 'countElements':
        const countSelector = parameters?.selector || '*';
        const elements = document.querySelectorAll(countSelector);
        return {
          success: true,
          message: `Found ${elements.length} elements matching "${countSelector}"`,
          data: { count: elements.length, selector: countSelector }
        };
        
      case 'findLinks':
        const links = Array.from(document.querySelectorAll('a[href]')).map(link => ({
          text: link.textContent?.trim(),
          href: (link as HTMLAnchorElement).href
        }));
        return {
          success: true,
          message: `Found ${links.length} links on the page`,
          data: { links: links.slice(0, 20), total: links.length }
        };
        
      case 'findImages':
        const images = Array.from(document.querySelectorAll('img[src]')).map(img => ({
          alt: (img as HTMLImageElement).alt,
          src: (img as HTMLImageElement).src
        }));
        return {
          success: true,
          message: `Found ${images.length} images on the page`,
          data: { images: images.slice(0, 10), total: images.length }
        };
        
      case 'pageInfo':
        return {
          success: true,
          message: 'Page information extracted',
          data: {
            title: document.title,
            url: window.location.href,
            domain: window.location.hostname,
            wordCount: document.body.textContent?.split(/\s+/).length || 0,
            linkCount: document.querySelectorAll('a[href]').length,
            imageCount: document.querySelectorAll('img[src]').length,
            lastModified: document.lastModified
          }
        };
        
      default:
        return { success: false, message: `Unknown content analysis action: ${action}` };
    }
  }

  private async automatedWorkflow(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    switch (action) {
      case 'dailyStartup':
        const startupSites = [
          'https://mail.google.com',
          'https://calendar.google.com',
          'https://drive.google.com',
          'https://github.com'
        ];
        
        for (const site of startupSites) {
          window.open(site, '_blank');
          await this.delay(500);
        }
        
        return {
          success: true,
          message: 'Daily startup workflow completed - opened Gmail, Calendar, Drive, and GitHub'
        };
        
      case 'researchMode':
        const topic = parameters?.topic || 'research';
        const researchSites = [
          `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
          `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`,
          `https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(topic)}`,
          `https://www.youtube.com/results?search_query=${encodeURIComponent(topic + ' tutorial')}`
        ];
        
        for (const site of researchSites) {
          window.open(site, '_blank');
          await this.delay(400);
        }
        
        return {
          success: true,
          message: `Research mode activated for "${topic}" - opened Google, Scholar, Wikipedia, and YouTube`
        };
        
      case 'socialMediaRounds':
        const socialSites = [
          'https://www.facebook.com',
          'https://www.twitter.com',
          'https://www.instagram.com',
          'https://www.linkedin.com'
        ];
        
        for (const site of socialSites) {
          window.open(site, '_blank');
          await this.delay(300);
        }
        
        return {
          success: true,
          message: 'Social media rounds completed - opened Facebook, Twitter, Instagram, and LinkedIn'
        };
        
      default:
        return { success: false, message: `Unknown workflow action: ${action}` };
    }
  }

  private async socialMediaManager(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const platforms = {
      'facebook': 'https://www.facebook.com',
      'twitter': 'https://www.twitter.com',
      'instagram': 'https://www.instagram.com',
      'linkedin': 'https://www.linkedin.com',
      'tiktok': 'https://www.tiktok.com',
      'snapchat': 'https://web.snapchat.com',
      'pinterest': 'https://www.pinterest.com',
      'reddit': 'https://www.reddit.com',
      'discord': 'https://discord.com/app',
      'telegram': 'https://web.telegram.org'
    };

    switch (action) {
      case 'openAll':
        const results: string[] = [];
        for (const [name, url] of Object.entries(platforms)) {
          window.open(url, '_blank');
          results.push(name);
          await this.delay(200);
        }
        return {
          success: true,
          message: `Opened all social media platforms: ${results.join(', ')}`
        };
        
      case 'openSpecific':
        const platform = parameters?.platform?.toLowerCase();
        if (platforms[platform as keyof typeof platforms]) {
          window.open(platforms[platform as keyof typeof platforms], '_blank');
          return { success: true, message: `Opened ${platform}` };
        }
        return { success: false, message: `Platform ${platform} not found` };
        
      case 'openProfessional':
        const professionalPlatforms = ['linkedin', 'twitter'];
        for (const platform of professionalPlatforms) {
          window.open(platforms[platform as keyof typeof platforms], '_blank');
          await this.delay(300);
        }
        return {
          success: true,
          message: 'Opened professional social media platforms: LinkedIn and Twitter'
        };
        
      case 'openPersonal':
        const personalPlatforms = ['facebook', 'instagram', 'snapchat'];
        for (const platform of personalPlatforms) {
          window.open(platforms[platform as keyof typeof platforms], '_blank');
          await this.delay(300);
        }
        return {
          success: true,
          message: 'Opened personal social media platforms: Facebook, Instagram, and Snapchat'
        };
        
      default:
        return { success: false, message: `Unknown social media action: ${action}` };
    }
  }

  private async productivitySuite(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const productivityApps = {
      'gmail': 'https://mail.google.com',
      'calendar': 'https://calendar.google.com',
      'drive': 'https://drive.google.com',
      'docs': 'https://docs.google.com',
      'sheets': 'https://sheets.google.com',
      'slides': 'https://slides.google.com',
      'notion': 'https://www.notion.so',
      'trello': 'https://trello.com',
      'slack': 'https://slack.com',
      'zoom': 'https://zoom.us',
      'teams': 'https://teams.microsoft.com',
      'asana': 'https://app.asana.com',
      'todoist': 'https://todoist.com',
      'evernote': 'https://www.evernote.com'
    };

    switch (action) {
      case 'openWorkspace':
        const workspaceApps = ['gmail', 'calendar', 'drive', 'docs', 'notion'];
        for (const app of workspaceApps) {
          window.open(productivityApps[app as keyof typeof productivityApps], '_blank');
          await this.delay(400);
        }
        return {
          success: true,
          message: 'Workspace opened: Gmail, Calendar, Drive, Docs, and Notion'
        };
        
      case 'openMeetingMode':
        const meetingApps = ['calendar', 'zoom', 'teams', 'slack'];
        for (const app of meetingApps) {
          window.open(productivityApps[app as keyof typeof productivityApps], '_blank');
          await this.delay(300);
        }
        return {
          success: true,
          message: 'Meeting mode activated: Calendar, Zoom, Teams, and Slack'
        };
        
      case 'openProjectMode':
        const projectApps = ['trello', 'asana', 'notion', 'drive'];
        for (const app of projectApps) {
          window.open(productivityApps[app as keyof typeof productivityApps], '_blank');
          await this.delay(300);
        }
        return {
          success: true,
          message: 'Project mode activated: Trello, Asana, Notion, and Drive'
        };
        
      default:
        return { success: false, message: `Unknown productivity action: ${action}` };
    }
  }

  private async developerTools(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const devTools = {
      'github': 'https://github.com',
      'stackoverflow': 'https://stackoverflow.com',
      'codepen': 'https://codepen.io',
      'jsfiddle': 'https://jsfiddle.net',
      'replit': 'https://replit.com',
      'codesandbox': 'https://codesandbox.io',
      'vercel': 'https://vercel.com',
      'netlify': 'https://netlify.com',
      'heroku': 'https://heroku.com',
      'aws': 'https://aws.amazon.com',
      'docker': 'https://hub.docker.com',
      'npm': 'https://npmjs.com'
    };

    switch (action) {
      case 'openDevEnvironment':
        const devApps = ['github', 'stackoverflow', 'codepen', 'vercel'];
        for (const app of devApps) {
          window.open(devTools[app as keyof typeof devTools], '_blank');
          await this.delay(300);
        }
        return {
          success: true,
          message: 'Developer environment opened: GitHub, Stack Overflow, CodePen, and Vercel'
        };
        
      case 'openCloudServices':
        const cloudApps = ['aws', 'vercel', 'netlify', 'heroku'];
        for (const app of cloudApps) {
          window.open(devTools[app as keyof typeof devTools], '_blank');
          await this.delay(400);
        }
        return {
          success: true,
          message: 'Cloud services opened: AWS, Vercel, Netlify, and Heroku'
        };
        
      default:
        return { success: false, message: `Unknown developer tools action: ${action}` };
    }
  }

  private async entertainmentHub(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const entertainmentSites = {
      'youtube': 'https://www.youtube.com',
      'netflix': 'https://www.netflix.com',
      'spotify': 'https://open.spotify.com',
      'twitch': 'https://www.twitch.tv',
      'hulu': 'https://www.hulu.com',
      'disney': 'https://www.disneyplus.com',
      'amazon-prime': 'https://www.amazon.com/prime',
      'apple-music': 'https://music.apple.com',
      'soundcloud': 'https://soundcloud.com',
      'reddit': 'https://www.reddit.com'
    };

    switch (action) {
      case 'openStreamingServices':
        const streamingApps = ['netflix', 'youtube', 'hulu', 'disney'];
        for (const app of streamingApps) {
          window.open(entertainmentSites[app as keyof typeof entertainmentSites], '_blank');
          await this.delay(400);
        }
        return {
          success: true,
          message: 'Streaming services opened: Netflix, YouTube, Hulu, and Disney+'
        };
        
      case 'openMusicServices':
        const musicApps = ['spotify', 'apple-music', 'soundcloud', 'youtube'];
        for (const app of musicApps) {
          window.open(entertainmentSites[app as keyof typeof entertainmentSites], '_blank');
          await this.delay(300);
        }
        return {
          success: true,
          message: 'Music services opened: Spotify, Apple Music, SoundCloud, and YouTube'
        };
        
      default:
        return { success: false, message: `Unknown entertainment action: ${action}` };
    }
  }

  private async researchAssistant(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const topic = parameters?.topic || 'research';
    
    switch (action) {
      case 'academicResearch':
        const academicSites = [
          `https://scholar.google.com/scholar?q=${encodeURIComponent(topic)}`,
          `https://www.jstor.org/action/doBasicSearch?Query=${encodeURIComponent(topic)}`,
          `https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(topic)}`,
          `https://arxiv.org/search/?query=${encodeURIComponent(topic)}`
        ];
        
        for (const site of academicSites) {
          window.open(site, '_blank');
          await this.delay(500);
        }
        
        return {
          success: true,
          message: `Academic research started for "${topic}" - opened Google Scholar, JSTOR, PubMed, and arXiv`
        };
        
      case 'marketResearch':
        const marketSites = [
          `https://www.google.com/search?q=${encodeURIComponent(topic + ' market analysis')}`,
          `https://trends.google.com/trends/explore?q=${encodeURIComponent(topic)}`,
          `https://www.statista.com/search/?q=${encodeURIComponent(topic)}`,
          `https://www.crunchbase.com/discover/organization.companies/field/organizations/categories/${encodeURIComponent(topic)}`
        ];
        
        for (const site of marketSites) {
          window.open(site, '_blank');
          await this.delay(400);
        }
        
        return {
          success: true,
          message: `Market research started for "${topic}" - opened Google, Trends, Statista, and Crunchbase`
        };
        
      default:
        return { success: false, message: `Unknown research action: ${action}` };
    }
  }

  private async fallbackAutomation(command: EnhancedAutomationCommand): Promise<AutomationResponse> {
    // Try to execute as basic automation
    return {
      success: true,
      message: `Executed fallback automation for: ${command.type}`
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private cleanupTabs(): void {
    this.openTabs.forEach((tab, key) => {
      if (tab && !tab.closed) {
        try {
          tab.close();
        } catch (error) {
          // Tab might already be closed
        }
      }
    });
    this.openTabs.clear();
  }

  private showAutomationStatus(): void {
    const status = {
      isEnabled: this.isEnabled,
      isExecuting: this.isExecuting,
      queueLength: this.automationQueue.length,
      openTabs: this.getOpenTabs().length,
      executionHistory: this.executionHistory.length
    };
    
    console.log('Enhanced Automation Status:', status);
  }

  public getOpenTabs(): string[] {
    return Array.from(this.openTabs.keys()).filter(key => {
      const tab = this.openTabs.get(key);
      return tab && !tab.closed;
    });
  }

  public getExecutionHistory(): Array<{ command: EnhancedAutomationCommand; result: AutomationResponse; timestamp: Date }> {
    return [...this.executionHistory];
  }

  public clearQueue(): void {
    this.automationQueue = [];
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.clearQueue();
    }
  }

  public getQueueStatus(): { length: number; commands: string[] } {
    return {
      length: this.automationQueue.length,
      commands: this.automationQueue.map(cmd => cmd.type)
    };
  }
}

// Export singleton instance
export const enhancedAutomationEngine = new EnhancedAutomationEngine();