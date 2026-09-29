import { useEffect, useRef, useState } from 'react';
import * as Pitchy from 'pitchy';
import { frequencyToCentsError, frequencyToMidi, midiToNoteName } from './pitchUtils';
import type { PitchSnapshot } from '../store/appStore';

const CLARITY_THRESHOLD = 0.85;

// Standard guitar: low E2 (82 Hz) to high E6 (1319 Hz) with some headroom.
const GUITAR_MIN_FREQ = 70;
const GUITAR_MAX_FREQ = 1400;
const FREQ_SMOOTH_ALPHA = 0.3;

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
  const [ready, setReady] = useState(false);
  const targetMidiRef = useRef(targetMidi);

  useEffect(() => {
    targetMidiRef.current = targetMidi;
  }, [targetMidi]);

  useEffect(() => {
    setSnapshot(EMPTY_SNAPSHOT);
    setError(null);
    setReady(false);
    if (!enabled) {
      return;
    }

    // Each capture owns its resources. A late permission/resume/close promise
    // from an older capture must never modify a newer capture's resources.
    let disposed = false;
    let stream: MediaStream | null = null;
    let context: AudioContext | null = null;
    let source: MediaStreamAudioSourceNode | null = null;
    let rafId: number | null = null;

    const releaseResources = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      source?.disconnect();
      source = null;
      stream?.getTracks().forEach((track) => track.stop());
      stream = null;
      const contextToClose = context;
      context = null;
      if (contextToClose && contextToClose.state !== 'closed') {
        void contextToClose.close().catch(() => {});
      }
    };

    const init = async () => {
      try {
        const capturedStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (disposed) {
          capturedStream.getTracks().forEach((track) => track.stop());
          return;
        }
        stream = capturedStream;

        const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const capturedContext = new AudioContextClass();
        context = capturedContext;
        if (capturedContext.state === 'suspended') {
          await capturedContext.resume();
        }
        if (disposed) {
          return;
        }

        const analyser = capturedContext.createAnalyser();
        analyser.fftSize = 2048;
        source = capturedContext.createMediaStreamSource(capturedStream);
        source.connect(analyser);
        const detector = Pitchy.PitchDetector.forFloat32Array(analyser.fftSize);
        const buffer = new Float32Array(analyser.fftSize);
        let smoothedFrequency: number | null = null;

        const detectFrame = () => {
          if (disposed) {
            return;
          }

          analyser.getFloatTimeDomainData(buffer);
          const [frequency, clarity] = detector.findPitch(buffer, capturedContext.sampleRate);
          if (clarity > CLARITY_THRESHOLD && frequency >= GUITAR_MIN_FREQ && frequency <= GUITAR_MAX_FREQ) {
            smoothedFrequency = smoothedFrequency === null
              ? frequency
              : smoothedFrequency + FREQ_SMOOTH_ALPHA * (frequency - smoothedFrequency);
            const midi = frequencyToMidi(smoothedFrequency);
            const target = targetMidiRef.current;
            setSnapshot({
              frequency: smoothedFrequency,
              midi,
              note: midi !== null ? midiToNoteName(midi).label : null,
              centsError: midi !== null && target != null ? frequencyToCentsError(smoothedFrequency, target) : null,
              clarity,
              timestamp: performance.now(),
            });
          } else {
            smoothedFrequency = null;
            setSnapshot({ ...EMPTY_SNAPSHOT, clarity });
          }
          rafId = requestAnimationFrame(detectFrame);
        };

        setReady(true);
        detectFrame();
      } catch {
        if (!disposed) {
          releaseResources();
          setReady(false);
          setSnapshot(EMPTY_SNAPSHOT);
          setError('Microphone access failed');
        }
      }
    };

    void init();
    return () => {
      disposed = true;
      releaseResources();
    };
  }, [enabled]);

  return {
    snapshot: enabled ? snapshot : EMPTY_SNAPSHOT,
    error: enabled ? error : null,
    ready: enabled && ready,
  };
}
