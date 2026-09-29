import { act } from '@testing-library/react';
import { vi } from 'vitest';

export function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

// Exercise the real detector and lesson with synthetic audio and a controlled
// animation clock, without relying on microphone hardware or wall-clock delays.
export function createAudioHarness(initialState: AudioContextState = 'running') {
  let frequency = 440;
  let now = 1000;
  let nextFrame = 1;
  const frames = new Map<number, FrameRequestCallback>();
  const streams: Array<{ stream: MediaStream; stop: ReturnType<typeof vi.fn> }> = [];
  const createStream = () => {
    const stop = vi.fn();
    const stream = { getTracks: () => [{ stop }] } as unknown as MediaStream;
    streams.push({ stream, stop });
    return stream;
  };
  const getUserMedia = vi.fn(async () => createStream());
  const contexts: FakeAudioContext[] = [];

  class FakeAudioContext {
    state: AudioContextState = initialState;
    sampleRate = 48000;
    resume = vi.fn(async () => { this.state = 'running'; });
    close = vi.fn(async () => { this.state = 'closed'; });
    source = { connect: vi.fn(), disconnect: vi.fn() };
    createMediaStreamSource = vi.fn(() => this.source);
    createAnalyser = vi.fn(() => ({
      fftSize: 2048,
      getFloatTimeDomainData: (buffer: Float32Array) => {
        for (let i = 0; i < buffer.length; i += 1) {
          buffer[i] = frequency === 0 ? 0 : Math.sin(2 * Math.PI * frequency * i / this.sampleRate);
        }
      },
    }));

    constructor() {
      contexts.push(this);
    }
  }

  vi.stubGlobal('navigator', { mediaDevices: { getUserMedia } });
  vi.stubGlobal('AudioContext', FakeAudioContext);
  vi.stubGlobal('requestAnimationFrame', vi.fn((callback: FrameRequestCallback) => {
    const id = nextFrame++;
    frames.set(id, callback);
    return id;
  }));
  vi.stubGlobal('cancelAnimationFrame', vi.fn((id: number) => frames.delete(id)));
  vi.spyOn(performance, 'now').mockImplementation(() => now);

  return {
    getUserMedia,
    createStream,
    streams,
    contexts,
    setFrequency: (value: number) => { frequency = value; },
    frame: (elapsed = 16) => act(() => {
      now += elapsed;
      const scheduled = [...frames.values()];
      frames.clear();
      scheduled.forEach((callback) => callback(now));
    }),
    pendingFrames: () => frames.size,
  };
}
