import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import LanguageSwitcher from './components/LanguageSwitcher';
import Logo from './components/Logo';

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        {/* Navigation Bar with guitar theme */}
        <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b border-amber-700/30 shadow-lg shadow-amber-500/5 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <Link to="/" className="hover:scale-105 transition-transform">
                  <Logo showText={true} />
                </Link>
                <div className="hidden md:flex gap-4">
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/lesson"
                    className="text-gray-300 hover:text-amber-400 transition-colors px-3 py-2 rounded-lg hover:bg-gray-800"
                  >
                    {t('nav.lessons')}
                  </Link>
                </div>
              </div>
              <LanguageSwitcher />
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/lesson" element={<LessonPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
