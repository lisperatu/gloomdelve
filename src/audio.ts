// Tiny procedural SFX engine — no audio assets, everything synthesized.
class SFXEngine {
  private ctx: AudioContext | null = null;
  private enabled = true;

  private ensure(): AudioContext | null {
    if (!this.enabled) return null;
    if (!this.ctx) {
      try {
        this.ctx = new AudioContext();
      } catch {
        this.enabled = false;
        return null;
      }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
    return this.ctx;
  }

  private tone(freq: number, dur: number, type: OscillatorType, vol: number, delay = 0, slide = 0): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  private noise(dur: number, vol: number, cutoff = 800, delay = 0): void {
    const ctx = this.ensure();
    if (!ctx) return;
    const t0 = ctx.currentTime + delay;
    const len = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = cutoff;
    const g = ctx.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(ctx.destination);
    src.start(t0);
  }

  play(name: string): void {
    switch (name) {
      case 'hit': this.noise(0.07, 0.2, 900); break;
      case 'miss': this.noise(0.05, 0.07, 2000); break;
      case 'hurt': this.tone(220, 0.16, 'sawtooth', 0.12, 0, -120); this.noise(0.09, 0.16, 500); break;
      case 'kill': this.noise(0.18, 0.22, 400); this.tone(85, 0.22, 'triangle', 0.2, 0, -35); break;
      case 'quaff': this.tone(480, 0.07, 'sine', 0.13); this.tone(680, 0.07, 'sine', 0.13, 0.08); this.tone(840, 0.07, 'sine', 0.1, 0.16); break;
      case 'scroll': this.noise(0.14, 0.1, 2600); break;
      case 'equip': this.noise(0.09, 0.13, 1300); this.tone(300, 0.07, 'triangle', 0.08, 0.02); break;
      case 'gold': this.tone(1250, 0.05, 'square', 0.06); this.tone(1650, 0.06, 'square', 0.06, 0.06); break;
      case 'levelup': [440, 554, 659, 880].forEach((f, i) => this.tone(f, 0.13, 'triangle', 0.13, i * 0.07)); break;
      case 'stairs': [300, 240, 185, 140].forEach((f, i) => this.tone(f, 0.16, 'triangle', 0.12, i * 0.11)); break;
      case 'boss': this.tone(58, 0.9, 'sawtooth', 0.18, 0, -18); this.noise(0.5, 0.12, 220); break;
      case 'god': this.tone(880, 0.3, 'sine', 0.1, 0, -220); this.tone(440, 0.45, 'sine', 0.09, 0.12); break;
      case 'spell': this.tone(700, 0.12, 'sawtooth', 0.08, 0, -300); this.noise(0.08, 0.08, 1800); break;
      case 'death': this.tone(220, 1.3, 'sawtooth', 0.18, 0, -185); this.noise(0.8, 0.1, 300, 0.1); break;
      case 'win': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.45, 'triangle', 0.12, i * 0.16)); break;
    }
  }
}

export const sfx = new SFXEngine();
