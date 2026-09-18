import { useState, useEffect } from 'react';
import { Sparkles, Sun, BookOpen, Heart } from 'lucide-react';

export default function AnimatedGreeting({ userName }) {
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
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
      sub: `hope your ${currentDay} is treating you kindly.`,
    },
    {
      text: `${firstName}'s journal`,
      icon: BookOpen,
      color: 'var(--accent)',
      sub: 'your safe, cozy space for unfiltered reflections.',
    },
  ];

  const current = greetings[greetingIndex];
  const Icon = current.icon;

  // Typewriter effect
  useEffect(() => {
    const fullText = current.text;
    
    if (isTyping) {
      if (charIndex < fullText.length) {
        const timer = setTimeout(() => {
          setDisplayText(fullText.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 60);
        return () => clearTimeout(timer);
      } else {
        setIsTyping(false);
        const deleteTimer = setTimeout(() => {
          setIsTyping(false);
          setCharIndex(0);
          setDisplayText('');
        }, 2000);
        return () => clearTimeout(deleteTimer);
      }
    } else {
      const nextTimer = setTimeout(() => {
        setGreetingIndex((prev) => (prev + 1) % greetings.length);
        setIsTyping(true);
        setCharIndex(0);
        setDisplayText('');
      }, 1000);
      return () => clearTimeout(nextTimer);
    }
  }, [charIndex, isTyping, current.text, greetings.length]);

  // Reset when greeting changes
  useEffect(() => {
    setDisplayText('');
    setCharIndex(0);
    setIsTyping(true);
  }, [greetingIndex]);

  // Find the longest greeting text to set a fixed width
  const longestText = greetings.reduce((max, g) => g.text.length > max.length ? g.text : max, greetings[0].text);

  return (
    <div className="flex flex-col gap-1 select-none">
      <div className="flex items-center gap-2.5">
        <div 
          className="text-2xl md:text-3xl font-bold tracking-tight lowercase flex items-center gap-2"
          style={{ 
            fontFamily: 'var(--font-display)', 
            color: 'var(--ink)',
            minWidth: `${longestText.length * 16}px`, // Approximate width based on character count
          }}
        >
          <span>{displayText || '\u00A0'}</span>
          <span 
            className="inline-block w-0.5 h-6 md:h-7 animate-pulse"
            style={{ background: 'var(--accent)' }}
          />
        </div>
      </div>
      <p
        className="text-[13px] md:text-[14px] lowercase font-medium animate-cute-fade"
        style={{ color: 'var(--ink-soft)' }}
      >
        {current.sub}
      </p>
    </div>
  );
}