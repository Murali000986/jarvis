export interface VoiceProfile {
  name: string;
  voice: SpeechSynthesisVoice | null;
  rate: number;
  pitch: number;
  volume: number;
  style: string;
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
      rate: 1.0,
      pitch: 0.8,
      volume: 0.8,
      style: 'professional'
    };
  }

  private initializeVoiceProfiles(): void {
    const setVoices = () => {
      const voices = this.synth.getVoices();
      
      // JARVIS Profile - Professional, slightly lower pitch
      const jarvisVoice = this.findBestVoice(voices, ['Google UK English Male', 'Microsoft David', 'Alex']);
      this.voiceProfiles.set('jarvis', {
        name: 'JARVIS',
        voice: jarvisVoice,
        rate: 1.0,
        pitch: 0.8,
        volume: 0.8,
        style: 'professional'
      });

      // ChatGPT Style - Warm and conversational
      const chatgptVoice = this.findBestVoice(voices, ['Google US English', 'Microsoft Zira', 'Samantha']);
      this.voiceProfiles.set('chatgpt', {
        name: 'ChatGPT',
        voice: chatgptVoice,
        rate: 1.1,
        pitch: 1.0,
        volume: 0.8,
        style: 'conversational'
      });

      // Assistant Style - Clear and helpful
      const assistantVoice = this.findBestVoice(voices, ['Google UK English Female', 'Microsoft Hazel', 'Victoria']);
      this.voiceProfiles.set('assistant', {
        name: 'Assistant',
        voice: assistantVoice,
        rate: 1.0,
        pitch: 1.1,
        volume: 0.8,
        style: 'helpful'
      });

      // Robotic Style - More mechanical
      const roboticVoice = this.findBestVoice(voices, ['Google Deutsch', 'Microsoft David', 'Fred']);
      this.voiceProfiles.set('robotic', {
        name: 'Robotic',
        voice: roboticVoice,
        rate: 0.9,
        pitch: 0.7,
        volume: 0.8,
        style: 'mechanical'
      });

      // Friendly Style - Warm and approachable
      const friendlyVoice = this.findBestVoice(voices, ['Google US English Female', 'Microsoft Zira', 'Karen']);
      this.voiceProfiles.set('friendly', {
        name: 'Friendly',
        voice: friendlyVoice,
        rate: 1.2,
        pitch: 1.2,
        volume: 0.8,
        style: 'warm'
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
    emotion?: 'neutral' | 'excited' | 'calm' | 'urgent';
  }): void {
    if (!this.isEnabled || !text.trim()) return;

    // Stop any current speech
    this.stop();

    // Use specified profile or current profile
    const profile = options?.profile ? this.voiceProfiles.get(options.profile) || this.currentProfile : this.currentProfile;
    
    // Apply emotional modulation
    const emotionalSettings = this.getEmotionalSettings(options?.emotion || 'neutral');

    const utterance = new SpeechSynthesisUtterance(this.preprocessText(text, profile.style));
    
    if (profile.voice) {
      utterance.voice = profile.voice;
    }
    
    utterance.rate = profile.rate * emotionalSettings.rateMultiplier;
    utterance.pitch = profile.pitch * emotionalSettings.pitchMultiplier;
    utterance.volume = profile.volume * emotionalSettings.volumeMultiplier;

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
      case 'professional':
        // Add slight pauses for professional delivery
        processedText = text.replace(/\./g, '. ').replace(/,/g, ', ');
        break;
      case 'conversational':
        // Make it sound more natural and friendly
        processedText = text.replace(/\b(I am|I'm)\b/g, "I'm")
                          .replace(/\bcannot\b/g, "can't")
                          .replace(/\bdo not\b/g, "don't");
        break;
      case 'mechanical':
        // More robotic speech patterns
        processedText = text.replace(/\b(I'm|I am)\b/g, "I am")
                          .replace(/\bcan't\b/g, "cannot")
                          .replace(/\bdon't\b/g, "do not");
        break;
    }

    return processedText;
  }

  private getEmotionalSettings(emotion: string): {
    rateMultiplier: number;
    pitchMultiplier: number;
    volumeMultiplier: number;
  } {
    switch (emotion) {
      case 'excited':
        return { rateMultiplier: 1.2, pitchMultiplier: 1.3, volumeMultiplier: 1.0 };
      case 'calm':
        return { rateMultiplier: 0.8, pitchMultiplier: 0.9, volumeMultiplier: 0.9 };
      case 'urgent':
        return { rateMultiplier: 1.3, pitchMultiplier: 1.1, volumeMultiplier: 1.0 };
      default:
        return { rateMultiplier: 1.0, pitchMultiplier: 1.0, volumeMultiplier: 1.0 };
    }
  }

  public setVoiceProfile(profileName: string): boolean {
    const profile = this.voiceProfiles.get(profileName);
    if (profile) {
      this.currentProfile = profile;
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
      style: settings.style || 'neutral'
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
}

// Export singleton instance
export const enhancedTtsEngine = new EnhancedTextToSpeechEngine();