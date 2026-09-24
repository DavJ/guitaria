import { describe, expect, it } from 'vitest';
import { chooseBestPosition, getGuitarPositions } from './fretboard';

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
});
