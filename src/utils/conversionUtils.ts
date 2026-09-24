import type { Composition } from '../features/AIComposer/types';
import type { Song } from '../domain/Song';
import { compositionToSong as adaptCompositionToSong } from '../adapters/compositionSong';

export function compositionToSong(composition: Composition): Song {
  return adaptCompositionToSong(composition);
}

export function songToComposition(song: Song): Partial<Composition> {
  const beats = song.timeSignature?.beats ?? 4;
  const beatType = song.timeSignature?.beatType ?? 4;
  const secondsPerBeat = 60 / song.tempo;

  return {
    title: song.title,
    tempo: song.tempo,
    key: song.key ?? 'C',
    timeSignature: `${beats}/${beatType}`,
    sections: song.sections.map((section, index) => ({
      id: section.id,
      type: 'verse',
      name: section.name,
      startTime: section.startTime / secondsPerBeat,
      endTime: section.endTime / secondsPerBeat,
      chords: song.chords
        .filter((chord) => chord.startTime >= section.startTime && chord.startTime < section.endTime)
        .map((chord) => ({
          name: chord.name,
          root: chord.name.charAt(0),
          quality: chord.name.includes('m') ? 'm' : '',
          duration: chord.duration / secondsPerBeat,
          time: chord.startTime / secondsPerBeat,
        })),
      melody: song.notes
        .filter((note) => !note.isRest && note.startTime >= section.startTime && note.startTime < section.endTime)
        .map((note) => ({
          pitch: note.pitch,
          octave: note.octave,
          duration: note.duration / secondsPerBeat,
          time: note.startTime / secondsPerBeat,
          velocity: 0.8,
        })),
      lyrics: song.lyrics
        .filter((lyric) => lyric.startTime >= section.startTime && lyric.startTime < section.endTime)
        .map((lyric) => lyric.text)
        .join('\n'),
    })),
  };
}
