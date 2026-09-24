import type { Song, SongNote } from '../../domain/Song';
import { getPlayableNotes } from '../../domain/Song';
import type { ScoreData } from '../../store/appStore';

export interface LessonConfig {
  pitchToleranceCents: number;
  timingPerfectMs: number;
  timingGoodMs: number;
  timingAcceptableMs: number;
}

export const DEFAULT_LESSON_CONFIG: LessonConfig = {
  pitchToleranceCents: 35,
  timingPerfectMs: 80,
  timingGoodMs: 180,
  timingAcceptableMs: 300,
};

export type NoteStatus = 'waiting' | 'accepted' | 'missed';

export interface NoteEvaluation {
  noteId: string;
  expectedMidi: number;
  detectedMidi?: number;
  pitchErrorCents?: number;
  timingErrorMs?: number;
  pitchCorrect: boolean;
  timingCorrect: boolean;
  correct: boolean;
}

export interface LessonProgress {
  noteStatuses: Record<string, NoteStatus>;
  evaluations: NoteEvaluation[];
}

export function createLessonProgress(song: Song): LessonProgress {
  const statuses: Record<string, NoteStatus> = {};
  getPlayableNotes(song).forEach((note) => {
    statuses[note.id] = 'waiting';
  });

  return {
    noteStatuses: statuses,
    evaluations: [],
  };
}

export function getExpectedNote(song: Song, progress: LessonProgress, currentTime: number, lookAheadSec = 0.3): SongNote | null {
  const notes = getPlayableNotes(song);
  for (const note of notes) {
    if (progress.noteStatuses[note.id] !== 'waiting') {
      continue;
    }

    if (note.startTime - lookAheadSec <= currentTime) {
      return note;
    }

    break;
  }

  return null;
}

export function evaluateDetectedNote(
  expected: SongNote,
  detectedMidi: number,
  detectionTimeSec: number,
  detectedFrequency: number,
  config: LessonConfig = DEFAULT_LESSON_CONFIG,
): NoteEvaluation {
  const expectedFrequency = 440 * 2 ** ((expected.midi - 69) / 12);
  const pitchErrorCents = 1200 * Math.log2(detectedFrequency / expectedFrequency);
  const timingErrorMs = (detectionTimeSec - expected.startTime) * 1000;

  const pitchCorrect = Math.abs(pitchErrorCents) <= config.pitchToleranceCents;
  const timingCorrect = Math.abs(timingErrorMs) <= config.timingAcceptableMs;

  return {
    noteId: expected.id,
    expectedMidi: expected.midi,
    detectedMidi,
    pitchErrorCents,
    timingErrorMs,
    pitchCorrect,
    timingCorrect,
    correct: pitchCorrect && timingCorrect,
  };
}

export function applyEvaluation(progress: LessonProgress, evaluation: NoteEvaluation): LessonProgress {
  const currentStatus = progress.noteStatuses[evaluation.noteId];
  if (currentStatus !== 'waiting') {
    return progress;
  }

  return {
    noteStatuses: {
      ...progress.noteStatuses,
      [evaluation.noteId]: evaluation.correct ? 'accepted' : currentStatus,
    },
    evaluations: [...progress.evaluations, evaluation],
  };
}

export function markMissedNotes(song: Song, progress: LessonProgress, currentTime: number, config: LessonConfig = DEFAULT_LESSON_CONFIG): LessonProgress {
  const notes = getPlayableNotes(song);
  const nextStatuses = { ...progress.noteStatuses };
  let changed = false;

  notes.forEach((note) => {
    if (nextStatuses[note.id] !== 'waiting') {
      return;
    }

    if (currentTime > note.startTime + config.timingAcceptableMs / 1000) {
      nextStatuses[note.id] = 'missed';
      changed = true;
    }
  });

  if (!changed) {
    return progress;
  }

  return {
    ...progress,
    noteStatuses: nextStatuses,
  };
}

export function calculateScore(song: Song, progress: LessonProgress): ScoreData {
  const totalNotes = getPlayableNotes(song).length;
  const correctNotes = Object.values(progress.noteStatuses).filter((status) => status === 'accepted').length;
  const missedNotes = Object.values(progress.noteStatuses).filter((status) => status === 'missed').length;
  const latestEvaluationByNote = progress.evaluations.reduce<Record<string, NoteEvaluation>>((acc, evaluation) => {
    acc[evaluation.noteId] = evaluation;
    return acc;
  }, {});
  const perNoteEvaluations = Object.values(latestEvaluationByNote);
  const pitchErrors = perNoteEvaluations
    .map((evaluation) => evaluation.pitchErrorCents)
    .filter((value): value is number => typeof value === 'number');
  const timingErrors = perNoteEvaluations
    .map((evaluation) => evaluation.timingErrorMs)
    .filter((value): value is number => typeof value === 'number');

  const pitchCorrectCount = perNoteEvaluations.filter((evaluation) => evaluation.pitchCorrect).length;
  const timingCorrectCount = perNoteEvaluations.filter((evaluation) => evaluation.timingCorrect).length;

  return {
    totalNotes,
    correctNotes,
    missedNotes,
    pitchAccuracy: totalNotes > 0 ? (pitchCorrectCount / totalNotes) * 100 : 0,
    timingAccuracy: totalNotes > 0 ? (timingCorrectCount / totalNotes) * 100 : 0,
    averageCentsError:
      pitchErrors.length > 0
        ? pitchErrors.reduce((sum, value) => sum + Math.abs(value), 0) / pitchErrors.length
        : 0,
    averageTimingErrorMs:
      timingErrors.length > 0
        ? timingErrors.reduce((sum, value) => sum + Math.abs(value), 0) / timingErrors.length
        : 0,
  };
}
