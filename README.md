# 🎸 Guitaria - Interactive Guitar Learning Application

Guitaria is a comprehensive web and mobile application for learning guitar through interactive lessons with real-time feedback.

## ✨ Features

- 🎼 **MusicXML Import** - Import your favorite songs in MusicXML format
- 🎸 **Interactive Fretboard** - Visual representation of guitar fretboard with real-time note display
- 🎙️ **Pitch Detection** - Live microphone input analysis to detect played notes
- ⏯️ **Smart Player** - Adjustable tempo, looping, and volume controls
- 📊 **Scoring System** - Track your accuracy and progress
- 🎚️ **Multiple Difficulty Levels** - From beginner to expert
- 🌍 **Multilingual** - Czech and English language support
- 📱 **Mobile Ready** - Progressive Web App (PWA) with offline support
- 🎨 **Modern UI** - Beautiful, responsive design with TailwindCSS

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/DavJ/guitaria.git
cd guitaria
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: TailwindCSS
- **Routing**: React Router
- **State Management**: Zustand
- **Audio Analysis**: Web Audio API, Pitchy, Meyda
- **Music Notation**: OpenSheetMusicDisplay
- **Internationalization**: react-i18next
- **PWA**: Service Workers for offline support

## 📱 Mobile App

Guitaria is a Progressive Web App (PWA) that can be installed on mobile devices:

1. Open the app in your mobile browser
2. Tap the "Add to Home Screen" option in your browser menu
3. The app will be installed and can be used offline

## 🌐 Language Support

The application supports multiple languages:
- Czech (Čeština) - Default
- English

Switch languages using the language selector in the navigation bar.

## 📖 Usage

1. **Import a Song**: On the home page, upload a MusicXML file
2. **Start Lesson**: Click "Start" to begin the interactive lesson
3. **Enable Microphone**: Allow microphone access for pitch detection
4. **Select Difficulty**: Choose your skill level (Beginner, Intermediate, Advanced, Expert)
5. **Play Along**: The app will guide you through the song with visual feedback

## 🧩 Modules

- **SongImport** - Import and parse MusicXML files
- **LessonView** - Main lesson interface
- **Fretboard** - Visual guitar fretboard component
- **Player** - Audio playback controls
- **PitchDetection** - Real-time pitch detection from microphone
- **Scoring** - Performance tracking and statistics
- **DifficultySelector** - Switch between difficulty levels

## 🔧 Development

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

### Lint Code

```bash
npm run lint
```

## 📋 Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed development plans and feature roadmap.

### Phase 1: MVP (Completed ✅)
- [x] Basic project setup
- [x] MusicXML import
- [x] Interactive fretboard
- [x] Audio player with controls
- [x] Pitch detection
- [x] Basic scoring
- [x] Multilingual support (Czech/English)
- [x] PWA support for mobile

### Phase 2: Advanced Features (Planned)
- [ ] Section training (verse, chorus, bridge, solo)
- [ ] Advanced rhythm analysis
- [ ] Practice history and statistics
- [ ] Cloud sync for user data

### Phase 3: Smart Training (Planned)
- [ ] AI-powered recommendations
- [ ] Adaptive difficulty
- [ ] Social features and sharing
- [ ] Extended music library

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 👨‍💻 Author

Created by DavJ

## 🙏 Acknowledgments

- Built with React and Vite
- Music notation powered by OpenSheetMusicDisplay
- Audio analysis with Pitchy and Meyda
- Designed according to comprehensive roadmap in ROADMAP.md
