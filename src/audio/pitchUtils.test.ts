import { describe, expect, it } from 'vitest';
import { frequencyToCentsError, frequencyToMidi, midiToNoteName, pitchToMidi } from './pitchUtils';

describe('pitchUtils', () => {
  it('converts frequency to midi', () => {
    expect(frequencyToMidi(440)).toBe(69);
    expect(frequencyToMidi(261.63)).toBe(60);
  });

  it('converts midi to note name', () => {
    expect(midiToNoteName(69).label).toBe('A4');
    expect(midiToNoteName(60).label).toBe('C4');
  });

  it('computes cents error', () => {
    expect(frequencyToCentsError(440, 69)).toBeCloseTo(0, 6);
    expect(frequencyToCentsError(466.16, 69)).toBeGreaterThan(90);
  });

  it('converts pitch parts to midi', () => {
    expect(pitchToMidi('C', 0, 4)).toBe(60);
    expect(pitchToMidi('F', 1, 4)).toBe(66);
  });
});
