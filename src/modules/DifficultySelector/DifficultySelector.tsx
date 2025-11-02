import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';

const DifficultySelector: React.FC = () => {
  const { t } = useTranslation();
  const { difficulty, setDifficulty } = useAppStore();

  const difficulties: Array<'beginner' | 'intermediate' | 'advanced' | 'expert'> = [
    'beginner',
    'intermediate',
    'advanced',
    'expert',
  ];

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-600 hover:bg-green-700';
      case 'intermediate':
        return 'bg-yellow-600 hover:bg-yellow-700';
      case 'advanced':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'expert':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4">{t('lesson.difficulty')}</h2>
      
      <div className="grid grid-cols-2 gap-3">
        {difficulties.map((level) => (
          <button
            key={level}
            onClick={() => setDifficulty(level)}
            className={`px-4 py-3 rounded-lg font-semibold transition-all ${
              difficulty === level
                ? `${getDifficultyColor(level)} ring-2 ring-white`
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {t(`difficulty.${level}`)}
          </button>
        ))}
      </div>
      
      {/* Difficulty description */}
      <div className="mt-4 p-4 bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-300">
          {difficulty === 'beginner' && 'Základní akordy a jednoduché rytmy'}
          {difficulty === 'intermediate' && 'Barre akordy a složitější rytmy'}
          {difficulty === 'advanced' && 'Sóla, tapping a pokročilé techniky'}
          {difficulty === 'expert' && 'Kompletní originální verze s detaily'}
        </p>
      </div>
    </div>
  );
};

export default DifficultySelector;
