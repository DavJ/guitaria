import React, { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

const Player: React.FC = () => {
  const { t } = useTranslation();
  const audioContextRef = useRef<AudioContext | null>(null);
  
  const {
    isPlaying,
    currentTime,
    tempo,
    volume,
    loopEnabled,
    setIsPlaying,
    setCurrentTime,
    setTempo,
    setVolume,
    setLoopEnabled,
  } = useAppStore();

  useEffect(() => {
    // Initialize Web Audio API
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleTempoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempo(Number(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value) / 100);
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('player.title')}</h2>
      
      <div className="space-y-4">
        {/* Playback Controls */}
        <div className="flex gap-4 items-center justify-center">
          <button
            onClick={handlePlayPause}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
          >
            {isPlaying ? t('lesson.pause') : t('lesson.play')}
          </button>
          
          <button
            onClick={handleStop}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            {t('lesson.stop')}
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full">
          <input
            type="range"
            min="0"
            max="100"
            value={currentTime}
            onChange={(e) => setCurrentTime(Number(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-sm text-gray-400 mt-1">
            <span>{Math.floor(currentTime)}s</span>
            <span>100s</span>
          </div>
        </div>

        {/* Tempo Control */}
        <div>
          <label className="block text-sm font-medium mb-2">
            {t('lesson.tempo')}: {tempo}%
          </label>
          <input
            type="range"
            min="25"
            max="200"
            value={tempo}
            onChange={handleTempoChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
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
            value={Math.round(volume * 100)}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
          />
        </div>

        {/* Loop Control */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="loop"
            checked={loopEnabled}
            onChange={(e) => setLoopEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="loop" className="text-sm font-medium">
            {t('lesson.loop')}
          </label>
        </div>
      </div>
    </div>
  );
};

export default Player;
