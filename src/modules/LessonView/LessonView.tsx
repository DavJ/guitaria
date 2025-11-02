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
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🎸</div>
          <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{t('lesson.title')}</h2>
          <p className="text-gray-400">{t('import.selectFile')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header with guitar theme */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-amber-700/30">
          <div className="flex items-center gap-4">
            <span className="text-5xl">🎵</span>
            <div>
              <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">{currentSong.title}</h1>
              <p className="text-amber-200">{currentSong.artist}</p>
            </div>
          </div>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main View */}
          <div className="lg:col-span-2 space-y-6">
            {/* Fretboard */}
            <div className="transform transition-all hover:scale-[1.01]">
              <Fretboard currentNote={{ string: 2, fret: 3 }} />
            </div>
            
            {/* Player Controls */}
            <Player />
            
            {/* Music Notation Area */}
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-6 rounded-2xl shadow-2xl border border-amber-700/30 min-h-[200px]">
              <h3 className="text-xl font-bold mb-4 text-amber-400">{t('lesson.musicNotation')}</h3>
              <div className="flex items-center justify-center h-40 bg-gray-700/50 rounded-xl border border-gray-600">
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
