export interface VoiceProfile {
  name: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  style: string;
  description: string;
}

export class EnhancedTextToSpeechEngine {
  private synth: SpeechSynthesis;
  private currentProfile: VoiceProfile;
  private isEnabled: boolean = true;
  private voiceProfiles: Map<string, VoiceProfile> = new Map();

  constructor() {
    this.synth = window.speechSynthesis;
    this.currentProfile = this.createDefaultProfile();
    this.initializeVoiceProfiles();
  }

  private createDefaultProfile(): VoiceProfile {
    return {
      name: 'JARVIS',
      voice: null,
      rate: 0.9,
      pitch: 0.6,
      volume: 0.9,
      style: 'professional',
      description: 'Authentic JARVIS voice - Deep, authoritative, and sophisticated'
    };
  }

  private initializeVoiceProfiles(): void {
    const setVoices = () => {
      const voices = this.synth.getVoices();
      
      // JARVIS Profile - Deep, authoritative, sophisticated (like Iron Man's JARVIS)
      const jarvisVoice = this.findBestJarvisVoice(voices);
      this.voiceProfiles.set('jarvis', {
        name: 'JARVIS',
        voice: jarvisVoice,
        rate: 0.9,        // Slightly slower for authority
        pitch: 0.6,       // Much lower pitch for that deep JARVIS sound
        volume: 0.9,      // Clear and present
        style: 'sophisticated',
        description: 'Authentic JARVIS voice - Deep, authoritative, and sophisticated'
      });

      // JARVIS Mark II - Even deeper and more robotic
      this.voiceProfiles.set('jarvis-mk2', {
        name: 'JARVIS Mark II',
        voice: this.findBestVoice(voices, ['Microsoft David', 'Google UK English Male', 'Alex']),
        rate: 0.8,        // Slower for more dramatic effect
        pitch: 0.5,       // Very low pitch
        volume: 0.95,
        style: 'cinematic',
        description: 'Enhanced JARVIS with deeper, more cinematic voice'
      });

      // Friday (JARVIS successor from MCU)
      const fridayVoice = this.findBestVoice(voices, ['Microsoft Zira', 'Google UK English Female', 'Karen', 'Samantha']);
      this.voiceProfiles.set('friday', {
        name: 'FRIDAY',
        voice: fridayVoice,
        rate: 1.0,
        pitch: 0.8,
        volume: 0.85,
        style: 'efficient',
        description: 'FRIDAY AI - Efficient and direct like Tony Stark\'s later assistant'
      });

      // ChatGPT Style - Warm and conversational
      const chatgptVoice = this.findBestVoice(voices, ['Google US English', 'Microsoft Zira', 'Samantha']);
      this.voiceProfiles.set('chatgpt', {
        name: 'ChatGPT',
        voice: chatgptVoice,
        rate: 1.1,
        pitch: 1.0,
        volume: 0.8,
        style: 'conversational',
        description: 'Warm and conversational like ChatGPT'
      });

      // Assistant Style - Clear and helpful
      const assistantVoice = this.findBestVoice(voices, ['Google UK English Female', 'Microsoft Hazel', 'Victoria']);
      this.voiceProfiles.set('assistant', {
        name: 'Assistant',
        voice: assistantVoice,
        rate: 1.0,
        pitch: 1.1,
        volume: 0.8,
        style: 'helpful',
        description: 'Clear and helpful AI assistant'
      });

      // Robotic Style - More mechanical
      const roboticVoice = this.findBestVoice(voices, ['Microsoft David', 'Google Deutsch', 'Fred']);
      this.voiceProfiles.set('robotic', {
        name: 'Robotic',
        voice: roboticVoice,
        rate: 0.85,
        pitch: 0.7,
        volume: 0.8,
        style: 'mechanical',
        description: 'Mechanical and precise robotic voice'
      });

      // Set default to JARVIS
      this.currentProfile = this.voiceProfiles.get('jarvis') || this.currentProfile;
    };

    if (this.synth.getVoices().length > 0) {
      setVoices();
    } else {
      this.synth.addEventListener('voiceschanged', setVoices);
    }
  }

  private findBestJarvisVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
    // Prioritize voices that sound most like JARVIS
    const jarvisPreferences = [
      'Microsoft David - English (United States)',
      'Google UK English Male',
      'Alex',
      'Daniel',
      'Microsoft David',
      'Google US English Male',
      'Fred'
    ];

    for (const name of jarvisPreferences) {
      const voice = voices.find(v => v.name.includes(name) || v.name === name);
      if (voice) {
        console.log(`Selected JARVIS voice: ${voice.name}`);
        return voice;
      }
    }

    // Fallback to any male voice
    const maleVoice = voices.find(v => 
      v.name.toLowerCase().includes('male') || 
      v.name.toLowerCase().includes('david') ||
      v.name.toLowerCase().includes('alex') ||
      v.name.toLowerCase().includes('daniel')
    );

    return maleVoice || (voices.length > 0 ? voices[0] : null);
  }

  private findBestVoice(voices: SpeechSynthesisVoice[], preferredNames: string[]): SpeechSynthesisVoice | null {
    for (const name of preferredNames) {
      const voice = voices.find(v => v.name.includes(name));
      if (voice) return voice;
    }
    return voices.length > 0 ? voices[0] : null;
  }

  public speak(text: string, options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: SpeechSynthesisErrorEvent) => void;
    profile?: string;
    emotion?: 'neutral' | 'excited' | 'calm' | 'urgent' | 'authoritative';
  }): void {
    if (!this.isEnabled || !text.trim()) return;

    // Stop any current speech
    this.stop();

    // Use specified profile or current profile
    const profile = options?.profile ? this.voiceProfiles.get(options.profile) || this.currentProfile : this.currentProfile;
    
    // Apply emotional modulation
    const emotionalSettings = this.getEmotionalSettings(options?.emotion || 'neutral', profile.style);

    const utterance = new SpeechSynthesisUtterance(this.preprocessText(text, profile.style));
    
    if (profile.voice) {
      utterance.voice = profile.voice;
    }
    
    utterance.rate = Math.max(0.1, Math.min(2.0, profile.rate * emotionalSettings.rateMultiplier));
    utterance.pitch = Math.max(0, Math.min(2, profile.pitch * emotionalSettings.pitchMultiplier));
    utterance.volume = Math.max(0, Math.min(1, profile.volume * emotionalSettings.volumeMultiplier));

    if (options?.onStart) {
      utterance.onstart = options.onStart;
    }

    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }

    if (options?.onError) {
      utterance.onerror = (event) => {
        // Only report actual errors, not interruptions
        if (event.error !== 'interrupted') {
          options.onError!(event);
        }
      };
    }

    this.synth.speak(utterance);
  }

  private preprocessText(text: string, style: string): string {
    let processedText = text;

    switch (style) {
      case 'sophisticated':
      case 'cinematic':
        // JARVIS-style speech patterns
        processedText = text
          .replace(/\bI am\b/g, "I am")
          .replace(/\bI'm\b/g, "I am")
          .replace(/\bcan't\b/g, "cannot")
          .replace(/\bdon't\b/g, "do not")
          .replace(/\bwon't\b/g, "will not")
          .replace(/\bisn't\b/g, "is not")
          .replace(/\baren't\b/g, "are not")
          .replace(/\bhello\b/gi, "Good day")
          .replace(/\bhi\b/gi, "Greetings")
          .replace(/\bokay\b/gi, "Very well")
          .replace(/\bok\b/gi, "Understood")
          .replace(/\byes\b/gi, "Affirmative")
          .replace(/\bno\b/gi, "Negative");
        
        // Add JARVIS-style formality
        if (!processedText.match(/^(Good day|Greetings|Sir|Certainly|Of course|Very well)/)) {
          if (Math.random() > 0.7) {
            const jarvisPrefixes = ["Certainly", "Of course", "Very well", "Indeed", "Absolutely"];
            processedText = jarvisPrefixes[Math.floor(Math.random() * jarvisPrefixes.length)] + ". " + processedText;
          }
        }
        
        // Add slight pauses for dramatic effect
        processedText = processedText.replace(/\./g, '... ').replace(/,/g, ', ');
        break;
        
      case 'efficient':
        // FRIDAY-style efficiency
        processedText = text.replace(/\bI am\b/g, "I'm")
                          .replace(/\bcannot\b/g, "can't")
                          .replace(/\bdo not\b/g, "don't");
        break;
        
      case 'conversational':
        // ChatGPT-style natural speech
        processedText = text.replace(/\b(I am|I'm)\b/g, "I'm")
                          .replace(/\bcannot\b/g, "can't")
                          .replace(/\bdo not\b/g, "don't");
        break;
        
      case 'mechanical':
        // More robotic speech patterns
        processedText = text.replace(/\b(I'm|I am)\b/g, "I am")
                          .replace(/\bcan't\b/g, "cannot")
                          .replace(/\bdon't\b/g, "do not")
                          .replace(/\bhello\b/gi, "Greetings")
                          .replace(/\byes\b/gi, "Affirmative")
                          .replace(/\bno\b/gi, "Negative");
        break;
    }

    return processedText;
  }

  private getEmotionalSettings(emotion: string, style: string): {
    rateMultiplier: number;
    pitchMultiplier: number;
    volumeMultiplier: number;
  } {
    // Base settings for JARVIS-style voices
    const baseSettings = style === 'sophisticated' || style === 'cinematic' ? {
      rateMultiplier: 0.95,
      pitchMultiplier: 0.9,
      volumeMultiplier: 1.0
    } : {
      rateMultiplier: 1.0,
      pitchMultiplier: 1.0,
      volumeMultiplier: 1.0
    };

    switch (emotion) {
      case 'excited':
        return { 
          rateMultiplier: baseSettings.rateMultiplier * 1.1, 
          pitchMultiplier: baseSettings.pitchMultiplier * 1.2, 
          volumeMultiplier: baseSettings.volumeMultiplier 
        };
      case 'calm':
        return { 
          rateMultiplier: baseSettings.rateMultiplier * 0.85, 
          pitchMultiplier: baseSettings.pitchMultiplier * 0.9, 
          volumeMultiplier: baseSettings.volumeMultiplier * 0.9 
        };
      case 'urgent':
        return { 
          rateMultiplier: baseSettings.rateMultiplier * 1.2, 
          pitchMultiplier: baseSettings.pitchMultiplier * 1.1, 
          volumeMultiplier: baseSettings.volumeMultiplier 
        };
      case 'authoritative':
        return { 
          rateMultiplier: baseSettings.rateMultiplier * 0.9, 
          pitchMultiplier: baseSettings.pitchMultiplier * 0.8, 
          volumeMultiplier: baseSettings.volumeMultiplier * 1.1 
        };
      default:
        return baseSettings;
    }
  }

  public setVoiceProfile(profileName: string): boolean {
    const profile = this.voiceProfiles.get(profileName);
    if (profile) {
      this.currentProfile = profile;
      console.log(`Voice profile changed to: ${profile.name}`);
      return true;
    }
    return false;
  }

  public getCurrentProfile(): VoiceProfile {
    return this.currentProfile;
  }

  public getAvailableProfiles(): VoiceProfile[] {
    return Array.from(this.voiceProfiles.values());
  }

  public createCustomProfile(name: string, settings: Partial<VoiceProfile>): void {
    const voices = this.synth.getVoices();
    const profile: VoiceProfile = {
      name,
      voice: settings.voice || voices[0] || null,
      rate: settings.rate || 1.0,
      pitch: settings.pitch || 1.0,
      volume: settings.volume || 0.8,
      style: settings.style || 'neutral',
      description: settings.description || 'Custom voice profile'
    };
    
    this.voiceProfiles.set(name.toLowerCase(), profile);
  }

  public stop(): void {
    this.synth.cancel();
  }

  public pause(): void {
    this.synth.pause();
  }

  public resume(): void {
    this.synth.resume();
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (!enabled) {
      this.stop();
    }
  }

  public isSpeaking(): boolean {
    return this.synth.speaking;
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  // Method to test JARVIS voice specifically
  public testJarvisVoice(): void {
    this.speak("Good day. I am JARVIS, your advanced artificial intelligence assistant. All systems are operational and ready to serve.", {
      emotion: 'authoritative'
    });
  }
}

// Export singleton instance
export const enhancedTtsEngine = new EnhancedTextToSpeechEngine();