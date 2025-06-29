export interface ScrollCommand {
  type: 'scroll' | 'autoScroll' | 'smartScroll';
  direction: 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom';
  amount?: number;
  speed?: number;
  smooth?: boolean;
  target?: string;
  continuous?: boolean;
  stopCondition?: string;
  duration?: number;
}

export interface ScrollResponse {
  success: boolean;
  message: string;
  position?: { x: number; y: number };
  completed?: boolean;
}

export class AdvancedScrollEngine {
  private isScrolling: boolean = false;
  private scrollInterval: NodeJS.Timeout | null = null;
  private currentScrollCommand: ScrollCommand | null = null;
  private scrollHistory: Array<{ x: number; y: number; timestamp: Date }> = [];
  private scrollStartTime: number = 0;

  constructor() {
    this.initializeScrollEngine();
  }

  private initializeScrollEngine(): void {
    // Track scroll position for smart features
    window.addEventListener('scroll', this.trackScrollPosition.bind(this));
    console.log('Advanced Scroll Engine v2.0 initialized');
  }

  private trackScrollPosition(): void {
    this.scrollHistory.push({
      x: window.scrollX,
      y: window.scrollY,
      timestamp: new Date()
    });

    // Keep only last 50 positions
    if (this.scrollHistory.length > 50) {
      this.scrollHistory.shift();
    }
  }

  public async executeScrollCommand(command: ScrollCommand): Promise<ScrollResponse> {
    try {
      // Stop any current scrolling
      this.stopScrolling();

      this.currentScrollCommand = command;

      switch (command.type) {
        case 'scroll':
          return await this.basicScroll(command);
        case 'autoScroll':
          return await this.autoScroll(command);
        case 'smartScroll':
          return await this.smartScroll(command);
        default:
          return {
            success: false,
            message: `Unknown scroll type: ${command.type}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Scroll error: ${error.message}`
      };
    }
  }

  private async basicScroll(command: ScrollCommand): Promise<ScrollResponse> {
    const amount = command.amount || 300;
    const smooth = command.smooth !== false;

    const scrollOptions: ScrollToOptions = {
      behavior: smooth ? 'smooth' : 'auto'
    };

    const currentX = window.scrollX;
    const currentY = window.scrollY;

    switch (command.direction) {
      case 'up':
        window.scrollBy({ top: -amount, ...scrollOptions });
        break;
      case 'down':
        window.scrollBy({ top: amount, ...scrollOptions });
        break;
      case 'left':
        window.scrollBy({ left: -amount, ...scrollOptions });
        break;
      case 'right':
        window.scrollBy({ left: amount, ...scrollOptions });
        break;
      case 'top':
        window.scrollTo({ top: 0, ...scrollOptions });
        break;
      case 'bottom':
        window.scrollTo({ top: document.body.scrollHeight, ...scrollOptions });
        break;
    }

    return {
      success: true,
      message: `Scrolled ${command.direction} by ${amount}px`,
      position: { x: window.scrollX, y: window.scrollY }
    };
  }

  private async autoScroll(command: ScrollCommand): Promise<ScrollResponse> {
    return new Promise((resolve) => {
      const amount = command.amount || 100;
      const speed = command.speed || 1000;
      const direction = command.direction;
      const duration = command.duration || 20000; // Default 20 seconds
      
      let scrollCount = 0;
      const maxScrolls = Math.floor(duration / speed);

      this.isScrolling = true;
      this.scrollStartTime = Date.now();

      const performScroll = () => {
        if (!this.isScrolling || scrollCount >= maxScrolls) {
          this.stopScrolling();
          resolve({
            success: true,
            message: `Auto-scroll completed. Scrolled ${scrollCount} times in ${Math.round((Date.now() - this.scrollStartTime) / 1000)}s.`,
            position: { x: window.scrollX, y: window.scrollY },
            completed: true
          });
          return;
        }

        const previousY = window.scrollY;
        const previousX = window.scrollX;

        // Add visual feedback during auto-scroll
        this.addScrollIndicator(direction);

        switch (direction) {
          case 'up':
            window.scrollBy({ top: -amount, behavior: 'smooth' });
            break;
          case 'down':
            window.scrollBy({ top: amount, behavior: 'smooth' });
            break;
          case 'left':
            window.scrollBy({ left: -amount, behavior: 'smooth' });
            break;
          case 'right':
            window.scrollBy({ left: amount, behavior: 'smooth' });
            break;
        }

        scrollCount++;

        // Check if we've reached the end
        setTimeout(() => {
          const currentY = window.scrollY;
          const currentX = window.scrollX;

          if ((direction === 'down' && currentY === previousY && currentY >= document.body.scrollHeight - window.innerHeight) ||
              (direction === 'up' && currentY === previousY && currentY <= 0) ||
              (direction === 'right' && currentX === previousX && currentX >= document.body.scrollWidth - window.innerWidth) ||
              (direction === 'left' && currentX === previousX && currentX <= 0)) {
            this.stopScrolling();
            resolve({
              success: true,
              message: `Auto-scroll reached the end after ${scrollCount} scrolls.`,
              position: { x: window.scrollX, y: window.scrollY },
              completed: true
            });
          }
        }, 100);
      };

      this.scrollInterval = setInterval(performScroll, speed);
      performScroll(); // Start immediately

      // Initial response
      resolve({
        success: true,
        message: `Started auto-scrolling ${direction} for ${duration/1000}s`,
        position: { x: window.scrollX, y: window.scrollY }
      });
    });
  }

  private addScrollIndicator(direction: string): void {
    // Create visual indicator for auto-scroll
    const indicator = document.createElement('div');
    indicator.className = 'scroll-indicator';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: rgba(0, 212, 255, 0.9);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      z-index: 10000;
      pointer-events: none;
      animation: pulse 1s infinite;
    `;
    indicator.textContent = `Auto-scrolling ${direction}...`;
    
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    }, 1000);
  }

  private async smartScroll(command: ScrollCommand): Promise<ScrollResponse> {
    const target = command.target;
    
    if (target) {
      return await this.scrollToElement(target);
    }

    // Smart scroll based on content
    return await this.intelligentScroll(command);
  }

  private async scrollToElement(selector: string): Promise<ScrollResponse> {
    try {
      let element = document.querySelector(selector);
      
      if (!element) {
        // Try to find element by text content
        const elements = Array.from(document.querySelectorAll('*')).filter(el => 
          el.textContent?.toLowerCase().includes(selector.toLowerCase())
        );
        
        if (elements.length > 0) {
          element = elements[0];
        }
      }

      if (!element) {
        // Try common content selectors
        const commonSelectors = [
          `[id*="${selector}"]`,
          `[class*="${selector}"]`,
          `h1:contains("${selector}")`,
          `h2:contains("${selector}")`,
          `h3:contains("${selector}")`,
          `.${selector}`,
          `#${selector}`
        ];

        for (const sel of commonSelectors) {
          element = document.querySelector(sel);
          if (element) break;
        }
      }
      
      if (!element) {
        return {
          success: false,
          message: `Element "${selector}" not found`
        };
      }

      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Highlight the element briefly
      this.highlightElement(element as HTMLElement);
      
      return {
        success: true,
        message: `Scrolled to element: ${selector}`,
        position: { x: window.scrollX, y: window.scrollY }
      };
    } catch (error: any) {
      return {
        success: false,
        message: `Error scrolling to element: ${error.message}`
      };
    }
  }

  private highlightElement(element: HTMLElement): void {
    const originalStyle = element.style.cssText;
    element.style.cssText += `
      outline: 3px solid #00d4ff !important;
      outline-offset: 2px !important;
      background-color: rgba(0, 212, 255, 0.1) !important;
      transition: all 0.3s ease !important;
    `;
    
    setTimeout(() => {
      element.style.cssText = originalStyle;
    }, 2000);
  }

  private async intelligentScroll(command: ScrollCommand): Promise<ScrollResponse> {
    // Analyze page structure for intelligent scrolling
    const articles = document.querySelectorAll('article, .article, .post, .content, .main-content, main');
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const sections = document.querySelectorAll('section, .section, .container, .wrapper');
    const paragraphs = document.querySelectorAll('p');

    let targetElement: Element | null = null;
    const viewportHeight = window.innerHeight;
    const currentScroll = window.scrollY;

    switch (command.direction) {
      case 'down':
        // Find next content section below current view
        const elementsBelow = Array.from([...articles, ...headings, ...sections, ...paragraphs])
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.top > viewportHeight * 0.2 && rect.height > 50;
          })
          .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
        
        targetElement = elementsBelow[0] || null;
        break;
        
      case 'up':
        // Find previous content section above current view
        const elementsAbove = Array.from([...articles, ...headings, ...sections, ...paragraphs])
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.bottom < viewportHeight * 0.8 && rect.height > 50;
          })
          .sort((a, b) => b.getBoundingClientRect().top - a.getBoundingClientRect().top);
        
        targetElement = elementsAbove[0] || null;
        break;
    }

    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      this.highlightElement(targetElement as HTMLElement);
      
      return {
        success: true,
        message: `Smart scrolled to next content section`,
        position: { x: window.scrollX, y: window.scrollY }
      };
    }

    // Fallback to regular scroll
    return await this.basicScroll(command);
  }

  public stopScrolling(): void {
    this.isScrolling = false;
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
    this.currentScrollCommand = null;
    
    // Remove any scroll indicators
    const indicators = document.querySelectorAll('.scroll-indicator');
    indicators.forEach(indicator => {
      if (indicator.parentNode) {
        indicator.parentNode.removeChild(indicator);
      }
    });
  }

  public isCurrentlyScrolling(): boolean {
    return this.isScrolling;
  }

  public getCurrentScrollCommand(): ScrollCommand | null {
    return this.currentScrollCommand;
  }

  public getScrollHistory(): Array<{ x: number; y: number; timestamp: Date }> {
    return [...this.scrollHistory];
  }

  public scrollToPercentage(percentage: number, smooth: boolean = true): ScrollResponse {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const targetScroll = (maxScroll * percentage) / 100;

    window.scrollTo({
      top: targetScroll,
      behavior: smooth ? 'smooth' : 'auto'
    });

    return {
      success: true,
      message: `Scrolled to ${percentage}% of page`,
      position: { x: window.scrollX, y: window.scrollY }
    };
  }

  public getScrollPercentage(): number {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    return maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
  }

  // Enhanced voice command parsing
  public parseScrollCommand(input: string): ScrollCommand | null {
    const lowerInput = input.toLowerCase();

    // Auto scroll commands with duration
    if (lowerInput.includes('auto scroll') || lowerInput.includes('keep scrolling')) {
      const direction = this.extractDirection(lowerInput);
      const speed = this.extractSpeed(lowerInput);
      const duration = this.extractDuration(lowerInput);
      
      return {
        type: 'autoScroll',
        direction: direction || 'down',
        speed: speed || 2000,
        continuous: true,
        duration: duration || 20000
      };
    }

    // Smart scroll commands
    if (lowerInput.includes('smart scroll') || lowerInput.includes('scroll to next')) {
      const direction = this.extractDirection(lowerInput);
      
      return {
        type: 'smartScroll',
        direction: direction || 'down'
      };
    }

    // Scroll to element
    if (lowerInput.includes('scroll to')) {
      const target = lowerInput.replace(/.*scroll to\s+/, '').trim();
      
      return {
        type: 'smartScroll',
        direction: 'down',
        target: target
      };
    }

    // Percentage scroll
    const percentageMatch = lowerInput.match(/scroll to (\d+)%/);
    if (percentageMatch) {
      const percentage = parseInt(percentageMatch[1]);
      return {
        type: 'scroll',
        direction: percentage > this.getScrollPercentage() ? 'down' : 'up',
        amount: Math.abs(percentage - this.getScrollPercentage())
      };
    }

    // Basic scroll commands
    const direction = this.extractDirection(lowerInput);
    if (direction) {
      const amount = this.extractAmount(lowerInput);
      const speed = this.extractSpeed(lowerInput);
      
      return {
        type: 'scroll',
        direction,
        amount: amount || 300,
        speed: speed || 1000,
        smooth: !lowerInput.includes('fast') && !lowerInput.includes('quick')
      };
    }

    return null;
  }

  private extractDirection(input: string): 'up' | 'down' | 'left' | 'right' | 'top' | 'bottom' | null {
    if (input.includes('up')) return 'up';
    if (input.includes('down')) return 'down';
    if (input.includes('left')) return 'left';
    if (input.includes('right')) return 'right';
    if (input.includes('top') || input.includes('beginning')) return 'top';
    if (input.includes('bottom') || input.includes('end')) return 'bottom';
    return null;
  }

  private extractAmount(input: string): number | null {
    const match = input.match(/(\d+)\s*(px|pixel|pixels)?/);
    return match ? parseInt(match[1]) : null;
  }

  private extractSpeed(input: string): number | null {
    if (input.includes('very slow')) return 4000;
    if (input.includes('slow')) return 3000;
    if (input.includes('fast') || input.includes('quick')) return 500;
    if (input.includes('very fast')) return 200;
    if (input.includes('medium')) return 1500;
    
    const match = input.match(/(\d+)\s*(ms|millisecond|milliseconds|second|seconds)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return unit.includes('second') ? value * 1000 : value;
    }
    
    return null;
  }

  private extractDuration(input: string): number | null {
    const match = input.match(/for\s+(\d+)\s*(second|seconds|minute|minutes)/);
    if (match) {
      const value = parseInt(match[1]);
      const unit = match[2];
      return unit.includes('minute') ? value * 60000 : value * 1000;
    }
    return null;
  }
}

// Export singleton instance
export const advancedScrollEngine = new AdvancedScrollEngine();