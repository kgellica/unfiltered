import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Platform,
  Image,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Sun, BookOpen } from 'lucide-react-native';
import { colors } from '../theme/theme';

const TYPE_SPEED = 34; // ms per character
const HOLD_DURATION = 2200; // how long the finished line stays before erasing
const ERASE_SPEED = 16;

export default function AnimatedGreeting({ userName, avatarUrl }) {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [phase, setPhase] = useState('typing'); // 'typing' | 'holding' | 'erasing'
  const subFade = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const firstName = (userName?.split(' ')[0] || 'friend').toLowerCase();

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];

  // Only the small eyebrow phrase + subtext rotate/animate — the person's
  // name itself stays put and never gets typed or erased.
  const greetings = [
    {
      eyebrow: 'welcome back',
      icon: Sparkles,
      color: colors.accent,
      sub: "it's a lovely time to write down your thoughts.",
    },
    {
      eyebrow: `happy ${currentDay}`,
      icon: Sun,
      color: '#f59e0b',
      sub: `hope your ${currentDay} is treating you kindly. 🌸`,
    },
    {
      eyebrow: 'journal of',
      icon: BookOpen,
      color: colors.accent,
      sub: 'your safe, cozy space for unfiltered reflections. ☕',
    },
  ];

  const current = greetings[index];
  const Icon = current.icon;

  // Typewriter state machine: type out current.eyebrow char by char, hold,
  // erase, then advance to the next greeting and repeat. The name never
  // enters this loop — it's rendered separately as static text.
  useEffect(() => {
    let timer;

    if (phase === 'typing') {
      if (displayedText.length < current.eyebrow.length) {
        timer = setTimeout(() => {
          setDisplayedText(current.eyebrow.slice(0, displayedText.length + 1));
        }, TYPE_SPEED);
      } else {
        Animated.timing(subFade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
        timer = setTimeout(() => setPhase('holding'), HOLD_DURATION);
      }
    } else if (phase === 'holding') {
      timer = setTimeout(() => {
        Animated.timing(subFade, { toValue: 0, duration: 150, useNativeDriver: true }).start();
        setPhase('erasing');
      }, 10);
    } else if (phase === 'erasing') {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
        }, ERASE_SPEED);
      } else {
        timer = setTimeout(() => {
          setIndex((prev) => (prev + 1) % greetings.length);
          setPhase('typing');
        }, 250);
      }
    }

    return () => clearTimeout(timer);
  }, [phase, displayedText, current.eyebrow]);

  const initial = (userName || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        <View style={styles.textContainer}>
          <View style={styles.titleRow}>
            <Text style={styles.eyebrowText} numberOfLines={1}>
              {displayedText}
              <Text style={styles.caret}>|</Text>
            </Text>
            <View style={[styles.iconBadge, { backgroundColor: colors.accentSoft }]}>
              <Icon size={14} color={current.color} strokeWidth={2} />
            </View>
          </View>
          {/* Name — always visible, never animated/typed/erased */}
          <Text style={styles.nameText} numberOfLines={1}>
            {firstName}
          </Text>
          <Animated.Text style={[styles.subText, { opacity: subFade }]} numberOfLines={1}>
            {current.sub}
          </Animated.Text>
        </View>

        {/* Profile picture, replaces the old streak pill here */}
        <Pressable
          onPress={() => navigation.navigate('Profile')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Open your profile"
          style={styles.avatarWrap}
        >
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatarImg} />
          ) : (
            <View style={[styles.avatarImg, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 4,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    paddingRight: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: 0.2,
    textTransform: 'lowercase',
    flexShrink: 1,
  },
  caret: {
    fontWeight: '400',
    color: colors.accent,
    opacity: 0.7,
  },
  iconBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 23,
    fontWeight: '800',
    color: colors.onBackground,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -0.3,
    textTransform: 'lowercase',
    marginTop: 1,
  },
  subText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginTop: 2,
    textTransform: 'lowercase',
  },
  avatarWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 2,
    borderColor: colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImg: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  avatarInitial: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.accent,
  },
});
