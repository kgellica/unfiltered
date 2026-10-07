// components/StateMessage.jsx
export default function StateMessage({
  type = 'empty', 
  variant = 'default', 
  title,
  description,
  actionLabel,
  onAction,
  className = '',
}) {
  const getDefaultContent = () => {
    if (type === 'loading') {
      return {
        title: title || `gathering your ${variant === 'default' ? 'entries' : variant}...`,
        description: description || 'a quiet moment, please wait',
      };
    }

    if (type === 'error') {
      return {
        title: title || 'something went wrong',
        description: description || 'please try again in a moment',
      };
    }

    const emptyMessages = {
      journal: {
        title: 'no entries yet',
        description: 'start your first journal entry today',
      },
      calendar: {
        title: 'no entries on this day',
        description: 'take a moment to reflect and write something',
      },
      memories: {
        title: 'no memories captured yet',
        description: 'every entry becomes a beautiful memory',
      },
      default: {
        title: 'nothing here yet',
        description: 'start creating and filling this space',
      },
    };

    const content = emptyMessages[variant] || emptyMessages.default;
    return {
      title: title || content.title,
      description: description || content.description,
    };
  };

  const content = getDefaultContent();

  return (
    <div
      className={`rounded-3xl py-12 px-6 text-center flex flex-col items-center justify-center gap-3 transition-all ${className}`}
      style={{
        background: 'var(--surface)',
        border: type === 'empty' ? '2px dashed var(--border-soft)' : '1.5px solid var(--border-soft)',
      }}
    >
      {type === 'loading' ? (
        <div
          className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'var(--accent)', borderTopColor: 'transparent' }}
        />
      ) : null}

      <div className="flex flex-col gap-1.5">
        <p className="text-[16px] font-bold text-[var(--ink)]">
          {content.title}
        </p>
        <p className="text-[13px] font-medium text-[var(--ink-soft)]">
          {content.description}
        </p>
      </div>

      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-2xl text-[13px] font-bold text-white transition hover:scale-105 active:scale-95 cursor-pointer"
          style={{ background: 'var(--accent)' }}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}