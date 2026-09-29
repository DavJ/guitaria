// @vitest-environment jsdom
import { StrictMode } from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Song } from '../../domain/Song';
import { useAppStore } from '../../store/appStore';
import { createAudioHarness, deferred } from '../../test/audioHarness';
import LessonPage from './LessonPage';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('./SheetMusicView', () => ({ default: () => null }));
vi.mock('../../modules/Fretboard', () => ({ default: () => null }));
vi.mock('../../modules/SongImport', () => ({ default: () => null }));
vi.mock('../../modules/DifficultySelector', () => ({ default: () => null }));

const song: Song = {
  id: 'lesson-test', title: 'Repeated A', tempo: 120, duration: 2,
  measures: [], sections: [], chords: [], lyrics: [],
  notes: [0, 1].map((startTime, index) => ({
    id: `n${index}`, midi: 69, pitch: 'A', step: 'A', alter: 0, octave: 4,
    startTime, duration: 0.5, measure: 1, isRest: false,
  })),
};

const state = () => useAppStore.getState();
const play = async () => {
  fireEvent.click(screen.getByText('lesson.play'));
  await waitFor(() => expect(state().isPlaying).toBe(true));
};

beforeEach(() => {
  useAppStore.setState(useAppStore.getInitialState(), true);
  state().setCurrentSong(song);
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('lesson microphone and transport integration', () => {
  it('opens capture once and starts only after the detector is ready', async () => {
    const audio = createAudioHarness();
    const permission = deferred<MediaStream>();
    audio.getUserMedia.mockReturnValueOnce(permission.promise);
    render(<StrictMode><LessonPage /></StrictMode>);
    fireEvent.click(screen.getByText('lesson.play'));
    expect(screen.getByText('lesson.cancelStart')).toBeTruthy();
    expect(state().isPlaying).toBe(false);
    audio.frame(1000);
    expect(state().currentTime).toBe(0);
    await act(async () => { permission.resolve(audio.createStream()); });
    await waitFor(() => expect(state().isPlaying).toBe(true));
    expect(audio.getUserMedia).toHaveBeenCalledTimes(1);
    expect(state().score.correctNotes).toBe(0);
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
  });

  it.each(['stop', 'unmount', 'replace song', 'seek', 'cancel start'] as const)(
    'cancels pending permission on %s and stops a stream granted later', async (action) => {
      const audio = createAudioHarness();
      const permission = deferred<MediaStream>();
      audio.getUserMedia.mockReturnValueOnce(permission.promise);
      const view = render(<LessonPage />);
      fireEvent.click(screen.getByText('lesson.play'));
      expect(audio.getUserMedia).toHaveBeenCalledTimes(1);
      if (action === 'stop') fireEvent.click(screen.getByText('lesson.stop'));
      if (action === 'unmount') view.unmount();
      if (action === 'replace song') act(() => state().setCurrentSong({ ...song, id: 'replacement' }));
      if (action === 'seek') fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '1' } });
      if (action === 'cancel start') fireEvent.click(screen.getByText('lesson.cancelStart'));
      await act(async () => { permission.resolve(audio.createStream()); });
      expect(state().isPlaying).toBe(false);
      expect(state().microphoneEnabled).toBe(false);
      expect(audio.streams[0].stop).toHaveBeenCalledOnce();
      expect(audio.contexts).toHaveLength(0);
      expect(audio.pendingFrames()).toBe(0);
    },
  );

  it('shows permission failure and allows a fresh successful attempt', async () => {
    const audio = createAudioHarness();
    audio.getUserMedia.mockRejectedValueOnce(new Error('Permission denied'));
    render(<LessonPage />);
    fireEvent.click(screen.getByText('lesson.play'));
    await screen.findByText('Microphone access failed');
    expect(state().isPlaying).toBe(false);
    expect(state().microphoneEnabled).toBe(false);
    await play();
    expect(screen.queryByText('Microphone access failed')).toBeNull();
    expect(audio.getUserMedia).toHaveBeenCalledTimes(2);
  });

  it('does not reuse a pre-seek measurement, even when playback resumes', async () => {
    const audio = createAudioHarness();
    render(<LessonPage />);
    await play();
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '1' } });
    expect(state().isPlaying).toBe(false);
    expect(state().score.correctNotes).toBe(0);
    audio.frame();
    expect(state().score.correctNotes).toBe(0);
    await play();
    expect(state().score.correctNotes).toBe(0);
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
    expect(state().score.missedNotes).toBe(1);
    expect(audio.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('keeps Stop reset clean and releases capture until a fresh Play', async () => {
    const audio = createAudioHarness();
    render(<LessonPage />);
    await play();
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
    fireEvent.click(screen.getByText('lesson.stop'));
    audio.frame();
    expect(state().score.correctNotes).toBe(0);
    expect(state().currentTime).toBe(0);
    expect(state().microphoneEnabled).toBe(false);
    expect(audio.streams[0].stop).toHaveBeenCalledOnce();
    await play();
    expect(state().score.correctNotes).toBe(0);
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
  });

  it('ignores notes played while paused and requires a fresh note after resume', async () => {
    const audio = createAudioHarness();
    audio.setFrequency(0);
    render(<LessonPage />);
    await play();
    fireEvent.click(screen.getByText('lesson.pause'));
    audio.setFrequency(440);
    audio.frame();
    expect(state().score.correctNotes).toBe(0);
    await play();
    expect(state().score.correctNotes).toBe(0);
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
    expect(audio.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('re-evaluates each loop using fresh measurements and keeps one audio stream', async () => {
    const audio = createAudioHarness();
    render(<StrictMode><LessonPage /></StrictMode>);
    act(() => { state().setLoopEnabled(true); state().setLoopRange(0, 0.5); });
    await play();
    audio.frame();
    expect(state().score.correctNotes).toBe(1);
    for (let cycle = 0; cycle < 2; cycle += 1) {
      audio.frame(500);
      expect(state().currentTime).toBe(0);
      expect(state().score.correctNotes).toBe(0);
      audio.frame();
      expect(state().score.correctNotes).toBe(1);
    }
    expect(audio.getUserMedia).toHaveBeenCalledTimes(1);
  });

  it('pauses playback when microphone capture is switched off', async () => {
    const audio = createAudioHarness();
    render(<LessonPage />);
    await play();
    fireEvent.click(screen.getByText('pitchDetection.detecting'));
    audio.frame(1000);
    expect(state().isPlaying).toBe(false);
    expect(state().currentTime).toBe(0);
    expect(state().score.correctNotes).toBe(0);
    expect(audio.streams[0].stop).toHaveBeenCalledOnce();
  });
});
