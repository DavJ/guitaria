import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../store/appStore';
import Fretboard from '../Fretboard';
import Player from '../Player';
import PitchDetection from '../PitchDetection';
import Scoring from '../Scoring';
import DifficultySelector from '../DifficultySelector';

const LessonView: React.FC = () => {
  const { t } = useTranslation();
  const { currentSong } = useAppStore();

  if (!currentSong) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">{t('lesson.title')}</h2>
          <p className="text-gray-400">{t('import.selectFile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <h1 className="text-3xl font-bold mb-2">{currentSong.title}</h1>
          <p className="text-gray-400">{currentSong.artist}</p>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fretboard */}
            <Fretboard currentNote={{ string: 2, fret: 3 }} />
            
            {/* Player Controls */}
            <Player />
            
            {/* Music Notation Area */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[200px]">
              <h3 className="text-xl font-bold mb-4">{t('lesson.musicNotation')}</h3>
              <div className="flex items-center justify-center h-40 bg-gray-700 rounded-lg">
                <p className="text-gray-400">{t('lesson.sheetMusicPlaceholder')}</p>
              </div>
            </div>
          </div>

          {/* Right Column - Controls & Info */}
          <div className="space-y-6">
            {/* Difficulty Selector */}
            <DifficultySelector />
            
            {/* Pitch Detection */}
            <PitchDetection />
            
            {/* Scoring */}
            <Scoring />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonView;
