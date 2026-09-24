import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SongImport from '../../modules/SongImport';
import Fretboard from '../../modules/Fretboard';
import DifficultySelector from '../../modules/DifficultySelector';
import { useAppStore } from '../../store/appStore';
import { getPlayableNotes } from '../../domain/Song';
import { chooseBestPosition, getGuitarPositions, internalStringIndexToGuitarStringNumber, type GuitarPosition } from '../../guitar/fretboard';
import { usePitchDetector } from '../../audio/usePitchDetector';
import {
  applyEvaluation,
  calculateScore,
  createLessonProgress,
  DEFAULT_LESSON_CONFIG,
  evaluateDetectedNote,
  getExpectedNote,
  markMissedNotes,
  rebuildLessonProgress,
  resetProgressInRange,
  type LessonProgress,
} from './lessonEngine';
import { formatNoteLabel } from './noteFormatting';
import SheetMusicView from './SheetMusicView';

const LessonPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    currentSong,
    currentTime,
    isPlaying,
    tempoMultiplier,
    loopEnabled,
    loopStart,
    loopEnd,
    microphoneEnabled,
    detectedPitch,
    score,
    setCurrentTime,
    setIsPlaying,
    setTempoMultiplier,
    setLoopEnabled,
    setLoopRange,
    setMicrophoneEnabled,
    setDetectedPitch,
    updateScore,
    resetScore,
  } = useAppStore();

  const [progress, setProgress] = useState<LessonProgress | null>(null);
  const [lessonError, setLessonError] = useState<string | null>(null);
  const previousPositionRef = useRef<GuitarPosition | undefined>(undefined);
  const lastFrameRef = useRef<number | null>(null);
  const lastHandledDetectionRef = useRef<number | null>(null);
  const currentTimeRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  const notes = useMemo(() => (currentSong ? getPlayableNotes(currentSong) : []), [currentSong]);
  const playableNoteIndexById = useMemo(
    () =>
      notes.reduce<Record<string, number>>((acc, note, index) => {
        acc[note.id] = index;
        return acc;
      }, {}),
    [notes],
  );

  useEffect(() => {
    return () => {
      setIsPlaying(false);
      setMicrophoneEnabled(false);
    };
  }, [setIsPlaying, setMicrophoneEnabled]);

  useEffect(() => {
    if (!currentSong) {
      setProgress(null);
      setLessonError(null);
      setMicrophoneEnabled(false);
      return;
    }

    const fresh = createLessonProgress(currentSong);
    setProgress(fresh);
    resetScore(getPlayableNotes(currentSong).length);
    updateScore(calculateScore(currentSong, fresh));
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setLoopRange(0, currentSong.duration);
    setIsPlaying(false);
    setMicrophoneEnabled(false);
    setLessonError(null);
    previousPositionRef.current = undefined;
    lastHandledDetectionRef.current = null;
  }, [currentSong, resetScore, setCurrentTime, setIsPlaying, setLoopRange, setMicrophoneEnabled, updateScore]);

  useEffect(() => {
    currentTimeRef.current = currentTime;
  }, [currentTime]);

  const expectedNote = useMemo(() => {
    if (!currentSong || !progress) {
      return null;
    }
    return getExpectedNote(currentSong, progress, currentTime);
  }, [currentSong, progress, currentTime]);

  const expectedPosition = useMemo(() => {
    if (!expectedNote) {
      return null;
    }

    const positions = getGuitarPositions(expectedNote.midi, 0, 20);
    return chooseBestPosition(positions, previousPositionRef.current);
  }, [expectedNote]);

  const targetNoteIndex = expectedNote ? playableNoteIndexById[expectedNote.id] ?? null : null;
  const { snapshot, error: pitchError } = usePitchDetector(microphoneEnabled, expectedNote?.midi);

  useEffect(() => {
    setDetectedPitch(snapshot);
  }, [setDetectedPitch, snapshot]);

  useEffect(() => {
    if (!pitchError) {
      return;
    }

    setLessonError(pitchError);
    setIsPlaying(false);
    setMicrophoneEnabled(false);
  }, [pitchError, setIsPlaying, setMicrophoneEnabled]);

  useEffect(() => {
    if (!currentSong || !isPlaying) {
      return;
    }

    const tick = (time: number) => {
      const last = lastFrameRef.current ?? time;
      const delta = ((time - last) / 1000) * tempoMultiplier;
      lastFrameRef.current = time;

      const songDuration = currentSong.duration;
      let nextTime = currentTimeRef.current + delta;
      let nextProgress: LessonProgress | null = null;

      if (loopEnabled && loopEnd > loopStart && nextTime >= loopEnd) {
        nextTime = loopStart;
        setProgress((prev) => {
          if (!prev) {
            return prev;
          }

          const reset = resetProgressInRange(currentSong, prev, loopStart, loopEnd);
          nextProgress = reset;
          updateScore(calculateScore(currentSong, reset));
          return reset;
        });
        previousPositionRef.current = undefined;
      }

      if (nextTime >= songDuration) {
        nextTime = songDuration;
        setIsPlaying(false);
      }

      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);

      setProgress((prev) => {
        const baseProgress = nextProgress ?? prev;
        if (!baseProgress) {
          return baseProgress;
        }

        const updated = markMissedNotes(currentSong, baseProgress, nextTime, DEFAULT_LESSON_CONFIG);
        updateScore(calculateScore(currentSong, updated));
        return updated;
      });

      if (nextTime < songDuration) {
        rafIdRef.current = requestAnimationFrame(tick);
      }
    };

    rafIdRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      rafIdRef.current = null;
      lastFrameRef.current = null;
    };
  }, [
    currentSong,
    isPlaying,
    loopEnabled,
    loopEnd,
    loopStart,
    setCurrentTime,
    setIsPlaying,
    tempoMultiplier,
    updateScore,
  ]);

  useEffect(() => {
    if (!currentSong || !progress || !expectedNote || !snapshot.midi || !snapshot.frequency || !snapshot.timestamp) {
      return;
    }

    if (lastHandledDetectionRef.current === snapshot.timestamp) {
      return;
    }

    if (snapshot.clarity < 0.85) {
      return;
    }

    const evaluation = evaluateDetectedNote(expectedNote, snapshot.midi, currentTime, snapshot.frequency, DEFAULT_LESSON_CONFIG);
    lastHandledDetectionRef.current = snapshot.timestamp;

    setProgress((prev) => {
      if (!prev) {
        return prev;
      }

      const updated = applyEvaluation(prev, evaluation);
      if (evaluation.correct && expectedPosition) {
        previousPositionRef.current = expectedPosition;
      }
      updateScore(calculateScore(currentSong, updated));
      return updated;
    });
  }, [currentSong, currentTime, expectedNote, expectedPosition, progress, snapshot, updateScore]);

  const handleSeek = async (newTime: number) => {
    if (!currentSong) {
      return;
    }

    const clampedTime = Math.min(Math.max(newTime, 0), currentSong.duration);
    setIsPlaying(false);
    setCurrentTime(clampedTime);
    currentTimeRef.current = clampedTime;
    previousPositionRef.current = undefined;
    lastHandledDetectionRef.current = null;
    const rebuilt = rebuildLessonProgress(currentSong, clampedTime);
    setProgress(rebuilt);
    updateScore(calculateScore(currentSong, rebuilt));
  };

  const enableMicrophone = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      setMicrophoneEnabled(true);
      setLessonError(null);
      return true;
    } catch {
      setMicrophoneEnabled(false);
      setLessonError(t('aiComposer.input.microphoneError'));
      return false;
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    if (!microphoneEnabled) {
      const microphoneReady = await enableMicrophone();
      if (!microphoneReady) {
        return;
      }
    }

    setLessonError(null);
    setIsPlaying(true);
  };

  const handleMicrophoneToggle = async () => {
    if (microphoneEnabled) {
      setMicrophoneEnabled(false);
      return;
    }

    await enableMicrophone();
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    previousPositionRef.current = undefined;
    lastHandledDetectionRef.current = null;
    if (currentSong) {
      const fresh = createLessonProgress(currentSong);
      setProgress(fresh);
      updateScore(calculateScore(currentSong, fresh));
    }
  };

  const completed = currentSong && progress ? Object.values(progress.noteStatuses).every((status) => status !== 'waiting') : false;

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <SongImport />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-gray-800 p-6 rounded-xl border border-amber-700/30">
          <h1 className="text-3xl font-bold text-amber-400">{currentSong.title}</h1>
          <p className="text-gray-300">{currentSong.artist ?? 'Unknown Artist'}</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-gray-800 p-4 rounded-xl">
              <SheetMusicView xml={currentSong.sourceXml ?? ''} targetNoteIndex={targetNoteIndex} />
            </div>

            <Fretboard currentNote={expectedPosition} />

            <div className="bg-gray-800 p-6 rounded-xl space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <button className="px-4 py-2 bg-blue-600 rounded" onClick={() => void handlePlayPause()}>
                  {isPlaying ? t('lesson.pause') : t('lesson.play')}
                </button>
                <button className="px-4 py-2 bg-red-600 rounded" onClick={handleStop}>
                  {t('lesson.stop')}
                </button>
                <button className={`px-4 py-2 rounded ${microphoneEnabled ? 'bg-green-600' : 'bg-gray-600'}`} onClick={() => void handleMicrophoneToggle()}>
                  {microphoneEnabled ? t('pitchDetection.detecting') : t('pitchDetection.enableMicrophone')}
                </button>
              </div>

              <div>
                <input
                  type="range"
                  min={0}
                  max={currentSong.duration}
                  step={0.01}
                  value={currentTime}
                  onChange={(event) => void handleSeek(Number(event.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{currentTime.toFixed(2)}s</span>
                  <span>{currentSong.duration.toFixed(2)}s</span>
                </div>
              </div>

              <div>
                <label className="block text-sm mb-1">{t('lesson.tempo')}: {(tempoMultiplier * 100).toFixed(0)}%</label>
                <input
                  type="range"
                  min={0.5}
                  max={1.5}
                  step={0.05}
                  value={tempoMultiplier}
                  onChange={(event) => setTempoMultiplier(Number(event.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" checked={loopEnabled} onChange={(event) => setLoopEnabled(event.target.checked)} />
                  <span>{t('lesson.loop')}</span>
                </label>
                {loopEnabled && (
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      min={0}
                      max={Math.max(0, loopEnd || currentSong.duration)}
                      value={loopStart}
                      onChange={(event) => setLoopRange(Number(event.target.value), Math.max(loopEnd, Number(event.target.value)))}
                      className="bg-gray-700 rounded px-2 py-1"
                    />
                    <input
                      type="number"
                      min={loopStart}
                      max={currentSong.duration}
                      value={loopEnd || currentSong.duration}
                      onChange={(event) => setLoopRange(loopStart, Number(event.target.value))}
                      className="bg-gray-700 rounded px-2 py-1"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <DifficultySelector />

            <div className="bg-gray-800 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-amber-400">Expected note</h3>
              <p>{expectedNote ? formatNoteLabel(expectedNote) : '—'}</p>
              <p>
                {expectedPosition
                  ? `String ${internalStringIndexToGuitarStringNumber(expectedPosition.string)}, Fret ${expectedPosition.fret}`
                  : 'No playable position'}
              </p>
              <p className="text-sm text-gray-300">Detected: {detectedPitch.note ?? '—'}</p>
              <p className="text-sm text-gray-300">Clarity: {(detectedPitch.clarity * 100).toFixed(0)}%</p>
              <p className="text-sm text-gray-300">
                Cents error: {detectedPitch.centsError == null ? '—' : detectedPitch.centsError.toFixed(1)}
              </p>
              {(lessonError || pitchError) && <p className="text-red-400 text-sm">{lessonError ?? pitchError}</p>}
            </div>

            <div className="bg-gray-800 p-4 rounded-xl space-y-2">
              <h3 className="font-bold text-amber-400">Score</h3>
              <p>Total notes: {score.totalNotes}</p>
              <p>Correct: {score.correctNotes}</p>
              <p>Missed: {score.missedNotes}</p>
              <p>Pitch accuracy: {score.pitchAccuracy.toFixed(1)}%</p>
              <p>Timing accuracy: {score.timingAccuracy.toFixed(1)}%</p>
              <p>Avg cents error: {score.averageCentsError.toFixed(1)}</p>
              <p>Avg timing error: {score.averageTimingErrorMs.toFixed(1)} ms</p>
            </div>

            {completed && (
              <div className="bg-green-900/40 border border-green-600 p-4 rounded-xl">
                <h3 className="font-bold text-green-300">Practice complete</h3>
                <p className="text-sm text-green-200">Final score: {score.pitchAccuracy.toFixed(1)}% pitch, {score.timingAccuracy.toFixed(1)}% timing</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-xl">
          <SongImport />
        </div>

        {notes.length === 0 && (
          <div className="bg-yellow-900/30 border border-yellow-600 p-4 rounded-xl text-yellow-200">
            This score has no playable notes.
          </div>
        )}
      </div>
    </div>
  );
};

export default LessonPage;
