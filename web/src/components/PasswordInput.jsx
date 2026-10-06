import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  label,
  icon: Icon,
  value,
  onChange,
  name,
  placeholder,
  autoComplete = 'current-password',
  hasError = false,
  required = false,
}) {
  const [show, setShow] = useState(false);

  return (
    <div>
      {label && (
        <label className="block text-[12px] font-bold text-[var(--ink-soft)] mb-1.5 flex items-center gap-1">
          {Icon && <Icon size={13} />} {label}
        </label>
      )}
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          name={name}
          required={required}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 pr-11 rounded-2xl border text-[14px] font-medium outline-none transition focus:border-[var(--accent)]"
          style={{
            background: 'var(--surface-muted)',
            borderColor: hasError ? '#ef4444' : 'var(--border-soft)',
            color: 'var(--ink)',
          }}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--ink-soft)] hover:text-[var(--accent)] transition cursor-pointer"
          tabIndex={-1}
          aria-label={show ? 'hide password' : 'show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );
}