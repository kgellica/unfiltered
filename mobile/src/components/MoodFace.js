import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';

// Mouth curve per mood, drawn as a quadratic curve from (8,17) to (16,17)
// through a control point whose Y controls how much it smiles/frowns.
// control Y < 17 = smile (curves up), > 17 = frown (curves down), = 17 = flat.
const MOUTHS = {
  great: 'M7,16 Q12,23 17,16',
  good: 'M8,16.5 Q12,20.5 16,16.5',
  okay: 'M8.5,17.5 L15.5,17.5',
  low: 'M8,18.5 Q12,15.5 16,18.5',
  sad: 'M7,19.5 Q12,13.5 17,19.5',
};

/**
 * Line-art smiley face icon (outline circle, dot eyes, curved mouth) —
 * matches the "smiley line" reference design instead of emoji glyphs.
 * `active` swaps the stroke/eye color to the mood's accent color.
 */
export default function MoodFace({ mood, size = 30, color = '#3A3A3A', active = false, strokeWidth = 1.6 }) {
  const mouthPath = MOUTHS[mood] || MOUTHS.okay;
  const stroke = color;

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="10.2"
        stroke={stroke}
        strokeWidth={active ? strokeWidth + 0.3 : strokeWidth}
        fill="none"
      />
      <Circle cx="8.4" cy="9.6" r="1.15" fill={stroke} />
      <Circle cx="15.6" cy="9.6" r="1.15" fill={stroke} />
      <Path
        d={mouthPath}
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      />
    </Svg>
  );
}