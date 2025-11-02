import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SongImport from '../modules/SongImport';
import { useAppStore } from '../store/appStore';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentSong } = useAppStore();

  const handleStartLesson = () => {
    if (currentSong) {
      navigate('/lesson');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            🎸 {t('app.name')}
          </h1>
          <p className="text-2xl text-gray-400">{t('app.tagline')}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Song Import */}
          <div>
            <SongImport />
          </div>

          {/* Features */}
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6">{t('home.features')}</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎼</span>
                <div>
                  <h3 className="font-semibold">MusicXML Import</h3>
                  <p className="text-sm text-gray-400">Import your favorite songs</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎸</span>
                <div>
                  <h3 className="font-semibold">Interactive Fretboard</h3>
                  <p className="text-sm text-gray-400">Visual learning with real-time feedback</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎙️</span>
                <div>
                  <h3 className="font-semibold">Pitch Detection</h3>
                  <p className="text-sm text-gray-400">Play along with live feedback</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🎚️</span>
                <div>
                  <h3 className="font-semibold">Multiple Difficulties</h3>
                  <p className="text-sm text-gray-400">From beginner to expert</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">🌍</span>
                <div>
                  <h3 className="font-semibold">Multilingual</h3>
                  <p className="text-sm text-gray-400">Czech and English support</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-2xl">📱</span>
                <div>
                  <h3 className="font-semibold">Mobile Ready</h3>
                  <p className="text-sm text-gray-400">Works on all devices</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Start Button */}
        {currentSong && (
          <div className="text-center">
            <button
              onClick={handleStartLesson}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 rounded-lg text-xl font-bold transition-all transform hover:scale-105"
            >
              {t('common.start')} →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
