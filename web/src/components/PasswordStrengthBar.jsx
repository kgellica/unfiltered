import { getPasswordChecks } from '../lib/password';

export default function PasswordStrengthBar({ password = '' }) {
  const { checks, passedCount, total } = getPasswordChecks(password);
  const percentage = (passedCount / total) * 100;

  const getProgressColor = () => {
    if (passedCount <= 1) return 'bg-red-500';
    if (passedCount <= 3) return 'bg-amber-500';
    if (passedCount === 4) return 'bg-yellow-400';
    return 'bg-emerald-500';
  };

  return (
    <div className="mt-2 space-y-1.5">
      <div className="w-full h-1.5 bg-[var(--surface-muted)] border border-[var(--border-soft)] rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ease-out ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-[11px] font-medium text-[var(--ink-soft)] px-0.5">
        <span>
          {passedCount === 0 && 'Enter password'}
          {passedCount > 0 && passedCount < total && `${passedCount}/${total} requirements met`}
          {passedCount === total && '✓ Strong password!'}
        </span>
        <span className="opacity-75">
          {checks.filter((c) => !c.valid).map((c) => c.label).join(' • ')}
        </span>
      </div>
    </div>
  );
}