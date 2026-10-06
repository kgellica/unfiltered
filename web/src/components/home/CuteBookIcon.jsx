import { MONTH_ICONS } from "../../constants/calendar";
import { useTheme } from "../../context/ThemeContext";

export default function CuteBookIcon({ monthNum, selected }) {
  const Icon = MONTH_ICONS[monthNum] || MONTH_ICONS[7];
  const { mode } = useTheme();

  const getIconColor = () => {
    if (selected) return '#ffffff';
    if (mode === 'light') return '#8B7355';
    return 'rgba(255,255,255,0.7)';
  };

  const getBgColor = () => {
    if (selected) return 'rgba(255,255,255,0.2)';
    if (mode === 'light') return 'rgba(139, 115, 85, 0.15)';
    return 'rgba(255,255,255,0.08)';
  };

  return (
    <div
      className="flex items-center justify-center rounded-full ring-1 ring-white/35 shadow-inner shrink-0"
      style={{
        width: selected ? '3rem' : '2.5rem',
        height: selected ? '3rem' : '2.5rem',
        background: getBgColor(),
        backdropFilter: 'blur(4px)',
      }}
    >
      <Icon size={selected ? 24 : 20} color={getIconColor()} />
    </div>
  );
}