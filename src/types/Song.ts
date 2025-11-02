/**
 * Song type definition for composition and playback
 * Provides a simplified interface for songs with chord progressions and lyrics
 */

export interface Song {
  id?: string; // Optional ID for uniqueness
  title: string;
  tempo: number;
  key: string;
  sections: Section[];
}

export interface Section {
  name: string;
  chords: string[];
  lyrics?: string;
}
