import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import * as Pitchy from 'pitchy';

const PitchDetection: React.FC = () => {
  const { t } = useTranslation();
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const detectorRef = useRef<Pitchy.PitchDetector<Float32Array> | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  
  const {
    microphoneEnabled,
    setMicrophoneEnabled,
    setDetectedPitch,
  } = useAppStore();

  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsInitialized(false);
    setDetectedPitch(null);
  }, [setDetectedPitch]);

  const detectPitch = useCallback((buffer: Float32Array) => {
    if (!analyserRef.current || !detectorRef.current || !microphoneEnabled) {
      return;
    }
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    analyserRef.current.getFloatTimeDomainData(buffer as any);
    
    // Type assertion needed due to library type mismatch
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [pitch, clarity] = detectorRef.current.findPitch(buffer as any, audioContextRef.current!.sampleRate);
    
    if (clarity > 0.9 && pitch > 0) {
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
      const noteNum = 12 * (Math.log(pitch / 440) / Math.log(2)) + 49;
      const noteIndex = Math.round(noteNum) % 12;
      const noteName = noteNames[noteIndex];
      const octave = Math.floor(Math.round(noteNum) / 12) + 3;
      
      setDetectedPitch(`${noteName}${octave}`);
    } else {
      setDetectedPitch(null);
    }
    
    animationFrameRef.current = requestAnimationFrame(() => detectPitch(buffer));
  }, [microphoneEnabled, setDetectedPitch]);

  const initializeMicrophone = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Initialize Audio Context
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      const audioContext = audioContextRef.current;
      
      // Create analyser node
      analyserRef.current = audioContext.createAnalyser();
      analyserRef.current.fftSize = 2048;
      
      // Connect microphone to analyser
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyserRef.current);
      
      // Initialize Pitchy detector
      const bufferLength = analyserRef.current.fftSize;
      const buffer = new Float32Array(bufferLength);
      detectorRef.current = Pitchy.PitchDetector.forFloat32Array(bufferLength);
      
      setIsInitialized(true);
      setError(null);
      
      // Start detection loop
      detectPitch(buffer);
    } catch (err) {
      setError(t('pitchDetection.noInput'));
      setMicrophoneEnabled(false);
      console.error('Microphone initialization error:', err);
    }
  }, [t, setMicrophoneEnabled, detectPitch]);

  useEffect(() => {
    if (microphoneEnabled && !isInitialized) {
      initializeMicrophone();
    } else if (!microphoneEnabled && isInitialized) {
      cleanup();
    }
    
    return () => {
      cleanup();
    };
  }, [microphoneEnabled, isInitialized, initializeMicrophone, cleanup]);

  const handleToggleMicrophone = () => {
    setMicrophoneEnabled(!microphoneEnabled);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('pitchDetection.title')}</h2>
      
      <div className="space-y-4">
        <button
          onClick={handleToggleMicrophone}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
            microphoneEnabled
              ? 'bg-green-600 hover:bg-green-700'
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {microphoneEnabled
            ? t('pitchDetection.detecting')
            : t('pitchDetection.enableMicrophone')}
        </button>
        
        {error && (
          <div className="text-red-400 text-sm">{error}</div>
        )}
        
        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">{t('pitchDetection.detectedNote')}</div>
          <div className="text-4xl font-bold">
            {useAppStore.getState().detectedPitch || '—'}
          </div>
        </div>
        
        {microphoneEnabled && (
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-green-500 rounded-full animate-pulse" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PitchDetection;
