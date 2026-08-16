import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Flame, Check } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';

const WEEKDAY_LABELS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

function toKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Mirrors the web app's streak card: flame + count on the left, a
// mon–sun strip of the current week on the right with a check on days
// that have an entry.
export default function StreakBar({ streak = 0, entryDateSet }) {
  const today = new Date();
  // Monday-start week containing today.
  const dow = today.getDay(); // 0 = Sun
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
      <View style={styles.left}>
        <Flame size={30} color={streak > 0 ? colors.accent : colors.onSurfaceFaint} strokeWidth={2} style={styles.flameIcon} />
        <View>
          <View style={styles.countRow}>
            <Text style={styles.countText}>{streak}</Text>
            <Text style={styles.countLabel}>day streak</Text>
          </View>
          <Text style={styles.subText}>
            {streak > 0 ? 'keep the streak alive! ✨' : 'first step taken! come back tomorrow 🌸'}
          </Text>
        </View>
      </View>

      <View style={styles.weekWrap}>
        {days.map((d) => {
          const key = toKey(d);
          const hasEntry = entryDateSet?.has(key);
          const isToday = key === todayKey;
          const isFuture = d > today && !isToday;
          return (
            <View key={key} style={styles.dayCol}>
              <Text style={[styles.dayLabel, isToday && styles.dayLabelToday]}>{WEEKDAY_LABELS[(d.getDay() + 6) % 7]}</Text>
              <View
                style={[
                  styles.dayDot,
                  hasEntry && styles.dayDotFilled,
                  isFuture && styles.dayDotFuture,
                ]}
              >
                {hasEntry ? (
                  <Check size={12} color="#fff" strokeWidth={3} />
                ) : (
                  <Text style={styles.dayNum}>{d.getDate()}</Text>
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
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 10, flexShrink: 1 },
  flameIcon: { marginRight: 2 },
  countRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6 },
  countText: { fontSize: 24, fontWeight: '800', color: colors.onBackground },
  countLabel: { fontSize: 13.5, fontWeight: '700', color: colors.accent },
  subText: { fontSize: 11.5, fontWeight: '500', color: colors.onSurfaceVariant, marginTop: 1 },
  weekWrap: { flexDirection: 'row', gap: 6 },
  dayCol: { alignItems: 'center', gap: 4, minWidth: 24 },
  dayLabel: { fontSize: 9.5, fontWeight: '700', color: colors.onSurfaceFaint },
  dayLabelToday: { color: colors.accent },
  dayDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  dayDotFilled: { backgroundColor: colors.accent, borderColor: colors.accent },
  dayDotFuture: { opacity: 0.4 },
  dayNum: { fontSize: 9.5, fontWeight: '700', color: colors.onSurfaceFaint },
});
