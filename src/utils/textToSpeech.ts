export class TextToSpeechEngine {
  private synth: SpeechSynthesis;
  private currentVoice: SpeechSynthesisVoice | null = null;
  private isEnabled: boolean = true;
  private rate: number = 1.0;
  private pitch: number = 1.0;
  private volume: number = 0.8;

  constructor() {
    this.synth = window.speechSynthesis;
    this.initializeVoice();
  }

  private initializeVoice(): void {
    const setVoice = () => {
      const voices = this.synth.getVoices();
      
      // Prefer male voices that sound more like JARVIS
      const preferredVoices = [
        'Google UK English Male',
        'Microsoft David - English (United States)',
        'Alex',
        'Daniel',
        'Google US English'
      ];

      for (const voiceName of preferredVoices) {
        const voice = voices.find(v => v.name.includes(voiceName));
        if (voice) {
          this.currentVoice = voice;
          return;
        }
      }

      // Fallback to any male voice
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('alex')
      );

      if (maleVoice) {
        this.currentVoice = maleVoice;
      } else if (voices.length > 0) {
        this.currentVoice = voices[0];
      }
    };

    if (this.synth.getVoices().length > 0) {
      setVoice();
    } else {
      this.synth.addEventListener('voiceschanged', setVoice);
    }
  }

  public speak(text: string, options?: {
    onStart?: () => void;
    onEnd?: () => void;
    onError?: (error: SpeechSynthesisErrorEvent) => void;
  }): void {
    if (!this.isEnabled || !text.trim()) return;

    // Stop any current speech
    this.stop();

    const utterance = new SpeechSynthesisUtterance(text);
    
    if (this.currentVoice) {
      utterance.voice = this.currentVoice;
    }
    
    utterance.rate = this.rate;
    utterance.pitch = this.pitch;
    utterance.volume = this.volume;

    if (options?.onStart) {
      utterance.onstart = options.onStart;
    }

    if (options?.onEnd) {
      utterance.onend = options.onEnd;
    }

    if (options?.onError) {
      utterance.onerror = options.onError;
    }

    this.synth.speak(utterance);
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

  public isEnabledState(): boolean {
    return this.isEnabled;
  }

  public setRate(rate: number): void {
    this.rate = Math.max(0.1, Math.min(2.0, rate));
  }

  public setPitch(pitch: number): void {
    this.pitch = Math.max(0, Math.min(2, pitch));
  }

  public setVolume(volume: number): void {
    this.volume = Math.max(0, Math.min(1, volume));
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synth.getVoices();
  }

  public setVoice(voice: SpeechSynthesisVoice): void {
    this.currentVoice = voice;
  }

  public getCurrentVoice(): SpeechSynthesisVoice | null {
    return this.currentVoice;
  }

  public isSpeaking(): boolean {
    return this.synth.speaking;
  }
}

// Singleton instance
export const ttsEngine = new TextToSpeechEngine();