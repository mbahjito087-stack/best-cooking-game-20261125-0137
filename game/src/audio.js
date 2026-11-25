// Synthesised sound, no audio files: a click, a till ding, a low buzz for a mistake,
// and a looping filtered-noise sizzle while a patty cooks. Created on the first
// gesture, so browsers allow it; M mutes.
export function createAudio() {
  let context = null;
  let muted = false;
  let sizzle = null;

  function ensure() {
    if (context) return context;
    try {
      const AudioContext = window.AudioContext ?? window.webkitAudioContext;
      context = new AudioContext();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, seconds, type, gainValue, when = 0) {
    const ctx = ensure();
    if (!ctx || muted) return;
    const start = ctx.currentTime + when;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(gainValue, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    oscillator.connect(gain);
    gain.connect(ctx.destination);
    oscillator.start(start);
    oscillator.stop(start + seconds + 0.05);
  }

  return {
    unlock() {
      const ctx = ensure();
      if (ctx && ctx.state === 'suspended') void ctx.resume();
    },
    toggleMute() {
      muted = !muted;
      if (muted) this.stopSizzle();
      return muted;
    },
    get muted() {
      return muted;
    },
    click() {
      tone(660, 0.06, 'triangle', 0.12);
    },
    place() {
      tone(440, 0.08, 'triangle', 0.14);
      tone(330, 0.1, 'triangle', 0.1, 0.05);
    },
    ding() {
      tone(880, 0.25, 'sine', 0.18);
      tone(1318, 0.35, 'sine', 0.14, 0.09);
    },
    buzz() {
      tone(140, 0.28, 'sawtooth', 0.12);
      tone(110, 0.3, 'sawtooth', 0.1, 0.05);
    },
    startSizzle() {
      const ctx = ensure();
      if (!ctx || muted || sizzle) return;
      const length = ctx.sampleRate;
      const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let index = 0; index < length; index += 1) data[index] = Math.random() * 2 - 1;
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4200;
      filter.Q.value = 0.6;
      const gain = ctx.createGain();
      gain.gain.value = 0.05;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start();
      sizzle = { source, gain };
    },
    stopSizzle() {
      if (!sizzle) return;
      try {
        sizzle.gain.gain.linearRampToValueAtTime(0.0001, context.currentTime + 0.15);
        sizzle.source.stop(context.currentTime + 0.2);
      } catch {
        // Already stopped.
      }
      sizzle = null;
    },
  };
}
