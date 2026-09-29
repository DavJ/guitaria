import { describe, expect, it } from 'vitest';
import type { Song } from '../../domain/Song';
import {
  applyEvaluation,
  calculateScore,
  createLessonProgress,
  evaluateDetectedNote,
  getExpectedNote,
  markMissedNotes,
  rebuildLessonProgress,
  resetProgressInRange,
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
      startTime: 0.2,
      duration: 0.25,
      measure: 1,
      isRest: false,
    },
    {
      id: 'n2',
      midi: 71,
      pitch: 'B',
      step: 'B',
      alter: 0,
      octave: 4,
      startTime: 0.8,
      duration: 0.25,
      measure: 1,
      isRest: false,
    },
    {
      id: 'n3',
      midi: 72,
      pitch: 'C',
      step: 'C',
      alter: 0,
      octave: 5,
      startTime: 1.4,
      duration: 0.25,
      measure: 1,
      isRest: false,
    },
  ],
  sections: [],
  chords: [],
  lyrics: [],
};

describe('lesson engine', () => {
  it('finds the first expected note around current time', () => {
    const progress = createLessonProgress(song);
    const expected = getExpectedNote(song, progress, 0);
    expect(expected?.id).toBe('n1');
  });

  it('accepts a correct note evaluation', () => {
    const evaluation = evaluateDetectedNote(song.notes[0], 69, 0.22, 440);
    const updated = applyEvaluation(createLessonProgress(song), evaluation);

    expect(evaluation.correct).toBe(true);
    expect(updated.noteStatuses.n1).toBe('accepted');
    expect(updated.evaluations).toHaveLength(1);
  });

  it('keeps bounded failed history and replaces it with the best/latest accepted attempt', () => {
    let progress = createLessonProgress(song);

    for (const frequency of [400, 405, 410, 415, 418]) {
      progress = applyEvaluation(progress, evaluateDetectedNote(song.notes[0], 67, 0.22, frequency));
    }

    expect(progress.evaluations).toHaveLength(1);
    expect(progress.noteStatuses.n1).toBe('waiting');

    progress = applyEvaluation(progress, evaluateDetectedNote(song.notes[0], 69, 0.22, 440));

    expect(progress.evaluations).toHaveLength(1);
    expect(progress.noteStatuses.n1).toBe('accepted');

    const score = calculateScore(song, progress);
    expect(score.correctNotes).toBe(1);
    expect(score.pitchAccuracy).toBeCloseTo(100 / 3);
  });

  it('marks notes missed after the acceptable timing window', () => {
    const missed = markMissedNotes(song, createLessonProgress(song), 1.2);

    expect(missed.noteStatuses.n1).toBe('missed');
    expect(missed.noteStatuses.n2).toBe('missed');
    expect(missed.noteStatuses.n3).toBe('waiting');
  });

  it('rebuilds progress deterministically for seeking', () => {
    const rebuilt = rebuildLessonProgress(song, 0.95);

    expect(rebuilt.noteStatuses).toEqual({
      n1: 'missed',
      n2: 'waiting',
      n3: 'waiting',
    });
    expect(rebuilt.evaluations).toEqual([]);
  });

  it('resets loop-range notes so they can be practiced again', () => {
    let progress = createLessonProgress(song);
    progress = applyEvaluation(progress, evaluateDetectedNote(song.notes[0], 69, 0.22, 440));
    progress = applyEvaluation(progress, evaluateDetectedNote(song.notes[1], 71, 0.82, 493.88));

    const loopReset = resetProgressInRange(song, progress, 0.75, 1.1);

    expect(loopReset.noteStatuses).toEqual({
      n1: 'accepted',
      n2: 'waiting',
      n3: 'waiting',
    });
    expect(loopReset.evaluations.map((evaluation) => evaluation.noteId)).toEqual(['n1']);
  });

  it('accumulates score from per-note evaluations only', () => {
    let progress = createLessonProgress(song);
    progress = applyEvaluation(progress, evaluateDetectedNote(song.notes[0], 69, 0.22, 440));
    progress = applyEvaluation(progress, evaluateDetectedNote(song.notes[1], 68, 0.82, 415.3));
    progress = markMissedNotes(song, progress, 2);
    const score = calculateScore(song, progress);

    expect(score.totalNotes).toBe(3);
    expect(score.correctNotes).toBe(1);
    expect(score.missedNotes).toBe(2);
    expect(score.pitchAccuracy).toBeCloseTo(100 / 3);
  });
});
