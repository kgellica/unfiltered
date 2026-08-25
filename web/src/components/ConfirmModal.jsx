import { Trash2, LogOut, AlertCircle, X, Heart } from 'lucide-react';

export default function ConfirmModal({
  isOpen,
  title = 'are you sure?',
  message = 'this action cannot be undone.',
  confirmText = 'confirm',
  cancelText = 'cancel',
  confirmVariant = 'danger', // 'danger' | 'accent' | 'default'
  icon = 'trash', // 'trash' | 'logout' | 'alert'
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  const renderIcon = () => {
    if (icon === 'logout') {
      return <LogOut size={24} className="text-[var(--accent)]" />;
    }
    if (icon === 'alert') {
      return <AlertCircle size={24} className="text-amber-500" />;
    }
    return <Trash2 size={24} className="text-red-500" />;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 lowercase"
      style={{ background: 'rgba(35, 25, 20, 0.65)', backdropFilter: 'blur(6px)' }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-6 shadow-2xl animate-cute-pop flex flex-col items-center text-center gap-4 relative"
        style={{
          background: 'var(--surface)',
          border: '1.5px solid var(--border-soft)',
          boxShadow: 'var(--modal-shadow)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-xl hover:bg-black/5 transition text-[var(--ink-faint)]"
          aria-label="close"
        >
          <X size={18} />
        </button>

        {/* Icon Badge */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-xs animate-cute-float"
          style={{
            background: confirmVariant === 'danger' ? '#fef2f2' : 'var(--accent-soft)',
          }}
        >
          {renderIcon()}
        </div>

        {/* Title & Message */}
        <div className="flex flex-col gap-1">
          <h3
            className="text-lg font-bold tracking-tight text-[var(--ink)]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h3>
          <p className="text-[13px] font-medium leading-relaxed text-[var(--ink-soft)] px-2">
            {message}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="w-full py-2.5 rounded-2xl text-[13px] font-bold text-[var(--ink)] bg-[var(--surface-muted)] hover:bg-black/5 transition border border-[var(--border-soft)] cursor-pointer"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`w-full py-2.5 rounded-2xl text-[13px] font-bold text-white shadow-sm transition hover:scale-105 active:scale-95 cursor-pointer ${
              confirmVariant === 'danger'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-[var(--accent)] hover:opacity-90'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
