import { useState, useEffect } from 'react';
import { Sparkles, Sun, BookOpen, Heart } from 'lucide-react';

export default function AnimatedGreeting({ userName }) {
  const [index, setIndex] = useState(0);
  const firstName = (userName?.split(' ')[0] || 'friend').toLowerCase();

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];

  const greetings = [
    {
      text: `welcome back, ${firstName}!`,
      icon: Sparkles,
      color: 'var(--accent)',
      sub: "it's a lovely time to write down your thoughts.",
    },
    {
      text: `happy ${currentDay}!`,
      icon: Sun,
      color: '#f59e0b',
      sub: `hope your ${currentDay} is treating you kindly. 🌸`,
    },
    {
      text: `${firstName}'s journal`,
      icon: BookOpen,
      color: 'var(--accent)',
      sub: 'your safe, cozy space for unfiltered reflections. ☕',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % greetings.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [greetings.length]);

  const current = greetings[index];
  const Icon = current.icon;

  return (
    <div className="flex flex-col gap-1 select-none">
      <div className="flex items-center gap-2.5">
        <h1
          key={index}
          className="text-2xl md:text-3xl font-bold tracking-tight lowercase animate-cute-fade flex items-center gap-2"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--ink)' }}
        >
          <span>{current.text}</span>
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs shadow-sm animate-cute-float"
            style={{ background: 'var(--accent-soft)', color: current.color }}
          >
            <Icon size={16} />
          </span>
        </h1>
      </div>
      <p
        key={`sub-${index}`}
        className="text-[13px] md:text-[14px] lowercase font-medium animate-cute-fade"
        style={{ color: 'var(--ink-soft)' }}
      >
        {current.sub}
      </p>
    </div>
  );
}
