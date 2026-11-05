/**
 * Web Audio Procedural Sound Effects & Retro Chiptune Synthesizer
 * Enhanced with polyphonic sound effects, rich filters, and boss themes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxGainNode: GainNode | null = null;
  private musicGainNode: GainNode | null = null;
  private sfxVolume = 0.5;
  private musicVolume = 0.3;
  private sfxMuted = false;
  private musicMuted = false;
  private musicPlaying = false;
  private musicIntervalId: number | null = null;
  private currentNoteIndex = 0;
  private isUnlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const unlockAudio = () => {
        this.unlock();
        window.removeEventListener('click', unlockAudio);
        window.removeEventListener('keydown', unlockAudio);
        window.removeEventListener('touchstart', unlockAudio);
      };
      window.addEventListener('click', unlockAudio, { passive: true });
      window.addEventListener('keydown', unlockAudio, { passive: true });
      window.addEventListener('touchstart', unlockAudio, { passive: true });
    }
  }

  public unlock() {
    if (this.isUnlocked) return;
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().then(() => {
        this.isUnlocked = true;
      }).catch(() => {});
    } else if (this.ctx && this.ctx.state === 'running') {
      this.isUnlocked = true;
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        try {
          this.ctx = new AudioContextClass();
          this.sfxGainNode = this.ctx.createGain();
          this.musicGainNode = this.ctx.createGain();

          this.sfxGainNode.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
          this.musicGainNode.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume, this.ctx.currentTime);

          this.sfxGainNode.connect(this.ctx.destination);
          this.musicGainNode.connect(this.ctx.destination);
        } catch {
          // Audio not supported
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxVolume(vol: number) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.sfxGainNode && this.ctx) {
      this.sfxGainNode.gain.setValueAtTime(this.sfxMuted ? 0 : this.sfxVolume, this.ctx.currentTime);
    }
  }

  public setMusicVolume(vol: number) {
    this.musicVolume = Math.max(0, Math.min(1, vol));
    if (this.musicGainNode && this.ctx) {
      this.musicGainNode.gain.setValueAtTime(this.musicMuted ? 0 : this.musicVolume, this.ctx.currentTime);
    }
  }

  public toggleSfx(): boolean {
    this.sfxMuted = !this.sfxMuted;
    this.setSfxVolume(this.sfxVolume);
    return !this.sfxMuted;
  }

  public toggleMusic(): boolean {
    this.musicMuted = !this.musicMuted;
    if (this.musicMuted) {
      this.stopMusic();
    } else {
      this.startMusic();
    }
    return !this.musicMuted;
  }

  public getSfxState() {
    return { volume: this.sfxVolume, muted: this.sfxMuted };
  }

  public getMusicState() {
    return { volume: this.musicVolume, muted: this.musicMuted, playing: this.musicPlaying };
  }

  public playSound(type: string, param = 1) {
    if (this.sfxMuted) return;
    this.initContext();
    if (!this.ctx || !this.sfxGainNode) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    try {
      if (type === 'shoot') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(640, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'plasma') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.08);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'railgun') {
        // High electric crack + low impact
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'square';
        osc2.type = 'sawtooth';
        osc1.frequency.setValueAtTime(1600, now);
        osc1.frequency.exponentialRampToValueAtTime(80, now + 0.25);
        osc2.frequency.setValueAtTime(120, now);
        osc2.frequency.linearRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.25);
        osc2.stop(now + 0.25);
      } else if (type === 'missile') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(600, now + 0.15);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.15);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(160, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.11);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.11);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'double_jump') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();
        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(350, now);
        osc1.frequency.exponentialRampToValueAtTime(700, now + 0.14);
        osc2.frequency.setValueAtTime(700, now);
        osc2.frequency.exponentialRampToValueAtTime(1200, now + 0.14);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.14);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.sfxGainNode);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.14);
        osc2.stop(now + 0.14);
      } else if (type === 'spring_bounce') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.22);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'shield_deflect') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(1600, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'perfect_parry') {
        // High crystalline chime + bass pulse
        const chime = ctx.createOscillator();
        const sub = ctx.createOscillator();
        const gain = ctx.createGain();
        chime.type = 'sine';
        sub.type = 'triangle';
        chime.frequency.setValueAtTime(1320, now);
        chime.frequency.setValueAtTime(1760, now + 0.08);
        sub.frequency.setValueAtTime(100, now);
        sub.frequency.exponentialRampToValueAtTime(40, now + 0.25);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        chime.connect(gain);
        sub.connect(gain);
        gain.connect(this.sfxGainNode);
        chime.start(now);
        sub.start(now);
        chime.stop(now + 0.25);
        sub.stop(now + 0.25);
      } else if (type === 'shield_bash') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.16);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'crate_break') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(45, now + 0.1);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.linearRampToValueAtTime(35, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'enemy_hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.linearRampToValueAtTime(180, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.05);
      } else if (type === 'enemy_kill') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.18);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.18);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.18);
      } else if (type === 'combo') {
        const base = 440 * (1 + (param - 1) * 0.15);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(base, now);
        osc.frequency.setValueAtTime(base * 1.5, now + 0.05);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'ultimate_ready') {
        const notes = [440, 554.37, 659.25, 880];
        notes.forEach((f, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + idx * 0.06);
          gain.gain.setValueAtTime(0.2, now + idx * 0.06);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.06 + 0.14);
          osc.connect(gain);
          gain.connect(this.sfxGainNode!);
          osc.start(now + idx * 0.06);
          osc.stop(now + idx * 0.06 + 0.14);
        });
      } else if (type === 'ultimate_blast') {
        // Massive screen-clearing super laser explosion
        const noiseOsc = ctx.createOscillator();
        const sweep = ctx.createOscillator();
        const gain = ctx.createGain();
        noiseOsc.type = 'sawtooth';
        sweep.type = 'triangle';
        noiseOsc.frequency.setValueAtTime(90, now);
        noiseOsc.frequency.linearRampToValueAtTime(30, now + 0.7);
        sweep.frequency.setValueAtTime(1400, now);
        sweep.frequency.exponentialRampToValueAtTime(120, now + 0.7);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.7);
        noiseOsc.connect(gain);
        sweep.connect(gain);
        gain.connect(this.sfxGainNode);
        noiseOsc.start(now);
        sweep.start(now);
        noiseOsc.stop(now + 0.7);
        sweep.stop(now + 0.7);
      } else if (type === 'coin') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.06);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.16);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'gem') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1174.66, now);
        osc.frequency.setValueAtTime(1567.98, now + 0.06);
        osc.frequency.setValueAtTime(2093.0, now + 0.12);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.24);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.24);
      } else if (type === 'achievement') {
        const chord = [523.25, 659.25, 783.99, 1046.5, 1318.51];
        chord.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.2, now + idx * 0.05);
          gain.gain.linearRampToValueAtTime(0.01, now + idx * 0.05 + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGainNode!);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.35);
        });
      } else if (type === 'boss_roar') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.linearRampToValueAtTime(190, now + 0.25);
        osc.frequency.linearRampToValueAtTime(45, now + 0.65);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.65);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (type === 'click') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(400, now + 0.03);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.03);
        osc.connect(gain);
        gain.connect(this.sfxGainNode);
        osc.start(now);
        osc.stop(now + 0.03);
      }
    } catch {
      // Safe context guard
    }
  }

  public startMusic() {
    if (this.musicMuted || this.musicPlaying) return;
    this.initContext();
    if (!this.ctx || !this.musicGainNode) return;

    this.musicPlaying = true;
    this.currentNoteIndex = 0;

    const melody = [
      261.63, 311.13, 392.0, 523.25,
      311.13, 392.0, 523.25, 622.25,
      415.3, 523.25, 622.25, 830.61,
      392.0, 493.88, 587.33, 783.99,
    ];
    const bass = [
      130.81, 130.81, 155.56, 155.56,
      207.65, 207.65, 196.0, 196.0,
    ];

    const noteDuration = 140;

    this.musicIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.musicGainNode || !this.musicPlaying || this.musicMuted) return;

      const now = this.ctx.currentTime;
      const freq = melody[this.currentNoteIndex % melody.length];
      const bassFreq = bass[Math.floor(this.currentNoteIndex / 2) % bass.length];

      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.005, now + 0.11);
        osc.connect(gain);
        gain.connect(this.musicGainNode);
        osc.start(now);
        osc.stop(now + 0.11);

        if (this.currentNoteIndex % 2 === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'triangle';
          bassOsc.frequency.setValueAtTime(bassFreq, now);
          bassGain.gain.setValueAtTime(0.1, now);
          bassGain.gain.linearRampToValueAtTime(0.01, now + 0.22);
          bassOsc.connect(bassGain);
          bassGain.connect(this.musicGainNode);
          bassOsc.start(now);
          bassOsc.stop(now + 0.22);
        }
      } catch {
        // Safe context guard
      }

      this.currentNoteIndex = (this.currentNoteIndex + 1) % melody.length;
    }, noteDuration);
  }

  public stopMusic() {
    this.musicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const soundEngine = new SoundEngine();
