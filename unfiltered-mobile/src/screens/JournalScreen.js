import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  Platform,
  Modal,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import DatePicker from 'react-native-date-picker'; // ✅ Crash-Proof JS Picker
import { listEntries, getStats } from '../api/entries';
import { colors, radius, spacing, cardShadow } from '../theme/theme';
import { Plus, Search, X, Sparkles, ChevronDown, Calendar, Tag, Check, Mic, CalendarDays } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import StreakBar from '../components/StreakBar';

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

function toDateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
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

function formatDateAndTime(dateVal, createdAt) {
  const dateLabel = formatShortDate(dateVal).toLowerCase();
  if (!createdAt) return dateLabel;
  const t = new Date(createdAt);
  if (isNaN(t.getTime())) return dateLabel;
  const timeLabel = t.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  return `${dateLabel} \u2022 ${timeLabel}`;
}

export default function JournalScreen({ navigation }) {
  const { user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [streak, setStreak] = useState(0);
  const [dateMenuOpen, setDateMenuOpen] = useState(false);
  const [tagMenuOpen, setTagMenuOpen] = useState(false);

  // ✅ NEW CRASH-PROOF DATE PICKER STATE
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState(new Date());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [entriesRes, statsRes] = await Promise.all([listEntries(), getStats()]);
      setEntries(entriesRes);
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

  const entryDateSet = useMemo(() => new Set(entries.map((e) => normalizeDateKey(e.entry_date))), [entries]);

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
      const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
      return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
    return match.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }, [selectedDate, recentDays]);

  const selectedTagLabel = selectedTag ? `#${selectedTag}` : 'all tags';

  const todayStr = toDateKey(new Date());
  const yesterdayStr = toDateKey(new Date(new Date().setDate(new Date().getDate() - 1)));

  // ✅ NEW HANDLER FUNCTIONS
  const handlePresetPress = (dateKey) => {
    setSelectedDate(dateKey);
    setDateMenuOpen(false);
  };

  const handleDateConfirm = (selectedDateObj) => {
    setOpen(false);
    setDate(selectedDateObj);
    const formattedKey = toDateKey(selectedDateObj);
    setSelectedDate(formattedKey);
    setDateMenuOpen(false);
  };

  const openDatePicker = () => {
    setOpen(true);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.flex}>
        
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Journal</Text>
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
            <Text style={[styles.filterPillText, selectedDate && styles.filterPillTextActive]}>{selectedDateLabel}</Text>
            <ChevronDown size={13} color={selectedDate ? colors.accentInk : colors.onSurfaceFaint} strokeWidth={2.4} />
          </Pressable>

          <Pressable
            style={[styles.filterPill, selectedTag && styles.filterPillActive]}
            onPress={() => setTagMenuOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Filter by tag"
          >
            <Tag size={13} color={selectedTag ? colors.accentInk : colors.onSurfaceVariant} strokeWidth={2.2} />
            <Text style={[styles.filterPillText, selectedTag && styles.filterPillTextActive]}>{selectedTagLabel}</Text>
            <ChevronDown size={13} color={selectedTag ? colors.accentInk : colors.onSurfaceFaint} strokeWidth={2.4} />
          </Pressable>

          {hasFilters && (
            <Pressable onPress={() => { setQuery(''); setSelectedTag(''); setSelectedDate(''); }} style={styles.clearFilters}>
              <Text style={styles.clearFiltersText}>clear ✕</Text>
            </Pressable>
          )}
        </View>

        <Modal visible={dateMenuOpen} transparent animationType="fade" onRequestClose={() => setDateMenuOpen(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setDateMenuOpen(false)}>
            <View style={styles.menuSheet}>
              
              <View style={styles.dateModalHeader}>
                <CalendarDays size={16} color={colors.accent} strokeWidth={2.2} />
                <Text style={styles.dateModalTitle}>filter by date</Text>
              </View>
              <View style={styles.dateModalDivider} />

              <View style={styles.presetRow}>
                <Pressable
                  style={[styles.presetBtn, !selectedDate && styles.presetBtnActive]}
                  onPress={() => handlePresetPress('')}
                >
                  <Text style={[styles.presetBtnText, !selectedDate && styles.presetBtnTextActive]}>all</Text>
                </Pressable>

                <Pressable
                  style={[styles.presetBtn, selectedDate === todayStr && styles.presetBtnActive]}
                  onPress={() => handlePresetPress(todayStr)}
                >
                  <Text style={[styles.presetBtnText, selectedDate === todayStr && styles.presetBtnTextActive]}>today</Text>
                </Pressable>

                <Pressable
                  style={[styles.presetBtn, selectedDate === yesterdayStr && styles.presetBtnActive]}
                  onPress={() => handlePresetPress(yesterdayStr)}
                >
                  <Text style={[styles.presetBtnText, selectedDate === yesterdayStr && styles.presetBtnTextActive]}>yesterday</Text>
                </Pressable>
              </View>

              <Text style={styles.pickerLabel}>pick specific day:</Text>
              <TouchableOpacity
                style={styles.dateInputBox}
                activeOpacity={0.7}
                onPress={openDatePicker}
              >
                <Text style={styles.dateInputText}>
                  {selectedDate && selectedDate !== todayStr && selectedDate !== yesterdayStr
                    ? selectedDate.split('-').join('/')
                    : 'mm/dd/yyyy'}
                </Text>
                <Calendar size={18} color={colors.onSurfaceVariant} strokeWidth={2} />
              </TouchableOpacity>

            </View>
          </Pressable>
        </Modal>

        {/* ✅ REACT-NATIVE-DATE-PICKER (CRASH PROOF) */}
        <DatePicker
          modal
          open={open}
          date={date}
          onConfirm={handleDateConfirm}
          onCancel={() => {
            setOpen(false);
            setDateMenuOpen(false);
          }}
          maximumDate={new Date()}
          mode="date"
        />

        <Modal visible={tagMenuOpen} transparent animationType="fade" onRequestClose={() => setTagMenuOpen(false)}>
          <Pressable style={styles.menuOverlay} onPress={() => setTagMenuOpen(false)}>
            <View style={styles.menuSheet}>
              <Text style={styles.menuTitle}>filter by tag</Text>
              <FlatList
                data={['any', ...allTags]}
                keyExtractor={(t) => t}
                style={{ maxHeight: 320 }}
                ListEmptyComponent={<Text style={styles.menuEmptyText}>no tags yet</Text>}
                renderItem={({ item }) => {
                  const isAny = item === 'any';
                  const active = isAny ? !selectedTag : selectedTag === item;
                  return (
                    <Pressable
                      style={styles.menuItem}
                      onPress={() => { setSelectedTag(isAny ? '' : item); setTagMenuOpen(false); }}
                    >
                      <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
                        {isAny ? 'all tags' : `#${item}`}
                      </Text>
                      {active && <Check size={15} color={colors.accent} strokeWidth={2.6} />}
                    </Pressable>
                  );
                }}
              />
            </View>
          </Pressable>
        </Modal>

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
          renderItem={({ item }) => {
            const mood = MOOD_META[item.mood] || MOOD_META.good;
            const plainText = (item.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
            const tags = item.tags || [];
            const hasPhoto = !!item.photo_path;
            const hasVoice = !!item.voice_path;
            
            return (
              <Pressable
                style={styles.card}
                onPress={() => navigation.navigate('NewEntry', { entryId: item.id })}
                accessibilityRole="button"
                accessibilityLabel={`Open entry: ${item.title || 'untitled reflection'}`}
              >
                <View style={styles.cardTopRow}>
                  <View style={styles.cardDateRow}>
                    <Calendar size={12} color={colors.onSurfaceFaint} strokeWidth={2.2} />
                    <Text style={styles.cardDate}>{formatDateAndTime(item.entry_date, item.created_at)}</Text>
                  </View>
                  <View style={styles.moodPill}>
                    <Text style={styles.moodPillText}>{mood.emoji} {mood.label}</Text>
                  </View>
                </View>
                
                {hasPhoto && (
                  <View style={styles.attachmentPreview}>
                    <Image 
                      source={{ uri: item.photo_path }} 
                      style={styles.attachmentImage}
                      resizeMode="cover"
                    />
                    {hasVoice && (
                      <View style={styles.voiceBadge}>
                        <Mic size={12} color="#FFFFFF" strokeWidth={2.2} />
                        <Text style={styles.voiceBadgeText}>voice</Text>
                      </View>
                    )}
                  </View>
                )}
                
                {!hasPhoto && hasVoice && (
                  <View style={styles.voicePreview}>
                    <Mic size={16} color={colors.accent} strokeWidth={2.2} />
                    <Text style={styles.voicePreviewText}>voice recording attached</Text>
                  </View>
                )}
                
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.title || 'untitled reflection'}
                </Text>
                <Text style={styles.cardBody} numberOfLines={2}>
                  {plainText || 'no content written yet...'}
                </Text>
                <View style={styles.cardDivider} />
                <View style={styles.cardFooterRow}>
                  {tags.length > 0 ? (
                    <View style={styles.cardTagsRow}>
                      {tags.slice(0, 3).map((t) => {
                        const name = t.name || t;
                        return (
                          <View key={name} style={styles.cardTag}>
                            <Text style={styles.cardTagText}>#{name}</Text>
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text style={styles.cardNoTags}>no tags</Text>
                  )}
                  <Text style={styles.cardOpenLink}>open ›</Text>
                </View>
              </Pressable>
            );
          }}
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

const styles = StyleSheet.create({
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
    borderColor: colors.borderSoft,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
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
  filterPillActive: { backgroundColor: colors.accent, borderColor: colors.accent },
  filterPillText: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant },
  filterPillTextActive: { color: colors.accentInk },
  clearFilters: { marginLeft: 'auto', paddingVertical: 4, paddingHorizontal: 4 },
  clearFiltersText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.accent,
  },

  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 36, 30, 0.35)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    ...cardShadow,
  },
  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  dateModalTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.accent,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  dateModalDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginBottom: 16,
  },

  presetRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  presetBtnActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  presetBtnTextActive: {
    color: colors.accentInk,
  },

  pickerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  dateInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  dateInputText: {
    fontSize: 14,
    color: colors.onSurface,
    fontWeight: '500',
  },

  menuTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.4,
    paddingHorizontal: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  menuItemText: { fontSize: 14.5, color: colors.onSurface, fontWeight: '500' },
  menuItemTextActive: { color: colors.accent, fontWeight: '800' },
  menuEmptyText: { fontSize: 13, color: colors.onSurfaceFaint, paddingHorizontal: 12, paddingVertical: 10 },
  
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
    marginBottom: 10,
  },
  cardDateRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  cardDate: {
    fontSize: 11.5,
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
  attachmentPreview: {
    marginBottom: 10,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  attachmentImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
  },
  voiceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  voiceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentInk,
  },
  voicePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  voicePreviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
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
  cardDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginTop: 12,
    marginBottom: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNoTags: { fontSize: 11.5, fontStyle: 'italic', color: colors.onSurfaceFaint },
  cardOpenLink: { fontSize: 12, fontWeight: '700', color: colors.accent },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
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
    color: colors.accent,
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
});