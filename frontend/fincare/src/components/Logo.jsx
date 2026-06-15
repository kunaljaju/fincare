import React from 'react';

const Logo = ({ size = 32, className = '' }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="logo-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#39ff14" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="logo-lime-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#adff2f" />
          <stop offset="100%" stopColor="#39ff14" />
        </linearGradient>
        <filter id="logo-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g filter="url(#logo-glow)">
        {/* Main vertical curve of F */}
        <path 
          d="M9 27C9 27 12 17 12 11C12 7.5 10 5.5 10 5.5C10 5.5 13.5 5 16.5 8C19 10.5 18.5 14.5 16.5 20C14.5 24.5 9 27 9 27Z" 
          fill="url(#logo-green-grad)" 
        />
        {/* Top horizontal branch of F */}
        <path 
          d="M14.5 9C17 7 22.5 5 26 5C26 5 22 9.5 18 11C15.5 12 14.5 10 14.5 9Z" 
          fill="url(#logo-lime-grad)" 
        />
        {/* Middle horizontal branch of F */}
        <path 
          d="M13.5 17C16 15.5 20.5 14 23.5 14C23.5 14 20.5 17.5 17 18.5C15 19 13.5 18 13.5 17Z" 
          fill="url(#logo-green-grad)" 
        />
      </g>
    </svg>
  );
};

export default Logo;
