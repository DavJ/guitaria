import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseMusicXml } from './parser';

const fixturePath = resolve(process.cwd(), 'src/test/fixtures/simple-guitar.musicxml');
const fixtureXml = readFileSync(fixturePath, 'utf8');

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

  it('throws on invalid xml', () => {
    expect(() => parseMusicXml('<score-partwise><broken></score-partwise>')).toThrow();
  });
});
