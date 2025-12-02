class AudioService {
  private synth: SpeechSynthesis;
  private audioCtx: AudioContext | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
    // Initialize Audio Context lazily
    if (typeof window !== 'undefined') {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    
    // Attempt to load voices immediately and on change
    this.loadVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = this.loadVoice.bind(this);
    }
  }

  private loadVoice() {
    const voices = this.synth.getVoices();
    // Prioritize Turkish voice, then fallback
    this.voice = voices.find(v => v.lang.includes('tr')) || voices[0] || null;
  }

  public speak(text: string) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = this.createUtterance(text);
    
    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
    };
    
    this.synth.speak(this.currentUtterance);
  }

  // New method specifically for Story Mode to handle sequencing
  public speakWithCallback(text: string, onEnd: () => void) {
    if (this.synth.speaking) {
      this.synth.cancel();
    }
    this.currentUtterance = this.createUtterance(text);
    
    // Bind the end event
    this.currentUtterance.onend = () => {
      this.currentUtterance = null;
      onEnd();
    };

    // Handle errors just in case to prevent hanging
    this.currentUtterance.onerror = (event) => {
      this.currentUtterance = null;
      // Gracefully handle cancellation (navigation away)
      if (event.error === 'canceled' || event.error === 'interrupted') {
        return;
      }
      console.warn("Speech error detected:", event.error);
      // Attempt to continue flow even if speech failed
      onEnd(); 
    };

    this.synth.speak(this.currentUtterance);
  }

  private createUtterance(text: string): SpeechSynthesisUtterance {
    if (!this.voice) this.loadVoice();

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.voice) {
      utterance.voice = this.voice;
    }
    utterance.lang = 'tr-TR';
    utterance.rate = 0.9; // Slightly faster for flow
    utterance.pitch = 1.1; // Cheerful tone
    return utterance;
  }

  public cancelSpeech() {
    this.synth.cancel();
    this.currentUtterance = null;
  }

  public resumeContext() {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private createOscillator(freq: number, type: OscillatorType, duration: number, startTime: number = 0) {
    if (!this.audioCtx) return;
    const osc = this.audioCtx.createOscillator();
    const gainNode = this.audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime + startTime);
    
    gainNode.gain.setValueAtTime(0.1, this.audioCtx.currentTime + startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(this.audioCtx.destination);

    osc.start(this.audioCtx.currentTime + startTime);
    osc.stop(this.audioCtx.currentTime + startTime + duration);
  }

  public playNote(note: string) {
    this.resumeContext();
    const notes: {[key: string]: number} = {
      'C': 261.63,
      'D': 293.66,
      'E': 329.63,
      'F': 349.23,
      'G': 392.00,
      'A': 440.00,
      'B': 493.88
    };
    const freq = notes[note];
    if (freq) {
      this.createOscillator(freq, 'triangle', 0.5, 0);
    }
  }

  public playCorrect() {
    this.resumeContext();
    // Happy Major Arpeggio
    this.createOscillator(523.25, 'sine', 0.3, 0);   // C5
    this.createOscillator(659.25, 'sine', 0.3, 0.1); // E5
    this.createOscillator(783.99, 'sine', 0.4, 0.2); // G5
    this.createOscillator(1046.50, 'sine', 0.5, 0.3); // C6
  }

  public playWrong() {
    this.resumeContext();
    // Sad Slide
    this.createOscillator(300, 'sawtooth', 0.4, 0);
    this.createOscillator(200, 'sawtooth', 0.4, 0.2);
  }

  public playClick() {
    this.resumeContext();
    this.createOscillator(800, 'triangle', 0.05, 0);
  }

  public playFlip() {
    this.resumeContext();
    // Short, soft pop for flipping cards
    this.createOscillator(400, 'sine', 0.1, 0);
  }

  public playFanfare() {
    this.resumeContext();
    // Simple victory tune
    [523, 659, 784, 1046, 784, 1046].forEach((freq, i) => {
        this.createOscillator(freq, 'square', 0.2, i * 0.15);
    });
  }
}

export const audioService = new AudioService();