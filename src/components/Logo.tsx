import React from 'react';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = '', showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Guitar SVG Logo */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg"
      >
        {/* Guitar body */}
        <ellipse cx="65" cy="65" rx="28" ry="32" fill="url(#guitarGradient)" stroke="#d97706" strokeWidth="2" />
        
        {/* Sound hole */}
        <circle cx="65" cy="65" r="10" fill="#1f2937" stroke="#92400e" strokeWidth="1.5" />
        <circle cx="65" cy="65" r="7" fill="none" stroke="#b45309" strokeWidth="1" />
        
        {/* Guitar neck */}
        <rect x="25" y="22" width="12" height="35" rx="2" fill="url(#neckGradient)" stroke="#92400e" strokeWidth="1.5" />
        
        {/* Frets */}
        <line x1="25" y1="30" x2="37" y2="30" stroke="#78716c" strokeWidth="1" />
        <line x1="25" y1="38" x2="37" y2="38" stroke="#78716c" strokeWidth="1" />
        <line x1="25" y1="46" x2="37" y2="46" stroke="#78716c" strokeWidth="1" />
        
        {/* Strings */}
        <line x1="28" y1="20" x2="62" y2="58" stroke="#e5e5e5" strokeWidth="0.5" opacity="0.8" />
        <line x1="30" y1="20" x2="64" y2="58" stroke="#e5e5e5" strokeWidth="0.5" opacity="0.8" />
        <line x1="32" y1="20" x2="66" y2="58" stroke="#e5e5e5" strokeWidth="0.5" opacity="0.8" />
        <line x1="34" y1="20" x2="68" y2="58" stroke="#e5e5e5" strokeWidth="0.6" opacity="0.8" />
        
        {/* Headstock */}
        <rect x="23" y="15" width="16" height="8" rx="2" fill="url(#headstockGradient)" stroke="#92400e" strokeWidth="1.5" />
        
        {/* Tuning pegs */}
        <circle cx="26" cy="17" r="1.5" fill="#d4d4d4" />
        <circle cx="30" cy="17" r="1.5" fill="#d4d4d4" />
        <circle cx="34" cy="17" r="1.5" fill="#d4d4d4" />
        <circle cx="26" cy="21" r="1.5" fill="#d4d4d4" />
        <circle cx="30" cy="21" r="1.5" fill="#d4d4d4" />
        <circle cx="34" cy="21" r="1.5" fill="#d4d4d4" />
        
        {/* Music note decoration */}
        <circle cx="82" cy="48" r="6" fill="#f59e0b" opacity="0.8" />
        <rect x="88" y="36" width="2" height="12" fill="#f59e0b" opacity="0.8" />
        <path d="M88 36 Q92 34 92 38 L92 44" stroke="#f59e0b" strokeWidth="2" fill="none" opacity="0.8" />
        
        {/* Gradients */}
        <defs>
          <linearGradient id="guitarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id="neckGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
          <linearGradient id="headstockGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#92400e" />
            <stop offset="100%" stopColor="#78350f" />
          </linearGradient>
        </defs>
      </svg>
      
      {showText && (
        <div className="flex flex-col">
          <span className="text-2xl font-black bg-gradient-to-r from-amber-400 via-orange-500 to-amber-600 bg-clip-text text-transparent">
            Guitaria
          </span>
          <span className="text-xs text-amber-300 font-semibold -mt-1">
            Guitar Learning
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;