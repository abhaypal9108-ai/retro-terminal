// Web Audio API Synthesizer for Mechanical Keyboard Clicks
let audioCtx = null;

export function playKeyClick() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    // Subtle click frequency
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140 + Math.random() * 40, audioCtx.currentTime);

    // Fast decay envelope (mimics key bottoming out)
    gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + 0.05);
  } catch (e) {
    // Audio context silently ignored if browser blocks autoplay before user gesture
  }
}