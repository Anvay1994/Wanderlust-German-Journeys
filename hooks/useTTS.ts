import { useCallback } from 'react';

type TtsOptions = {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
  debounceMs?: number;
};

const DEFAULT_LANG = 'de-DE';
const DEFAULT_DEBOUNCE = 350;

let cachedVoices: SpeechSynthesisVoice[] = [];
let germanVoice: SpeechSynthesisVoice | null = null;
let englishVoice: SpeechSynthesisVoice | null = null;
let voicesReady = false;
let warnedNoGerman = false;
let warnedNoEnglish = false;
let lastSpokenAt = 0;
let voicesPromise: Promise<void> | null = null;

const selectGermanVoice = (voices: SpeechSynthesisVoice[]) => {
  const exact = voices.find((voice) => voice.lang?.toLowerCase() === 'de-de');
  if (exact) return exact;
  const anyGerman = voices.find((voice) => voice.lang?.toLowerCase().startsWith('de'));
  if (anyGerman) return anyGerman;
  return null;
};

const selectEnglishVoice = (voices: SpeechSynthesisVoice[]) => {
  const usEnglish = voices.find((voice) => voice.lang?.toLowerCase() === 'en-us');
  if (usEnglish) return usEnglish;
  const ukEnglish = voices.find((voice) => voice.lang?.toLowerCase() === 'en-gb');
  if (ukEnglish) return ukEnglish;
  const anyEnglish = voices.find((voice) => voice.lang?.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;
  return null;
};

const refreshVoices = () => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return;
  cachedVoices = voices;
  germanVoice = selectGermanVoice(voices);
  englishVoice = selectEnglishVoice(voices);
  voicesReady = true;
};

const ensureVoices = () => {
  if (voicesReady || typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return Promise.resolve();
  }

  if (voicesPromise) return voicesPromise;

  voicesPromise = new Promise((resolve) => {
    const synth = window.speechSynthesis;
    let resolved = false;

    const finalize = () => {
      if (resolved) return;
      resolved = true;
      resolve();
    };

    const handler = () => {
      refreshVoices();
      if (voicesReady) {
        finalize();
      }
    };

    if (typeof synth.addEventListener === 'function') {
      synth.addEventListener('voiceschanged', handler);
    } else {
      synth.onvoiceschanged = handler;
    }

    handler();

    window.setTimeout(() => {
      refreshVoices();
      finalize();
    }, 1000);
  });

  return voicesPromise;
};

export const useTTS = () => {
  const speak = useCallback(async (text: string, options: TtsOptions = {}) => {
    const trimmed = text?.trim();
    if (!trimmed) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const now = Date.now();
    const debounceMs = options.debounceMs ?? DEFAULT_DEBOUNCE;
    if (now - lastSpokenAt < debounceMs) return;
    lastSpokenAt = now;

    await ensureVoices();

    const utterance = new SpeechSynthesisUtterance(trimmed);
    const lang = options.lang || DEFAULT_LANG;
    utterance.lang = lang;

    // Select voice based on language
    const isEnglish = lang.toLowerCase().startsWith('en');
    if (isEnglish) {
      if (englishVoice) {
        utterance.voice = englishVoice;
      } else if (!warnedNoEnglish) {
        console.warn('[TTS] No English voice found. Falling back to en-US without a specific voice.');
        warnedNoEnglish = true;
      }
    } else {
      if (germanVoice) {
        utterance.voice = germanVoice;
      } else if (!warnedNoGerman) {
        console.warn('[TTS] No German voice found. Falling back to de-DE without a specific voice.');
        warnedNoGerman = true;
      }
    }
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, []);

  const cancel = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
  }, []);

  return { speak, cancel };
};

export default useTTS;
