let context: AudioContext | null = null;
let droneGain: GainNode | null = null;
let isMuted = false;
let cachedNoiseBuffer: AudioBuffer | null = null;

function getContext(): AudioContext {
  context ??= new AudioContext();
  if (context.state === 'suspended') void context.resume();
  return context;
}

export function isAudioMuted(): boolean {
  return isMuted;
}

export function toggleAudio(): boolean {
  isMuted = !isMuted;
  if (droneGain && context) {
    const target = isMuted ? 0.0001 : 0.02;
    droneGain.gain.setTargetAtTime(target, context.currentTime, 0.4);
  }
  return isMuted;
}

export function suspendAudioForBackground(hidden: boolean): void {
  if (!context) return;
  if (hidden) {
    if (context.state === 'running') {
      context.suspend().catch(() => {});
    }
  } else {
    if (context.state === 'suspended' && !isMuted) {
      context.resume().catch(() => {});
    }
  }
}

export function startAmbientDrone() {
  if (droneGain || typeof window === 'undefined') return;
  try {
    const audio = getContext();
    const now = audio.currentTime;

    const master = audio.createGain();
    master.gain.setValueAtTime(0.0001, now);
    master.gain.exponentialRampToValueAtTime(isMuted ? 0.0001 : 0.02, now + 3);
    master.connect(audio.destination);
    droneGain = master;

    // Filtered deep space resonance
    const filter = audio.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(120, now);
    filter.Q.setValueAtTime(2.5, now);
    filter.connect(master);

    // Osc 1: Sub-bass base
    const osc1 = audio.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(55, now); // A1

    // Osc 2: Detuned binaural celestial breathing
    const osc2 = audio.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(55.4, now);

    osc1.connect(filter);
    osc2.connect(filter);

    osc1.start(now);
    osc2.start(now);
  } catch {
    // Ignore autoplay restriction before first interaction
  }
}

export function playClick() {
  if (isMuted) return;
  try {
    const audio = getContext();
    const now = audio.currentTime;

    // High crystal click
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1760, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.04);

    amp.gain.setValueAtTime(0.03, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    osc.connect(amp).connect(audio.destination);
    osc.start(now);
    osc.stop(now + 0.045);
  } catch {
    // Audio context not allowed yet
  }
}

function getOrCreateNoiseBuffer(audio: AudioContext): AudioBuffer {
  if (cachedNoiseBuffer && cachedNoiseBuffer.sampleRate === audio.sampleRate) {
    return cachedNoiseBuffer;
  }
  const bufferSize = Math.floor(audio.sampleRate * 1.5);
  const noiseBuffer = audio.createBuffer(1, bufferSize, audio.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }
  cachedNoiseBuffer = noiseBuffer;
  return noiseBuffer;
}

export function playWarp() {
  if (isMuted) return;
  try {
    const audio = getContext();
    const now = audio.currentTime;

    // Sub-bass frequency dive
    const subOsc = audio.createOscillator();
    const subAmp = audio.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(160, now);
    subOsc.frequency.exponentialRampToValueAtTime(42, now + 1.8);

    subAmp.gain.setValueAtTime(0.06, now);
    subAmp.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    subOsc.connect(subAmp).connect(audio.destination);
    subOsc.start(now);
    subOsc.stop(now + 1.85);

    // Filtered atmospheric whoosh (reusing pre-cached noise buffer)
    const whiteNoise = audio.createBufferSource();
    whiteNoise.buffer = getOrCreateNoiseBuffer(audio);

    const noiseFilter = audio.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(600, now);
    noiseFilter.frequency.exponentialRampToValueAtTime(140, now + 1.5);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseAmp = audio.createGain();
    noiseAmp.gain.setValueAtTime(0.001, now);
    noiseAmp.gain.linearRampToValueAtTime(0.035, now + 0.4);
    noiseAmp.gain.exponentialRampToValueAtTime(0.0001, now + 1.5);

    whiteNoise.connect(noiseFilter).connect(noiseAmp).connect(audio.destination);
    whiteNoise.start(now);
    whiteNoise.stop(now + 1.55);
  } catch {
    // Audio context not allowed yet
  }
}
