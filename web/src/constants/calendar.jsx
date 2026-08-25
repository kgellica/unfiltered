export const MONTH_DATA = [
  { num: 0, name: 'january', short: 'JAN', color: '#40354a', days: 31 },
  { num: 1, name: 'february', short: 'FEB', color: '#543b43', days: 28 },
  { num: 2, name: 'march', short: 'MAR', color: '#3b4d40', days: 31 },
  { num: 3, name: 'april', short: 'APR', color: '#3d445c', days: 30 },
  { num: 4, name: 'may', short: 'MAY', color: '#4a463a', days: 31 },
  { num: 5, name: 'june', short: 'JUN', color: '#543846', days: 30 },
  { num: 6, name: 'july', short: 'JUL', color: '#364954', days: 31 },
  { num: 7, name: 'august', short: 'AUG', color: '#544338', days: 31 },
  { num: 8, name: 'september', short: 'SEP', color: '#4d3b32', days: 30 },
  { num: 9, name: 'october', short: 'OCT', color: '#543f32', days: 31 },
  { num: 10, name: 'november', short: 'NOV', color: '#3d3029', days: 30 },
  { num: 11, name: 'december', short: 'DEC', color: '#2d3b34', days: 31 },
];

export const MONTH_ICONS = {
  0: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 8v36M14 15l24 22M14 37l24-22M18 6l8 18 8-18M18 46l8-18 8 18" />
        <circle cx="26" cy="26" r="4" fill={color} stroke="none" />
      </g>
    </svg>
  ),
  1: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 39c-9-6.5-14.5-12-14.5-18.5A7.5 7.5 0 0 1 19 13a8.5 8.5 0 0 1 7 3.5A8.5 8.5 0 0 1 33 13a7.5 7.5 0 0 1 7.5 7.5C40.5 27 35 32.5 26 39Z" fill={color} fillOpacity="0.2" />
        <path d="M13 18h6M33 18h6M26 12v6M26 40v6" />
      </g>
    </svg>
  ),
  2: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 33c5.5-9 9-14 15-14s9.5 5 15 14" />
        <path d="M15 31c3.5-4 6.5-6 11-6s7.5 2 11 6" />
        <path d="M26 12c4.8 0 8.5 3.8 8.5 8.5S30.8 29 26 29s-8.5-3.8-8.5-8.5S21.2 12 26 12Z" fill={color} fillOpacity="0.18" />
        <path d="M18 38c-1.5 0-3 1-3 3s1.5 3 3 3h16c1.5 0 3-1 3-3s-1.5-3-3-3H18Z" fill={color} fillOpacity="0.2" />
      </g>
    </svg>
  ),
  3: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 9c8 0 13 6 13 13 0 9-7.5 17-13 21-5.5-4-13-12-13-21 0-7 5-13 13-13Z" fill={color} fillOpacity="0.18" />
        <path d="M26 16v12M20 22h12" />
      </g>
    </svg>
  ),
  4: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="26" cy="26" r="9" fill={color} fillOpacity="0.18" />
        <path d="M26 6v7M26 39v7M6 26h7M39 26h7M12 12l5 5M35 35l5 5M35 12l-5 5M17 35l-5 5" />
      </g>
    </svg>
  ),
  5: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="26" cy="26" r="4" fill={color} fillOpacity="0.2" />
        <path d="M26 7v8M26 37v8M7 26h8M37 26h8M14 14l6 6M32 32l6 6M32 14l-6 6M20 32l-6 6" />
        <path d="M26 18c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12Z" fill={color} fillOpacity="0.12" />
      </g>
    </svg>
  ),
  6: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 14c-4 0-7 3-7 7 0 4 3 7 7 7 4 0 7-3 7-7 0-4-3-7-7-7Z" fill={color} fillOpacity="0.16" />
        <path d="M26 8v8M26 36v8M8 26h8M36 26h8M13 13l6 6M33 33l6 6M33 13l-6 6M19 33l-6 6" />
        <path d="M17 30c2.5 4.5 6.5 7 9 7 3.5 0 6.5-2.5 9-7" />
      </g>
    </svg>
  ),
  7: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="35" cy="16" r="7" fill={color} fillOpacity="0.15" />
        <path d="M18 28h16c4.5 0 8 3.5 8 8v5H10v-5c0-4.5 3.5-8 8-8Z" fill={color} fillOpacity="0.12" />
        <path d="M16 30c1.5 0 3.5 1.5 5 3.5 3-4 7-5.5 10-5.5" />
        <path d="M13 38c2.5-7 8.5-11 14-11 6.5 0 10.5 4 13.5 11" />
      </g>
    </svg>
  ),
  8: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 30c6.5 0 9.5-5 15-5s8.5 5 17 5" />
        <path d="M10 35c6.5 0 9.5-5 15-5s8.5 5 17 5" />
        <path d="M16 18c4-5 7.5-7 10-7 4.5 0 8.5 3 10 8" />
        <path d="M21 21c-2.5 3.5-4 7-4 10.5" />
      </g>
    </svg>
  ),
  9: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M26 10c7.5 0 13 5.5 13 13 0 7.5-5.5 13-13 13s-13-5.5-13-13c0-7.5 5.5-13 13-13Z" fill={color} fillOpacity="0.12" />
        <path d="M26 16v10M21 21h10M20 31h12M18 38h16" />
      </g>
    </svg>
  ),
  10: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 34h20l-2 8H18l-2-8Z" fill={color} fillOpacity="0.12" />
        <path d="M18 33c0-7 3.5-12 8-12s8 5 8 12" />
        <path d="M20 22c0-3 2.5-6 6-6s6 2.5 6 6" />
        <path d="M26 9v6" />
        <path d="M14 38h24" />
      </g>
    </svg>
  ),
  11: ({ color }) => (
    <svg viewBox="0 0 52 52" className="h-8 w-8" aria-hidden="true">
      <g fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 23h16v13H18z" fill={color} fillOpacity="0.12" />
        <path d="M15 23c0-6.5 5-11 11-11s11 4.5 11 11" />
        <path d="M13 37h26" />
        <path d="M18 18c0-2.5 2.5-4 8-4" />
        <path d="M24 29h4" />
      </g>
    </svg>
  ),
};
