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
import { colors } from '../theme/theme';

const TYPE_SPEED = 40;
const SUB_TYPE_SPEED = 25;
const HOLD_DURATION = 3000;
const ERASE_SPEED = 15;

export default function AnimatedGreeting({ userName, avatarUrl }) {
  const [index, setIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [displayedSub, setDisplayedSub] = useState('');
  const [phase, setPhase] = useState('typing'); 
  const subFade = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();

  const firstName = (userName?.split(' ')[0] || 'friend').toLowerCase();

  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const currentDay = days[new Date().getDay()];

  // UPDATED: Removed 'icon' properties completely
  const greetings = [
    {
      text: `, welcome back!`,
      sub: "it's a lovely time to write down your thoughts.",
    },
    {
      text: `, happy ${currentDay}!`,
      sub: `hope your ${currentDay} is treating you kindly. 🌸`,
    },
    {
      text: `'s journal`,
      sub: 'your safe, cozy space for unfiltered reflections. ☕',
    },
  ];

  const current = greetings[index];

  useEffect(() => {
    let timer;

    // PHASE 1: Type the dynamic text
    if (phase === 'typing') {
      if (displayedText.length < current.text.length) {
        timer = setTimeout(() => {
          setDisplayedText(current.text.slice(0, displayedText.length + 1));
        }, TYPE_SPEED);
      } else {
        Animated.timing(subFade, { toValue: 1, duration: 300, useNativeDriver: true }).start();
        setPhase('typingSub');
      }
      
    // PHASE 2: Type the SUBTEXT
    } else if (phase === 'typingSub') {
      if (displayedSub.length < current.sub.length) {
        timer = setTimeout(() => {
          setDisplayedSub(current.sub.slice(0, displayedSub.length + 1));
        }, SUB_TYPE_SPEED);
      } else {
        timer = setTimeout(() => setPhase('holding'), HOLD_DURATION);
      }

    // PHASE 3: Hold and wait
    } else if (phase === 'holding') {
      timer = setTimeout(() => {
        Animated.timing(subFade, { toValue: 0, duration: 200, useNativeDriver: true }).start();
        setPhase('erasing');
      }, 10);

    // PHASE 4: Erase the dynamic text
    } else if (phase === 'erasing') {
      if (displayedText.length > 0) {
        timer = setTimeout(() => {
          setDisplayedText(displayedText.slice(0, -1));
          if (displayedSub.length > 0 && displayedText.length <= current.text.length) {
            setDisplayedSub(displayedSub.slice(0, -1));
          }
        }, ERASE_SPEED);
      } else {
        timer = setTimeout(() => {
          setIndex((prev) => (prev + 1) % greetings.length);
          setPhase('typing');
        }, 200);
      }
    }

    return () => clearTimeout(timer);
  }, [phase, displayedText, displayedSub, current.text, current.sub]);

  const initial = (userName || '?').charAt(0).toUpperCase();

  return (
    <View style={styles.container}>
      <View style={styles.greetingRow}>
        <View style={styles.textContainer}>
          
          {/* COMBINED ROW: Static Name + Animated Text */}
          <View style={styles.titleRow}>
            {/* 1. The Static Name (NEVER changes) */}
            <Text style={styles.staticName} numberOfLines={1}>
              {firstName}
            </Text>
            
            {/* 2. The Animated Text (Icons Removed) */}
            <Text style={styles.animatedText} numberOfLines={1}>
              {displayedText}
              <Text style={styles.caret}>|</Text>
            </Text>
          </View>

          {/* SUBTEXT LINE: Types out smoothly */}
          <Animated.Text style={[styles.subText, { opacity: subFade }]} numberOfLines={1}>
            {displayedSub}
          </Animated.Text>
        </View>

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
    flexWrap: 'wrap',
  },
  
  // 1. Permanent Static Name
  staticName: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.onBackground,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -0.3,
    textTransform: 'lowercase',
  },
  
  // 2. Fully Animated Text (No icon)
  animatedText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.accent,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -0.3,
    textTransform: 'lowercase',
  },
  
  caret: {
    fontWeight: '300',
    color: colors.accent,
    opacity: 0.7,
  },
  
  subText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.onSurfaceVariant,
    marginTop: 4,
    textTransform: 'lowercase',
    minHeight: 18, 
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