import { useCallback, useEffect, useRef, useState } from 'react';
import * as Pitchy from 'pitchy';
import { frequencyToCentsError, frequencyToMidi, midiToNoteName } from './pitchUtils';
import type { PitchSnapshot } from '../store/appStore';

const CLARITY_THRESHOLD = 0.85;

const EMPTY_SNAPSHOT: PitchSnapshot = {
  frequency: null,
  midi: null,
  note: null,
  centsError: null,
  clarity: 0,
  timestamp: null,
};

export function usePitchDetector(enabled: boolean, targetMidi?: number | null) {
  const [snapshot, setSnapshot] = useState<PitchSnapshot>(EMPTY_SNAPSHOT);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<Pitchy.PitchDetector<Float32Array> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  const cleanup = useCallback(async () => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      await audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    detectorRef.current = null;
    setSnapshot(EMPTY_SNAPSHOT);
  }, []);

  const detectFrame = useCallback(() => {
    const analyser = analyserRef.current;
    const detector = detectorRef.current;
    const context = audioContextRef.current;

    if (!enabled || !analyser || !detector || !context) {
      return;
    }

    const buffer = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buffer);
    const [frequency, clarity] = detector.findPitch(buffer, context.sampleRate);

    if (clarity > CLARITY_THRESHOLD && frequency > 0) {
      const midi = frequencyToMidi(frequency);
      const noteLabel = midi !== null ? midiToNoteName(midi).label : null;
      const centsError = midi !== null && targetMidi != null ? frequencyToCentsError(frequency, targetMidi) : null;

      setSnapshot({
        frequency,
        midi,
        note: noteLabel,
        centsError,
        clarity,
        timestamp: performance.now(),
      });
    } else {
      setSnapshot((prev) => ({ ...prev, clarity, frequency: null, midi: null, note: null, centsError: null }));
    }

    rafRef.current = requestAnimationFrame(detectFrame);
  }, [enabled, targetMidi]);

  useEffect(() => {
    if (!enabled) {
      void cleanup();
      setError(null);
      return;
    }

    let disposed = false;

    const init = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (disposed) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const context = new AudioContextClass();
        audioContextRef.current = context;

        if (context.state === 'suspended') {
          await context.resume();
        }

        const analyser = context.createAnalyser();
        analyser.fftSize = 2048;
        analyserRef.current = analyser;

        const source = context.createMediaStreamSource(stream);
        source.connect(analyser);

        detectorRef.current = Pitchy.PitchDetector.forFloat32Array(analyser.fftSize);
        setError(null);
        detectFrame();
      } catch {
        setError('Microphone access failed');
      }
    };

    void init();

    return () => {
      disposed = true;
      void cleanup();
    };
  }, [cleanup, detectFrame, enabled]);

  return { snapshot, error };
}
