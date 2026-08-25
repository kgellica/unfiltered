import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../context/ThemeContext';

export default function AppLayout() {
  const { mode, accent, customAccent } = useTheme();

  return (
    <div
      className="flex min-h-screen lowercase"
      data-mode={mode}
      data-accent={accent}
      style={{
        background: 'var(--bg-sidebar)',
        ...(accent === 'custom' ? { '--accent': customAccent } : {}),
      }}
    >
      <Sidebar />
      <main
        className="flex-1 min-w-0 min-h-screen overflow-y-auto"
        style={{ background: 'var(--bg-page)' }}
      >
        <Outlet />
      </main>
    </div>
  );
}
