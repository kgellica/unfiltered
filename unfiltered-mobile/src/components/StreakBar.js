import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Check } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';

const WEEKDAY_LABELS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function StreakBar({ streak = 0, entryDateSet }) {
  const today = new Date();
  const dow = today.getDay();
  const mondayOffset = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });

  const todayKey = toKey(today);

  return (
    <View style={styles.card}>
      
      {/* TOP ROW: Flame + Text */}
      <View style={styles.topRow}>
        <View style={[styles.flameCircle, streak > 0 && styles.flameCircleActive]}>
          {/* REPLACED HARCODED #FFFFFF WITH colors.accentInk */}
          <Flame size={22} color={streak > 0 ? colors.accentInk : colors.onSurfaceFaint} strokeWidth={2.2} />
        </View>
        <View style={styles.textContainer}>
          
          <View style={styles.countRow}>
            <Text style={styles.countText}>{streak} day streak</Text>
          </View>

          <Text style={styles.subText}>
            {streak > 0 ? 'keep the streak alive!' : 'first step taken! come back tomorrow'}
          </Text>
        </View>
      </View>

      {/* BOTTOM ROW: Days of the week strip */}
      <View style={styles.bottomRow}>
        {days.map((d) => {
          const key = toKey(d);
          const hasEntry = entryDateSet?.has(key);
          const isToday = key === todayKey;
          const isFuture = d > today && !isToday;
          return (
            <View key={key} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>
                {WEEKDAY_LABELS[(d.getDay() + 6) % 7]}
              </Text>
              <View
                style={[
                  styles.dayDot,
                  hasEntry && styles.dayDotFilled,
                  isFuture && styles.dayDotFuture,
                  isToday && !hasEntry && styles.dayDotToday,
                ]}
              >
                {hasEntry ? (
                  <Check size={12} color={colors.accentInk} strokeWidth={3.5} />
                ) : (
                  <Text style={[styles.dayNum, isToday && styles.dayNumToday]}>
                    {d.getDate()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.xl,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    flexDirection: 'column',
    alignItems: 'stretch',
    width: '100%',
    gap: 18,
  },
  
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  flameCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    flexShrink: 0,
  },
  flameCircleActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  textContainer: {
    flexShrink: 1,
  },
  
  countRow: { 
    flexDirection: 'row', 
    alignItems: 'baseline', 
    gap: 6,
    flexWrap: 'wrap',
  },
  countText: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: colors.onBackground,
    lineHeight: 28, 
    letterSpacing: -0.5,
  },
  subText: { 
    fontSize: 12, 
    fontWeight: '500', 
    color: colors.onSurfaceVariant, 
    marginTop: 2,
  },

  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  dayCol: { 
    alignItems: 'center', 
    gap: 8, 
    minWidth: 30,
  },
  dayLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: colors.onSurfaceFaint,
    letterSpacing: 0.3,
  },
  dayLabelToday: { 
    color: colors.accent,
    fontWeight: '800',
  },
  dayDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dayDotFilled: { 
    backgroundColor: colors.accent, 
    borderColor: colors.accent,
  },
  dayDotToday: { 
    borderColor: colors.accent, 
    borderWidth: 2,
    backgroundColor: colors.background,
  },
  dayDotFuture: { 
    opacity: 0.4,
  },
  dayNum: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: colors.onSurfaceFaint,
  },
  dayNumToday: { 
    color: colors.accent, 
    fontWeight: '900',
  },
});