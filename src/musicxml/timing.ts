export function divisionsToSeconds(durationDivisions: number, divisions: number, tempo: number): number {
  if (divisions <= 0 || tempo <= 0) {
    return 0;
  }

  return durationDivisions * (60 / (tempo * divisions));
}

export function measureLengthSeconds(beats: number, beatType: number, tempo: number): number {
  if (beatType <= 0 || tempo <= 0) {
    return 0;
  }

  const quarterNotesPerBeat = 4 / beatType;
  return beats * quarterNotesPerBeat * (60 / tempo);
}
