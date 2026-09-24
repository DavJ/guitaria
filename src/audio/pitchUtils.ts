const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export interface NoteName {
  name: string;
  octave: number;
  label: string;
}

export function frequencyToMidi(frequency: number): number | null {
  if (!Number.isFinite(frequency) || frequency <= 0) {
    return null;
  }

  return Math.round(69 + 12 * Math.log2(frequency / 440));
}

export function midiToNoteName(midi: number): NoteName {
  const normalized = ((midi % 12) + 12) % 12;
  const octave = Math.floor(midi / 12) - 1;
  const name = NOTE_NAMES[normalized];

  return {
    name,
    octave,
    label: `${name}${octave}`,
  };
}

export function frequencyToCentsError(frequency: number, targetMidi: number): number {
  const referenceFrequency = 440 * 2 ** ((targetMidi - 69) / 12);
  return 1200 * Math.log2(frequency / referenceFrequency);
}

export function pitchToMidi(step: string, alter: number, octave: number): number {
  const steps: Record<string, number> = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  };

  const base = steps[step.toUpperCase()] ?? 0;
  return (octave + 1) * 12 + base + alter;
}

export function midiToPitchParts(midi: number): { step: string; alter: number; octave: number; pitch: string } {
  const note = midiToNoteName(midi);
  if (note.name.includes('#')) {
    return {
      step: note.name[0],
      alter: 1,
      octave: note.octave,
      pitch: note.name,
    };
  }

  return {
    step: note.name,
    alter: 0,
    octave: note.octave,
    pitch: note.name,
  };
}
