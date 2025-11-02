/**
 * Types for AI Composer module
 * Defines data structures for AI-powered song composition
 */

export type CompositionStyle = 
  | 'rock' 
  | 'pop' 
  | 'blues' 
  | 'jazz' 
  | 'country' 
  | 'folk' 
  | 'funk' 
  | 'ballad' 
  | 'metal';

export type SectionType = 
  | 'intro' 
  | 'verse' 
  | 'chorus' 
  | 'bridge' 
  | 'solo' 
  | 'outro';

export interface Chord {
  name: string;
  root: string;
  quality: string;
  duration: number;
  time: number;
}

export interface MelodyNote {
  pitch: string;
  octave: number;
  duration: number;
  time: number;
  velocity: number;
}

export interface CompositionSection {
  id: string;
  type: SectionType;
  name: string;
  startTime: number;
  endTime: number;
  chords: Chord[];
  melody: MelodyNote[];
  lyrics?: string;
}

export interface Composition {
  id: string;
  title: string;
  artist: string;
  style: CompositionStyle;
  tempo: number;
  timeSignature: string;
  key: string;
  sections: CompositionSection[];
  createdAt: Date;
  modifiedAt: Date;
}

export interface AICommand {
  type: 'modify-section' | 'change-style' | 'change-key' | 'add-section' | 'modify-tempo';
  target?: string;
  parameters: Record<string, string | number>;
}

export interface InputOptions {
  type: 'audio' | 'midi' | 'notation';
  source?: File | MediaStream;
}

export interface ExportFormat {
  format: 'gtrsong' | 'musicxml' | 'midi';
  includeAudio?: boolean;
}

export interface LyricGenerationOptions {
  theme?: string;
  emotion?: string;
  language?: string;
  lineCount?: number;
}

export interface MelodyGenerationOptions {
  style: CompositionStyle;
  length?: number;
  complexity?: 'simple' | 'moderate' | 'complex';
  baseMotif?: MelodyNote[];
}
