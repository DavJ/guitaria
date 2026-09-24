import { DEFAULT_TEMPO, type ChordEvent, type LyricEvent, type Measure, type Song, type SongNote, type SongSection, type TimeSignature } from '../domain/Song';
import { midiToPitchParts, pitchToMidi } from '../audio/pitchUtils';

interface ParseState {
  divisions: number;
  tempo: number;
  timeSignature?: TimeSignature;
  key?: string;
}

function parseInteger(value: string | null | undefined, fallback: number): number {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function parseFloatValue(value: string | null | undefined, fallback: number): number {
  const parsed = value ? Number.parseFloat(value) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : fallback;
}

function keyFifthsToName(fifths: number): string {
  const map: Record<number, string> = {
    '-7': 'Cb',
    '-6': 'Gb',
    '-5': 'Db',
    '-4': 'Ab',
    '-3': 'Eb',
    '-2': 'Bb',
    '-1': 'F',
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

function parseChordName(harmonyElement: Element): string {
  const rootStep = harmonyElement.querySelector('root > root-step')?.textContent?.trim() ?? 'C';
  const alter = parseInteger(harmonyElement.querySelector('root > root-alter')?.textContent, 0);
  const kind = harmonyElement.querySelector('kind')?.textContent?.toLowerCase() ?? '';

  const accidental = alter === 1 ? '#' : alter === -1 ? 'b' : '';
  const quality = kind.includes('minor') ? 'm' : '';

  return `${rootStep}${accidental}${quality}`;
}

function parseSectionFromDirection(direction: Element, startTime: number, measureNumber: number): SongSection | null {
  const rehearsal = direction.querySelector('direction-type > rehearsal')?.textContent?.trim();
  if (!rehearsal) {
    return null;
  }

  return {
    id: `section-${measureNumber}-${startTime}`,
    name: rehearsal,
    startTime,
    endTime: startTime,
  };
}

function buildMeasure(index: number, startTime: number, endTime: number): Measure {
  return {
    number: index,
    startTime,
    duration: Math.max(0, endTime - startTime),
  };
}

export function parseMusicXml(xmlText: string): Song {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'application/xml');
  const parserError = xmlDoc.querySelector('parsererror');

  if (parserError) {
    throw new Error('Invalid MusicXML document.');
  }

  const score = xmlDoc.querySelector('score-partwise');
  if (!score) {
    throw new Error('Unsupported MusicXML format: expected score-partwise root.');
  }

  const title =
    xmlDoc.querySelector('work > work-title')?.textContent?.trim() ??
    xmlDoc.querySelector('movement-title')?.textContent?.trim() ??
    'Untitled';

  const artist =
    xmlDoc.querySelector('identification > creator[type="composer"]')?.textContent?.trim() ??
    xmlDoc.querySelector('identification > creator')?.textContent?.trim() ??
    undefined;

  const part = xmlDoc.querySelector('part');
  if (!part) {
    throw new Error('MusicXML has no playable part.');
  }

  const measures = Array.from(part.querySelectorAll(':scope > measure'));
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

  measures.forEach((measureElement, measureIndex) => {
    const attributes = measureElement.querySelector(':scope > attributes');
    if (attributes) {
      state.divisions = parseInteger(attributes.querySelector('divisions')?.textContent, state.divisions);
      const beats = parseInteger(attributes.querySelector('time > beats')?.textContent, 4);
      const beatType = parseInteger(attributes.querySelector('time > beat-type')?.textContent, 4);
      if (beats > 0 && beatType > 0) {
        state.timeSignature = { beats, beatType };
      }
      const fifthsText = attributes.querySelector('key > fifths')?.textContent;
      if (fifthsText) {
        state.key = keyFifthsToName(parseInteger(fifthsText, 0));
      }
    }

    const tempoDirection = measureElement.querySelector(':scope > direction sound[tempo]');
    if (tempoDirection) {
      state.tempo = parseFloatValue(tempoDirection.getAttribute('tempo'), state.tempo);
    }

    const measureNumber = parseInteger(measureElement.getAttribute('number'), measureIndex + 1);
    const measureStart = absoluteTime;
    let measureCursorDiv = 0;
    let maxDivPosition = 0;

    Array.from(measureElement.children).forEach((child) => {
      if (child.tagName === 'direction') {
        const section = parseSectionFromDirection(child, measureStart, measureNumber);
        if (section) {
          sections.push(section);
        }
      }

      if (child.tagName === 'harmony') {
        const chordName = parseChordName(child);
        const secondsPerDivision = 60 / (state.tempo * state.divisions);
        chords.push({
          id: `chord-${measureNumber}-${measureCursorDiv}-${chords.length}`,
          name: chordName,
          startTime: measureStart + measureCursorDiv * secondsPerDivision,
          duration: 0,
          measure: measureNumber,
        });
      }

      if (child.tagName === 'backup') {
        const durationDiv = parseInteger(child.querySelector('duration')?.textContent, 0);
        measureCursorDiv = Math.max(0, measureCursorDiv - durationDiv);
      }

      if (child.tagName === 'forward') {
        const durationDiv = parseInteger(child.querySelector('duration')?.textContent, 0);
        measureCursorDiv += durationDiv;
        maxDivPosition = Math.max(maxDivPosition, measureCursorDiv);
      }

      if (child.tagName !== 'note') {
        return;
      }

      const isChordTone = child.querySelector('chord') !== null;
      const isRest = child.querySelector('rest') !== null;
      const durationDiv = parseInteger(child.querySelector('duration')?.textContent, 0);
      const startDiv = isChordTone ? Math.max(0, measureCursorDiv - durationDiv) : measureCursorDiv;
      const secondsPerDivision = 60 / (state.tempo * state.divisions);
      const startTime = measureStart + startDiv * secondsPerDivision;
      const duration = durationDiv * secondsPerDivision;

      const pitchElement = child.querySelector('pitch');
      let midi = -1;
      let step = 'R';
      let alter = 0;
      let octave = 0;
      let pitch = 'Rest';

      if (!isRest && pitchElement) {
        step = pitchElement.querySelector('step')?.textContent?.trim() ?? 'C';
        alter = parseInteger(pitchElement.querySelector('alter')?.textContent, 0);
        octave = parseInteger(pitchElement.querySelector('octave')?.textContent, 4);
        midi = pitchToMidi(step, alter, octave);
        const pitchParts = midiToPitchParts(midi);
        pitch = pitchParts.pitch;
      }

      const noteId = `note-${measureNumber}-${startDiv}-${notes.length}`;
      notes.push({
        id: noteId,
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

      const lyricText = child.querySelector('lyric > text')?.textContent?.trim();
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
