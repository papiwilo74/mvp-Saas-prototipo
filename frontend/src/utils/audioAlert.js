let audioCtx = null;
const listeners = new Set();

const STORAGE_KEY = 'orderflow_sound_enabled';

export const isSoundEnabled = () => {
  if (typeof window === 'undefined') return true;
  const val = localStorage.getItem(STORAGE_KEY);
  return val === null ? true : val === 'true';
};

export const setSoundEnabled = (enabled) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, enabled ? 'true' : 'false');
  listeners.forEach((fn) => {
    try {
      fn(enabled);
    } catch {
      // Ignorar errores
    }
  });
};

export const subscribeSoundChange = (callback) => {
  listeners.add(callback);
  return () => listeners.delete(callback);
};

// Desbloquear AudioContext con la primera interacción del usuario
const unlockAudio = () => {
  if (typeof window === 'undefined') return;
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  } catch {
    // Ignorar restricciones de navegador
  }
};

if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach((event) => {
    window.addEventListener(event, unlockAudio, { once: false, passive: true });
  });
}

/**
 * Reproduce un timbre clásico y nítido de restaurante (D5 -> A5)
 */
export const playOrderChime = () => {
  if (!isSoundEnabled() || typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume().catch(() => {});
    }

    const now = audioCtx.currentTime;

    // Primer tono: Re 5 (587.33 Hz)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.exponentialRampToValueAtTime(0.35, now + 0.02);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.start(now);
    osc1.stop(now + 0.32);

    // Segundo tono: La 5 (880 Hz) - Más brillante
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, now + 0.12);
    gain2.gain.setValueAtTime(0.001, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.4, now + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.58);
  } catch (err) {
    console.warn('No se pudo reproducir el timbre de orden:', err);
  }
};
