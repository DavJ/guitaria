export interface TimeSignature {
  beats: number;
  beatType: number;
}

export interface Measure {
  number: number;
  startTime: number;
  duration: number;
}

export interface SongSection {
  id: string;
  name: string;
  startTime: number;
  endTime: number;
  chords?: string[];
  lyrics?: string;
}

export interface ChordEvent {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  measure: number;
}

export interface LyricEvent {
  id: string;
  text: string;
  startTime: number;
  measure: number;
}

export interface SongNote {
  id: string;
  midi: number;
  pitch: string;
  step: string;
  alter: number;
  octave: number;
  startTime: number;
  duration: number;
  measure: number;
  isRest: boolean;
  string?: number;
  fret?: number;
}

export interface Song {
  id: string;
  title: string;
  artist?: string;
  tempo: number;
  key?: string;
  timeSignature?: TimeSignature;
  duration: number;
  measures: Measure[];
  notes: SongNote[];
  sections: SongSection[];
  chords: ChordEvent[];
  lyrics: LyricEvent[];
  sourceXml?: string;
}

export const DEFAULT_TEMPO = 120;

export function getPlayableNotes(song: Song): SongNote[] {
  return song.notes.filter((note) => !note.isRest && note.midi >= 0);
}
