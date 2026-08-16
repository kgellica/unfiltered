import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NotebookText, Images, Camera, Mic, ArrowDownUp, Calendar, X } from 'lucide-react-native';
import { listEntries } from '../api/entries';
import { colors, radius, spacing, cardShadow } from '../theme/theme';

const FILTERS = [
  { key: 'all', label: 'All', Icon: Images },
  { key: 'photos', label: 'Photos', Icon: Camera },
  { key: 'voice', label: 'Voice', Icon: Mic },
];

const SORTS = [
  { key: 'newest', label: 'Newest first' },
  { key: 'oldest', label: 'Oldest first' },
];

// Groups by calendar month for the date filter, newest month first.
function monthKeyOf(dateStr) {
  return String(dateStr || '').slice(0, 7); // 'YYYY-MM'
}
function monthLabelOf(key) {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function MemoriesScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [monthFilter, setMonthFilter] = useState(''); // '' = all months

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await listEntries());
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const availableMonths = useMemo(() => {
    const s = new Set();
    entries.forEach((e) => {
      if (e.photo_path || e.voice_path) s.add(monthKeyOf(e.entry_date));
    });
    return Array.from(s).sort().reverse();
  }, [entries]);

  const visibleEntries = useMemo(() => {
    let list = entries.filter((e) => {
      if (filter === 'photos') return !!e.photo_path;
      if (filter === 'voice') return !!e.voice_path;
      return !!e.photo_path || !!e.voice_path;
    });
    if (monthFilter) {
      list = list.filter((e) => monthKeyOf(e.entry_date) === monthFilter);
    }
    list = [...list].sort((a, b) => {
      const cmp = String(a.entry_date || '').localeCompare(String(b.entry_date || ''));
      return sortOrder === 'newest' ? -cmp : cmp;
    });
    return list;
  }, [entries, filter, monthFilter, sortOrder]);

  const hasDateFilter = Boolean(monthFilter);

  return (
    <View style={styles.flex}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>memories</Text>
        <Pressable
          onPress={() => setSortMenuOpen((v) => !v)}
          style={[styles.sortBtn, sortMenuOpen && styles.sortBtnActive]}
          accessibilityRole="button"
          accessibilityLabel="Sort memories by date"
        >
          <ArrowDownUp size={13} color={sortMenuOpen ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
          <Text style={[styles.sortBtnText, sortMenuOpen && styles.sortBtnTextActive]}>
            {SORTS.find((s) => s.key === sortOrder)?.label}
          </Text>
        </Pressable>
      </View>

      {sortMenuOpen && (
        <View style={styles.sortMenu}>
          {SORTS.map((s) => (
            <Pressable
              key={s.key}
              onPress={() => { setSortOrder(s.key); setSortMenuOpen(false); }}
              style={styles.sortMenuItem}
            >
              <Text style={[styles.sortMenuItemText, sortOrder === s.key && styles.sortMenuItemTextActive]}>
                {s.label}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Top selector: All / Photos / Voice — lets the user quickly narrow
          down which kind of memory they're looking for. */}
      <View style={styles.filterRow}>
        {FILTERS.map(({ key, label, Icon }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              onPress={() => setFilter(key)}
              style={[styles.filterChip, active && styles.filterChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
              accessibilityLabel={`Show ${label}`}
            >
              <Icon size={15} color={active ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
              <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      {/* Month filter — lets the person jump to a specific journal's date */}
      {availableMonths.length > 1 && (
        <FlatList
          horizontal
          data={availableMonths}
          keyExtractor={(k) => k}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.monthRow}
          renderItem={({ item: key }) => {
            const active = monthFilter === key;
            return (
              <Pressable
                onPress={() => setMonthFilter(active ? '' : key)}
                style={[styles.monthChip, active && styles.monthChipActive]}
              >
                <Calendar size={12} color={active ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
                <Text style={[styles.monthChipText, active && styles.monthChipTextActive]}>
                  {monthLabelOf(key)}
                </Text>
              </Pressable>
            );
          }}
        />
      )}

      {hasDateFilter && (
        <Pressable onPress={() => setMonthFilter('')} style={styles.clearDateFilter}>
          <X size={12} color={colors.primary} strokeWidth={2.6} />
          <Text style={styles.clearDateFilterText}>clear date filter</Text>
        </Pressable>
      )}

      <FlatList
        style={styles.flex}
        contentContainerStyle={styles.container}
        data={visibleEntries}
        keyExtractor={(item) => String(item.id)}
        refreshing={loading}
        onRefresh={load}
        ListEmptyComponent={
          !loading && (
            <View style={styles.emptyState}>
              <Images size={28} color={colors.accent} strokeWidth={1.8} />
              <Text style={styles.empty}>
                {filter === 'photos' ? 'No photo memories yet.' : filter === 'voice' ? 'No voice memories yet.' : 'No memories yet. Start journaling!'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => navigation.navigate('NewEntry', { entryId: item.id })}>
            {item.photo_path ? (
              <Image source={{ uri: item.photo_path }} style={styles.thumb} />
            ) : (
              <View style={[styles.thumb, styles.thumbPlaceholder]}>
                {item.voice_path ? (
                  <Mic size={20} color={colors.tertiary} strokeWidth={1.8} />
                ) : (
                  <NotebookText size={20} color={colors.tertiary} strokeWidth={1.8} />
                )}
              </View>
            )}
            <View style={styles.cardBody}>
              <Text style={styles.cardDate}>{item.entry_date}</Text>
              <Text style={styles.cardTitle} numberOfLines={1}>{item.title || '(untitled)'}</Text>
              <Text style={styles.cardPreview} numberOfLines={2}>{item.content}</Text>
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.gutter,
    paddingTop: 14,
  },
  headerTitle: { fontSize: 20, fontWeight: '800', color: colors.onBackground },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  sortBtnActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  sortBtnText: { fontSize: 11.5, fontWeight: '700', color: colors.onSurfaceVariant },
  sortBtnTextActive: { color: colors.accentInk },
  sortMenu: {
    marginHorizontal: spacing.gutter,
    marginTop: 8,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
    ...cardShadow,
  },
  sortMenuItem: { paddingHorizontal: 14, paddingVertical: 12 },
  sortMenuItemText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  sortMenuItemTextActive: { color: colors.accent, fontWeight: '800' },
  monthRow: { paddingHorizontal: spacing.gutter, gap: 8, paddingTop: 4, paddingBottom: 2 },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    marginRight: 8,
  },
  monthChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  monthChipText: { fontSize: 11.5, fontWeight: '700', color: colors.onSurfaceVariant },
  monthChipTextActive: { color: colors.accentInk },
  clearDateFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-end',
    marginRight: spacing.gutter,
    marginTop: 4,
  },
  clearDateFilterText: { fontSize: 11, fontWeight: '700', color: colors.primary },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.gutter,
    paddingTop: 14,
    paddingBottom: 10,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  filterChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterChipText: { fontSize: 12.5, fontWeight: '700', color: colors.onSurfaceVariant },
  filterChipTextActive: { color: colors.accentInk },
  container: { padding: spacing.gutter, paddingTop: 4, paddingBottom: 100 },
  empty: { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 8 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 8 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    marginBottom: 12,
    overflow: 'hidden',
    ...cardShadow,
  },
  thumb: { width: 72, height: 72 },
  thumbPlaceholder: { backgroundColor: colors.tertiaryContainer, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 10, justifyContent: 'center' },
  cardDate: { fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface, marginVertical: 2 },
  cardPreview: { fontSize: 12, color: colors.onSurfaceVariant },
});

