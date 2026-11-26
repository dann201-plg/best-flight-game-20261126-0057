/* sound.js — synthesized audio only, no files: twin-prop engine drone,
   wind rush, ring chime and landing thud, all WebAudio oscillators + noise. */

function createSound() {
  let ctx = null;
  let engineOsc1 = null;
  let engineOsc2 = null;
  let engineGain = null;
  let windGain = null;
  let windSrc = null;
  let propLfo = null; // slow throb on the engine gain: the prop beat
  let muted = false;
  let started = false;

  function ensure() {
    if (started) return true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ctx = new AC();
      // Engine: two detuned saws through a low-pass, pitch follows throttle.
      engineOsc1 = ctx.createOscillator();
      engineOsc1.type = 'sawtooth';
      engineOsc1.frequency.value = 58;
      engineOsc2 = ctx.createOscillator();
      engineOsc2.type = 'sawtooth';
      engineOsc2.frequency.value = 116.5;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 420;
      engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      engineOsc1.connect(lp);
      engineOsc2.connect(lp);
      lp.connect(engineGain);
      engineGain.connect(ctx.destination);
      engineOsc1.start();
      engineOsc2.start();
      // Prop beat: a slow LFO on the engine gain — the throb of two
      // propellers turning at slightly different RPM, follows throttle.
      propLfo = ctx.createOscillator();
      propLfo.type = 'sine';
      propLfo.frequency.value = 9;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.012;
      propLfo.connect(lfoGain);
      lfoGain.connect(engineGain.gain);
      propLfo.start();
      // Wind: looped noise through a band-pass.
      const len = ctx.sampleRate * 2;
      const buf = ctx.createBuffer(1, len, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
      windSrc = ctx.createBufferSource();
      windSrc.buffer = buf;
      windSrc.loop = true;
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = 700;
      bp.Q.value = 0.6;
      windGain = ctx.createGain();
      windGain.gain.value = 0;
      windSrc.connect(bp);
      bp.connect(windGain);
      windGain.connect(ctx.destination);
      windSrc.start();
      started = true;
      return true;
    } catch (e) {
      return false;
    }
  }

  function tone(freq, dur, type, vol, when) {
    if (!ctx || muted) return;
    const o = ctx.createOscillator();
    o.type = type || 'sine';
    o.frequency.value = freq;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, ctx.currentTime + (when || 0));
    g.gain.linearRampToValueAtTime(vol || 0.2, ctx.currentTime + (when || 0) + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (when || 0) + dur);
    o.connect(g);
    g.connect(ctx.destination);
    o.start(ctx.currentTime + (when || 0));
    o.stop(ctx.currentTime + (when || 0) + dur + 0.05);
  }

  return {
    // Call from a user gesture (button click) — browsers block audio before it.
    unlock() { ensure(); if (ctx && ctx.state === 'suspended') ctx.resume(); },
    setMuted(m) { muted = m; if (engineGain) engineGain.gain.value = 0; if (windGain) windGain.gain.value = 0; },
    isMuted() { return muted; },
    // Continuous engine + wind, driven by throttle and speed.
    setFlight(throttle, speed, airborne) {
      if (!ctx || muted) return;
      const t = ctx.currentTime;
      const eng = airborne ? 0.05 + throttle * 0.075 : 0.02 + throttle * 0.03;
      engineGain.gain.setTargetAtTime(eng, t, 0.1);
      engineOsc1.frequency.setTargetAtTime(52 + throttle * 46, t, 0.1);
      engineOsc2.frequency.setTargetAtTime(104 + throttle * 92, t, 0.1);
      if (propLfo) propLfo.frequency.setTargetAtTime(5 + throttle * 9 + speed * 0.06, t, 0.2);
      windGain.gain.setTargetAtTime(airborne ? clamp(speed / 80, 0, 1) * 0.06 : 0, t, 0.15);
    },
    ringChime() { tone(880, 0.35, 'sine', 0.22); tone(1318, 0.5, 'sine', 0.18, 0.09); },
    landThud() { tone(70, 0.4, 'sine', 0.35); tone(140, 0.25, 'triangle', 0.15, 0.05); },
    crashNoise() { tone(55, 0.8, 'sawtooth', 0.3); tone(38, 1.0, 'sine', 0.3, 0.1); },
    click() { tone(660, 0.08, 'square', 0.08); },
  };
}
