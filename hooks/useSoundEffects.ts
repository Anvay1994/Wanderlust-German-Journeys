import { useCallback, useRef } from 'react';

// Using consistent CDN assets for reliability
const SOUND_URLS = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Soft chime
  stamp: 'https://assets.mixkit.co/active_storage/sfx/1392/1392-preview.mp3', // Heavy thud
  message: 'https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3', // Pop notification
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Typewriter/click
  paper: 'https://assets.mixkit.co/active_storage/sfx/2413/2413-preview.mp3', // Page turn
  error: 'https://assets.mixkit.co/active_storage/sfx/2658/2658-preview.mp3' // Buzzer
};

export const useSoundEffects = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((type: keyof typeof SOUND_URLS, volume = 0.5) => {
    try {
      // Stop any currently playing sound
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      const audio = new Audio(SOUND_URLS[type]);
      audio.volume = volume;
      audioRef.current = audio;
      audio.play().catch(e => console.warn("Audio play blocked (interaction required)", e));
    } catch (e) {
      console.error("Audio error", e);
    }
  }, []);

  const stopSound = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { playSound, stopSound };
};