export interface GuitarPosition {
  string: number;
  fret: number;
}

export const STANDARD_TUNING_MIDI = [40, 45, 50, 55, 59, 64];
export const GUITAR_STRING_NAMES = ['E', 'A', 'D', 'G', 'B', 'E'];

export function internalStringIndexToGuitarStringNumber(index: number): number {
  return STANDARD_TUNING_MIDI.length - index;
}

export function getGuitarStringLabel(index: number): string {
  return `${internalStringIndexToGuitarStringNumber(index)} · ${GUITAR_STRING_NAMES[index]}`;
}

export function getGuitarPositions(midi: number, minFret = 0, maxFret = 20): GuitarPosition[] {
  const positions: GuitarPosition[] = [];

  STANDARD_TUNING_MIDI.forEach((openMidi, stringIndex) => {
    const fret = midi - openMidi;
    if (fret >= minFret && fret <= maxFret) {
      positions.push({ string: stringIndex, fret });
    }
  });

  return positions.sort((a, b) => a.fret - b.fret || a.string - b.string);
}

export function chooseBestPosition(
  positions: GuitarPosition[],
  previousPosition?: GuitarPosition,
): GuitarPosition | null {
  if (positions.length === 0) {
    return null;
  }

  if (!previousPosition) {
    return positions[0];
  }

  return positions
    .map((position) => {
      const movementCost = Math.abs(position.fret - previousPosition.fret) * 1.5 + Math.abs(position.string - previousPosition.string);
      const fretCost = position.fret;
      return {
        position,
        score: movementCost + fretCost,
      };
    })
    .sort((a, b) => a.score - b.score)[0].position;
}
