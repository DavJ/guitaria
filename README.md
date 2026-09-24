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
- Composer provider abstraction with local provider (`LocalComposerProvider`)
- Unit tests via Vitest for parser, timing, pitch utils, fretboard mapping, lesson engine, and composer→song conversion
- GitHub Actions CI for typecheck/lint/test/build
- PWA basics: manifest + real icons + service worker registration/cache versioning

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

## Notes

- The tutor/composer logic is local/template-based in this phase; no browser-side API keys are used.
- Some advanced capabilities (complex polyphony handling, notation cursor syncing, persistence analytics) remain in progress.
