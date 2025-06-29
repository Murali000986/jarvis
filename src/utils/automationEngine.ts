export interface AutomationCommand {
  type: string;
  target?: string;
  action?: string;
  parameters?: Record<string, any>;
}

export interface AutomationResponse {
  success: boolean;
  message: string;
  data?: any;
}

export class AutomationEngine {
  private isEnabled: boolean = true;
  private currentTab: any = null;

  constructor() {
    this.initializeAutomation();
  }

  private initializeAutomation(): void {
    // Initialize automation capabilities
    console.log('Automation Engine initialized');
  }

  public async executeCommand(command: AutomationCommand): Promise<AutomationResponse> {
    if (!this.isEnabled) {
      return {
        success: false,
        message: 'Automation is currently disabled'
      };
    }

    try {
      switch (command.type) {
        case 'open':
          return await this.openApplication(command.target!);
        case 'close':
          return await this.closeApplication(command.target!);
        case 'browser':
          return await this.browserControl(command.action!, command.parameters);
        case 'system':
          return await this.systemControl(command.action!, command.parameters);
        case 'media':
          return await this.mediaControl(command.action!, command.parameters);
        case 'scroll':
          return await this.scrollControl(command.action!, command.parameters);
        default:
          return {
            success: false,
            message: `Unknown automation command: ${command.type}`
          };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Automation error: ${error.message}`
      };
    }
  }

  private async openApplication(appName: string): Promise<AutomationResponse> {
    const normalizedApp = appName.toLowerCase().trim();
    
    // Map common app names to their URLs or actions
    const appMappings: Record<string, () => Promise<AutomationResponse>> = {
      'chrome': () => this.openBrowser('chrome'),
      'google chrome': () => this.openBrowser('chrome'),
      'firefox': () => this.openBrowser('firefox'),
      'edge': () => this.openBrowser('edge'),
      'safari': () => this.openBrowser('safari'),
      'google': () => this.openWebsite('https://www.google.com'),
      'youtube': () => this.openWebsite('https://www.youtube.com'),
      'facebook': () => this.openWebsite('https://www.facebook.com'),
      'twitter': () => this.openWebsite('https://www.twitter.com'),
      'instagram': () => this.openWebsite('https://www.instagram.com'),
      'linkedin': () => this.openWebsite('https://www.linkedin.com'),
      'github': () => this.openWebsite('https://www.github.com'),
      'gmail': () => this.openWebsite('https://mail.google.com'),
      'whatsapp': () => this.openWebsite('https://web.whatsapp.com'),
      'discord': () => this.openWebsite('https://discord.com/app'),
      'spotify': () => this.openWebsite('https://open.spotify.com'),
      'netflix': () => this.openWebsite('https://www.netflix.com'),
      'amazon': () => this.openWebsite('https://www.amazon.com'),
      'notepad': () => this.openNotepad(),
      'calculator': () => this.openCalculator(),
      'settings': () => this.openSettings()
    };

    const handler = appMappings[normalizedApp];
    if (handler) {
      return await handler();
    }

    // If not found in mappings, try to open as a website
    if (normalizedApp.includes('.com') || normalizedApp.includes('.org') || normalizedApp.includes('.net')) {
      const url = normalizedApp.startsWith('http') ? normalizedApp : `https://${normalizedApp}`;
      return await this.openWebsite(url);
    }

    return {
      success: false,
      message: `I don't know how to open "${appName}". Try specifying a website URL or a supported application.`
    };
  }

  private async openBrowser(browserName: string): Promise<AutomationResponse> {
    try {
      // Since we're in a web environment, we can't actually launch external browsers
      // Instead, we'll open a new tab/window
      window.open('about:blank', '_blank');
      return {
        success: true,
        message: `Opening ${browserName} in a new tab`
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to open ${browserName}`
      };
    }
  }

  private async openWebsite(url: string): Promise<AutomationResponse> {
    try {
      const newWindow = window.open(url, '_blank');
      if (newWindow) {
        this.currentTab = newWindow;
        return {
          success: true,
          message: `Opening ${url}`
        };
      } else {
        return {
          success: false,
          message: 'Failed to open website. Please check if pop-ups are blocked.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `Failed to open ${url}`
      };
    }
  }

  private async openNotepad(): Promise<AutomationResponse> {
    // Open a simple text editor in a new window
    const notepadHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Notepad</title>
        <style>
          body { margin: 0; padding: 20px; font-family: monospace; background: #1a1a1a; color: white; }
          textarea { width: 100%; height: 90vh; background: #2a2a2a; color: white; border: 1px solid #444; padding: 10px; font-family: monospace; font-size: 14px; }
        </style>
      </head>
      <body>
        <h2>JARVIS Notepad</h2>
        <textarea placeholder="Start typing..."></textarea>
      </body>
      </html>
    `;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(notepadHTML);
      return {
        success: true,
        message: 'Notepad opened successfully'
      };
    }
    
    return {
      success: false,
      message: 'Failed to open notepad'
    };
  }

  private async openCalculator(): Promise<AutomationResponse> {
    // Open a simple calculator in a new window
    const calculatorHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Calculator</title>
        <style>
          body { margin: 0; padding: 20px; font-family: Arial; background: #1a1a1a; color: white; display: flex; justify-content: center; align-items: center; min-height: 100vh; }
          .calculator { background: #2a2a2a; padding: 20px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,212,255,0.3); }
          .display { width: 100%; height: 60px; font-size: 24px; text-align: right; margin-bottom: 10px; background: #1a1a1a; color: #00d4ff; border: none; padding: 0 10px; }
          .buttons { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
          button { height: 60px; font-size: 18px; border: none; border-radius: 5px; cursor: pointer; background: #444; color: white; }
          button:hover { background: #555; }
          .operator { background: #00d4ff; color: black; }
        </style>
      </head>
      <body>
        <div class="calculator">
          <input type="text" class="display" id="display" readonly>
          <div class="buttons">
            <button onclick="clearDisplay()">C</button>
            <button onclick="deleteLast()">⌫</button>
            <button onclick="appendToDisplay('/')" class="operator">÷</button>
            <button onclick="appendToDisplay('*')" class="operator">×</button>
            <button onclick="appendToDisplay('7')">7</button>
            <button onclick="appendToDisplay('8')">8</button>
            <button onclick="appendToDisplay('9')">9</button>
            <button onclick="appendToDisplay('-')" class="operator">-</button>
            <button onclick="appendToDisplay('4')">4</button>
            <button onclick="appendToDisplay('5')">5</button>
            <button onclick="appendToDisplay('6')">6</button>
            <button onclick="appendToDisplay('+')" class="operator">+</button>
            <button onclick="appendToDisplay('1')">1</button>
            <button onclick="appendToDisplay('2')">2</button>
            <button onclick="appendToDisplay('3')">3</button>
            <button onclick="calculate()" class="operator" style="grid-row: span 2;">=</button>
            <button onclick="appendToDisplay('0')" style="grid-column: span 2;">0</button>
            <button onclick="appendToDisplay('.')">.</button>
          </div>
        </div>
        <script>
          function appendToDisplay(value) {
            document.getElementById('display').value += value;
          }
          function clearDisplay() {
            document.getElementById('display').value = '';
          }
          function deleteLast() {
            const display = document.getElementById('display');
            display.value = display.value.slice(0, -1);
          }
          function calculate() {
            try {
              const result = eval(document.getElementById('display').value.replace('×', '*').replace('÷', '/'));
              document.getElementById('display').value = result;
            } catch (error) {
              document.getElementById('display').value = 'Error';
            }
          }
        </script>
      </body>
      </html>
    `;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(calculatorHTML);
      return {
        success: true,
        message: 'Calculator opened successfully'
      };
    }
    
    return {
      success: false,
      message: 'Failed to open calculator'
    };
  }

  private async openSettings(): Promise<AutomationResponse> {
    return {
      success: true,
      message: 'Settings panel would open here (not implemented in web version)'
    };
  }

  private async closeApplication(appName: string): Promise<AutomationResponse> {
    if (this.currentTab && !this.currentTab.closed) {
      this.currentTab.close();
      this.currentTab = null;
      return {
        success: true,
        message: `Closed ${appName}`
      };
    }
    
    return {
      success: true,
      message: `Attempted to close ${appName}`
    };
  }

  private async browserControl(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    switch (action) {
      case 'scroll':
        return await this.scrollControl(parameters?.direction || 'down', parameters);
      case 'refresh':
        window.location.reload();
        return { success: true, message: 'Page refreshed' };
      case 'back':
        window.history.back();
        return { success: true, message: 'Navigated back' };
      case 'forward':
        window.history.forward();
        return { success: true, message: 'Navigated forward' };
      case 'fullscreen':
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          return { success: true, message: 'Entered fullscreen mode' };
        }
        return { success: false, message: 'Fullscreen not supported' };
      case 'zoom':
        const zoomLevel = parameters?.level || 1.1;
        document.body.style.zoom = zoomLevel.toString();
        return { success: true, message: `Zoomed to ${Math.round(zoomLevel * 100)}%` };
      default:
        return { success: false, message: `Unknown browser action: ${action}` };
    }
  }

  private async scrollControl(direction: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    const scrollAmount = parameters?.amount || 300;
    const smooth = parameters?.smooth !== false;
    
    const scrollOptions: ScrollToOptions = {
      behavior: smooth ? 'smooth' : 'auto'
    };

    switch (direction.toLowerCase()) {
      case 'up':
        window.scrollBy({ top: -scrollAmount, ...scrollOptions });
        return { success: true, message: 'Scrolled up' };
      case 'down':
        window.scrollBy({ top: scrollAmount, ...scrollOptions });
        return { success: true, message: 'Scrolled down' };
      case 'left':
        window.scrollBy({ left: -scrollAmount, ...scrollOptions });
        return { success: true, message: 'Scrolled left' };
      case 'right':
        window.scrollBy({ left: scrollAmount, ...scrollOptions });
        return { success: true, message: 'Scrolled right' };
      case 'top':
        window.scrollTo({ top: 0, ...scrollOptions });
        return { success: true, message: 'Scrolled to top' };
      case 'bottom':
        window.scrollTo({ top: document.body.scrollHeight, ...scrollOptions });
        return { success: true, message: 'Scrolled to bottom' };
      default:
        return { success: false, message: `Unknown scroll direction: ${direction}` };
    }
  }

  private async systemControl(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    switch (action) {
      case 'volume':
        const volumeAction = parameters?.action || 'toggle';
        return { success: true, message: `Volume ${volumeAction} (system control not available in web)` };
      case 'brightness':
        const brightnessLevel = parameters?.level || 50;
        return { success: true, message: `Brightness set to ${brightnessLevel}% (system control not available in web)` };
      case 'screenshot':
        return { success: true, message: 'Screenshot taken (system control not available in web)' };
      default:
        return { success: false, message: `Unknown system action: ${action}` };
    }
  }

  private async mediaControl(action: string, parameters?: Record<string, any>): Promise<AutomationResponse> {
    // Try to control media on the current page
    const mediaElements = document.querySelectorAll('video, audio');
    
    switch (action) {
      case 'play':
        mediaElements.forEach((element: any) => {
          if (element.paused) element.play();
        });
        return { success: true, message: 'Media playback started' };
      case 'pause':
        mediaElements.forEach((element: any) => {
          if (!element.paused) element.pause();
        });
        return { success: true, message: 'Media playback paused' };
      case 'stop':
        mediaElements.forEach((element: any) => {
          element.pause();
          element.currentTime = 0;
        });
        return { success: true, message: 'Media playback stopped' };
      case 'volume':
        const volume = Math.max(0, Math.min(1, (parameters?.level || 50) / 100));
        mediaElements.forEach((element: any) => {
          element.volume = volume;
        });
        return { success: true, message: `Media volume set to ${Math.round(volume * 100)}%` };
      default:
        return { success: false, message: `Unknown media action: ${action}` };
    }
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  public isAutomationEnabled(): boolean {
    return this.isEnabled;
  }

  public getSupportedCommands(): string[] {
    return [
      'open [application/website]',
      'close [application]',
      'scroll [up/down/left/right/top/bottom]',
      'refresh page',
      'go back',
      'go forward',
      'fullscreen',
      'zoom [level]',
      'play media',
      'pause media',
      'stop media',
      'volume [level]'
    ];
  }
}

// Export singleton instance
export const automationEngine = new AutomationEngine();