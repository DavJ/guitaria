/**
 * Utility functions for AI Composer
 */

import type { Composition, CompositionSection, Chord, MelodyNote } from './types';

/**
 * Generate a unique ID for compositions
 */
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Parse MIDI note number to pitch notation
 */
export const midiToPitch = (midiNote: number): { pitch: string; octave: number } => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const octave = Math.floor(midiNote / 12) - 1;
  const pitch = notes[midiNote % 12];
  return { pitch, octave };
};

/**
 * Convert pitch notation to MIDI note number
 */
export const pitchToMidi = (pitch: string, octave: number): number => {
  const notes: Record<string, number> = {
    'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
    'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
  };
  return (octave + 1) * 12 + (notes[pitch] || 0);
};

/**
 * Transpose melody by semitones
 */
export const transposeMelody = (melody: MelodyNote[], semitones: number): MelodyNote[] => {
  return melody.map(note => {
    const midiNote = pitchToMidi(note.pitch, note.octave);
    const transposed = midiToPitch(midiNote + semitones);
    return {
      ...note,
      pitch: transposed.pitch,
      octave: transposed.octave
    };
  });
};

/**
 * Transpose chord by semitones
 */
export const transposeChord = (chord: Chord, semitones: number): Chord => {
  const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const rootIndex = notes.indexOf(chord.root);
  if (rootIndex === -1) return chord;
  
  const newIndex = (rootIndex + semitones + 12) % 12;
  const newRoot = notes[newIndex];
  
  return {
    ...chord,
    root: newRoot,
    name: `${newRoot}${chord.quality}`
  };
};

/**
 * Calculate duration in bars from time
 */
export const timeToBars = (time: number, tempo: number, timeSignature: string): number => {
  const [beatsPerBar] = timeSignature.split('/').map(Number);
  const secondsPerBeat = 60 / tempo;
  const secondsPerBar = secondsPerBeat * beatsPerBar;
  return time / secondsPerBar;
};

/**
 * Validate composition structure
 */
export const validateComposition = (composition: Composition): boolean => {
  if (!composition.title || !composition.sections || composition.sections.length === 0) {
    return false;
  }
  
  for (const section of composition.sections) {
    if (section.startTime >= section.endTime) {
      return false;
    }
  }
  
  return true;
};

/**
 * Merge overlapping sections
 */
export const mergeSections = (sections: CompositionSection[]): CompositionSection[] => {
  if (sections.length === 0) return [];
  
  const sorted = [...sections].sort((a, b) => a.startTime - b.startTime);
  const merged: CompositionSection[] = [sorted[0]];
  
  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i];
    const last = merged[merged.length - 1];
    
    if (current.startTime <= last.endTime) {
      last.endTime = Math.max(last.endTime, current.endTime);
      last.chords = [...last.chords, ...current.chords];
      last.melody = [...last.melody, ...current.melody];
      if (current.lyrics) {
        last.lyrics = last.lyrics ? `${last.lyrics}\n${current.lyrics}` : current.lyrics;
      }
    } else {
      merged.push(current);
    }
  }
  
  return merged;
};

/**
 * Format time in MM:SS format
 */
export const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Create empty composition
 */
export const createEmptyComposition = (): Composition => {
  return {
    id: generateId(),
    title: 'Untitled Composition',
    artist: 'Unknown',
    style: 'rock',
    tempo: 120,
    timeSignature: '4/4',
    key: 'C',
    sections: [],
    createdAt: new Date(),
    modifiedAt: new Date()
  };
};
