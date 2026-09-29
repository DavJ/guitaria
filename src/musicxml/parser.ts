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
type OrderedXmlNode = Record<string, unknown>;

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

function secondsPerDivision(state: ParseState): number {
  return 60 / (state.tempo * state.divisions);
}

function getOrderedAttributes(node: OrderedXmlNode): UnknownRecord {
  return asRecord(node[':@']);
}

function getOrderedTagName(node: OrderedXmlNode): string | undefined {
  return Object.keys(node).find((key) => key !== ':@' && key !== '#text');
}

function orderedValueToObject(value: unknown, attributes: UnknownRecord = {}): unknown {
  if (!Array.isArray(value)) {
    return value;
  }

  if (value.length === 0) {
    return Object.keys(attributes).length > 0 ? { ...attributes } : '';
  }

  const first = asRecord(value[0]);
  if (value.length === 1 && Object.keys(first).length === 1 && '#text' in first) {
    const text = first['#text'];
    return Object.keys(attributes).length > 0 ? { ...attributes, '#text': text } : text;
  }

  const result: UnknownRecord = { ...attributes };
  value.forEach((childValue) => {
    const child = asRecord(childValue);
    const childAttributes = getOrderedAttributes(child);
    Object.entries(child).forEach(([key, nestedValue]) => {
      if (key === ':@') {
        return;
      }

      if (key === '#text') {
        result['#text'] = nestedValue;
        return;
      }

      const converted = orderedValueToObject(nestedValue, childAttributes);
      const current = result[key];
      if (current === undefined) {
        result[key] = converted;
        return;
      }

      result[key] = Array.isArray(current) ? [...current, converted] : [current, converted];
    });
  });

  return result;
}

function orderedElementToRecord(element: OrderedXmlNode): UnknownRecord {
  const tagName = getOrderedTagName(element);
  if (!tagName) {
    return {};
  }

  return asRecord(orderedValueToObject(element[tagName], getOrderedAttributes(element)));
}

function findOrderedChild(nodes: OrderedXmlNode[], tagName: string): OrderedXmlNode | undefined {
  return nodes.find((node) => getOrderedTagName(node) === tagName);
}

function getOrderedChildren(node: OrderedXmlNode, tagName: string): OrderedXmlNode[] {
  const value = node[tagName];
  return Array.isArray(value) ? value.map((child) => asRecord(child)) : [];
}

export function parseMusicXml(xmlText: string): Song {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: true,
    trimValues: true,
  });
  const orderedParser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    parseTagValue: true,
    trimValues: true,
    preserveOrder: true,
  });

  const parsed = parser.parse(xmlText);
  const orderedParsed = (orderedParser.parse(xmlText) as unknown[]).map((node) => asRecord(node));
  const score = asRecord(parsed['score-partwise']);
  if (Object.keys(score).length === 0) {
    throw new Error('Unsupported MusicXML format: expected score-partwise root.');
  }

  const orderedScoreRoot = findOrderedChild(orderedParsed, 'score-partwise');
  if (!orderedScoreRoot) {
    throw new Error('Unsupported MusicXML format: expected ordered score-partwise root.');
  }

  const orderedScoreChildren = getOrderedChildren(orderedScoreRoot, 'score-partwise');
  const orderedPartRoot = findOrderedChild(orderedScoreChildren, 'part');
  const part = asRecord(asArray(score.part)[0]);
  if (Object.keys(part).length === 0 || !orderedPartRoot) {
    throw new Error('MusicXML has no playable part.');
  }

  const work = asRecord(score.work);
  const identification = asRecord(score.identification);
  const creatorRaw = identification.creator;
  const creators = asArray(creatorRaw).map((creator) => asRecord(creator));

  const title = asString(work['work-title']) ?? asString(score['movement-title']) ?? 'Untitled';
  const composerCreator = creators.find((creator) => asString(creator['@_type']) === 'composer');
  const firstCreator = creators[0];
  const artist = asString(composerCreator?.['#text']) ?? asString(firstCreator?.['#text']) ?? asString(firstCreator);

  const measureElements = getOrderedChildren(orderedPartRoot, 'part');
  const notes: Array<SongNote & { sourceOrder: number }> = [];
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
  let noteSourceOrder = 0;

  measureElements.forEach((measureElement, measureIndex) => {
    const measureNumber = asNumber(getOrderedAttributes(measureElement)['@_number'], measureIndex + 1);
    const measureStart = absoluteTime;
    const measureChildren = getOrderedChildren(measureElement, 'measure');
    let measureCursorDiv = 0;
    let maxDivPosition = 0;

    measureChildren.forEach((childNode) => {
      const tagName = getOrderedTagName(childNode);
      if (!tagName) {
        return;
      }

      const child = orderedElementToRecord(childNode);
      if (tagName === 'attributes') {
        state.divisions = asNumber(child.divisions, state.divisions);
        const timeNode = asRecord(child.time);
        const beats = asNumber(timeNode.beats, 4);
        const beatType = asNumber(timeNode['beat-type'], 4);
        if (beats > 0 && beatType > 0) {
          state.timeSignature = { beats, beatType };
        }

        const keyNode = asRecord(child.key);
        if (Object.keys(keyNode).length > 0) {
          state.key = keyFifthsToName(asNumber(keyNode.fifths, 0));
        }
        return;
      }

      if (tagName === 'direction') {
        const sound = asRecord(child.sound);
        const tempo = asNumber(sound['@_tempo'], Number.NaN);
        if (Number.isFinite(tempo) && tempo > 0) {
          state.tempo = tempo;
        }

        const directionType = asRecord(child['direction-type']);
        const rehearsal = asString(directionType.rehearsal);
        if (rehearsal) {
          sections.push({
            id: `section-${measureNumber}-${measureCursorDiv}-${sections.length}`,
            name: rehearsal,
            startTime: measureStart + measureCursorDiv * secondsPerDivision(state),
            endTime: measureStart + measureCursorDiv * secondsPerDivision(state),
          });
        }
        return;
      }

      if (tagName === 'harmony') {
        chords.push({
          id: `chord-${measureNumber}-${measureCursorDiv}-${chords.length}`,
          name: parseChordName(child),
          startTime: measureStart + measureCursorDiv * secondsPerDivision(state),
          duration: 0,
          measure: measureNumber,
        });
        return;
      }

      if (tagName === 'backup') {
        measureCursorDiv = Math.max(0, measureCursorDiv - asNumber(child.duration, 0));
        return;
      }

      if (tagName === 'forward') {
        measureCursorDiv += asNumber(child.duration, 0);
        maxDivPosition = Math.max(maxDivPosition, measureCursorDiv);
        return;
      }

      if (tagName !== 'note') {
        return;
      }

      const isChordTone = child.chord !== undefined;
      const isRest = child.rest !== undefined;
      const durationDiv = asNumber(child.duration, 0);
      const startDiv = isChordTone ? Math.max(0, measureCursorDiv - durationDiv) : measureCursorDiv;
      const startTime = measureStart + startDiv * secondsPerDivision(state);
      const duration = durationDiv * secondsPerDivision(state);

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
        id: `note-${measureNumber}-${startDiv}-${noteSourceOrder}`,
        midi,
        pitch,
        step,
        alter,
        octave,
        startTime,
        duration,
        measure: measureNumber,
        isRest,
        sourceOrder: noteSourceOrder,
      });
      noteSourceOrder += 1;

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

    const measureDurationSec = secondsPerDivision(state) * maxDivPosition;
    const measureEnd = measureStart + measureDurationSec;
    measureData.push(buildMeasure(measureNumber, measureStart, measureEnd));
    absoluteTime = measureEnd;
  });

  const sortedNotes = notes
    .sort((a, b) => a.startTime - b.startTime || a.measure - b.measure || a.sourceOrder - b.sourceOrder)
    .map((note) => {
      const { sourceOrder, ...normalizedNote } = note;
      return sourceOrder >= 0 ? normalizedNote : normalizedNote;
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
    notes: sortedNotes,
    sections: normalizedSections,
    chords: sortedChords,
    lyrics,
    sourceXml: xmlText,
  };
}
