import { Plus } from 'lucide-react';

export default function NewEntryButton({ onClick, label = 'new entry', className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-center gap-2 h-12 px-5 rounded-2xl text-[14px] font-bold shrink-0 shadow-md transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto ${className}`}
      style={{
        background: 'var(--accent)',
        color: 'var(--accent-ink)',
        boxShadow: '0 6px 20px -2px var(--accent-soft)',
      }}
    >
      <Plus size={18} strokeWidth={2.5} />
      <span>{label}</span>
    </button>
  );
}