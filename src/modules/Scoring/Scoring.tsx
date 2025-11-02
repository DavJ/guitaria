import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

const Scoring: React.FC = () => {
  const { t } = useTranslation();
  const { score, resetScore } = useAppStore();

  const accuracyPercentage = score.totalNotes > 0
    ? Math.round((score.correctNotes / score.totalNotes) * 100)
    : 0;

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">{t('scoring.title')}</h2>
        <button
          onClick={resetScore}
          className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-semibold transition-colors"
        >
          {t('common.reset')}
        </button>
      </div>
      
      <div className="space-y-4">
        {/* Total Score */}
        <div className="text-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
          <div className="text-sm text-gray-200 mb-1">{t('scoring.percentage')}</div>
          <div className="text-5xl font-bold">{accuracyPercentage}%</div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-700 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-400 mb-1">{t('scoring.total')}</div>
            <div className="text-3xl font-bold">{score.totalNotes}</div>
          </div>
          
          <div className="bg-green-700 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-200 mb-1">{t('scoring.correct')}</div>
            <div className="text-3xl font-bold">{score.correctNotes}</div>
          </div>
          
          <div className="bg-red-700 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-200 mb-1">{t('scoring.incorrect')}</div>
            <div className="text-3xl font-bold">{score.totalNotes - score.correctNotes}</div>
          </div>
          
          <div className="bg-blue-700 p-4 rounded-lg text-center">
            <div className="text-sm text-gray-200 mb-1">{t('lesson.rhythm')}</div>
            <div className="text-3xl font-bold">{Math.round(score.rhythmAccuracy)}%</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t('lesson.accuracy')}</span>
              <span>{accuracyPercentage}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${accuracyPercentage}%` }}
              />
            </div>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>{t('lesson.rhythm')}</span>
              <span>{Math.round(score.rhythmAccuracy)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${score.rhythmAccuracy}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Scoring;
