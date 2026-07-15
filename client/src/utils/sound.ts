let ctx: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq: number, startOffset: number, duration: number, gainValue: number) {
  const audioCtx = getContext();
  if (!audioCtx) return;

  const oscillator = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  oscillator.connect(gain);
  gain.connect(audioCtx.destination);

  oscillator.type = "sine";
  oscillator.frequency.value = freq;

  const start = audioCtx.currentTime + startOffset;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(gainValue, start + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

  oscillator.start(start);
  oscillator.stop(start + duration);
}

/** Confirms the current user's own bid went through — a bright upward chime. */
export function playBidPlacedSound() {
  playTone(660, 0, 0.15, 0.15);
  playTone(880, 0.1, 0.18, 0.15);
}

/** Someone else's bid pushed the price up while polling — a shorter, softer ping. */
export function playPriceUpdateSound() {
  playTone(520, 0, 0.12, 0.08);
}

/** Auction just closed sold — a small celebratory two-note flourish. */
export function playSoldSound() {
  playTone(523, 0, 0.15, 0.15);
  playTone(659, 0.12, 0.15, 0.15);
  playTone(784, 0.24, 0.25, 0.15);
}
