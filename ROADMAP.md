# Guitaria Roadmap

## Phase 0 – Architecture repair

- [x] Canonical `Song` domain model shared across lesson mode and composer adapters
- [x] Remove duplicate lesson architecture usage (legacy LessonView/LessonMode no longer active)
- [x] Introduce lesson engine with deterministic note expectation/evaluation/score logic
- [x] Add test infrastructure (Vitest) and CI checks

## Phase 1 – Functional MVP

- [x] Real MusicXML parsing (title/creator/measures/divisions/tempo/time/pitch/rest/duration)
- [x] Duration + timeline conversion to seconds
- [x] Render imported notation via OpenSheetMusicDisplay
- [x] Synchronized lesson timeline with play/pause/stop/seek/tempo/loop
- [x] Microphone pitch detection with confidence and cents error
- [x] MIDI note comparison to expected lesson note
- [x] Guitar fret/string mapping from expected MIDI note
- [x] Pitch scoring + basic timing scoring + final summary state
- [x] Deterministic OSMD follow-cursor syncing for supported monophonic lesson scores
- [ ] Broader manual verification on multiple real-world MusicXML files
- [ ] Improve cursor/event parity for dense polyphony, repeats, and other advanced MusicXML navigation cases

## Phase 2 – Practice features

- [ ] Adaptive fingering strategies by difficulty
- [ ] Section-focused drill workflows and richer loop editing UX
- [ ] Detailed per-note history and persistent session statistics
- [ ] Practice history dashboard

## Phase 3 – AI training

- [ ] Server-backed provider integration for real LLM tutoring/composition
- [ ] Personalized recommendations based on historical practice
- [ ] Adaptive lesson generation from user weaknesses
- [ ] Advanced AI-assisted feedback explanation
