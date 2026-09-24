import React, { useEffect, useRef, useState } from 'react';

interface SheetMusicViewProps {
  xml: string;
  currentTime: number;
}

const SheetMusicView: React.FC<SheetMusicViewProps> = ({ xml, currentTime }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const osmdRef = useRef<{ load: (xmlData: string) => Promise<void>; render: () => void } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleResize = () => {
      if (osmdRef.current) {
        osmdRef.current.render();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!containerRef.current || !xml) {
      return;
    }

    let disposed = false;

    const load = async () => {
      try {
        const { OpenSheetMusicDisplay } = await import('opensheetmusicdisplay');
        if (disposed || !containerRef.current) {
          return;
        }

        const instance = new OpenSheetMusicDisplay(containerRef.current, {
          autoResize: true,
          backend: 'svg',
          drawPartNames: false,
        });

        osmdRef.current = instance;
        await instance.load(xml);
        instance.render();
        setError(null);
      } catch {
        setError('Could not render sheet music.');
      }
    };

    void load();

    return () => {
      disposed = true;
      osmdRef.current = null;
    };
  }, [xml]);

  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    containerRef.current.style.setProperty('--lesson-progress', `${currentTime}`);
  }, [currentTime]);

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
