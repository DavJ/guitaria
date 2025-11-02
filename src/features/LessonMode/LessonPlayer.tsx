/**
 * LessonPlayer - Interactive lesson player for custom compositions
 * Allows users to learn their own songs with real-time chord and lyric display
 */

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import type { Song, Section } from '../../types/Song';
import PlaybackEngine from '../../audio/PlaybackEngine';

interface LessonPlayerProps {
  song: Song;
  onBack?: () => void;
}

const LessonPlayer: React.FC<LessonPlayerProps> = ({ song, onBack }) => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [showChords, setShowChords] = useState(true);
  const [showLyrics, setShowLyrics] = useState(true);
  const [showFingering, setShowFingering] = useState(true);
  const engineRef = useRef<PlaybackEngine | null>(null);

  // Initialize playback engine
  useEffect(() => {
    engineRef.current = new PlaybackEngine();
    
    return () => {
      if (engineRef.current) {
        engineRef.current.dispose();
      }
    };
  }, []);

  // Calculate total duration
  const calculateDuration = (): number => {
    const beatsPerMinute = song.tempo;
    const secondsPerBeat = 60 / beatsPerMinute;
    const beatsPerSection = 16; // 4 bars * 4 beats
    return song.sections.length * beatsPerSection * secondsPerBeat;
  };

  const totalDuration = calculateDuration();

  const handlePlayPause = async () => {
    if (!engineRef.current) return;

    if (isPlaying) {
      engineRef.current.pause();
      setIsPlaying(false);
    } else {
      try {
        await engineRef.current.play(song, {
          volume,
          loop: false,
          onTimeUpdate: (time) => setCurrentTime(time),
          onSectionChange: (index) => setCurrentSectionIndex(index),
          onEnd: () => setIsPlaying(false),
        });
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play:', error);
      }
    }
  };

  const handleStop = () => {
    if (engineRef.current) {
      engineRef.current.stop();
      setIsPlaying(false);
      setCurrentTime(0);
      setCurrentSectionIndex(0);
    }
  };

  const handleSeek = (time: number) => {
    if (engineRef.current) {
      engineRef.current.seek(time);
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (engineRef.current) {
      engineRef.current.setVolume(newVolume);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentSection: Section | null = 
    song.sections[currentSectionIndex] || null;

  // Basic chord fingering positions (simplified)
  const getChordFingering = (chord: string): string => {
    const fingerings: Record<string, string> = {
      'C': 'x32010',
      'D': 'xx0232',
      'E': '022100',
      'F': '133211',
      'G': '320003',
      'A': 'x02220',
      'Am': 'x02210',
      'Dm': 'xx0231',
      'Em': '022000',
      'B': 'x24442',
      'Bm': 'x24432',
    };
    
    const baseChord = chord.replace(/[0-9]/g, '').trim();
    return fingerings[baseChord] || 'xxxxxx'; // Consistent fallback
  };

  return (
    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 min-h-screen">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-amber-700/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-5xl">🎸</span>
              <div>
                <h1 className="text-3xl font-bold mb-1 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                  {song.title}
                </h1>
                <div className="flex gap-4 text-sm text-gray-400">
                  <span>{t('aiComposer.preview.tempo')}: {song.tempo} BPM</span>
                  <span>{t('aiComposer.preview.key')}: {song.key}</span>
                  <span>{song.sections.length} {t('aiComposer.preview.sections')}</span>
                </div>
              </div>
            </div>
            {onBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                ← {t('common.back')}
              </button>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Current Section Display */}
          <div className="lg:col-span-2 space-y-6">
            {currentSection && (
              <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 p-6 rounded-2xl border-2 border-blue-500 min-h-[400px]">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{currentSection.name}</h2>
                  <span className="px-4 py-2 bg-blue-600 rounded-full text-sm font-semibold">
                    {t('lesson.section')} {currentSectionIndex + 1}/{song.sections.length}
                  </span>
                </div>

                {/* Chords Display */}
                {showChords && currentSection.chords.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 text-blue-300">
                      {t('aiComposer.preview.currentChords')}:
                    </h3>
                    <div className="flex flex-wrap gap-3">
                      {currentSection.chords.map((chord, idx) => (
                        <div key={idx} className="text-center">
                          <div className="px-6 py-4 bg-blue-600 rounded-lg text-2xl font-bold mb-2">
                            {chord}
                          </div>
                          {showFingering && (
                            <div className="text-xs font-mono text-gray-400">
                              {getChordFingering(chord)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Lyrics Display */}
                {showLyrics && currentSection.lyrics && (
                  <div className="bg-gray-900/50 p-4 rounded-xl">
                    <h3 className="text-lg font-semibold mb-3 text-purple-300">
                      {t('aiComposer.preview.lyrics')}:
                    </h3>
                    <p className="whitespace-pre-wrap text-lg leading-relaxed">
                      {currentSection.lyrics}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Playback Controls */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xl font-bold mb-4">{t('player.title')}</h3>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-400">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(totalDuration)}</span>
                </div>
                <div
                  className="h-3 bg-gray-700 rounded-full cursor-pointer relative"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const percentage = x / rect.width;
                    handleSeek(percentage * totalDuration);
                  }}
                >
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  />
                </div>
              </div>

              {/* Play Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleStop}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
                >
                  ⏹️ {t('lesson.stop')}
                </button>
                <button
                  onClick={handlePlayPause}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors text-lg"
                >
                  {isPlaying ? `⏸️ ${t('lesson.pause')}` : `▶️ ${t('lesson.play')}`}
                </button>
              </div>

              {/* Volume Control */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t('player.volume')}: {Math.round(volume * 100)}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume * 100}
                  onChange={(e) => handleVolumeChange(Number(e.target.value) / 100)}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column - Settings & Section List */}
          <div className="space-y-6">
            {/* Display Options */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">{t('lesson.displayOptions')}</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showChords}
                    onChange={(e) => setShowChords(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span>{t('lesson.showChords')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showLyrics}
                    onChange={(e) => setShowLyrics(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span>{t('lesson.showLyrics')}</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showFingering}
                    onChange={(e) => setShowFingering(e.target.checked)}
                    className="w-5 h-5 rounded"
                  />
                  <span>{t('lesson.showFingering')}</span>
                </label>
              </div>
            </div>

            {/* Section List */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-xl">
              <h3 className="text-xl font-bold mb-4">{t('aiComposer.preview.sections')}</h3>
              <div className="space-y-2">
                {song.sections.map((section, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const beatsPerMinute = song.tempo;
                      const secondsPerBeat = 60 / beatsPerMinute;
                      const beatsPerSection = 16;
                      const secondsPerSection = beatsPerSection * secondsPerBeat;
                      handleSeek(idx * secondsPerSection);
                      setCurrentSectionIndex(idx);
                    }}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      currentSectionIndex === idx
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    <div className="font-medium">{section.name}</div>
                    <div className="text-xs text-gray-400 mt-1">
                      {section.chords.join(' - ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;
