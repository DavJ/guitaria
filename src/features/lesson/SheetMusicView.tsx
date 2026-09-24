import React, { useCallback, useEffect, useRef, useState } from 'react';

interface OsmdNoteLike {
  isRest(): boolean;
}

interface OsmdCursorLike {
  Dispose?: () => void;
  Iterator?: {
    EndReached: boolean;
  };
  NotesUnderCursor(): OsmdNoteLike[];
  hide(): void;
  next(): void;
  reset(): void;
  show(): void;
  update(): void;
}

interface OsmdLike {
  clear(): void;
  cursor: OsmdCursorLike;
  enableOrDisableCursors(enable: boolean): void;
  load(xmlData: string): Promise<unknown>;
  render(): void;
}

interface SheetMusicViewProps {
  xml: string;
  targetNoteIndex: number | null;
}

const CURSOR_GUARD_LIMIT = 10000;

const SheetMusicView: React.FC<SheetMusicViewProps> = ({ xml, targetNoteIndex }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const osmdRef = useRef<OsmdLike | null>(null);
  const targetNoteIndexRef = useRef<number | null>(targetNoteIndex);
  const [error, setError] = useState<string | null>(null);

  const syncCursorToIndex = useCallback((nextTargetIndex: number | null) => {
    const instance = osmdRef.current;
    if (!instance) {
      return;
    }

    const cursor = instance.cursor;
    if (!cursor) {
      return;
    }

    if (nextTargetIndex == null) {
      cursor.hide();
      return;
    }

    const hasPlayableNotes = () => cursor.NotesUnderCursor().some((note) => !note.isRest());

    cursor.reset();
    cursor.show();
    cursor.update();

    let steps = 0;
    while (!cursor.Iterator?.EndReached && !hasPlayableNotes() && steps < CURSOR_GUARD_LIMIT) {
      cursor.next();
      cursor.update();
      steps += 1;
    }

    let playableIndex = 0;
    while (!cursor.Iterator?.EndReached && playableIndex < nextTargetIndex && steps < CURSOR_GUARD_LIMIT) {
      cursor.next();
      cursor.update();
      steps += 1;

      if (hasPlayableNotes()) {
        playableIndex += 1;
      }
    }

    if (!hasPlayableNotes()) {
      cursor.hide();
      return;
    }

    cursor.show();
  }, []);

  useEffect(() => {
    targetNoteIndexRef.current = targetNoteIndex;
    syncCursorToIndex(targetNoteIndex);
  }, [syncCursorToIndex, targetNoteIndex]);

  useEffect(() => {
    const handleResize = () => {
      if (!osmdRef.current) {
        return;
      }

      osmdRef.current.render();
      syncCursorToIndex(targetNoteIndexRef.current);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [syncCursorToIndex]);

  useEffect(() => {
    if (!containerRef.current || !xml) {
      return;
    }

    let disposed = false;
    const container = containerRef.current;

    const load = async () => {
      try {
        const osmdModule = await import('opensheetmusicdisplay');
        const { OpenSheetMusicDisplay } = osmdModule as unknown as { OpenSheetMusicDisplay: new (container: HTMLElement, options: Record<string, unknown>) => OsmdLike };
        if (disposed) {
          return;
        }

        container.innerHTML = '';

        const instance = new OpenSheetMusicDisplay(container, {
          autoResize: true,
          backend: 'svg',
          drawPartNames: false,
        });

        osmdRef.current = instance;
        await instance.load(xml);
        instance.render();
        instance.enableOrDisableCursors(true);
        instance.cursor.reset();
        instance.cursor.show();
        syncCursorToIndex(targetNoteIndexRef.current);
        setError(null);
      } catch {
        setError('Could not render sheet music.');
      }
    };

    void load();

    return () => {
      disposed = true;
      if (osmdRef.current?.cursor) {
        osmdRef.current.cursor.hide();
        osmdRef.current.cursor.Dispose?.();
      }
      osmdRef.current?.clear();
      osmdRef.current = null;
      container.innerHTML = '';
    };
  }, [syncCursorToIndex, xml]);

  if (error) {
    return <div className="p-4 bg-red-900/30 border border-red-600 rounded text-red-200">{error}</div>;
  }

  return (
    <div className="bg-white rounded-lg p-2 overflow-auto max-h-[420px]">
      <div ref={containerRef} />
    </div>
  );
};

export default SheetMusicView;
