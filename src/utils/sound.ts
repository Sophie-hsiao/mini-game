interface MelodyNote {
  freq: number;
  beats: number;
  bassFreq?: number;
}

const NOTE_FREQ: Record<string, number> = {
  D3: 146.83,
  E3: 164.81,
  'F#3': 185.0,
  A3: 220.0,
  B3: 246.94,
  'C#4': 277.18,
  D4: 293.66,
  E4: 329.63,
  'F#4': 369.99,
  A4: 440.0,
  B4: 493.88,
  'C#5': 554.37,
  D5: 587.33,
  E5: 659.25,
  'F#5': 739.99,
  A5: 880.0,
  B5: 987.77,
};

// Instrumental arrangement inspired by Jay Chou's 《青花瓷》 (A Major pentatonic, ~84 BPM)
const QING_HUA_CI_SEQUENCE: MelodyNote[] = [
  // Verse: 素胚勾勒出青花 筆鋒濃轉淡
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ.A3 },
  { freq: NOTE_FREQ['F#5'], beats: 0.5 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ.B5, beats: 0.5, bassFreq: NOTE_FREQ.E3 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ['F#5'], beats: 1.0 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ['F#3'] },
  { freq: NOTE_FREQ['F#5'], beats: 0.5 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ['F#5'], beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 1.5, bassFreq: NOTE_FREQ.D3 },
  { freq: 0, beats: 0.5 },

  // Verse: 瓶身描繪的牡丹 一如妳初妝
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ.A3 },
  { freq: NOTE_FREQ['F#5'], beats: 0.5 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ.B5, beats: 0.5, bassFreq: NOTE_FREQ.E3 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ['F#5'], beats: 1.0 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ.D3 },
  { freq: NOTE_FREQ['F#5'], beats: 0.5 },
  { freq: NOTE_FREQ.A5, beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ['F#5'], beats: 1.5, bassFreq: NOTE_FREQ.E3 },
  { freq: 0, beats: 0.5 },

  // Chorus 1: 天青色等煙雨 而我在等妳
  { freq: NOTE_FREQ.A4, beats: 0.5, bassFreq: NOTE_FREQ.A3 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ.E3 },
  { freq: NOTE_FREQ['F#5'], beats: 1.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ['F#3'] },
  { freq: NOTE_FREQ['F#5'], beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.B4, beats: 1.5, bassFreq: NOTE_FREQ.E3 },
  { freq: 0, beats: 0.5 },

  // Chorus 2: 炊煙嫋嫋升起 隔江千萬里
  { freq: NOTE_FREQ.A4, beats: 0.5, bassFreq: NOTE_FREQ.D3 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ.E3 },
  { freq: NOTE_FREQ['F#5'], beats: 1.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ['F#3'] },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ.A4, beats: 0.5 },
  { freq: NOTE_FREQ.B4, beats: 1.5, bassFreq: NOTE_FREQ.E3 },
  { freq: 0, beats: 0.5 },

  // Chorus 3: 在瓶底書漢隸 仿前朝的飄逸
  { freq: NOTE_FREQ.A4, beats: 0.5, bassFreq: NOTE_FREQ.A3 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ['F#3'] },
  { freq: NOTE_FREQ['F#5'], beats: 1.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5, bassFreq: NOTE_FREQ.D3 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ.A4, beats: 0.5 },
  { freq: NOTE_FREQ['F#4'], beats: 0.5 },
  { freq: NOTE_FREQ.E4, beats: 1.0, bassFreq: NOTE_FREQ.E3 },
  { freq: 0, beats: 0.5 },

  // Chorus 4: 就當我為遇見妳伏筆
  { freq: NOTE_FREQ.A4, beats: 0.5, bassFreq: NOTE_FREQ.D3 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ['F#5'], beats: 0.5, bassFreq: NOTE_FREQ.E3 },
  { freq: NOTE_FREQ.E5, beats: 0.5 },
  { freq: NOTE_FREQ['C#5'], beats: 0.5 },
  { freq: NOTE_FREQ.B4, beats: 0.5 },
  { freq: NOTE_FREQ.A4, beats: 2.0, bassFreq: NOTE_FREQ.A3 },
  { freq: 0, beats: 1.0 },
];

class PatisserieAudio {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  // BGM scheduler state
  private bgmPlaying: boolean = false;
  private bgmTimerId: number | null = null;
  private bgmNoteIndex: number = 0;
  private bgmNextNoteTime: number = 0;
  private bgmGainNode: GainNode | null = null;

  constructor() {
    try {
      this.muted = localStorage.getItem('cake_stack_muted') === 'true';
    } catch {
      this.muted = false;
    }
  }

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public unlock() {
    this.ensureContext();
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public setMuted(mute: boolean) {
    this.muted = mute;
    try {
      localStorage.setItem('cake_stack_muted', String(mute));
    } catch {
      // ignore storage errors
    }
    if (mute) {
      this.stopBgm(false);
    }
  }

  // ---- 《青花瓷》 Guzheng-inspired Instrumental BGM ----
  public startBgm(resetPosition = false) {
    if (resetPosition) {
      this.bgmNoteIndex = 0;
    }
    if (this.muted) {
      this.bgmPlaying = true; // remember intent if unmuted later
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx) return;

    if (this.bgmTimerId !== null) return; // already running

    this.bgmPlaying = true;
    if (!this.bgmGainNode) {
      this.bgmGainNode = ctx.createGain();
      this.bgmGainNode.gain.setValueAtTime(0.85, ctx.currentTime);
      this.bgmGainNode.connect(ctx.destination);
    }
    this.bgmNextNoteTime = ctx.currentTime + 0.05;
    this.scheduleBgmLoop();
  }

  public stopBgm(resetPosition = true) {
    this.bgmPlaying = false;
    if (this.bgmTimerId !== null) {
      window.clearTimeout(this.bgmTimerId);
      this.bgmTimerId = null;
    }
    if (resetPosition) {
      this.bgmNoteIndex = 0;
    }
  }

  public resumeBgmIfNeeded() {
    if (this.bgmPlaying && !this.muted && this.bgmTimerId === null) {
      this.startBgm(false);
    }
  }

  private scheduleBgmLoop = () => {
    if (!this.bgmPlaying || this.muted) {
      this.bgmTimerId = null;
      return;
    }
    const ctx = this.ensureContext();
    if (!ctx || !this.bgmGainNode) return;

    const beatDuration = 0.7; // ~85 BPM gentle ballad
    const lookAhead = 0.25;

    while (this.bgmNextNoteTime < ctx.currentTime + lookAhead) {
      const note = QING_HUA_CI_SEQUENCE[this.bgmNoteIndex];
      const durSec = note.beats * beatDuration;

      if (note.freq > 0) {
        this.playGuzhengPluck(ctx, this.bgmGainNode, note.freq, this.bgmNextNoteTime, durSec);
      }
      if (note.bassFreq) {
        this.playBassPluck(ctx, this.bgmGainNode, note.bassFreq, this.bgmNextNoteTime, durSec * 2.2);
      }

      this.bgmNextNoteTime += durSec;
      this.bgmNoteIndex = (this.bgmNoteIndex + 1) % QING_HUA_CI_SEQUENCE.length;
    }

    this.bgmTimerId = window.setTimeout(this.scheduleBgmLoop, 75);
  };

  private playGuzhengPluck(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number
  ) {
    // Primary plucked string harmonic (triangle + soft sine overtone)
    const osc = ctx.createOscillator();
    const harmonic = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, startTime);

    harmonic.type = 'sine';
    harmonic.frequency.setValueAtTime(freq * 2, startTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(3400, startTime);
    filter.frequency.exponentialRampToValueAtTime(900, startTime + Math.min(duration * 1.4, 0.9));

    const decay = Math.max(0.32, Math.min(duration * 1.45, 1.3));
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(0.075, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + decay);

    const harmGain = ctx.createGain();
    harmGain.gain.setValueAtTime(0.28, startTime);

    osc.connect(filter);
    harmonic.connect(harmGain);
    harmGain.connect(filter);
    filter.connect(gain);
    gain.connect(dest);

    osc.start(startTime);
    harmonic.start(startTime);
    osc.stop(startTime + decay + 0.02);
    harmonic.stop(startTime + decay + 0.02);
  }

  private playBassPluck(
    ctx: AudioContext,
    dest: AudioNode,
    freq: number,
    startTime: number,
    duration: number
  ) {
    // Gentle warm accompaniment root + fifth arpeggio
    const freqs = [freq, freq * 1.5];
    freqs.forEach((f, idx) => {
      const t = startTime + idx * 0.09;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);

      const decay = Math.min(duration, 1.1);
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.linearRampToValueAtTime(0.032, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0008, t + decay);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(t);
      osc.stop(t + decay + 0.02);
    });
  }

  // ---- Gameplay Sound Effects ----
  public playDrop() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(420, now);
    osc.frequency.exponentialRampToValueAtTime(210, now + 0.11);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.12);
  }

  public playLand(combo: number, isPerfect: boolean) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    const thudOsc = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thudOsc.type = 'triangle';
    thudOsc.frequency.setValueAtTime(160, now);
    thudOsc.frequency.exponentialRampToValueAtTime(68, now + 0.09);

    thudGain.gain.setValueAtTime(0.14, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    thudOsc.connect(thudGain);
    thudGain.connect(ctx.destination);
    thudOsc.start(now);
    thudOsc.stop(now + 0.1);

    const scale = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.51];
    const noteIndex = isPerfect ? Math.min(combo, scale.length - 1) : 0;
    const freq = scale[noteIndex];

    const chimeOsc = ctx.createOscillator();
    const chimeGain = ctx.createGain();
    chimeOsc.type = isPerfect ? 'sine' : 'triangle';
    chimeOsc.frequency.setValueAtTime(freq, now);

    chimeGain.gain.setValueAtTime(isPerfect ? 0.12 : 0.05, now);
    chimeGain.gain.exponentialRampToValueAtTime(0.001, now + (isPerfect ? 0.34 : 0.15));

    chimeOsc.connect(chimeGain);
    chimeGain.connect(ctx.destination);
    chimeOsc.start(now);
    chimeOsc.stop(now + (isPerfect ? 0.35 : 0.16));

    if (isPerfect && combo >= 2) {
      const overtone = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtone.type = 'sine';
      overtone.frequency.setValueAtTime(freq * 1.5, now + 0.04);
      overtoneGain.gain.setValueAtTime(0.06, now + 0.04);
      overtoneGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
      overtone.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);
      overtone.start(now + 0.04);
      overtone.stop(now + 0.29);
    }
  }

  public playSlice() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const bufferSize = Math.floor(ctx.sampleRate * 0.07);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.35));
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2200, now);
    filter.Q.setValueAtTime(1.8, now);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    noise.start(now);
  }

  public playApplause() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    // Synthesize warm multi-hand applause claps over ~1.35s
    const clapCount = 26;
    const clapBufLen = Math.floor(ctx.sampleRate * 0.045);
    const noiseBuf = ctx.createBuffer(1, clapBufLen, ctx.sampleRate);
    const data = noiseBuf.getChannelData(0);
    for (let i = 0; i < clapBufLen; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (clapBufLen * 0.28));
    }

    for (let c = 0; c < clapCount; c++) {
      const offset = c * 0.045 + Math.random() * 0.035;
      const t = now + offset;
      const src = ctx.createBufferSource();
      src.buffer = noiseBuf;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100 + Math.random() * 1400, t);
      filter.Q.setValueAtTime(1.4, t);

      const envelope = Math.sin((c / clapCount) * Math.PI);
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03 + envelope * 0.075, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.045);

      src.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      src.start(t);
    }

    // Celebratory cheering chime triad at layer 5
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const t = now + idx * 0.06;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.46);
    });
  }

  public playGameOver() {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const notes = [392.0, 349.23, 293.66];
    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.11;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.1, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.3);
    });
  }
}

export const soundFX = new PatisserieAudio();
