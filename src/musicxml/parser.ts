import { XMLParser } from 'fast-xml-parser';
import { DEFAULT_TEMPO, type ChordEvent, type LyricEvent, type Measure, type Song, type SongNote, type SongSection, type TimeSignature } from '../domain/Song';
import { midiToPitchParts, pitchToMidi } from '../audio/pitchUtils';

interface ParseState {
  divisions: number;
  tempo: number;
  timeSignature?: TimeSignature;
  key?: string;
}

type UnknownRecord = Record<string, unknown>;

function asArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return String(value);
  }
  return undefined;
}

function asNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
}

function keyFifthsToName(fifths: number): string {
  const map: Record<number, string> = {
    [-7]: 'Cb',
    [-6]: 'Gb',
    [-5]: 'Db',
    [-4]: 'Ab',
    [-3]: 'Eb',
    [-2]: 'Bb',
    [-1]: 'F',
    0: 'C',
    1: 'G',
    2: 'D',
    3: 'A',
    4: 'E',
    5: 'B',
    6: 'F#',
    7: 'C#',
  };

  return map[fifths] ?? 'C';
}

function parseChordName(harmony: UnknownRecord): string {
  const root = asRecord(harmony.root);
  const rootStep = asString(root['root-step']) ?? 'C';
  const alter = asNumber(root['root-alter'], 0);
  const kind = (asString(harmony.kind) ?? '').toLowerCase();

  const accidental = alter === 1 ? '#' : alter === -1 ? 'b' : '';
  const quality = kind.includes('minor') ? 'm' : '';
  return `${rootStep}${accidental}${quality}`;
}

function buildMeasure(index: number, startTime: number, endTime: number): Measure {
  return {
    number: index,
    startTime,
    duration: Math.max(0, endTime - startTime),
  };
}

export function parseMusicXml(xmlText: string): Song {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: true,
    trimValues: true,
  });

  const parsed = parser.parse(xmlText);
  const score = asRecord(parsed['score-partwise']);
  if (Object.keys(score).length === 0) {
    throw new Error('Unsupported MusicXML format: expected score-partwise root.');
  }

  const work = asRecord(score.work);
  const identification = asRecord(score.identification);
  const creatorRaw = identification.creator;
  const creators = asArray(creatorRaw).map((creator) => asRecord(creator));

  const title = asString(work['work-title']) ?? asString(score['movement-title']) ?? 'Untitled';
  const composerCreator = creators.find((creator) => asString(creator['@_type']) === 'composer');
  const firstCreator = creators[0];
  const artist = asString(composerCreator?.['#text']) ?? asString(firstCreator?.['#text']) ?? asString(firstCreator);

  const part = asRecord(asArray(score.part)[0]);
  if (Object.keys(part).length === 0) {
    throw new Error('MusicXML has no playable part.');
  }

  const measureElements = asArray(part.measure).map((measure) => asRecord(measure));
  const notes: SongNote[] = [];
  const measureData: Measure[] = [];
  const sections: SongSection[] = [];
  const chords: ChordEvent[] = [];
  const lyrics: LyricEvent[] = [];

  const state: ParseState = {
    divisions: 1,
    tempo: DEFAULT_TEMPO,
    timeSignature: undefined,
    key: undefined,
  };

  let absoluteTime = 0;

  measureElements.forEach((measureElement, measureIndex) => {
    const attributes = asRecord(measureElement.attributes);
    if (Object.keys(attributes).length > 0) {
      state.divisions = asNumber(attributes.divisions, state.divisions);
      const timeNode = asRecord(attributes.time);
      const beats = asNumber(timeNode.beats, 4);
      const beatType = asNumber(timeNode['beat-type'], 4);
      if (beats > 0 && beatType > 0) {
        state.timeSignature = { beats, beatType };
      }

      const keyNode = asRecord(attributes.key);
      if (Object.keys(keyNode).length > 0) {
        state.key = keyFifthsToName(asNumber(keyNode.fifths, 0));
      }
    }

    const directions = asArray(measureElement.direction).map((direction) => asRecord(direction));
    directions.forEach((direction) => {
      const sound = asRecord(direction.sound);
      const tempo = asNumber(sound['@_tempo'], Number.NaN);
      if (Number.isFinite(tempo) && tempo > 0) {
        state.tempo = tempo;
      }

      const directionType = asRecord(direction['direction-type']);
      const rehearsal = asString(directionType.rehearsal);
      if (rehearsal) {
        sections.push({
          id: `section-${measureIndex + 1}-${absoluteTime}`,
          name: rehearsal,
          startTime: absoluteTime,
          endTime: absoluteTime,
        });
      }
    });

    const measureNumber = asNumber(measureElement['@_number'], measureIndex + 1);
    const measureStart = absoluteTime;
    let measureCursorDiv = 0;
    let maxDivPosition = 0;

    const sequence = ['harmony', 'backup', 'forward', 'note'] as const;
    sequence.forEach((tag) => {
      asArray(measureElement[tag]).map((entry) => asRecord(entry)).forEach((child) => {
        if (tag === 'harmony') {
          const secondsPerDivision = 60 / (state.tempo * state.divisions);
          chords.push({
            id: `chord-${measureNumber}-${measureCursorDiv}-${chords.length}`,
            name: parseChordName(child),
            startTime: measureStart + measureCursorDiv * secondsPerDivision,
            duration: 0,
            measure: measureNumber,
          });
          return;
        }

        if (tag === 'backup') {
          const durationDiv = asNumber(child.duration, 0);
          measureCursorDiv = Math.max(0, measureCursorDiv - durationDiv);
          return;
        }

        if (tag === 'forward') {
          const durationDiv = asNumber(child.duration, 0);
          measureCursorDiv += durationDiv;
          maxDivPosition = Math.max(maxDivPosition, measureCursorDiv);
          return;
        }

        const isChordTone = child.chord !== undefined;
        const isRest = child.rest !== undefined;
        const durationDiv = asNumber(child.duration, 0);
        const startDiv = isChordTone ? Math.max(0, measureCursorDiv - durationDiv) : measureCursorDiv;
        const secondsPerDivision = 60 / (state.tempo * state.divisions);
        const startTime = measureStart + startDiv * secondsPerDivision;
        const duration = durationDiv * secondsPerDivision;

        let midi = -1;
        let step = 'R';
        let alter = 0;
        let octave = 0;
        let pitch = 'Rest';

        if (!isRest) {
          const pitchNode = asRecord(child.pitch);
          step = asString(pitchNode.step) ?? 'C';
          alter = asNumber(pitchNode.alter, 0);
          octave = asNumber(pitchNode.octave, 4);
          midi = pitchToMidi(step, alter, octave);
          pitch = midiToPitchParts(midi).pitch;
        }

        notes.push({
          id: `note-${measureNumber}-${startDiv}-${notes.length}`,
          midi,
          pitch,
          step,
          alter,
          octave,
          startTime,
          duration,
          measure: measureNumber,
          isRest,
        });

        const lyricNode = asRecord(child.lyric);
        const lyricText = asString(asRecord(lyricNode.text)['#text']) ?? asString(lyricNode.text);
        if (lyricText) {
          lyrics.push({
            id: `lyric-${measureNumber}-${startDiv}-${lyrics.length}`,
            text: lyricText,
            startTime,
            measure: measureNumber,
          });
        }

        if (!isChordTone) {
          measureCursorDiv += durationDiv;
        }

        maxDivPosition = Math.max(maxDivPosition, startDiv + durationDiv, measureCursorDiv);
      });
    });

    const measureDurationSec = (60 / (state.tempo * state.divisions)) * maxDivPosition;
    const measureEnd = measureStart + measureDurationSec;
    measureData.push(buildMeasure(measureNumber, measureStart, measureEnd));
    absoluteTime = measureEnd;
  });

  const sortedChords = chords
    .sort((a, b) => a.startTime - b.startTime)
    .map((chord, index, arr) => ({
      ...chord,
      duration: (arr[index + 1]?.startTime ?? absoluteTime) - chord.startTime,
    }));

  const normalizedSections = sections
    .sort((a, b) => a.startTime - b.startTime)
    .map((section, index, arr) => ({
      ...section,
      endTime: arr[index + 1]?.startTime ?? absoluteTime,
    }));

  return {
    id: `song-${Date.now()}`,
    title,
    artist,
    tempo: state.tempo,
    key: state.key,
    timeSignature: state.timeSignature,
    duration: absoluteTime,
    measures: measureData,
    notes,
    sections: normalizedSections,
    chords: sortedChords,
    lyrics,
    sourceXml: xmlText,
  };
}
