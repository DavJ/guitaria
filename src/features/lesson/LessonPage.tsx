import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import SongImport from '../../modules/SongImport';
import Fretboard from '../../modules/Fretboard';
import DifficultySelector from '../../modules/DifficultySelector';
import { useAppStore } from '../../store/appStore';
import { getPlayableNotes } from '../../domain/Song';
import { chooseBestPosition, getGuitarPositions, type GuitarPosition } from '../../guitar/fretboard';
import { usePitchDetector } from '../../audio/usePitchDetector';
import {
  applyEvaluation,
  calculateScore,
  createLessonProgress,
  DEFAULT_LESSON_CONFIG,
  evaluateDetectedNote,
  getExpectedNote,
  markMissedNotes,
  type LessonProgress,
} from './lessonEngine';
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
  const previousPositionRef = useRef<GuitarPosition | undefined>(undefined);
  const lastFrameRef = useRef<number | null>(null);
  const lastHandledDetectionRef = useRef<number | null>(null);
  const currentTimeRef = useRef(0);

  const notes = useMemo(() => (currentSong ? getPlayableNotes(currentSong) : []), [currentSong]);

  useEffect(() => {
    if (!currentSong) {
      setProgress(null);
      return;
    }

    setProgress(createLessonProgress(currentSong));
    resetScore(getPlayableNotes(currentSong).length);
    setCurrentTime(0);
    currentTimeRef.current = 0;
    setLoopRange(0, currentSong.duration);
    setIsPlaying(false);
    previousPositionRef.current = undefined;
  }, [currentSong, resetScore, setCurrentTime, setIsPlaying, setLoopRange]);

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

  const { snapshot, error: pitchError } = usePitchDetector(microphoneEnabled, expectedNote?.midi);

  useEffect(() => {
    setDetectedPitch(snapshot);
  }, [setDetectedPitch, snapshot]);

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

      if (loopEnabled && loopEnd > loopStart && nextTime >= loopEnd) {
        nextTime = loopStart;
      }

      if (nextTime >= songDuration) {
        nextTime = songDuration;
        setIsPlaying(false);
      }

      currentTimeRef.current = nextTime;
      setCurrentTime(nextTime);
      setProgress((prev) => {
        if (!prev) {
          return prev;
        }

        const updated = markMissedNotes(currentSong, prev, nextTime, DEFAULT_LESSON_CONFIG);
        updateScore(calculateScore(currentSong, updated));
        return updated;
      });

      if (isPlaying) {
        requestAnimationFrame(tick);
      }
    };

    const frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
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

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    currentTimeRef.current = 0;
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
              <SheetMusicView xml={currentSong.sourceXml ?? ''} currentTime={currentTime} />
            </div>

            <Fretboard currentNote={expectedPosition} />

            <div className="bg-gray-800 p-6 rounded-xl space-y-4">
              <div className="flex flex-wrap gap-3 items-center">
                <button className="px-4 py-2 bg-blue-600 rounded" onClick={() => setIsPlaying(!isPlaying)}>
                  {isPlaying ? t('lesson.pause') : t('lesson.play')}
                </button>
                <button className="px-4 py-2 bg-red-600 rounded" onClick={handleStop}>
                  {t('lesson.stop')}
                </button>
                <button className={`px-4 py-2 rounded ${microphoneEnabled ? 'bg-green-600' : 'bg-gray-600'}`} onClick={() => setMicrophoneEnabled(!microphoneEnabled)}>
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
                  onChange={(event) => setCurrentTime(Number(event.target.value))}
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
              <p>{expectedNote ? `${expectedNote.pitch}${expectedNote.octave}` : '—'}</p>
              <p>
                {expectedPosition ? `String ${expectedPosition.string + 1}, Fret ${expectedPosition.fret}` : 'No playable position'}
              </p>
              <p className="text-sm text-gray-300">Detected: {detectedPitch.note ?? '—'}</p>
              <p className="text-sm text-gray-300">Clarity: {(detectedPitch.clarity * 100).toFixed(0)}%</p>
              <p className="text-sm text-gray-300">
                Cents error: {detectedPitch.centsError == null ? '—' : detectedPitch.centsError.toFixed(1)}
              </p>
              {pitchError && <p className="text-red-400 text-sm">{pitchError}</p>}
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
