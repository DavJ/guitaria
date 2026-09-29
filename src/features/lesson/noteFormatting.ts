import type { SongNote } from '../../domain/Song';

export function formatNoteLabel(note: Pick<SongNote, 'step' | 'alter' | 'octave' | 'isRest'>): string {
  if (note.isRest) {
    return 'Rest';
  }

  const accidental = note.alter > 0 ? '#'.repeat(note.alter) : 'b'.repeat(Math.abs(note.alter));
  return `${note.step}${accidental}${note.octave}`;
}
