import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

const PitchDetection: React.FC = () => {
  const { t } = useTranslation();
  const { microphoneEnabled, setMicrophoneEnabled, detectedPitch } = useAppStore();

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">{t('pitchDetection.title')}</h2>

      <div className="space-y-4">
        <button
          onClick={() => setMicrophoneEnabled(!microphoneEnabled)}
          className={`w-full px-6 py-3 rounded-lg font-semibold transition-colors ${
            microphoneEnabled ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {microphoneEnabled ? t('pitchDetection.detecting') : t('pitchDetection.enableMicrophone')}
        </button>

        <div className="text-center">
          <div className="text-sm text-gray-400 mb-2">{t('pitchDetection.detectedNote')}</div>
          <div className="text-4xl font-bold">{detectedPitch.note || '—'}</div>
          <div className="text-sm text-gray-400 mt-1">Clarity: {(detectedPitch.clarity * 100).toFixed(0)}%</div>
        </div>
      </div>
    </div>
  );
};

export default PitchDetection;
