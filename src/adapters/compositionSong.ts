import type { Composition } from '../features/AIComposer/types';
import type { Song, SongNote, SongSection } from '../domain/Song';
import { pitchToMidi } from '../audio/pitchUtils';

function parseTimeSignature(value: string): { beats: number; beatType: number } {
  const [beatsText, beatTypeText] = value.split('/');
  const beats = Number.parseInt(beatsText, 10);
  const beatType = Number.parseInt(beatTypeText, 10);
  return {
    beats: Number.isFinite(beats) ? beats : 4,
    beatType: Number.isFinite(beatType) ? beatType : 4,
  };
}

export function compositionToSong(composition: Composition): Song {
  const secondsPerBeat = 60 / composition.tempo;
  const timeSignature = parseTimeSignature(composition.timeSignature);

  const notes: SongNote[] = composition.sections
    .flatMap((section, sectionIndex) =>
      section.melody.map((note, noteIndex) => {
        const midi = pitchToMidi(note.pitch, 0, note.octave);
        return {
          id: `cmp-note-${sectionIndex}-${noteIndex}`,
          midi,
          pitch: note.pitch,
          step: note.pitch.replace('#', ''),
          alter: note.pitch.includes('#') ? 1 : 0,
          octave: note.octave,
          startTime: note.time * secondsPerBeat,
          duration: note.duration * secondsPerBeat,
          measure: Math.floor(note.time / timeSignature.beats) + 1,
          isRest: false,
        };
      }),
    )
    .sort((a, b) => a.startTime - b.startTime);

  const sections: SongSection[] = composition.sections.map((section, index) => ({
    id: section.id,
    name: section.name,
    startTime: section.startTime * secondsPerBeat,
    endTime: section.endTime * secondsPerBeat,
    chords: section.chords.map((chord) => chord.name),
    lyrics: section.lyrics,
  }));

  const duration = Math.max(0, ...sections.map((section) => section.endTime), ...notes.map((note) => note.startTime + note.duration));

  const measureCount = Math.max(1, Math.ceil(duration / (timeSignature.beats * secondsPerBeat)));

  return {
    id: composition.id,
    title: composition.title,
    artist: composition.artist,
    tempo: composition.tempo,
    key: composition.key,
    timeSignature,
    duration,
    measures: Array.from({ length: measureCount }).map((_, index) => ({
      number: index + 1,
      startTime: index * timeSignature.beats * secondsPerBeat,
      duration: timeSignature.beats * secondsPerBeat,
    })),
    notes,
    sections,
    chords: composition.sections.flatMap((section, sectionIndex) =>
      section.chords.map((chord, chordIndex) => ({
        id: `cmp-chord-${sectionIndex}-${chordIndex}`,
        name: chord.name,
        startTime: chord.time * secondsPerBeat,
        duration: chord.duration * secondsPerBeat,
        measure: Math.floor(chord.time / timeSignature.beats) + 1,
      })),
    ),
    lyrics: composition.sections.flatMap((section, sectionIndex) => {
      if (!section.lyrics) {
        return [];
      }

      return section.lyrics
        .split('\n')
        .filter((text) => text.trim().length > 0)
        .map((text, lineIndex) => ({
          id: `cmp-lyric-${sectionIndex}-${lineIndex}`,
          text,
          startTime: section.startTime * secondsPerBeat,
          measure: Math.floor(section.startTime / timeSignature.beats) + 1,
        }));
    }),
  };
}
