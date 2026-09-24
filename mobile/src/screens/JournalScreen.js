import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  SafeAreaView,
  StatusBar,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listEntries, getStats } from '../api/entries';
import { colors, radius, spacing, cardShadow } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { Plus, Search, X, Sparkles, ChevronDown, Calendar, Tag, Check } from 'lucide-react-native';
import StreakBar from '../components/StreakBar';
import RemindersHeaderButton from '../components/RemindersHeaderButton';
import EntryCard from '../components/journal/EntryCard';
import { normalizeDateKey, toDateKey } from '../components/journal/journalDateUtils';

export default function JournalScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [streak, setStreak] = useState(0);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, statsRes] = await Promise.all([listEntries(), getStats()]);
      setEntries(entriesRes || []);
      setStreak(statsRes?.current_streak || 0);
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const entryDateSet = useMemo(
    () => new Set(entries.map((e) => normalizeDateKey(e.entry_date))),
    [entries]
  );

  const recentDays = useMemo(() => {
    const out = [];
    const base = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      out.push(d);
    }
    return out;
  }, []);

  const allTags = useMemo(() => {
    const s = new Set();
    entries.forEach((e) => (e.tags || []).forEach((t) => s.add(typeof t === 'string' ? t : t.name)));
    return Array.from(s);
  }, [entries]);

  const visibleEntries = useMemo(() => {
    return entries.filter((e) => {
      if (selectedDate && normalizeDateKey(e.entry_date) !== selectedDate) return false;
      if (
        selectedTag &&
        !(e.tags || []).some((t) => (typeof t === 'string' ? t : t.name).toLowerCase() === selectedTag.toLowerCase())
      ) {
        return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const inTitle = (e.title || '').toLowerCase().includes(q);
        const inContent = (e.content || '').toLowerCase().includes(q);
        if (!inTitle && !inContent) return false;
      }
      return true;
    });
  }, [entries, query, selectedTag, selectedDate]);

  const hasFilters = Boolean(query || selectedTag || selectedDate);

  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return 'any date';
    const match = recentDays.find((d) => toDateKey(d) === selectedDate);
    if (!match) {
      const [y, m, d] = selectedDate.split('-');
      const dateObj = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return match.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedDate, recentDays]);

  const selectedTagLabel = selectedTag || 'all tags';
  const todayStr = toDateKey(new Date());
  const yesterdayStr = toDateKey(new Date(new Date().setDate(new Date().getDate() - 1)));

  const handlePresetPress = (dateKey) => {
    setSelectedDate(dateKey);
    setDateMenuOpen(false);
    setCalendarOpen(false);
  };

  const handleDaySelect = (dateKey) => {
    setSelectedDate(dateKey);
    setCalendarOpen(false);
    setDateMenuOpen(false);
  };

  const openDatePicker = () => {
    if (selectedDate) {
      const [y, m, d] = selectedDate.split('-').map(Number);
      setVisibleMonth(new Date(y, m - 1, 1));
    } else {
      setVisibleMonth(new Date());
    }
    setCalendarOpen(true);
  };

  const renderEntryItem = useCallback(
    ({ item }) => (
      <EntryCard
        item={item}
        onPress={() => navigation.navigate('NewEntry', { entryId: item.id })}
      />
    ),
    [navigation]
  );

  // ── Date Filter Modal ──────────────────────────────────────────────
  const DateFilterModal = () => (
    <Modal visible={dateMenuOpen} transparent animationType="fade" onRequestClose={() => setDateMenuOpen(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setDateMenuOpen(false)}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Filter by date</Text>

          <TouchableOpacity style={styles.modalOption} onPress={() => handlePresetPress('')}>
            <Text style={[styles.modalOptionText, !selectedDate && styles.modalOptionTextActive]}>Any date</Text>
            {!selectedDate && <Check size={16} color={colors.accent} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalOption} onPress={() => handlePresetPress(todayStr)}>
            <Text style={[styles.modalOptionText, selectedDate === todayStr && styles.modalOptionTextActive]}>Today</Text>
            {selectedDate === todayStr && <Check size={16} color={colors.accent} />}
          </TouchableOpacity>

          <TouchableOpacity style={styles.modalOption} onPress={() => handlePresetPress(yesterdayStr)}>
            <Text style={[styles.modalOptionText, selectedDate === yesterdayStr && styles.modalOptionTextActive]}>Yesterday</Text>
            {selectedDate === yesterdayStr && <Check size={16} color={colors.accent} />}
          </TouchableOpacity>

          <View style={styles.modalDivider} />

          <ScrollView style={{ maxHeight: 220 }} showsVerticalScrollIndicator={false}>
            {recentDays.map((d) => {
              const key = toDateKey(d);
              const label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
              return (
                <TouchableOpacity key={key} style={styles.modalOption} onPress={() => handlePresetPress(key)}>
                  <Text style={[styles.modalOptionText, selectedDate === key && styles.modalOptionTextActive]}>{label}</Text>
                  {selectedDate === key && <Check size={16} color={colors.accent} />}
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <View style={styles.modalDivider} />

          <TouchableOpacity style={styles.modalOption} onPress={openDatePicker}>
            <Calendar size={16} color={colors.accent} />
            <Text style={[styles.modalOptionText, { marginLeft: 8, color: colors.accent }]}>Pick a specific date</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ── Tag Filter Modal ───────────────────────────────────────────────
  const TagFilterModal = () => (
    <Modal visible={tagMenuOpen} transparent animationType="fade" onRequestClose={() => setTagMenuOpen(false)}>
      <Pressable style={styles.modalOverlay} onPress={() => setTagMenuOpen(false)}>
        <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
          <Text style={styles.modalTitle}>Filter by tag</Text>

          <TouchableOpacity style={styles.modalOption} onPress={() => { setSelectedTag(''); setTagMenuOpen(false); }}>
            <Text style={[styles.modalOptionText, !selectedTag && styles.modalOptionTextActive]}>All tags</Text>
            {!selectedTag && <Check size={16} color={colors.accent} />}
          </TouchableOpacity>

          <View style={styles.modalDivider} />

          <ScrollView style={{ maxHeight: 260 }} showsVerticalScrollIndicator={false}>
            {allTags.length === 0 ? (
              <Text style={styles.modalEmptyText}>No tags yet</Text>
            ) : (
              allTags.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={styles.modalOption}
                  onPress={() => { setSelectedTag(tag); setTagMenuOpen(false); }}
                >
                  <View style={styles.tagRow}>
                    <View style={[styles.tagDot, { backgroundColor: colors.accent }]} />
                    <Text style={[styles.modalOptionText, selectedTag === tag && styles.modalOptionTextActive]}>{tag}</Text>
                  </View>
                  {selectedTag === tag && <Check size={16} color={colors.accent} />}
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );

  // ── Calendar Modal ─────────────────────────────────────────────────
  const CalendarModal = () => {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthName = visibleMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const days = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);

    return (
      <Modal visible={calendarOpen} transparent animationType="fade" onRequestClose={() => setCalendarOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setCalendarOpen(false)}>
          <Pressable style={styles.modalSheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.calendarHeader}>
              <TouchableOpacity onPress={() => setVisibleMonth(new Date(year, month - 1, 1))}>
                <ChevronDown size={20} color={colors.onSurfaceVariant} style={{ transform: [{ rotate: '90deg' }] }} />
              </TouchableOpacity>
              <Text style={styles.calendarMonthText}>{monthName}</Text>
              <TouchableOpacity onPress={() => setVisibleMonth(new Date(year, month + 1, 1))}>
                <ChevronDown size={20} color={colors.onSurfaceVariant} style={{ transform: [{ rotate: '-90deg' }] }} />
              </TouchableOpacity>
            </View>

            <View style={styles.calendarWeekRow}>
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                <Text key={d} style={styles.calendarWeekDay}>{d}</Text>
              ))}
            </View>

            <View style={styles.calendarGrid}>
              {days.map((day, idx) => {
                if (day === null) return <View key={`empty-${idx}`} style={styles.calendarCell} />;
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isSelected = selectedDate === dateKey;
                const isToday = dateKey === todayStr;
                return (
                  <TouchableOpacity
                    key={dateKey}
                    style={[styles.calendarCell, isSelected && styles.calendarCellSelected]}
                    onPress={() => handleDaySelect(dateKey)}
                  >
                    <Text style={[
                      styles.calendarDayText,
                      isToday && !isSelected && { color: colors.accent, fontWeight: '800' },
                      isSelected && { color: colors.accentInk, fontWeight: '800' },
                    ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.flex}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Journal</Text>
          <RemindersHeaderButton navigation={navigation} />
        </View>

        <View style={styles.streakWrapper}>
          <StreakBar streak={streak} entryDateSet={entryDateSet} />
        </View>

        <View style={styles.controlsRow}>
          <View style={styles.searchPill}>
            <Search size={16} color={colors.onSurfaceFaint} style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="search your thoughts..."
              placeholderTextColor={colors.onSurfaceFaint}
              value={query}
              onChangeText={setQuery}
              returnKeyType="search"
              accessibilityLabel="Search journal entries"
            />
            {query.length > 0 && (
              <Pressable onPress={() => setQuery('')} hitSlop={8} accessibilityLabel="Clear search">
                <X size={16} color={colors.onSurfaceFaint} />
              </Pressable>
            )}
          </View>
        </View>

        <View style={styles.filterPillsRow}>
          <Pressable
            style={[styles.filterPill, selectedDate && styles.filterPillActive]}
            onPress={() => setDateMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter by date"
          >
            <Calendar size={13} color={selectedDate ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
            <Text style={[styles.filterPillText, selectedDate && styles.filterPillTextActive]}>
              {selectedDateLabel}
            </Text>
            <ChevronDown size={13} color={selectedDate ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
          </Pressable>

          <Pressable
            style={[styles.filterPill, selectedTag && styles.filterPillActive]}
            onPress={() => setTagMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter by tag"
          >
            <Tag size={13} color={selectedTag ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
            <Text style={[styles.filterPillText, selectedTag && styles.filterPillTextActive]}>
              {selectedTagLabel}
            </Text>
            <ChevronDown size={13} color={selectedTag ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
          </Pressable>

          {hasFilters && (
            <Pressable
              style={styles.clearFilters}
              onPress={() => {
                setQuery('');
                setSelectedTag('');
                setSelectedDate('');
              }}
              accessibilityRole="button"
              accessibilityLabel="Clear all filters"
            >
              <Text style={styles.clearFiltersText}>clear all</Text>
            </Pressable>
          )}
        </View>

        <DateFilterModal />
        <TagFilterModal />
        <CalendarModal />

        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          data={visibleEntries}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={
            !loading && (
              <View style={styles.empty}>
                <Sparkles size={26} color={colors.accent} style={{ marginBottom: 8 }} />
                <Text style={styles.emptyTitle}>
                  {hasFilters ? 'no entries match your filters' : 'no entries yet'}
                </Text>
                <Text style={styles.emptySub}>
                  {hasFilters ? 'try clearing your search or tag filter.' : 'tap the + button below to write your first thought today.'}
                </Text>
              </View>
            )
          }
          renderItem={renderEntryItem}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={5}
          removeClippedSubviews
        />

        <Pressable
          style={({ pressed }) => [styles.fab, pressed && { transform: [{ scale: 0.94 }] }]}
          onPress={() => navigation.navigate('NewEntry')}
          accessibilityRole="button"
          accessibilityLabel="Write a new journal entry"
        >
          <Plus size={26} color={colors.accentInk} strokeWidth={2.5} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
    },
    flex: { flex: 1 },
    headerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
    streakWrapper: {
      paddingHorizontal: spacing.gutter,
      marginBottom: 16,
      width: '100%',
      overflow: 'hidden',
    },
    fab: {
      position: 'absolute',
      right: spacing.gutter,
      bottom: 24,
      width: 58,
      height: 58,
      borderRadius: radius.full,
      backgroundColor: colors.accent,
      alignItems: 'center',
      justifyContent: 'center',
      ...cardShadow,
      shadowOpacity: 0.25,
      zIndex: 20,
    },
    searchIcon: { marginRight: -2 },
    searchInput: {
      flex: 1,
      paddingVertical: 12,
      fontSize: 14,
      color: colors.onSurface,
    },
    controlsRow: {
      paddingHorizontal: spacing.gutter,
      marginBottom: 10,
    },
    searchPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1.5,
      borderColor: colors.outlineVariant,
      borderRadius: radius.full,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
    },
    filterPillsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingHorizontal: spacing.gutter,
      marginBottom: 12,
    },
    filterPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.borderSoft,
    },
    filterPillActive: {
      backgroundColor: colors.accent,
      borderColor: colors.accent,
    },
    filterPillText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.onSurfaceVariant,
    },
    filterPillTextActive: {
      color: colors.accentInk,
    },
    clearFilters: {
      marginLeft: 'auto',
      paddingVertical: 4,
      paddingHorizontal: 4,
    },
    clearFiltersText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: colors.accent,
    },
    listContent: {
      paddingHorizontal: spacing.gutter,
      paddingBottom: 40,
      gap: 12,
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.onSurface,
      marginBottom: 4,
      textAlign: 'center',
    },
    emptySub: {
      fontSize: 12,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
    },

    // ── Modal styles ─────────────────────────────────────────────────
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.35)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 24,
    },
    modalSheet: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: colors.surface,
      borderRadius: radius.lg || 16,
      padding: 20,
      ...cardShadow,
      shadowOpacity: 0.15,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.onSurface,
      marginBottom: 12,
    },
    modalOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 4,
      borderRadius: 8,
    },
    modalOptionText: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      fontWeight: '500',
    },
    modalOptionTextActive: {
      color: colors.accent,
      fontWeight: '700',
    },
    modalDivider: {
      height: 1,
      backgroundColor: colors.outlineVariant,
      marginVertical: 8,
    },
    modalEmptyText: {
      fontSize: 13,
      color: colors.onSurfaceFaint,
      textAlign: 'center',
      paddingVertical: 16,
    },
    tagRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    tagDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },

    // ── Calendar styles ──────────────────────────────────────────────
    calendarHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    calendarMonthText: {
      fontSize: 15,
      fontWeight: '800',
      color: colors.onSurface,
    },
    calendarWeekRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 8,
    },
    calendarWeekDay: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.onSurfaceFaint,
      width: 36,
      textAlign: 'center',
    },
    calendarGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-around',
    },
    calendarCell: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: 2,
    },
    calendarCellSelected: {
      backgroundColor: colors.accent,
    },
    calendarDayText: {
      fontSize: 13,
      color: colors.onSurface,
      fontWeight: '500',
    },
  });