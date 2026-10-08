// web/src/components/memories/MemoryFilterPills.jsx
import { Images, Camera, Mic } from 'lucide-react';

const FILTER_OPTIONS = [
  { id: 'all', label: 'all', icon: Images },
  { id: 'photos', label: 'photos', icon: Camera },
  { id: 'voice', label: 'voice', icon: Mic },
];

export default function MemoryFilterPills({ activeFilter, onFilterChange }) {
  return (
    <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
      {FILTER_OPTIONS.map(({ id, label, icon: Icon }) => {
        const isActive = activeFilter === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onFilterChange(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[13px] font-semibold transition-all duration-200 cursor-pointer border select-none shrink-0 ${
              isActive
                ? 'shadow-xs'
                : 'hover:bg-black/5 opacity-80 hover:opacity-100'
            }`}
            style={{
              backgroundColor: isActive
                ? 'var(--accent, #15803d)'
                : 'var(--surface-muted, rgba(0,0,0,0.04))',
              color: isActive ? '#FFFFFF' : 'var(--ink, #333333)',
              borderColor: isActive ? 'transparent' : 'var(--border-soft, rgba(0,0,0,0.08))',
            }}
          >
            <Icon
              size={15}
              strokeWidth={2.2}
              style={{ color: isActive ? '#FFFFFF' : 'var(--ink-soft, #666666)' }}
            />
            <span className="lowercase">{label}</span>
          </button>
        );
      })}
    </div>
  );
}