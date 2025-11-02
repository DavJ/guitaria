/**
 * PreviewPlayer - Playback component for compositions
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Composition, CompositionSection } from './types';
import { formatTime } from './composerUtils';

interface PreviewPlayerProps {
  composition: Composition;
}

const PreviewPlayer: React.FC<PreviewPlayerProps> = ({ composition }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSection, setCurrentSection] = useState<CompositionSection | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Calculate total duration
  const totalDuration = composition.sections.length > 0
    ? Math.max(...composition.sections.map(s => s.endTime))
    : 0;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = window.setInterval(() => {
        setCurrentTime(prev => {
          const next = prev + 0.1;
          if (next >= totalDuration) {
            setIsPlaying(false);
            return 0;
          }
          return next;
        });
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, totalDuration]);

  // Update current section based on time
  useEffect(() => {
    const section = composition.sections.find(
      s => currentTime >= s.startTime && currentTime < s.endTime
    );
    setCurrentSection(section || null);
  }, [currentTime, composition.sections]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeek = (time: number) => {
    setCurrentTime(time);
  };

  const getCurrentChords = (): string[] => {
    if (!currentSection) return [];
    return currentSection.chords
      .filter(chord => {
        const chordTime = chord.time;
        return chordTime <= currentTime && chordTime + chord.duration > currentTime;
      })
      .map(chord => chord.name);
  };

  const getCurrentLyrics = (): string => {
    if (!currentSection || !currentSection.lyrics) return '';
    return currentSection.lyrics;
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg space-y-4">
      <h2 className="text-2xl font-bold">{t('aiComposer.preview.title')}</h2>

      {/* Composition Info */}
      <div className="bg-gray-700 p-4 rounded-lg">
        <h3 className="text-xl font-semibold mb-2">{composition.title}</h3>
        <div className="flex gap-4 text-sm text-gray-300">
          <span>{t('aiComposer.preview.artist')}: {composition.artist}</span>
          <span>{t('aiComposer.preview.style')}: {composition.style}</span>
          <span>{t('aiComposer.preview.tempo')}: {composition.tempo} BPM</span>
          <span>{t('aiComposer.preview.key')}: {composition.key}</span>
        </div>
      </div>

      {/* Current Section Display */}
      {currentSection && (
        <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-4 rounded-lg border-2 border-blue-500">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-lg font-semibold">{currentSection.name}</h4>
            <span className="px-3 py-1 bg-blue-600 rounded-full text-xs">
              {currentSection.type}
            </span>
          </div>
          
          {/* Chords Display */}
          <div className="mb-3">
            <p className="text-xs text-gray-300 mb-2">{t('aiComposer.preview.currentChords')}:</p>
            <div className="flex flex-wrap gap-2">
              {getCurrentChords().length > 0 ? (
                getCurrentChords().map((chord, idx) => (
                  <span key={idx} className="px-4 py-2 bg-blue-600 rounded-lg text-lg font-bold">
                    {chord}
                  </span>
                ))
              ) : (
                <span className="text-gray-400 text-sm">{t('aiComposer.preview.noChords')}</span>
              )}
            </div>
          </div>

          {/* Lyrics Display */}
          {getCurrentLyrics() && (
            <div className="bg-gray-900/50 p-3 rounded">
              <p className="text-xs text-gray-300 mb-1">{t('aiComposer.preview.lyrics')}:</p>
              <p className="whitespace-pre-wrap text-base leading-relaxed">
                {getCurrentLyrics()}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(totalDuration)}</span>
        </div>
        <div
          className="h-2 bg-gray-700 rounded-full cursor-pointer relative"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const percentage = x / rect.width;
            handleSeek(percentage * totalDuration);
          }}
        >
          <div
            className="h-full bg-blue-600 rounded-full transition-all"
            style={{ width: `${(currentTime / totalDuration) * 100}%` }}
          />
          
          {/* Section markers */}
          {composition.sections.map(section => (
            <div
              key={section.id}
              className="absolute top-0 bottom-0 w-px bg-gray-500"
              style={{ left: `${(section.startTime / totalDuration) * 100}%` }}
              title={section.name}
            />
          ))}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleStop}
          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors"
        >
          ⏹️ {t('aiComposer.preview.stop')}
        </button>
        <button
          onClick={handlePlayPause}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          {isPlaying ? `⏸️ ${t('aiComposer.preview.pause')}` : `▶️ ${t('aiComposer.preview.play')}`}
        </button>
      </div>

      {/* Section Timeline */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-400">{t('aiComposer.preview.sections')}:</h4>
        <div className="space-y-1">
          {composition.sections.map(section => {
            const isCurrent = currentSection?.id === section.id;
            return (
              <button
                key={section.id}
                onClick={() => handleSeek(section.startTime)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{section.name}</span>
                  <span className="text-xs">
                    {formatTime(section.startTime)} - {formatTime(section.endTime)}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {composition.sections.length === 0 && (
        <div className="text-center text-gray-400 py-8">
          {t('aiComposer.preview.noComposition')}
        </div>
      )}
    </div>
  );
};

export default PreviewPlayer;
