import React, { useCallback, useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getEntriesByMonth } from '../api/entries';
import { colors, radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react-native';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

// ⭐️ FIX: Local Timezone Date Conversion (Uses Phone's exact clock)
function getTodayLocalString() {
  const now = new Date();
  // Adjust for the local timezone offset to get the real date correctly
  const offset = now.getTimezoneOffset() * 60000;
  const localISOTime = (new Date(now - offset)).toISOString().slice(0, -1);
  return localISOTime.split('T')[0];
}

function normalizeDateKey(val) {
  if (!val) return '';
  const match = String(val).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return '';
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

// FIX: Uses the local phone time, not UTC
function toDateKey(d) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatReflectionHeader(dateStr) {
  if (!dateStr) return 'Select a date';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  
  const todayStr = getTodayLocalString();
  const isToday = dateStr === todayStr;

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });
  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();

  if (isToday) {
    return `Reflections for today • ${weekday}, ${month} ${day}`;
  }
  return `Reflections for ${weekday}, ${month} ${day}`;
}

export default function CalendarScreen({ navigation }) {
  const { mode, accent } = useTheme(); // subscribe so styles rebuild with the current accent/mode
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const [cursor, setCursor] = useState(new Date());
  const [entriesByDate, setEntriesByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [loading, setLoading] = useState(false);

  const now = new Date();
  const todayStr = getTodayLocalString(); // ⭐️ Local phone date
  const isCurrentMonth = cursor.getFullYear() === now.getFullYear() && cursor.getMonth() === now.getMonth();

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`;
  const monthLabel = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getEntriesByMonth(monthKey);
      const map = {};
      data.forEach((e) => { 
        const key = normalizeDateKey(e.entry_date);
        if (key) {
          if (!map[key]) map[key] = [];
          map[key].push(e); 
        }
      });
      setEntriesByDate(map);
      
      if (map[todayStr] && map[todayStr].length > 0) {
        setSelectedDate(todayStr);
      } else {
        const dates = Object.keys(map).sort();
        setSelectedDate(dates.length > 0 ? dates[dates.length - 1] : null);
      }
    } catch (e) {
      setEntriesByDate({});
    } finally {
      setLoading(false);
    }
  }, [monthKey]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const firstDay = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();
  const cells = [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];

  const isFutureDay = (day) => {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return d > t;
  };

  const onSelectDay = (day) => {
    if (isFutureDay(day)) return;
    const dateStr = toDateKey(new Date(year, month, day));
    setSelectedDate(dateStr);
  };

  const handleCreateEntry = () => {
    const dateToUse = selectedDate || todayStr;
    const existing = entriesByDate[dateToUse] ? entriesByDate[dateToUse][0] : null;
    navigation.navigate('NewEntry', existing ? { date: dateToUse, entryId: existing.id } : { date: dateToUse });
  };

  const goPrevMonth = () => setCursor(new Date(year, month - 1, 1));
  const goNextMonth = () => {
    if (isCurrentMonth) return;
    setCursor(new Date(year, month + 1, 1));
  };

  const selectedEntries = selectedDate ? entriesByDate[selectedDate] || [] : [];
  const selectedDisplayDate = selectedDate ? formatReflectionHeader(selectedDate) : 'Select a date';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        <View style={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={goPrevMonth} hitSlop={16} style={styles.navBtn} accessibilityLabel="Previous month">
            <ChevronLeft size={22} color={colors.accent} strokeWidth={2.4} />
          </Pressable>
          <Text style={styles.monthLabel}>{monthLabel}</Text>
          <Pressable onPress={goNextMonth} hitSlop={16} style={[styles.navBtn, isCurrentMonth && styles.navBtnDisabled]} disabled={isCurrentMonth} accessibilityLabel="Next month">
            <ChevronRight size={22} color={isCurrentMonth ? colors.onSurfaceVariant : colors.accent} strokeWidth={2.4} />
          </Pressable>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((d, i) => <Text key={i} style={styles.weekday}>{d}</Text>)}
        </View>

        <View style={styles.grid}>
          {cells.map((day, i) => {
            if (!day) return <View key={i} style={styles.cell} />;
            const dateStr = toDateKey(new Date(year, month, day));
            const dayEntries = entriesByDate[dateStr] || [];
            const hasEntry = dayEntries.length > 0;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const future = isFutureDay(day);
            
            return (
              <Pressable key={i} style={styles.cell} onPress={() => onSelectDay(day)} disabled={future} hitSlop={2}>
                <View 
                  style={[
                    styles.dayCircle, 
                    isToday && !isSelected && styles.dayCircleToday, 
                    isSelected && styles.dayCircleSelected,         
                    future && styles.dayCircleFuture
                  ]}
                >
                  <Text 
                    style={[
                      styles.dayText, 
                      isToday && !isSelected && styles.dayTextToday, 
                      isSelected && styles.dayTextSelected,          
                      future && styles.dayTextFuture
                    ]}
                  >
                    {day}
                  </Text>
                  
                  {hasEntry && !isSelected && <View style={styles.entryDot} />}
                </View>
              </Pressable>
            );
          })}
        </View>

        <Pressable style={styles.createEntryAction} onPress={handleCreateEntry}>
          <Text style={styles.createEntryActionText}>
            {selectedEntries.length > 0 ? '+ edit entry for this day' : '+ write entry for this day'}
          </Text>
        </Pressable>

        <View style={styles.activitySection}>
          <View style={styles.activityHeader}>
            <Text style={styles.activityTitle}>{selectedDisplayDate}</Text>
            {selectedEntries.length > 0 && (
              <Text style={styles.entryCount}>{selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'}</Text>
            )}
          </View>
          
          {selectedEntries.length > 0 ? (
            <View style={styles.entriesList}>
              {selectedEntries.map((entry) => (
                <Pressable 
                  key={entry.id}
                  style={styles.activityCard} 
                  onPress={() => navigation.navigate('NewEntry', { entryId: entry.id })}
                >
                  <Text style={styles.activityEntryTitle}>{entry.title || 'untitled reflection'}</Text>
                  <Text style={styles.activityEntryPreview} numberOfLines={2}>
                    {(entry.content || '').replace(/<[^>]+>/g, ' ').trim() || 'no content written yet...'}
                  </Text>
                  <View style={styles.activityEntryFooter}>
                    <Text style={styles.activityEntryMood}>{entry.mood ? `✨ ${entry.mood}` : ''}</Text>
                    <Text style={styles.activityEntryOpen}>open ›</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          ) : (
            <View style={styles.emptyActivity}>
              <CalendarIcon size={24} color={colors.onSurfaceFaint} strokeWidth={1.8} />
              <Text style={styles.emptyActivityText}>
                {selectedDate ? 'no entry for this day yet' : 'select a day to view journal activity'}
              </Text>
            </View>
          )}
        </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CELL_SIZE = '14.28%';

const createStyles = () => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  flex: { flex: 1 },
  container: { paddingBottom: 40 },
  content: { paddingHorizontal: spacing.gutter },

  headerContainer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 0,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onBackground,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -0.5,
  },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  navBtn: { padding: 8, borderRadius: radius.md },
  navBtnDisabled: { opacity: 0.35 },
  monthLabel: { fontSize: 18, fontWeight: '700', color: colors.onBackground },

  weekRow: { flexDirection: 'row', marginBottom: 6 },
  weekday: { width: CELL_SIZE, textAlign: 'center', fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: CELL_SIZE, aspectRatio: 1, alignItems: 'center', justifyContent: 'center' },
  
  dayCircle: { 
    width: 40,
    height: 40, 
    borderRadius: radius.md, 
    alignItems: 'center', 
    justifyContent: 'center', 
    position: 'relative',
    backgroundColor: 'transparent',
  },
  dayCircleToday: { 
    backgroundColor: colors.accent, 
    borderWidth: 0, 
  },
  dayCircleSelected: { 
    backgroundColor: colors.accent, 
    borderWidth: 0,
  },
  dayCircleFuture: { opacity: 0.3 },
  
  dayText: { fontSize: 14, color: colors.onSurface, fontWeight: '600' },
  dayTextToday: { fontWeight: '800', color: colors.accentInk }, 
  dayTextSelected: { fontWeight: '900', color: colors.accentInk }, 
  dayTextFuture: { color: colors.onSurfaceVariant },
  
  entryDot: {
    position: 'absolute',
    bottom: 2,
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.accent,
  },

  createEntryAction: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    marginTop: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  createEntryActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },

  activitySection: {
    marginTop: 8,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  activityTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.onSurface,
  },
  entryCount: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },

  entriesList: {
    gap: 10,
  },
  activityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    padding: 14,
  },
  activityEntryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 4,
  },
  activityEntryPreview: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  activityEntryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  activityEntryMood: {
    fontSize: 12,
    color: colors.onSurfaceVariant,
  },
  activityEntryOpen: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
    gap: 8,
  },
  emptyActivityText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
});