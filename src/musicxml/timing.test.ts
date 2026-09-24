import { describe, expect, it } from 'vitest';
import { divisionsToSeconds, measureLengthSeconds } from './timing';

describe('musicxml timing', () => {
  it('converts divisions to seconds', () => {
    expect(divisionsToSeconds(2, 2, 120)).toBeCloseTo(0.5);
    expect(divisionsToSeconds(4, 4, 60)).toBeCloseTo(1);
  });

  it('computes measure length from time signature and tempo', () => {
    expect(measureLengthSeconds(4, 4, 120)).toBeCloseTo(2);
    expect(measureLengthSeconds(3, 8, 120)).toBeCloseTo(0.75);
  });
});
