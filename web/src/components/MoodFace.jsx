import React from 'react';

const MOUTHS = {
  great: 'M7,16 Q12,23 17,16',
  good: 'M8,16.5 Q12,20.5 16,16.5',
  okay: 'M8.5,17.5 L15.5,17.5',
  low: 'M8,18.5 Q12,15.5 16,18.5',
  sad: 'M7,19.5 Q12,13.5 17,19.5',
};

export default function MoodFace({ mood, size = 30, color = '#3A3A3A', active = false, strokeWidth = 1.6 }) {
  const mouthPath = MOUTHS[mood] || MOUTHS.okay;
  const stroke = color;
  const sw = active ? strokeWidth + 0.3 : strokeWidth;

  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block' }}>
      <circle
        cx="12"
        cy="12"
        r="10.2"
        stroke={stroke}
        strokeWidth={sw}
        fill="none"
      />
      <circle cx="8.4" cy="9.6" r="1.15" fill={stroke} />
      <circle cx="15.6" cy="9.6" r="1.15" fill={stroke} />
      <path
        d={mouthPath}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}
