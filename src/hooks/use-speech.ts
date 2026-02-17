import { useState, useCallback, useRef, useEffect } from "react";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export function useSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);
  const [activeChapterIdx, setActiveChapterIdx] = useState(-1);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wordsRef = useRef<string[]>([]);
  const wordIndexRef = useRef(-1);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }
    clearTimer();
    setIsSpeaking(false);
    setIsLoading(false);
    setCurrentWordIndex(-1);
    setActiveChapterIdx(-1);
    wordIndexRef.current = -1;
    wordsRef.current = [];
  }, [clearTimer]);

  const speak = useCallback(async (text: string, chapterIdx: number) => {
    stop();
    if (isMuted) return;

    setIsLoading(true);
    setActiveChapterIdx(chapterIdx);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/elevenlabs-tts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_KEY}`,
          apikey: SUPABASE_KEY,
        },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "TTS failed" }));
        throw new Error(err.error || `TTS returned ${res.status}`);
      }

      const blob = await res.blob();
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      // Prepare words for karaoke timing
      const words = text.split(/\s+/).filter(Boolean);
      wordsRef.current = words;

      await new Promise<void>((resolve, reject) => {
        audio.oncanplaythrough = () => resolve();
        audio.onerror = () => reject(new Error("Audio playback error"));
        audio.load();
      });

      const duration = audio.duration;
      if (!duration || duration === Infinity) {
        throw new Error("Could not determine audio duration");
      }

      // Estimate timing: distribute words evenly across duration
      const msPerWord = (duration * 1000) / words.length;

      setIsLoading(false);
      setIsSpeaking(true);
      setCurrentWordIndex(0);
      wordIndexRef.current = 0;

      // Start word advancement timer
      timerRef.current = setInterval(() => {
        if (!audioRef.current || audioRef.current.paused) return;
        const currentTime = audioRef.current.currentTime * 1000;
        const newIdx = Math.min(Math.floor(currentTime / msPerWord), words.length - 1);
        if (newIdx !== wordIndexRef.current) {
          wordIndexRef.current = newIdx;
          setCurrentWordIndex(newIdx);
        }
      }, 50); // Update every 50ms for smooth highlighting

      audio.onended = () => {
        clearTimer();
        // Flash all words as highlighted briefly, then reset
        setCurrentWordIndex(words.length);
        setTimeout(() => {
          setIsSpeaking(false);
          setCurrentWordIndex(-1);
          setActiveChapterIdx(-1);
          wordIndexRef.current = -1;
          URL.revokeObjectURL(audioUrl);
        }, 500);
      };

      audio.play();
    } catch (e: any) {
      if (e.name === "AbortError") return;
      console.error("TTS error:", e);
      setIsLoading(false);
      setIsSpeaking(false);
      setCurrentWordIndex(-1);
      setActiveChapterIdx(-1);
    }
  }, [isMuted, stop, clearTimer]);

  const toggleMute = useCallback(() => {
    setIsMuted((m) => {
      if (!m) stop();
      return !m;
    });
  }, [stop]);

  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return {
    speak,
    stop,
    isSpeaking,
    isLoading,
    isMuted,
    toggleMute,
    currentWordIndex,
    activeChapterIdx,
  };
}
