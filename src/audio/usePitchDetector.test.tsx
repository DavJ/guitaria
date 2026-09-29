// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { createAudioHarness, deferred } from '../test/audioHarness';
import { usePitchDetector } from './usePitchDetector';

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('microphone capture lifetime', () => {
  it('changes the target without reopening capture and uses the new target for cents', async () => {
    const audio = createAudioHarness();
    const view = renderHook(({ target }) => usePitchDetector(true, target), { initialProps: { target: 69 } });
    await waitFor(() => expect(view.result.current.ready).toBe(true));
    expect(view.result.current.snapshot.centsError).toBeCloseTo(0, 0);
    view.rerender({ target: 70 });
    audio.frame();
    expect(view.result.current.snapshot.centsError).toBeCloseTo(-100, 0);
    expect(audio.getUserMedia).toHaveBeenCalledTimes(1);
    expect(audio.contexts).toHaveLength(1);
    expect(audio.streams[0].stop).not.toHaveBeenCalled();
    view.unmount();
    expect(audio.streams[0].stop).toHaveBeenCalledOnce();
    expect(audio.contexts[0].close).toHaveBeenCalledOnce();
    expect(audio.pendingFrames()).toBe(0);
  });

  it('stops a stream granted after capture was disabled', async () => {
    const audio = createAudioHarness();
    const permission = deferred<MediaStream>();
    audio.getUserMedia.mockReturnValueOnce(permission.promise);
    const view = renderHook(({ enabled }) => usePitchDetector(enabled, 69), { initialProps: { enabled: true } });
    view.rerender({ enabled: false });
    await act(async () => { permission.resolve(audio.createStream()); });
    expect(audio.streams[0].stop).toHaveBeenCalledOnce();
    expect(audio.contexts).toHaveLength(0);
    expect(view.result.current.ready).toBe(false);
    expect(view.result.current.snapshot.timestamp).toBeNull();
  });

  it('does not finish initialization after cancellation during context resume', async () => {
    const audio = createAudioHarness('suspended');
    const resume = deferred<void>();
    const permission = deferred<MediaStream>();
    audio.getUserMedia.mockImplementationOnce(async () => {
      await permission.promise;
      return audio.createStream();
    });
    // Keep resume pending before the context is constructed.
    const NativeMock = window.AudioContext;
    vi.stubGlobal('AudioContext', class extends NativeMock {
      constructor() {
        super();
        this.resume = vi.fn(() => resume.promise);
      }
    });
    const view = renderHook(({ enabled }) => usePitchDetector(enabled, 69), { initialProps: { enabled: true } });
    await act(async () => { permission.resolve({} as MediaStream); });
    expect(view.result.current.ready).toBe(false);
    view.rerender({ enabled: false });
    await act(async () => { resume.resolve(); });
    expect(audio.contexts[0].createAnalyser).not.toHaveBeenCalled();
    expect(audio.streams[0].stop).toHaveBeenCalledOnce();
    expect(audio.contexts[0].close).toHaveBeenCalledOnce();
    expect(audio.pendingFrames()).toBe(0);
    expect(view.result.current.error).toBeNull();
  });

  it('releases capture when detector initialization fails', async () => {
    const audio = createAudioHarness();
    const NativeMock = window.AudioContext;
    vi.stubGlobal('AudioContext', class extends NativeMock {
      constructor() {
        super();
        this.createAnalyser = vi.fn(() => { throw new Error('Audio device initialization failed'); });
      }
    });
    const view = renderHook(() => usePitchDetector(true, 69));
    await waitFor(() => expect(view.result.current.error).toBe('Microphone access failed'));
    expect(view.result.current.ready).toBe(false);
    expect(audio.streams[0].stop).toHaveBeenCalledOnce();
    expect(audio.contexts[0].close).toHaveBeenCalledOnce();
  });

  it('ignores a late failure from an old request after a new capture is ready', async () => {
    const audio = createAudioHarness();
    const oldPermission = deferred<MediaStream>();
    audio.getUserMedia.mockReturnValueOnce(oldPermission.promise);
    const view = renderHook(({ enabled }) => usePitchDetector(enabled, 69), { initialProps: { enabled: true } });
    view.rerender({ enabled: false });
    view.rerender({ enabled: true });
    await waitFor(() => expect(view.result.current.ready).toBe(true));
    await act(async () => { oldPermission.reject(new Error('Old request denied')); });
    audio.frame();
    expect(view.result.current.ready).toBe(true);
    expect(view.result.current.error).toBeNull();
    expect(view.result.current.snapshot.midi).toBe(69);
    expect(audio.streams[0].stop).not.toHaveBeenCalled();
  });

  it('does not let a late context close clear a newer capture', async () => {
    const audio = createAudioHarness();
    const view = renderHook(({ enabled }) => usePitchDetector(enabled, 69), { initialProps: { enabled: true } });
    await waitFor(() => expect(view.result.current.ready).toBe(true));
    const closing = deferred<void>();
    audio.contexts[0].close.mockReturnValueOnce(closing.promise);
    view.rerender({ enabled: false });
    view.rerender({ enabled: true });
    await waitFor(() => expect(audio.contexts).toHaveLength(2));
    await act(async () => { closing.resolve(); });
    audio.frame();
    expect(view.result.current.ready).toBe(true);
    expect(view.result.current.snapshot.midi).toBe(69);
    expect(audio.streams[1].stop).not.toHaveBeenCalled();
  });
});
