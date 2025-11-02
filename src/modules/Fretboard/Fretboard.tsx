import React from 'react';

interface FretboardProps {
  currentNote?: {
    string: number;
    fret: number;
  } | null;
}

const STRINGS = 6;
const FRETS = 15;
const STRING_NOTES = ['E', 'A', 'D', 'G', 'B', 'E']; // Standard tuning

const Fretboard: React.FC<FretboardProps> = ({ 
  currentNote,
}) => {
  return (
    <div className="w-full bg-gradient-to-b from-amber-800 to-amber-900 p-6 rounded-lg shadow-xl">
      <div className="relative">
        {/* String lines */}
        {[...Array(STRINGS)].map((_, stringIndex) => (
          <div
            key={`string-${stringIndex}`}
            className="relative h-8 border-b-2 border-gray-300 flex items-center"
            style={{
              borderBottomWidth: `${1 + stringIndex * 0.3}px`,
            }}
          >
            {/* String label */}
            <div className="absolute -left-8 text-white font-bold text-sm">
              {STRING_NOTES[stringIndex]}
            </div>
            
            {/* Frets */}
            {[...Array(FRETS)].map((_, fretIndex) => (
              <div
                key={`fret-${stringIndex}-${fretIndex}`}
                className="relative flex-1 h-full"
                style={{
                  borderRight: fretIndex === 0 ? '4px solid #333' : '2px solid #666',
                }}
              >
                {/* Fret markers */}
                {stringIndex === 2 && [3, 5, 7, 9].includes(fretIndex) && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                )}
                {stringIndex === 2 && fretIndex === 12 && (
                  <>
                    <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                    <div className="absolute top-3/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-gray-400 rounded-full" />
                  </>
                )}
                
                {/* Highlight current note */}
                {currentNote &&
                  currentNote.string === stringIndex &&
                  currentNote.fret === fretIndex && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-blue-500 rounded-full border-2 border-white animate-pulse" />
                  )}
              </div>
            ))}
          </div>
        ))}
        
        {/* Fret numbers */}
        <div className="flex mt-2">
          {[...Array(FRETS)].map((_, fretIndex) => (
            <div
              key={`fret-num-${fretIndex}`}
              className="flex-1 text-center text-white text-xs"
            >
              {fretIndex}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fretboard;
