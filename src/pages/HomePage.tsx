import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import SongImport from '../modules/SongImport';
import ChatBot from '../components/ChatBot';
import GuitarBackground from '../components/GuitarBackground';
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white relative overflow-hidden">
      {/* Guitar-themed background */}
      <GuitarBackground />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section with guitar theme */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-600 blur-3xl opacity-30 animate-pulse" />
              <div className="relative transform scale-150 mb-4">
                <svg
                  width="120"
                  height="120"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="drop-shadow-2xl"
                >
                  <ellipse cx="65" cy="65" rx="28" ry="32" fill="url(#heroGuitarGradient)" stroke="#d97706" strokeWidth="2" />
                  <circle cx="65" cy="65" r="10" fill="#1f2937" stroke="#92400e" strokeWidth="1.5" />
                  <circle cx="65" cy="65" r="7" fill="none" stroke="#b45309" strokeWidth="1" />
                  <rect x="25" y="22" width="12" height="35" rx="2" fill="url(#heroNeckGradient)" stroke="#92400e" strokeWidth="1.5" />
                  <line x1="25" y1="30" x2="37" y2="30" stroke="#78716c" strokeWidth="1" />
                  <line x1="25" y1="38" x2="37" y2="38" stroke="#78716c" strokeWidth="1" />
                  <line x1="25" y1="46" x2="37" y2="46" stroke="#78716c" strokeWidth="1" />
                  <line x1="28" y1="20" x2="62" y2="58" stroke="#e5e5e5" strokeWidth="0.5" opacity="0.8" />
                  <line x1="30" y1="20" x2="64" y2="58" stroke="#e5e5e5" strokeWidth="0.5" opacity="0.8" />
                  <line x1="32" y1="20" x2="66" y2="58" stroke="#e5e5e5" strokeWidth="0.5" opacity="0.8" />
                  <line x1="34" y1="20" x2="68" y2="58" stroke="#e5e5e5" strokeWidth="0.6" opacity="0.8" />
                  <rect x="23" y="15" width="16" height="8" rx="2" fill="url(#heroHeadstockGradient)" stroke="#92400e" strokeWidth="1.5" />
                  <circle cx="26" cy="17" r="1.5" fill="#d4d4d4" />
                  <circle cx="30" cy="17" r="1.5" fill="#d4d4d4" />
                  <circle cx="34" cy="17" r="1.5" fill="#d4d4d4" />
                  <circle cx="26" cy="21" r="1.5" fill="#d4d4d4" />
                  <circle cx="30" cy="21" r="1.5" fill="#d4d4d4" />
                  <circle cx="34" cy="21" r="1.5" fill="#d4d4d4" />
                  <defs>
                    <linearGradient id="heroGuitarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#d97706" />
                      <stop offset="50%" stopColor="#f59e0b" />
                      <stop offset="100%" stopColor="#b45309" />
                    </linearGradient>
                    <linearGradient id="heroNeckGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#78350f" />
                      <stop offset="50%" stopColor="#92400e" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>
                    <linearGradient id="heroHeadstockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#92400e" />
                      <stop offset="100%" stopColor="#78350f" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>
          <h1 className="text-6xl md:text-7xl font-black mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent drop-shadow-2xl">
            {t('app.name')}
          </h1>
          <p className="text-3xl font-light text-amber-200 mb-4">{t('app.tagline')}</p>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Master your favorite songs with interactive lessons, real-time feedback, and AI-powered guidance
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-12">
          {/* Song Import - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-amber-700/30 backdrop-blur-sm">
              <SongImport />
            </div>

            {/* Features Grid */}
            <div className="mt-8 bg-gradient-to-br from-gray-800 to-gray-900 p-8 rounded-2xl shadow-2xl border border-amber-700/30">
              <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                {t('home.features')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="group p-6 bg-gray-800/50 rounded-xl border border-amber-700/20 hover:border-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🎼</span>
                    <div>
                      <h3 className="font-bold text-lg text-amber-400 mb-2">MusicXML Import</h3>
                      <p className="text-sm text-gray-400">Import your favorite songs in MusicXML format</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 bg-gray-800/50 rounded-xl border border-amber-700/20 hover:border-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🎸</span>
                    <div>
                      <h3 className="font-bold text-lg text-amber-400 mb-2">Interactive Fretboard</h3>
                      <p className="text-sm text-gray-400">Visual learning with real-time note feedback</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 bg-gray-800/50 rounded-xl border border-amber-700/20 hover:border-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🎙️</span>
                    <div>
                      <h3 className="font-bold text-lg text-amber-400 mb-2">Pitch Detection</h3>
                      <p className="text-sm text-gray-400">Play along with live pitch detection</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 bg-gray-800/50 rounded-xl border border-amber-700/20 hover:border-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🎚️</span>
                    <div>
                      <h3 className="font-bold text-lg text-amber-400 mb-2">Multiple Difficulties</h3>
                      <p className="text-sm text-gray-400">From beginner to expert levels</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 bg-gray-800/50 rounded-xl border border-amber-700/20 hover:border-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">🌍</span>
                    <div>
                      <h3 className="font-bold text-lg text-amber-400 mb-2">Multilingual</h3>
                      <p className="text-sm text-gray-400">8 languages including Czech & Slovak</p>
                    </div>
                  </div>
                </div>

                <div className="group p-6 bg-gray-800/50 rounded-xl border border-amber-700/20 hover:border-amber-500/50 transition-all hover:scale-105 hover:shadow-xl hover:shadow-amber-500/10">
                  <div className="flex items-start gap-4">
                    <span className="text-4xl group-hover:scale-110 transition-transform">📱</span>
                    <div>
                      <h3 className="font-bold text-lg text-amber-400 mb-2">Mobile Ready</h3>
                      <p className="text-sm text-gray-400">Works perfectly on all devices</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI ChatBot - Takes 1 column */}
          <div className="xl:col-span-1">
            <div className="sticky top-24 h-[calc(100vh-8rem)]">
              <ChatBot />
            </div>
          </div>
        </div>

        {/* Start Button */}
        {currentSong && (
          <div className="text-center animate-bounce-slow">
            <button
              onClick={handleStartLesson}
              className="group relative px-12 py-6 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 hover:from-amber-700 hover:via-orange-700 hover:to-amber-800 rounded-2xl text-2xl font-bold transition-all transform hover:scale-105 shadow-2xl hover:shadow-amber-500/50"
            >
              <span className="relative z-10 flex items-center gap-3">
                <span>🎵</span>
                <span>{t('common.start')}</span>
                <svg className="w-6 h-6 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 blur-xl opacity-50 group-hover:opacity-75 transition-opacity rounded-2xl" />
            </button>
          </div>
        )}

        {/* Quick Tips Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/30 p-6 rounded-xl border border-blue-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-3">🎯</div>
            <h3 className="font-bold text-lg mb-2 text-blue-400">Practice Smart</h3>
            <p className="text-sm text-gray-400">Use difficulty levels to match your skill and progress gradually</p>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/30 p-6 rounded-xl border border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="font-bold text-lg mb-2 text-purple-400">AI Guidance</h3>
            <p className="text-sm text-gray-400">Ask our AI tutor any guitar questions anytime</p>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 p-6 rounded-xl border border-green-500/30 backdrop-blur-sm">
            <div className="text-3xl mb-3">📊</div>
            <h3 className="font-bold text-lg mb-2 text-green-400">Track Progress</h3>
            <p className="text-sm text-gray-400">Monitor your accuracy and rhythm improvements</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;