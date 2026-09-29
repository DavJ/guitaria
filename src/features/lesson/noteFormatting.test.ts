import { describe, expect, it } from 'vitest';
import { formatNoteLabel } from './noteFormatting';

describe('formatNoteLabel', () => {
  it('formats natural notes', () => {
    expect(formatNoteLabel({ step: 'C', alter: 0, octave: 4, isRest: false })).toBe('C4');
  });

  it('formats sharps and flats', () => {
    expect(formatNoteLabel({ step: 'F', alter: 1, octave: 4, isRest: false })).toBe('F#4');
    expect(formatNoteLabel({ step: 'B', alter: -1, octave: 3, isRest: false })).toBe('Bb3');
  });

  it('formats rests', () => {
    expect(formatNoteLabel({ step: 'C', alter: 0, octave: 4, isRest: true })).toBe('Rest');
  });
});
