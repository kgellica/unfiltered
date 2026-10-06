export default function Avatar({
  user,
  size = 112,
  textSize = 'text-4xl',
  uppercase = true,
  textColor = 'white',
  className = '',
  style = {},
}) {
  const initial = user?.name?.charAt(0) || 'u';
  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold shadow-lg overflow-hidden shrink-0 ${textSize} ${className}`}
      style={{ width: size, height: size, background: 'var(--accent)', color: textColor, ...style }}
    >
      {user?.avatar_url || user?.photoURL ? (
        <img
          src={user.avatar_url || user.photoURL}
          alt={user?.name || 'profile'}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{uppercase ? initial.toUpperCase() : initial.toLowerCase()}</span>
      )}
    </div>
  );
}