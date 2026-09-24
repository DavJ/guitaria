import { describe, expect, it } from 'vitest';
import type { Song } from '../../domain/Song';
import {
  applyEvaluation,
  calculateScore,
  createLessonProgress,
  evaluateDetectedNote,
  getExpectedNote,
  markMissedNotes,
} from './lessonEngine';

const song: Song = {
  id: 'song-1',
  title: 'Test Song',
  tempo: 120,
  duration: 2,
  measures: [{ number: 1, startTime: 0, duration: 2 }],
  notes: [
    {
      id: 'n1',
      midi: 69,
      pitch: 'A',
      step: 'A',
      alter: 0,
      octave: 4,
      startTime: 0.5,
      duration: 0.5,
      measure: 1,
      isRest: false,
    },
  ],
  sections: [],
  chords: [],
  lyrics: [],
};

describe('lesson engine', () => {
  it('finds expected note around current time', () => {
    const progress = createLessonProgress(song);
    const expected = getExpectedNote(song, progress, 0.45);
    expect(expected?.id).toBe('n1');
  });

  it('evaluates and accepts correct note', () => {
    const evaluation = evaluateDetectedNote(song.notes[0], 69, 0.55, 440);
    expect(evaluation.correct).toBe(true);

    const updated = applyEvaluation(createLessonProgress(song), evaluation);
    expect(updated.noteStatuses.n1).toBe('accepted');
  });

  it('marks note missed if too late', () => {
    const missed = markMissedNotes(song, createLessonProgress(song), 1);
    expect(missed.noteStatuses.n1).toBe('missed');
  });

  it('accumulates score', () => {
    const evaluation = evaluateDetectedNote(song.notes[0], 69, 0.55, 440);
    const progress = applyEvaluation(createLessonProgress(song), evaluation);
    const score = calculateScore(song, progress);

    expect(score.totalNotes).toBe(1);
    expect(score.correctNotes).toBe(1);
    expect(score.pitchAccuracy).toBe(100);
    expect(score.timingAccuracy).toBe(100);
  });
});
