declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export class EnhancedSpeechRecognition {
  private recognition: SpeechRecognition | null = null;
  private isSupported: boolean;

  constructor() {
    this.isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
  }

  public isAvailable(): boolean {
    return this.isSupported;
  }

  public start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void,
    onEnd: () => void
  ): boolean {
    if (!this.isSupported) {
      onError('Speech recognition not supported');
      return false;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      const isFinal = event.results[event.results.length - 1].isFinal;
      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event) => {
      onError(event.error);
    };

    this.recognition.onend = onEnd;

    try {
      this.recognition.start();
      return true;
    } catch (error) {
      onError('Failed to start speech recognition');
      return false;
    }
  }

  public stop(): void {
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }
}