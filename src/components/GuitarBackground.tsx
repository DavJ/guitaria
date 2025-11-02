import React from 'react';

const GuitarBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-5 z-0">
      {/* Large guitar silhouette in the background */}
      <svg
        className="absolute -right-32 top-1/4 w-[600px] h-[600px] transform rotate-12"
        viewBox="0 0 200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Acoustic guitar body */}
        <ellipse cx="100" cy="180" rx="70" ry="85" fill="currentColor" className="text-amber-600" />
        <ellipse cx="100" cy="180" rx="60" ry="75" fill="currentColor" className="text-amber-700" />
        
        {/* Sound hole */}
        <circle cx="100" cy="180" r="25" fill="currentColor" className="text-gray-900" />
        <circle cx="100" cy="180" r="20" fill="none" stroke="currentColor" className="text-amber-600" strokeWidth="2" />
        
        {/* Guitar neck */}
        <rect x="85" y="10" width="30" height="100" fill="currentColor" className="text-amber-800" />
        
        {/* Frets */}
        {[20, 35, 50, 65, 80, 95].map((y, i) => (
          <line key={i} x1="85" y1={y} x2="115" y2={y} stroke="currentColor" className="text-gray-600" strokeWidth="1.5" />
        ))}
        
        {/* Strings */}
        {[88, 92, 96, 100, 104, 108].map((x, i) => (
          <line key={i} x1={x} y1="10" x2={x + (i - 2.5) * 2} y2="110" stroke="currentColor" className="text-gray-400" strokeWidth="0.8" />
        ))}
        
        {/* Headstock */}
        <rect x="80" y="0" width="40" height="15" rx="3" fill="currentColor" className="text-amber-900" />
        
        {/* Tuning pegs */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <circle key={i} cx={85 + (i % 3) * 10} cy={4 + Math.floor(i / 3) * 7} r="2" fill="currentColor" className="text-gray-500" />
        ))}
      </svg>
      
      {/* Another guitar on the left */}
      <svg
        className="absolute -left-32 bottom-1/4 w-[500px] h-[500px] transform -rotate-12"
        viewBox="0 0 200 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Electric guitar body */}
        <path d="M70,150 Q50,180 70,210 L130,210 Q150,180 130,150 Z" fill="currentColor" className="text-orange-600" />
        <path d="M75,155 Q60,180 75,205 L125,205 Q140,180 125,155 Z" fill="currentColor" className="text-orange-700" />
        
        {/* Pickups */}
        <rect x="85" y="170" width="30" height="8" rx="2" fill="currentColor" className="text-gray-900" />
        <rect x="85" y="190" width="30" height="8" rx="2" fill="currentColor" className="text-gray-900" />
        
        {/* Guitar neck */}
        <rect x="90" y="20" width="20" height="130" fill="currentColor" className="text-amber-800" />
        
        {/* Frets */}
        {[30, 45, 60, 75, 90, 105, 120, 135].map((y, i) => (
          <line key={i} x1="90" y1={y} x2="110" y2={y} stroke="currentColor" className="text-gray-600" strokeWidth="1" />
        ))}
        
        {/* Strings */}
        {[93, 96, 99, 102, 105, 108].map((x, i) => (
          <line key={i} x1={x} y1="20" x2={x} y2="150" stroke="currentColor" className="text-gray-400" strokeWidth="0.6" />
        ))}
        
        {/* Headstock */}
        <path d="M85,10 L85,25 L115,25 L115,10 Q100,5 85,10 Z" fill="currentColor" className="text-amber-900" />
      </svg>
      
      {/* Musical notes scattered around */}
      <div className="absolute top-20 left-1/4 text-6xl text-amber-500 opacity-30 animate-pulse" style={{ animationDelay: '0s' }}>♪</div>
      <div className="absolute bottom-32 right-1/4 text-7xl text-orange-500 opacity-30 animate-pulse" style={{ animationDelay: '1s' }}>♫</div>
      <div className="absolute top-1/3 right-1/3 text-5xl text-amber-600 opacity-20 animate-pulse" style={{ animationDelay: '2s' }}>♬</div>
      <div className="absolute bottom-1/4 left-1/3 text-6xl text-orange-600 opacity-25 animate-pulse" style={{ animationDelay: '1.5s' }}>♩</div>
      
      {/* Decorative circles */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-to-br from-orange-500/10 to-amber-600/10 rounded-full blur-3xl" />
    </div>
  );
};

export default GuitarBackground;