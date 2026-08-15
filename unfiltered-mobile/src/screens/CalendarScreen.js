import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEntriesByMonth } from '../api/entries';
import { colors, radius, spacing } from '../theme/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen({ navigation }) {
  const [cursor, setCursor] = useState(new Date());
  const [entryDates, setEntryDates] = useState(new Set());

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });

  const load = useCallback(async () => {
    try {
      const data = await getEntriesByMonth(monthKey);
      setEntryDates(new Set(data.map((e) => e.entry_date)));
    } catch (e) {
      setEntryDates(new Set());
    }
  }, [monthKey]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const onSelectDay = (day) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    navigation.navigate('NewEntry', { date: dateStr });
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => setCursor(new Date(year, month - 1, 1))}><Text style={styles.nav}>‹</Text></Pressable>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <Pressable onPress={() => setCursor(new Date(year, month + 1, 1))}><Text style={styles.nav}>›</Text></Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((d, i) => <Text key={i} style={styles.weekday}>{d}</Text>)}
      </View>

      <View style={styles.grid}>
        {cells.map((day, i) => {
          if (!day) return <View key={i} style={styles.cell} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const hasEntry = entryDates.has(dateStr);
          return (
            <Pressable key={i} style={styles.cell} onPress={() => onSelectDay(day)}>
              <View style={[styles.dayCircle, hasEntry && styles.dayHasEntry]}>
                <Text style={[styles.dayText, hasEntry && styles.dayTextHasEntry]}>{day}</Text>
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
  nav: { fontSize: 24, fontWeight: '700', color: colors.primary, paddingHorizontal: 12 },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.onBackground },
  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { width: CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  dayHasEntry: { backgroundColor: colors.primaryContainer, borderWidth: 2, borderColor: colors.primary },
  dayText: { fontSize: 13, color: colors.onSurface },
  dayTextHasEntry: { fontWeight: '700', color: colors.primary },
});
