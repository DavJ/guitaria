import { describe, expect, it } from 'vitest';
import { chooseBestPosition, getGuitarPositions, getGuitarStringLabel, internalStringIndexToGuitarStringNumber } from './fretboard';

describe('guitar fretboard mapping', () => {
  it('returns valid positions for a midi note', () => {
    const positions = getGuitarPositions(64, 0, 20);
    expect(positions.length).toBeGreaterThan(0);
    expect(positions.some((position) => position.string === 5 && position.fret === 0)).toBe(true);
  });

  it('chooses low movement position when previous note exists', () => {
    const positions = [
      { string: 0, fret: 12 },
      { string: 1, fret: 7 },
      { string: 2, fret: 2 },
    ];

    const best = chooseBestPosition(positions, { string: 2, fret: 3 });
    expect(best).toEqual({ string: 2, fret: 2 });
  });

  it('converts internal string indexes to guitar string numbers', () => {
    expect(internalStringIndexToGuitarStringNumber(0)).toBe(6);
    expect(internalStringIndexToGuitarStringNumber(1)).toBe(5);
    expect(internalStringIndexToGuitarStringNumber(5)).toBe(1);
  });

  it('formats guitar string labels for the UI', () => {
    expect(getGuitarStringLabel(0)).toBe('6 · E');
    expect(getGuitarStringLabel(5)).toBe('1 · E');
  });
});
