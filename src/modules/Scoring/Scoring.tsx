import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

const Scoring: React.FC = () => {
  const { t } = useTranslation();
  const { score, resetScore } = useAppStore();

  const accuracyPercentage = score.totalNotes > 0 ? Math.round((score.correctNotes / score.totalNotes) * 100) : 0;

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('scoring.title')}</h2>
        <button onClick={() => resetScore(score.totalNotes)} className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-semibold">
          {t('common.reset')}
        </button>
      </div>

      <div className="space-y-2 text-sm">
        <p>Success: {accuracyPercentage}%</p>
        <p>Total notes: {score.totalNotes}</p>
        <p>Correct notes: {score.correctNotes}</p>
        <p>Missed notes: {score.missedNotes}</p>
        <p>Pitch accuracy: {score.pitchAccuracy.toFixed(1)}%</p>
        <p>Timing accuracy: {score.timingAccuracy.toFixed(1)}%</p>
      </div>
    </div>
  );
};

export default Scoring;
