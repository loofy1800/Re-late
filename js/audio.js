/**
 * RELATE - Web Audio Tactile Sound Effects Synthesizer (Warm Coconut Tonal Profile)
 * Provides warm, subtle 3D tactile audio feedback for button clicks, join events,
 * voting, and proposal dispatches. No external audio files required.
 */

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.isMuted = localStorage.getItem("relate_audio_muted") === "true";
  }

  init() {
    if (!this.audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    localStorage.setItem("relate_audio_muted", this.isMuted ? "true" : "false");
    return this.isMuted;
  }

  // Warm tactile click for 3D buttons (organic wood/coconut tone)
  playClick() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(280, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, this.audioCtx.currentTime + 0.045);

      gain.gain.setValueAtTime(0.09, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + 0.045);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      // AudioContext policy fallback
    }
  }

  // Warm harmonic chime for joining a group or unlocking a tier
  playJoinSuccess() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      // Warm A major chord (A4, C#5, E5, A5)
      const freqs = [440.00, 554.37, 659.25, 880.00];

      freqs.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + i * 0.065);

        gain.gain.setValueAtTime(0, now + i * 0.065);
        gain.gain.linearRampToValueAtTime(0.12, now + i * 0.065 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.065 + 0.38);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + i * 0.065);
        osc.stop(now + i * 0.065 + 0.42);
      });
    } catch (e) {}
  }

  // Soft organic pop for incoming or sent chat message
  playMessagePop() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "triangle";
      osc.frequency.setValueAtTime(380, now);
      osc.frequency.exponentialRampToValueAtTime(760, now + 0.07);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.085);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.095);
    } catch (e) {}
  }

  // Warm chime for voting in a poll
  playVoteDing() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(659.25, now);
      osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.06);

      gain.gain.setValueAtTime(0.11, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start(now);
      osc.stop(now + 0.27);
    } catch (e) {}
  }

  // Grand celebratory fanfare for dispatching Joint Intent Proposal
  playProposalFanfare() {
    if (this.isMuted) return;
    try {
      this.init();
      if (!this.audioCtx) return;
      const now = this.audioCtx.currentTime;
      const notes = [
        { f: 554.37, t: 0 },    // C#5
        { f: 659.25, t: 0.12 }, // E5
        { f: 880.00, t: 0.24 }, // A5
        { f: 1108.73, t: 0.38 } // C#6
      ];

      notes.forEach(n => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(n.f, now + n.t);

        gain.gain.setValueAtTime(0, now + n.t);
        gain.gain.linearRampToValueAtTime(0.16, now + n.t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.t + 0.55);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + n.t);
        osc.stop(now + n.t + 0.58);
      });
    } catch (e) {}
  }
}

export const sound = new SoundEngine();
