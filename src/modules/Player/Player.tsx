import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

const Player: React.FC = () => {
  const { t } = useTranslation();

  const {
    isPlaying,
    currentTime,
    tempoMultiplier,
    volume,
    loopEnabled,
    setIsPlaying,
    setCurrentTime,
    setTempoMultiplier,
    setVolume,
    setLoopEnabled,
  } = useAppStore();

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('player.title')}</h2>

      <div className="space-y-4">
        <div className="flex gap-4 items-center justify-center">
          <button onClick={() => setIsPlaying(!isPlaying)} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold">
            {isPlaying ? t('lesson.pause') : t('lesson.play')}
          </button>
          <button onClick={() => setCurrentTime(0)} className="px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold">
            {t('lesson.stop')}
          </button>
        </div>

        <input
          type="range"
          min="0"
          max="300"
          value={currentTime}
          onChange={(e) => setCurrentTime(Number(e.target.value))}
          className="w-full"
        />

        <div>
          <label className="block text-sm font-medium mb-2">{t('lesson.tempo')}: {Math.round(tempoMultiplier * 100)}%</label>
          <input
            type="range"
            min="50"
            max="150"
            value={tempoMultiplier * 100}
            onChange={(e) => setTempoMultiplier(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            {t('player.volume')}: {Math.round(volume * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={Math.round(volume * 100)}
            onChange={(e) => setVolume(Number(e.target.value) / 100)}
            className="w-full"
          />
        </div>

        <label className="flex items-center gap-2">
          <input type="checkbox" checked={loopEnabled} onChange={(e) => setLoopEnabled(e.target.checked)} className="w-4 h-4" />
          <span className="text-sm font-medium">{t('lesson.loop')}</span>
        </label>
      </div>
    </div>
  );
};

export default Player;
