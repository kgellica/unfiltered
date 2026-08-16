import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEntriesByMonth } from '../api/entries';
import { colors, radius, spacing } from '../theme/theme';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react-native';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen({ navigation }) {
  const [cursor, setCursor] = useState(new Date());
  const [entriesByDate, setEntriesByDate] = useState({});

  const now = new Date();
  const isCurrentMonth = cursor.getFullYear() === now.getFullYear() && cursor.getMonth() === now.getMonth();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });

  const load = useCallback(async () => {
    try {
      const data = await getEntriesByMonth(monthKey);
      const map = {};
      data.forEach((e) => { map[e.entry_date] = e; });
      setEntriesByDate(map);
    } catch (e) {
      setEntriesByDate({});
    }
  }, [monthKey]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const isFutureDay = (day) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d > t;
  };

  const onSelectDay = (day) => {
    if (isFutureDay(day)) return; // no journaling ahead of today
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    const existing = entriesByDate[dateStr];
    // If a reflection already exists for that day, open it for editing
    // instead of starting a blank duplicate entry.
    navigation.navigate('NewEntry', existing ? { date: dateStr, entryId: existing.id } : { date: dateStr });
  };

  const todayEntry = entriesByDate[todayStr];
  const onCreateToday = () => {
    navigation.navigate('NewEntry', todayEntry ? { date: todayStr, entryId: todayEntry.id } : { date: todayStr });
  };

  const goPrevMonth = () => setCursor(new Date(year, month - 1, 1));
  const goNextMonth = () => {
    if (isCurrentMonth) return; // never navigate into a future month
    setCursor(new Date(year, month + 1, 1));
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={goPrevMonth}
          hitSlop={16}
          style={styles.navBtn}
          accessibilityLabel="Previous month"
        >
          <ChevronLeft size={22} color={colors.accent} strokeWidth={2.4} />
        </Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable
          onPress={goNextMonth}
          hitSlop={16}
          style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]}
          disabled={isCurrentMonth}
          accessibilityLabel="Next month"
        >
          <ChevronRight size={22} color={isCurrentMonth ? colors.onSurfaceVariant : colors.accent} strokeWidth={2.4} />
        </Pressable>
      </View>

      <Pressable style={styles.createEntryBtn} onPress={onCreateToday}>
        <Plus size={16} color="#fff" strokeWidth={2.6} />
        <Text style={styles.createEntryBtnText}>
          {todayEntry ? 'edit today\u2019s entry' : 'create entry for today'}
        </Text>
      </Pressable>

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: colors.primary }]} />
          <Text style={styles.legendText}>reflection saved</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendDotToday]} />
          <Text style={styles.legendText}>today</Text>
        </View>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => <Text key={i} style={styles.weekday}>{d}</Text>)}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={styles.cell} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEntry = !!entriesByDate[dateStr];
          const isToday = dateStr === todayStr;
          const future = isFutureDay(day);
          return (
            <Pressable
              key={i}
              style={styles.cell}
              onPress={() => onSelectDay(day)}
              disabled={future}
              hitSlop={2}
            >
              <View
                style={[
                  styles.dayCircle,
                  hasEntry && styles.dayHasEntry,
                  isToday && !hasEntry && styles.dayIsToday,
                  future && styles.dayFuture,
                ]}
              >
                <Text
                  style={[
                    styles.dayText,
                    hasEntry && styles.dayTextHasEntry,
                    future && styles.dayTextFuture,
                  ]}
                >
                  {day}
                </Text>
                {hasEntry && <View style={styles.entryDot} />}
              </View>
            </Pressable>
          );
        })}
      </View>
    </ScrollView>
  );
}

const CELL_SIZE = '14.28%';

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  navBtn: { padding: 8, borderRadius: radius.md },
  navBtnDisabled: { opacity: 0.35 },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.onBackground },

  createEntryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 12,
    marginBottom: 14,
  },
  createEntryBtnText: { color: '#fff', fontWeight: '800', fontSize: 13 },

  legendRow: { flexDirection: 'row', gap: 16, marginBottom: 14, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendDotToday: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.accent },
  legendText: { fontSize: 11, fontWeight: '600', color: colors.onSurfaceVariant },

  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { width: CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 38, height: 38, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', position: 'relative' },
  dayHasEntry: { backgroundColor: colors.primaryContainer, borderWidth: 2, borderColor: colors.primary },
  dayIsToday: { borderWidth: 1.5, borderColor: colors.accent },
  dayFuture: { opacity: 0.3 },
  dayText: { fontSize: 13, color: colors.onSurface },
  dayTextHasEntry: { fontWeight: '700', color: colors.primary },
  dayTextFuture: { color: colors.onSurfaceVariant },
  entryDot: {
    position: 'absolute',
    bottom: 3,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});