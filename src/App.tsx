import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import HomePage from './pages/HomePage';
import LessonPage from './pages/LessonPage';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const { t } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        {/* Navigation Bar */}
        <nav className="bg-gray-800 border-b border-gray-700">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <Link to="/" className="text-2xl font-bold text-white">
                  🎸 {t('app.name')}
                </Link>
                <div className="hidden md:flex gap-4">
                  <Link
                    to="/"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {t('nav.home')}
                  </Link>
                  <Link
                    to="/lesson"
                    className="text-gray-300 hover:text-white transition-colors"
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
