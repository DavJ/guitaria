import { describe, expect, it } from 'vitest';
import { compositionToSong } from './compositionSong';
import type { Composition } from '../features/AIComposer/types';

const composition: Composition = {
  id: 'cmp-1',
  title: 'Composition',
  artist: 'Composer',
  style: 'rock',
  tempo: 120,
  timeSignature: '4/4',
  key: 'C',
  sections: [
    {
      id: 's1',
      type: 'verse',
      name: 'Verse',
      startTime: 0,
      endTime: 8,
      chords: [{ name: 'C', root: 'C', quality: '', duration: 2, time: 0 }],
      melody: [{ pitch: 'C', octave: 4, duration: 1, time: 0, velocity: 0.8 }],
      lyrics: 'hello',
    },
  ],
  createdAt: new Date(),
  modifiedAt: new Date(),
};

describe('compositionToSong adapter', () => {
  it('converts composition into canonical song', () => {
    const song = compositionToSong(composition);

    expect(song.title).toBe('Composition');
    expect(song.notes).toHaveLength(1);
    expect(song.notes[0].midi).toBe(60);
    expect(song.sections[0].name).toBe('Verse');
    expect(song.chords[0].name).toBe('C');
    expect(song.duration).toBeGreaterThan(0);
  });
});
