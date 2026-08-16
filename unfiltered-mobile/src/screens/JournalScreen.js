import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listEntries } from '../api/entries';
import { colors, radius, spacing, pixelShadow } from '../theme/theme';

const MOOD_META = {
  great: { label: 'great', emoji: '😄' },
  good: { label: 'good', emoji: '🌸' },
  okay: { label: 'okay', emoji: '☁️' },
  low: { label: 'low', emoji: '🌧️' },
  sad: { label: 'sad', emoji: '🧸' },
};

function normalizeDateKey(val) {
  if (!val) return '';
  const match = String(val).match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (!match) return '';
  const [, y, m, d] = match;
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function formatShortDate(val) {
  const key = normalizeDateKey(val);
  if (!key) return '';
  const [y, m, d] = key.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const today = new Date();
  const isToday =
    target.getFullYear() === today.getFullYear() &&
    target.getMonth() === today.getMonth() &&
    target.getDate() === today.getDate();
  const weekday = target.toLocaleDateString('en-US', { weekday: 'short' });
  const month = target.toLocaleDateString('en-US', { month: 'short' });
  return isToday ? `Today, ${month} ${target.getDate()}` : `${weekday}, ${month} ${target.getDate()}`;
}

export default function JournalScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');

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

  const allTags = useMemo(() => {
    const s = new Set();
    entries.forEach((e) => (e.tags || []).forEach((t) => s.add(typeof t === 'string' ? t : t.name)));
    return Array.from(s);
  }, [entries]);

  const visibleEntries = useMemo(() => {
    return entries.filter((e) => {
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
  }, [entries, query, selectedTag]);

  const hasFilters = Boolean(query || selectedTag);

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Journal</Text>
        <Pressable
          style={styles.newBtn}
          onPress={() => navigation.navigate('NewEntry')}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Write a new entry"
        >
          <Text style={styles.newBtnText}>+ NEW</Text>
        </Pressable>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="search your entries..."
          placeholderTextColor={colors.outline}
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
          accessibilityLabel="Search journal entries"
        />
      </View>

      {/* Tag filter chips */}
      {allTags.length > 0 && (
        <FlatList
          horizontal
          data={allTags}
          keyExtractor={(t) => t}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagRow}
          renderItem={({ item }) => {
            const active = selectedTag === item;
            return (
              <Pressable
                onPress={() => setSelectedTag(active ? '' : item)}
                style={[styles.tagChip, active && styles.tagChipActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
              >
                <Text style={[styles.tagChipText, active && styles.tagChipTextActive]}>#{item}</Text>
              </Pressable>
            );
          }}
        />
      )}

      {hasFilters && (
        <Pressable onPress={() => { setQuery(''); setSelectedTag(''); }} style={styles.clearFilters}>
          <Text style={styles.clearFiltersText}>clear filters ✕</Text>
        </Pressable>
      )}

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
              <Text style={styles.emptyEmoji}>✨</Text>
              <Text style={styles.emptyTitle}>
                {hasFilters ? 'no entries match your filters' : 'no entries yet'}
              </Text>
              <Text style={styles.emptySub}>
                {hasFilters ? 'try clearing your search or tag filter.' : 'tap "+ new" to write your first thought today.'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const mood = MOOD_META[item.mood] || MOOD_META.good;
          const plainText = (item.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
          return (
            <Pressable
              style={styles.card}
              onPress={() => navigation.navigate('NewEntry', { entryId: item.id })}
              accessibilityRole="button"
              accessibilityLabel={`Open entry: ${item.title || 'untitled reflection'}`}
            >
              <View style={styles.cardTopRow}>
                <Text style={styles.cardDate}>{formatShortDate(item.entry_date)}</Text>
                <View style={styles.moodPill}>
                  <Text style={styles.moodPillText}>{mood.emoji} {mood.label}</Text>
                </View>
              </View>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {item.title || 'untitled reflection'}
              </Text>
              <Text style={styles.cardBody} numberOfLines={2}>
                {plainText || 'no content written yet...'}
              </Text>
              {(item.tags || []).length > 0 && (
                <View style={styles.cardTagsRow}>
                  {(item.tags || []).slice(0, 3).map((t) => {
                    const name = t.name || t;
                    return (
                      <View key={name} style={styles.cardTag}>
                        <Text style={styles.cardTagText}>#{name}</Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.gutter,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: colors.onSurface,
  },
  newBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 8,
    ...pixelShadow,
  },
  newBtnText: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  searchRow: {
    paddingHorizontal: spacing.gutter,
    marginBottom: 8,
  },
  searchInput: {
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.onSurface,
  },
  tagRow: {
    paddingHorizontal: spacing.gutter,
    gap: 8,
    paddingBottom: 8,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    marginRight: 8,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  tagChipActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  tagChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  tagChipTextActive: {
    color: colors.primary,
  },
  clearFilters: {
    alignSelf: 'flex-end',
    marginRight: spacing.gutter,
    marginBottom: 8,
  },
  clearFiltersText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 40,
    gap: 12,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: 16,
    marginBottom: 12,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  moodPill: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moodPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
  },
  cardTag: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primary,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyEmoji: { fontSize: 28, marginBottom: 8 },
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
});
