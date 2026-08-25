import React, { useCallback, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image,
  Platform,
  Alert,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Images, Camera, Mic, Calendar, Sparkles } from 'lucide-react-native';
import { listEntries } from '../api/entries';
import { colors, radius, spacing, cardShadow } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

const FILTERS = [
  { key: 'all', label: 'All', Icon: Images },
  { key: 'photos', label: 'Photos', Icon: Camera },
  { key: 'voice', label: 'Voice', Icon: Mic },
];

function monthKeyOf(dateStr) {
  if (!dateStr) return '';
  return String(dateStr).slice(0, 7);
}

function monthLabelOf(key) {
  if (!key) return '';
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MemoriesScreen({ navigation }) {
  const { mode, accent } = useTheme(); // subscribe so styles rebuild with the current accent/mode
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listEntries();
      console.log('Total entries loaded:', data?.length || 0);
      
      if (data && data.length > 0) {
        const withPhotos = data.filter(e => e.photo_path);
        const withVoice = data.filter(e => e.voice_path);
        console.log('Entries with photos:', withPhotos.length);
        console.log('Entries with voice:', withVoice.length);
      }
      
      const uniqueMap = {};
      if (data) {
        data.forEach((e) => {
          if (e && e.id && !uniqueMap[e.id]) {
            uniqueMap[e.id] = e;
          }
        });
      }
      const uniqueEntries = Object.values(uniqueMap);
      setEntries(uniqueEntries);
    } catch (e) {
      console.error('Error loading memories:', e);
      Alert.alert('Error', 'Failed to load memories. Please try again.');
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const availableMonths = useMemo(() => {
    const s = new Set();
    entries.forEach((e) => {
      if (e.entry_date) {
        const monthKey = monthKeyOf(e.entry_date);
        if (monthKey) s.add(monthKey);
      }
    });
    return Array.from(s).sort().reverse();
  }, [entries]);

  const visibleEntries = useMemo(() => {
    let list = [...entries];
    
    if (filter === 'photos') {
      list = list.filter((e) => !!e.photo_path);
    } else if (filter === 'voice') {
      list = list.filter((e) => !!e.voice_path);
    }
    
    if (selectedMonth) {
      list = list.filter((e) => monthKeyOf(e.entry_date) === selectedMonth);
    }
    
    list = list.sort((a, b) => {
      return String(b.entry_date || '').localeCompare(String(a.entry_date || ''));
    });
    
    return list;
  }, [entries, filter, selectedMonth]);

  const hasFilters = Boolean(selectedMonth || filter !== 'all');

  const renderEmptyState = () => {
    if (loading) return null;
    
    let message = 'No memories yet. Start journaling!';
    if (filter === 'photos') message = 'No photo memories yet. Add photos to your entries!';
    if (filter === 'voice') message = 'No voice memories yet. Record your thoughts!';
    
    return (
      <View style={styles.emptyState}>
        <Sparkles size={28} color={colors.accent} strokeWidth={1.8} />
        <Text style={styles.emptyText}>{message}</Text>
        {hasFilters && (
          <Pressable 
            onPress={() => { setFilter('all'); setSelectedMonth(''); }}
            style={styles.clearFiltersBtn}
          >
            <Text style={styles.clearFiltersBtnText}>clear filters</Text>
          </Pressable>
        )}
        {entries.length === 0 && !hasFilters && (
          <Pressable 
            onPress={() => navigation.navigate('NewEntry')}
            style={styles.createFirstBtn}
          >
            <Text style={styles.createFirstBtnText}>create your first entry →</Text>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.flex}>
        {/* Custom Header - Perfectly aligned with Journal */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Memories</Text>
        </View>

        {/* Filter chips */}
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
              >
                <Icon size={15} color={active ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
                <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Month filter */}
        {availableMonths.length > 1 && (
          <FlatList
            horizontal
            data={availableMonths}
            keyExtractor={(k) => k}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthRow}
            renderItem={({ item: key }) => {
              const active = selectedMonth === key;
              return (
                <Pressable
                  onPress={() => setSelectedMonth(active ? '' : key)}
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

        <FlatList
          style={styles.flex}
          contentContainerStyle={styles.listContent}
          data={visibleEntries}
          keyExtractor={(item) => String(item.id)}
          refreshing={loading}
          onRefresh={load}
          ListEmptyComponent={renderEmptyState}
          renderItem={({ item }) => {
            const hasPhoto = !!item.photo_path;
            const hasVoice = !!item.voice_path;
            const plainText = (item.content || '').replace(/<[^>]+>/g, ' ').trim();

            return (
              <Pressable 
                style={styles.card} 
                onPress={() => navigation.navigate('NewEntry', { entryId: item.id })}
              >
                {(hasPhoto || hasVoice) && (
                  <View style={styles.attachmentHeader}>
                    {hasPhoto && (
                      <View style={styles.attachmentTag}>
                        <Camera size={12} color={colors.accent} strokeWidth={2} />
                        <Text style={styles.attachmentTagText}>photo</Text>
                      </View>
                    )}
                    {hasVoice && (
                      <View style={styles.attachmentTag}>
                        <Mic size={12} color={colors.accent} strokeWidth={2} />
                        <Text style={styles.attachmentTagText}>voice</Text>
                      </View>
                    )}
                  </View>
                )}

                {hasPhoto && (
                  <View style={styles.imageContainer}>
                    <Image 
                      source={{ uri: item.photo_path }} 
                      style={styles.cardImage} 
                      resizeMode="cover"
                      onError={(e) => console.log('Image load error:', e.nativeEvent.error)}
                    />
                  </View>
                )}
                
                {!hasPhoto && hasVoice && (
                  <View style={styles.voiceIndicatorInline}>
                    <Mic size={16} color={colors.accent} strokeWidth={2.2} />
                    <Text style={styles.voiceIndicatorInlineText}>voice recording</Text>
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.cardTopRow}>
                    <Text style={styles.cardDate}>{formatDateDisplay(item.entry_date)}</Text>
                    {item.mood && (
                      <Text style={styles.cardMood}>{item.mood}</Text>
                    )}
                  </View>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title || 'untitled reflection'}
                  </Text>
                  <Text style={styles.cardPreview} numberOfLines={2}>
                    {plainText || 'no content written yet...'}
                  </Text>
                  
                  {item.tags && item.tags.length > 0 && (
                    <View style={styles.cardTags}>
                      {item.tags.slice(0, 3).map((t) => {
                        const name = t.name || t;
                        return (
                          <View key={name} style={styles.cardTag}>
                            <Text style={styles.cardTagText}>#{name}</Text>
                          </View>
                        );
                      })}
                      {item.tags.length > 3 && (
                        <Text style={styles.cardTagMore}>+{item.tags.length - 3}</Text>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const createStyles = () => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  flex: { flex: 1 },

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

  filterRow: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: spacing.gutter,
    paddingTop: 8,
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

  monthRow: { paddingHorizontal: spacing.gutter, gap: 8, paddingBottom: 4 },
  monthChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    marginRight: 8,
  },
  monthChipActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  monthChipText: { fontSize: 11.5, fontWeight: '700', color: colors.onSurfaceVariant },
  monthChipTextActive: { color: colors.accentInk },

  listContent: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 100,
    gap: 12,
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 10,
  },
  emptyText: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
  },
  clearFiltersBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  clearFiltersBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  createFirstBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  createFirstBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },

  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    overflow: 'hidden',
    ...cardShadow,
  },
  
  attachmentHeader: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  attachmentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  attachmentTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  
  imageContainer: {
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
    marginHorizontal: 14,
    marginTop: 6,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  
  voiceIndicatorInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 14,
    marginTop: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  voiceIndicatorInlineText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },

  cardBody: {
    padding: 14,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  cardMood: {
    fontSize: 12,
    color: colors.onSurfaceFaint,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 3,
  },
  cardPreview: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },

  cardTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  cardTag: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
  cardTagMore: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
});