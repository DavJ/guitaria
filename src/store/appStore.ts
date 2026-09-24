import { create } from 'zustand';
import type { Song } from '../domain/Song';

export type AppLanguage = 'cs' | 'en' | 'sk' | 'es' | 'de' | 'fr' | 'ru' | 'zh' | 'ar' | 'hi' | 'ja' | 'it';

export interface PitchSnapshot {
  frequency: number | null;
  midi: number | null;
  note: string | null;
  centsError: number | null;
  clarity: number;
  timestamp: number | null;
}

export interface ScoreData {
  totalNotes: number;
  correctNotes: number;
  missedNotes: number;
  pitchAccuracy: number;
  timingAccuracy: number;
  averageCentsError: number;
  averageTimingErrorMs: number;
}

interface AppState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  tempoMultiplier: number;
  volume: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  microphoneEnabled: boolean;
  detectedPitch: PitchSnapshot;
  score: ScoreData;
  language: AppLanguage;

  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setTempoMultiplier: (multiplier: number) => void;
  setVolume: (volume: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  setLoopRange: (start: number, end: number) => void;
  setDifficulty: (difficulty: AppState['difficulty']) => void;
  setMicrophoneEnabled: (enabled: boolean) => void;
  setDetectedPitch: (pitch: PitchSnapshot) => void;
  updateScore: (score: Partial<ScoreData>) => void;
  resetScore: (totalNotes?: number) => void;
  setLanguage: (lang: AppLanguage) => void;
}

const initialScore: ScoreData = {
  totalNotes: 0,
  correctNotes: 0,
  missedNotes: 0,
  pitchAccuracy: 0,
  timingAccuracy: 0,
  averageCentsError: 0,
  averageTimingErrorMs: 0,
};

const emptyPitch: PitchSnapshot = {
  frequency: null,
  midi: null,
  note: null,
  centsError: null,
  clarity: 0,
  timestamp: null,
};

export const useAppStore = create<AppState>((set) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  tempoMultiplier: 1,
  volume: 0.8,
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,
  difficulty: 'beginner',
  microphoneEnabled: false,
  detectedPitch: emptyPitch,
  score: initialScore,
  language: 'cs',

  setCurrentSong: (song) => set({ currentSong: song, currentTime: 0, isPlaying: false }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setTempoMultiplier: (tempoMultiplier) => set({ tempoMultiplier }),
  setVolume: (volume) => set({ volume }),
  setLoopEnabled: (loopEnabled) => set({ loopEnabled }),
  setLoopRange: (loopStart, loopEnd) => set({ loopStart, loopEnd }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setMicrophoneEnabled: (microphoneEnabled) => set({ microphoneEnabled }),
  setDetectedPitch: (detectedPitch) => set({ detectedPitch }),
  updateScore: (scoreUpdate) => set((state) => ({ score: { ...state.score, ...scoreUpdate } })),
  resetScore: (totalNotes = 0) =>
    set({
      score: {
        ...initialScore,
        totalNotes,
      },
    }),
  setLanguage: (language) => set({ language }),
}));
