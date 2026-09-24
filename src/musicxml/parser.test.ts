import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseMusicXml } from './parser';

const fixturePath = resolve(process.cwd(), 'src/test/fixtures/simple-guitar.musicxml');
const fixtureXml = readFileSync(fixturePath, 'utf8');
const orderedVoicesXml = readFileSync(resolve(process.cwd(), 'src/test/fixtures/ordered-voices.musicxml'), 'utf8');
const forwardBackupXml = readFileSync(resolve(process.cwd(), 'src/test/fixtures/forward-backup-order.musicxml'), 'utf8');
const tempoMeterXml = readFileSync(resolve(process.cwd(), 'src/test/fixtures/tempo-meter-accidentals.musicxml'), 'utf8');

describe('parseMusicXml', () => {
  it('parses title, metadata, and musical events', () => {
    const song = parseMusicXml(fixtureXml);

    expect(song.title).toBe('Simple Etude');
    expect(song.artist).toBe('Test Composer');
    expect(song.tempo).toBe(120);
    expect(song.timeSignature).toEqual({ beats: 4, beatType: 4 });
    expect(song.notes).toHaveLength(4);
    expect(song.notes[0].startTime).toBeCloseTo(0);
    expect(song.notes[0].duration).toBeCloseTo(0.5);
    expect(song.notes[1].isRest).toBe(true);
    expect(song.notes[2].pitch).toBe('F#');
    expect(song.sections[0].name).toBe('Verse');
    expect(song.chords[0].name).toBe('Am');
    expect(song.lyrics[0].text).toBe('la');
  });

  it('preserves in-measure ordering for backup voices', () => {
    const song = parseMusicXml(orderedVoicesXml);
    const playable = song.notes.filter((note) => !note.isRest);

    expect(playable).toHaveLength(4);
    expect(playable.map((note) => note.pitch)).toEqual(['C', 'C', 'D', 'E']);
    expect(playable.map((note) => note.startTime)).toEqual([0, 0, 0.5, 1]);
    expect(song.duration).toBeCloseTo(2);
  });

  it('preserves in-measure ordering for forward and backup events', () => {
    const song = parseMusicXml(forwardBackupXml);
    const playable = song.notes.filter((note) => !note.isRest);

    expect(playable[0].startTime).toBeCloseTo(0);
    expect(playable[1].startTime).toBeCloseTo(1);
    expect(playable[2].startTime).toBeCloseTo(2);
    expect(playable[3].startTime).toBeCloseTo(2);
  });

  it('parses rests, accidentals, chords, tempo changes, and non-4/4 meter', () => {
    const song = parseMusicXml(tempoMeterXml);

    expect(song.tempo).toBe(90);
    expect(song.timeSignature).toEqual({ beats: 3, beatType: 4 });
    expect(song.notes[0].pitch).toBe('F#');
    expect(song.notes[1].isRest).toBe(true);
    expect(song.notes[2].pitch).toBe('A#');
    expect(song.notes[3].startTime).toBeCloseTo(2);
    expect(song.notes[4].startTime).toBeCloseTo(2);
    expect(song.notes[5].duration).toBeCloseTo(4 / 3);
  });

  it('throws on invalid xml', () => {
    expect(() => parseMusicXml('<score-partwise><broken></score-partwise>')).toThrow();
    expect(() => parseMusicXml('not xml at all')).toThrow();
    expect(() => parseMusicXml('<other-root/>')).toThrow();
  });
});
