import { create } from 'zustand';

export interface Note {
  pitch: string;
  duration: number;
  time: number;
  fret?: number;
  string?: number;
}

export interface Song {
  id: string;
  title: string;
  artist: string;
  notes: Note[];
  sections: Section[];
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Section {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
}

export interface ScoreData {
  totalNotes: number;
  correctNotes: number;
  accuracy: number;
  rhythmAccuracy: number;
}

interface AppState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  tempo: number;
  volume: number;
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  microphoneEnabled: boolean;
  detectedPitch: string | null;
  score: ScoreData;
  language: 'cs' | 'en' | 'sk' | 'es' | 'de' | 'fr' | 'ru' | 'zh' | 'ar' | 'hi' | 'ja' | 'it';
  
  // Actions
  setCurrentSong: (song: Song | null) => void;
  setIsPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setTempo: (tempo: number) => void;
  setVolume: (volume: number) => void;
  setLoopEnabled: (enabled: boolean) => void;
  setLoopRange: (start: number, end: number) => void;
  setDifficulty: (difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert') => void;
  setMicrophoneEnabled: (enabled: boolean) => void;
  setDetectedPitch: (pitch: string | null) => void;
  updateScore: (score: Partial<ScoreData>) => void;
  resetScore: () => void;
  setLanguage: (lang: 'cs' | 'en' | 'sk' | 'es' | 'de' | 'fr' | 'ru' | 'zh' | 'ar' | 'hi' | 'ja' | 'it') => void;
}

const initialScore: ScoreData = {
  totalNotes: 0,
  correctNotes: 0,
  accuracy: 0,
  rhythmAccuracy: 0,
};

export const useAppStore = create<AppState>((set) => ({
  currentSong: null,
  isPlaying: false,
  currentTime: 0,
  tempo: 100,
  volume: 0.8,
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 0,
  difficulty: 'beginner',
  microphoneEnabled: false,
  detectedPitch: null,
  score: initialScore,
  language: 'cs',
  
  setCurrentSong: (song) => set({ currentSong: song }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setTempo: (tempo) => set({ tempo }),
  setVolume: (volume) => set({ volume }),
  setLoopEnabled: (enabled) => set({ loopEnabled: enabled }),
  setLoopRange: (start, end) => set({ loopStart: start, loopEnd: end }),
  setDifficulty: (difficulty) => set({ difficulty }),
  setMicrophoneEnabled: (enabled) => set({ microphoneEnabled: enabled }),
  setDetectedPitch: (pitch) => set({ detectedPitch: pitch }),
  updateScore: (scoreUpdate) => set((state) => ({
    score: { ...state.score, ...scoreUpdate }
  })),
  resetScore: () => set({ score: initialScore }),
  setLanguage: (lang) => set({ language: lang }),
}));
