/**
 * PlaybackEngine - Audio playback for songs using Web Audio API
 * Handles chord and melody playback with tempo and key control
 */

import type { Song } from '../types/Song';

// Note frequencies in Hz (A4 = 440Hz)
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': 261.63,
  'C#': 277.18,
  'Db': 277.18,
  'D': 293.66,
  'D#': 311.13,
  'Eb': 311.13,
  'E': 329.63,
  'F': 349.23,
  'F#': 369.99,
  'Gb': 369.99,
  'G': 392.00,
  'G#': 415.30,
  'Ab': 415.30,
  'A': 440.00,
  'A#': 466.16,
  'Bb': 466.16,
  'B': 493.88,
};

// Chord to notes mapping (triads)
const CHORD_NOTES: Record<string, string[]> = {
  'C': ['C', 'E', 'G'],
  'Cm': ['C', 'Eb', 'G'],
  'D': ['D', 'F#', 'A'],
  'Dm': ['D', 'F', 'A'],
  'E': ['E', 'G#', 'B'],
  'Em': ['E', 'G', 'B'],
  'F': ['F', 'A', 'C'],
  'Fm': ['F', 'Ab', 'C'],
  'G': ['G', 'B', 'D'],
  'Gm': ['G', 'Bb', 'D'],
  'A': ['A', 'C#', 'E'],
  'Am': ['A', 'C', 'E'],
  'B': ['B', 'D#', 'F#'],
  'Bm': ['B', 'D', 'F#'],
};

export interface PlaybackOptions {
  volume?: number;
  loop?: boolean;
  onTimeUpdate?: (currentTime: number) => void;
  onSectionChange?: (sectionIndex: number) => void;
  onEnd?: () => void;
}

export class PlaybackEngine {
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private startTime: number = 0;
  private animationFrameId: number | null = null;
  private options: PlaybackOptions = {};

  constructor() {
    this.initAudioContext();
  }

  private initAudioContext(): void {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext; // eslint-disable-line @typescript-eslint/no-explicit-any
      this.audioContext = new AudioContextClass();
      this.gainNode = this.audioContext.createGain();
      this.gainNode.connect(this.audioContext.destination);
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * Play a song from the beginning
   */
  async play(song: Song, options: PlaybackOptions = {}): Promise<void> {
    if (!this.audioContext || !this.gainNode) {
      throw new Error('Audio context not initialized');
    }

    this.options = options;
    this.isPlaying = true;
    this.startTime = this.audioContext.currentTime;
    this.currentTime = 0;

    // Set volume
    this.gainNode.gain.value = options.volume ?? 0.5;

    // Start playback loop
    this.playbackLoop(song);
  }

  /**
   * Pause playback
   */
  pause(): void {
    this.isPlaying = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Resume playback
   */
  resume(): void {
    if (this.audioContext && !this.isPlaying) {
      this.isPlaying = true;
      this.startTime = this.audioContext.currentTime - this.currentTime;
    }
  }

  /**
   * Stop playback and reset
   */
  stop(): void {
    this.pause();
    this.currentTime = 0;
    if (this.options.onTimeUpdate) {
      this.options.onTimeUpdate(0);
    }
  }

  /**
   * Seek to a specific time in seconds
   */
  seek(time: number): void {
    this.currentTime = time;
    if (this.audioContext) {
      this.startTime = this.audioContext.currentTime - time;
    }
    if (this.options.onTimeUpdate) {
      this.options.onTimeUpdate(time);
    }
  }

  /**
   * Set playback volume (0.0 to 1.0)
   */
  setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current playback state
   */
  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Get current playback time
   */
  getCurrentTime(): number {
    return this.currentTime;
  }

  /**
   * Play a chord (public API for testing and manual chord playback)
   */
  public playChord(chord: string, duration: number = 1.0): void {
    if (!this.audioContext || !this.gainNode) return;

    const notes = this.getChordNotes(chord);
    const now = this.audioContext.currentTime;

    notes.forEach((note, index) => {
      const frequency = NOTE_FREQUENCIES[note];
      if (!frequency) return;

      const oscillator = this.audioContext!.createOscillator();
      const noteGain = this.audioContext!.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.value = frequency;

      // Slight volume reduction for each note in the chord
      noteGain.gain.value = 0.3 / notes.length;
      
      // ADSR envelope for more natural sound
      noteGain.gain.setValueAtTime(0, now);
      noteGain.gain.linearRampToValueAtTime(0.3 / notes.length, now + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      oscillator.connect(noteGain);
      noteGain.connect(this.gainNode!);

      oscillator.start(now + index * 0.01); // Slight stagger for realism
      oscillator.stop(now + duration);
    });
  }

  /**
   * Get notes for a chord
   */
  private getChordNotes(chord: string): string[] {
    // Remove any extra characters and get base chord
    const baseChord = chord.replace(/[0-9]/g, '').trim();
    
    // Try exact match first (including minor chords like Am, Em, etc.)
    if (CHORD_NOTES[baseChord]) {
      return CHORD_NOTES[baseChord];
    }

    // Try to extract root and quality
    const rootMatch = baseChord.match(/^([A-G][#b]?)/);
    if (rootMatch) {
      const root = rootMatch[1];
      const isMinor = baseChord.includes('m') && !baseChord.includes('maj');
      const chordKey = isMinor ? `${root}m` : root;
      
      if (CHORD_NOTES[chordKey]) {
        return CHORD_NOTES[chordKey];
      }
    }

    // Default to C major if chord not found
    return CHORD_NOTES['C'];
  }

  /**
   * Calculate total song duration in seconds
   */
  private calculateDuration(song: Song): number {
    // Approximate: each section is 4 bars, each bar is 4 beats
    const beatsPerMinute = song.tempo;
    const secondsPerBeat = 60 / beatsPerMinute;
    const beatsPerSection = 16; // 4 bars * 4 beats
    return song.sections.length * beatsPerSection * secondsPerBeat;
  }

  /**
   * Playback loop
   */
  private playbackLoop(song: Song): void {
    if (!this.audioContext || !this.isPlaying) return;

    this.currentTime = this.audioContext.currentTime - this.startTime;
    const totalDuration = this.calculateDuration(song);

    // Check if playback has ended
    if (this.currentTime >= totalDuration) {
      if (this.options.loop) {
        this.currentTime = 0;
        this.startTime = this.audioContext.currentTime;
      } else {
        this.stop();
        if (this.options.onEnd) {
          this.options.onEnd();
        }
        return;
      }
    }

    // Update callbacks
    if (this.options.onTimeUpdate) {
      this.options.onTimeUpdate(this.currentTime);
    }

    // Calculate current section
    const beatsPerMinute = song.tempo;
    const secondsPerBeat = 60 / beatsPerMinute;
    const beatsPerSection = 16;
    const secondsPerSection = beatsPerSection * secondsPerBeat;
    const currentSectionIndex = Math.floor(this.currentTime / secondsPerSection);

    if (this.options.onSectionChange && currentSectionIndex < song.sections.length) {
      this.options.onSectionChange(currentSectionIndex);
    }

    // Schedule next frame
    this.animationFrameId = requestAnimationFrame(() => this.playbackLoop(song));
  }

  /**
   * Clean up resources
   */
  dispose(): void {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default PlaybackEngine;
