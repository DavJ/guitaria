/**
 * Conversion utilities between Composition and Song types
 */

import type { Composition } from '../features/AIComposer/types';
import type { Song } from '../types/Song';

/**
 * Convert a Composition to a Song for lesson mode
 */
export function compositionToSong(composition: Composition): Song {
  return {
    id: composition.id,
    title: composition.title,
    tempo: composition.tempo,
    key: composition.key,
    sections: composition.sections.map(section => ({
      name: section.name,
      chords: section.chords.map(chord => chord.name),
      lyrics: section.lyrics
    }))
  };
}

/**
 * Convert a Song to a simplified Composition
 */
export function songToComposition(song: Song): Partial<Composition> {
  return {
    title: song.title,
    tempo: song.tempo,
    key: song.key,
    sections: song.sections.map((section, index) => {
      const startTime = index * 16; // Approximate 16 beats per section
      return {
        id: `section-${index}`,
        type: 'verse' as const,
        name: section.name,
        startTime,
        endTime: startTime + 16,
        chords: section.chords.map((chordName, chordIndex) => ({
          name: chordName,
          root: chordName.charAt(0),
          quality: chordName.includes('m') ? 'm' : '',
          duration: 2,
          time: startTime + chordIndex * 2
        })),
        melody: [],
        lyrics: section.lyrics
      };
    })
  };
}
