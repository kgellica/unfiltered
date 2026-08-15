import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Auth from './components/Auth';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Journal from './pages/Journal';
import Memories from './pages/Memories';
import CalendarView from './pages/CalendarView';
import Affirmations from './pages/Affirmations';
import Reminders from './pages/Reminders';
import Settings from './pages/Settings';

export default function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center lowercase"
        style={{ background: 'var(--bg-page)', color: 'var(--ink)' }}
      >
        <p className="text-[14px] font-bold text-[var(--accent)] animate-pulse flex items-center gap-2">
          opening unfiltered diary... 
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <ThemeProvider>
        <Auth />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/journal" element={<Journal />} />
            <Route path="/memories" element={<Memories />} />
            <Route path="/calendar" element={<CalendarView />} />
            <Route path="/affirmations" element={<Affirmations />} />
            <Route path="/reminders" element={<Reminders />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}