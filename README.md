# Guitaria

Guitaria is a browser guitar-practice app focused on a real end-to-end lesson loop:

1. Import MusicXML
2. Parse notes/timing into one canonical song model
3. Render notation with OpenSheetMusicDisplay
4. Track expected note over timeline
5. Show expected guitar fret/string
6. Capture microphone pitch
7. Evaluate pitch + timing
8. Update score and progress to song end

## Prerequisites

- Node.js >= 22.22.2
- npm
- A modern browser
- Microphone permission for realtime pitch feedback

## Current status

Implemented in this phase:

- Canonical `Song` domain model shared by lesson mode and composer conversion
- Real MusicXML parser (`src/musicxml/parser.ts`) with timing conversion
- Integrated lesson page (`src/features/lesson/LessonPage.tsx`) with:
  - transport (play/pause/stop/seek/tempo/loop)
  - expected-note selection
  - microphone pitch detection
  - pitch/timing evaluation and scoring
  - fretboard guidance from MIDI→guitar-position mapping
- Real notation rendering with `opensheetmusicdisplay`
- OSMD follow-cursor syncing for the supported monophonic lesson flow
- Composer provider abstraction with local provider (`LocalComposerProvider`)
- Unit tests via Vitest for parser, timing, pitch utils, fretboard mapping, lesson engine, and composer→song conversion
- GitHub Actions CI for typecheck/lint/test/build
- PWA basics: manifest + real icons + service worker registration/cache versioning

## Demo workflow

1. `npm ci`
2. `npm run dev`
3. Open `/lesson`
4. Click **Load Demo Lesson**
5. Click **Play**
6. Allow microphone access when the browser prompts

## Development

```bash
npm ci
npm run dev
```

### Quality checks

```bash
npm run typecheck
npm run lint
npm run test:run
npm run build
```

## Architecture highlights

- `src/domain/Song.ts` — canonical song model
- `src/musicxml/` — MusicXML parsing and timing
- `src/audio/` — pitch detection + pitch utilities
- `src/guitar/` — guitar position/fingering strategy
- `src/features/lesson/` — lesson engine + synchronized lesson page
- `src/adapters/compositionSong.ts` — AI composer output to canonical song

## Supported MusicXML MVP scope

Supported:

- `score-partwise`
- notes and rests
- divisions-based timing
- basic tempo changes
- basic time and key signatures
- simple harmony/chord symbols
- basic multiple voices via `backup` / `forward`
- simple `<chord/>` note groups

Not guaranteed yet:

- arbitrary orchestral scores
- advanced tuplets
- repeats or navigation jumps
- complex nested voices
- full tablature semantics
- mid-measure tempo changes with full cursor/lesson synchronization parity

## Notes

- The tutor/composer logic is local/template-based in this phase; no browser-side API keys are used.
- Cursor synchronization is deterministic for the demo lesson and the supported monophonic MusicXML subset. Scores with dense polyphony can still render correctly while the lesson cursor falls back to best-effort note-event matching.
- Stopping a lesson resets lesson progress to the start; changing songs also shuts down microphone capture so audio resources are released cleanly.
- Some advanced capabilities (complex polyphony handling, persistence analytics) remain in progress.
