import React, { useCallback, useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
  Platform,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NotebookPen, CalendarCheck, Flame } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getEntriesByMonth, getStats } from '../api/entries';
import { colors, spacing, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import Svg, { Path, G, Circle } from 'react-native-svg';
import AnimatedGreeting from '../components/AnimatedGreeting';
import InlineAffirmation from '../components/InlineAffirmation';

const ALL_MONTHS = [
  { short: 'JAN', full: 'January', color: '#5C5B72' },
  { short: 'FEB', full: 'February', color: '#6E5253' },
  { short: 'MAR', full: 'March', color: '#4B6354' },
  { short: 'APR', full: 'April', color: '#C2B8E0' },
  { short: 'MAY', full: 'May', color: '#E2E0D8' },
  { short: 'JUN', full: 'June', color: '#DCD9CE' },
  { short: 'JUL', full: 'July', color: '#D98F6F' },
  { short: 'AUG', full: 'August', color: '#C9A227' },
  { short: 'SEP', full: 'September', color: '#A9673A' },
  { short: 'OCT', full: 'October', color: '#B4622C' },
  { short: 'NOV', full: 'November', color: '#6B4A3A' },
  { short: 'DEC', full: 'December', color: '#3E4A61' },
];

// SVG Icons for each month
const MONTH_ICONS = {
  0: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M26 8v36M14 15l24 22M14 37l24-22M18 6l8 18 8-18M18 46l8-18 8 18" />
          <Circle cx="26" cy="26" r="4" fill="#FFFFFF" fillOpacity="0.2" />
        </G>
      </Svg>
    </View>
  ),
  1: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M26 39c-9-6.5-14.5-12-14.5-18.5A7.5 7.5 0 0 1 19 13a8.5 8.5 0 0 1 7 3.5A8.5 8.5 0 0 1 33 13a7.5 7.5 0 0 1 7.5 7.5C40.5 27 35 32.5 26 39Z" fill="#FFFFFF" fillOpacity="0.2" />
          <Path d="M13 18h6M33 18h6M26 12v6M26 40v6" />
        </G>
      </Svg>
    </View>
  ),
  2: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M11 33c5.5-9 9-14 15-14s9.5 5 15 14" />
          <Path d="M15 31c3.5-4 6.5-6 11-6s7.5 2 11 6" />
          <Path d="M26 12c4.8 0 8.5 3.8 8.5 8.5S30.8 29 26 29s-8.5-3.8-8.5-8.5S21.2 12 26 12Z" fill="#FFFFFF" fillOpacity="0.18" />
          <Path d="M18 38c-1.5 0-3 1-3 3s1.5 3 3 3h16c1.5 0 3-1 3-3s-1.5-3-3-3H18Z" fill="#FFFFFF" fillOpacity="0.2" />
        </G>
      </Svg>
    </View>
  ),
  3: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M26 9c8 0 13 6 13 13 0 9-7.5 17-13 21-5.5-4-13-12-13-21 0-7 5-13 13-13Z" fill="#FFFFFF" fillOpacity="0.18" />
          <Path d="M26 16v12M20 22h12" />
        </G>
      </Svg>
    </View>
  ),
  4: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="26" cy="26" r="9" fill="#FFFFFF" fillOpacity="0.18" />
          <Path d="M26 6v7M26 39v7M6 26h7M39 26h7M12 12l5 5M35 35l5 5M35 12l-5 5M17 35l-5 5" />
        </G>
      </Svg>
    </View>
  ),
  5: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="26" cy="26" r="4" fill="#FFFFFF" fillOpacity="0.2" />
          <Path d="M26 7v8M26 37v8M7 26h8M37 26h8M14 14l6 6M32 32l6 6M32 14l-6 6M20 32l-6 6" />
          <Path d="M26 18c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12Z" fill="#FFFFFF" fillOpacity="0.12" />
        </G>
      </Svg>
    </View>
  ),
  6: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M26 14c-4 0-7 3-7 7 0 4 3 7 7 7 4 0 7-3 7-7 0-4-3-7-7-7Z" fill="#FFFFFF" fillOpacity="0.16" />
          <Path d="M26 8v8M26 36v8M8 26h8M36 26h8M13 13l6 6M33 33l6 6M33 13l-6 6M19 33l-6 6" />
          <Path d="M17 30c2.5 4.5 6.5 7 9 7 3.5 0 6.5-2.5 9-7" />
        </G>
      </Svg>
    </View>
  ),
  7: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Circle cx="35" cy="16" r="7" fill="#FFFFFF" fillOpacity="0.15" />
          <Path d="M18 28h16c4.5 0 8 3.5 8 8v5H10v-5c0-4.5 3.5-8 8-8Z" fill="#FFFFFF" fillOpacity="0.12" />
          <Path d="M16 30c1.5 0 3.5 1.5 5 3.5 3-4 7-5.5 10-5.5" />
          <Path d="M13 38c2.5-7 8.5-11 14-11 6.5 0 10.5 4 13.5 11" />
        </G>
      </Svg>
    </View>
  ),
  8: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M10 30c6.5 0 9.5-5 15-5s8.5 5 17 5" />
          <Path d="M10 35c6.5 0 9.5-5 15-5s8.5 5 17 5" />
          <Path d="M16 18c4-5 7.5-7 10-7 4.5 0 8.5 3 10 8" />
          <Path d="M21 21c-2.5 3.5-4 7-4 10.5" />
        </G>
      </Svg>
    </View>
  ),
  9: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M26 10c7.5 0 13 5.5 13 13 0 7.5-5.5 13-13 13s-13-5.5-13-13c0-7.5 5.5-13 13-13Z" fill="#FFFFFF" fillOpacity="0.12" />
          <Path d="M26 16v10M21 21h10M20 31h12M18 38h16" />
        </G>
      </Svg>
    </View>
  ),
  10: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M16 34h20l-2 8H18l-2-8Z" fill="#FFFFFF" fillOpacity="0.12" />
          <Path d="M18 33c0-7 3.5-12 8-12s8 5 8 12" />
          <Path d="M20 22c0-3 2.5-6 6-6s6 2.5 6 6" />
          <Path d="M26 9v6" />
          <Path d="M14 38h24" />
        </G>
      </Svg>
    </View>
  ),
  11: () => (
    <View style={{ width: 24, height: 24 }}>
      <Svg viewBox="0 0 52 52" width={24} height={24}>
        <G fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <Path d="M18 23h16v13H18z" fill="#FFFFFF" fillOpacity="0.12" />
          <Path d="M15 23c0-6.5 5-11 11-11s11 4.5 11 11" />
          <Path d="M13 37h26" />
          <Path d="M18 18c0-2.5 2.5-4 8-4" />
          <Path d="M24 29h4" />
        </G>
      </Svg>
    </View>
  ),
};

function BookmarkTab({ styles }) {
  const pop = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 5,
      tension: 120,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.bookmarkWrap,
        {
          transform: [{ scale: pop }],
          opacity: pop,
        },
      ]}
    >
      <View style={styles.bookmarkTab} />
      <View style={styles.bookmarkTail} />
    </Animated.View>
  );
}

function BookItem({ item, isSelected, onPress, disabled, monthIndex, styles }) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: isSelected ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -12] });
  const scaleY = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.15] });
  const scaleX = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.05] });

  const isLight = item.color === '#E2E0D8' || item.color === '#DCD9CE' || item.color === '#C9A227';
  const textColor = isLight ? '#4A4A4A' : '#FFFFFF';
  
  const IconComponent = MONTH_ICONS[monthIndex] || MONTH_ICONS[7];

  return (
    <Pressable onPress={() => !disabled && onPress(item)} disabled={disabled} hitSlop={4}>
      <Animated.View
        style={[
          styles.bookSpine,
          {
            backgroundColor: item.color,
            opacity: disabled ? 0.35 : 1,
            transform: [{ translateY }, { scaleY }, { scaleX }],
            zIndex: isSelected ? 10 : 1,
          },
        ]}
      >
        {isSelected && <BookmarkTab styles={styles} />}
        <View style={[styles.iconBadge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
          {IconComponent()}
        </View>
        <Text style={[styles.bookMonthText, { color: textColor }]}>{item.short}</Text>
        <View style={styles.spineLines}>
          <View style={[styles.spineLine, { backgroundColor: textColor, opacity: 0.3 }]} />
          <View style={[styles.spineLine, { backgroundColor: textColor, opacity: 0.3 }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const { mode, accent } = useTheme(); // subscribe so styles rebuild with the current accent/mode
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const { user } = useAuth();
  const [forceRefresh, setForceRefresh] = useState(0);

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonthIdx = today.getMonth();

  const joinYear = useMemo(() => {
    if (user?.created_at) {
      const d = new Date(user.created_at);
      if (!isNaN(d.getTime())) return d.getFullYear();
    }
    return currentYear;
  }, [user, currentYear]);

  const [viewMode, setViewMode] = useState('Month');
  const [selectedMonthIdx, setSelectedMonthIdx] = useState(currentMonthIdx);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [streak, setStreak] = useState(0);

  const selectedMonth = ALL_MONTHS[selectedMonthIdx];
  const visibleMonths = ALL_MONTHS.slice(0, currentMonthIdx + 1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const monthKey = `${currentYear}-${String(selectedMonthIdx + 1).padStart(2, '0')}`;
      const data = await getEntriesByMonth(monthKey);
      setEntries(data || []);
      const statsRes = await getStats();
      setStreak(statsRes?.current_streak || 0);
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [currentYear, selectedMonthIdx]);

  useFocusEffect(
    useCallback(() => {
      load();
      setForceRefresh(prev => prev + 1);
    }, [load])
  );

  const activeDaysCount = useMemo(() => {
    const days = new Set(entries.map((e) => e.entry_date));
    return days.size;
  }, [entries]);

  const daysInSelectedMonth = useMemo(() => {
    return new Date(currentYear, selectedMonthIdx + 1, 0).getDate();
  }, [currentYear, selectedMonthIdx]);

  const handleNewEntry = () => {
    navigation.navigate('NewEntry');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        key={`dashboard-${forceRefresh}`}
        style={styles.flex}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
      >
        <View style={styles.greetingWrapper}>
          <AnimatedGreeting userName={user?.name} avatarUrl={user?.avatar_url} />
        </View>

        <View style={styles.toggleWrapper}>
          <View style={styles.segmentedControl}>
            <Pressable
              style={[styles.segmentBtn, viewMode === 'Month' && styles.segmentBtnActive]}
              onPress={() => setViewMode('Month')}
            >
              <Text style={[styles.segmentText, viewMode === 'Month' && styles.segmentTextActive]}>Month</Text>
            </Pressable>
            <Pressable
              style={[styles.segmentBtn, viewMode === 'Year' && styles.segmentBtnActive]}
              onPress={() => setViewMode('Year')}
            >
              <Text style={[styles.segmentText, viewMode === 'Year' && styles.segmentTextActive]}>Year</Text>
            </Pressable>
          </View>
        </View>

        {viewMode === 'Month' ? (
          <>
            <View style={styles.shelfWrapper}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.booksRow}>
                {visibleMonths.map((item, idx) => (
                  <BookItem
                    key={item.short}
                    item={item}
                    monthIndex={idx}
                    isSelected={selectedMonthIdx === idx}
                    onPress={() => setSelectedMonthIdx(idx)}
                    styles={styles}
                  />
                ))}
              </ScrollView>
              <View style={styles.shelfBase} />
            </View>

            <View style={styles.summaryCard}>
              <View style={styles.streakPillContainer}>
                <View style={styles.streakPill}>
                  <Flame size={14} color={streak > 0 ? colors.accent : colors.onSurfaceFaint} strokeWidth={2.2} />
                  <Text style={[styles.streakText, streak === 0 && styles.streakTextZero]}>
                    {streak} day{streak === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>

              <Text style={styles.summaryTitle}>
                {selectedMonth.full} {currentYear}
              </Text>

              <View style={styles.metricRow}>
                <View style={[styles.metricIconBox, { backgroundColor: colors.accentSoft }]}>
                  <NotebookPen size={16} color={colors.accent} strokeWidth={2.1} />
                </View>
                <View>
                  <Text style={styles.metricSubLabel}>ENTRIES</Text>
                  <Text style={styles.metricValText}>{entries.length} this month</Text>
                </View>
              </View>

              <View style={styles.metricRow}>
                <View style={[styles.metricIconBox, { backgroundColor: colors.accentSoft }]}>
                  <CalendarCheck size={16} color={colors.accent} strokeWidth={2.1} />
                </View>
                <View>
                  <Text style={styles.metricSubLabel}>CONSISTENCY</Text>
                  <Text style={styles.metricValText}>
                    {activeDaysCount}/{daysInSelectedMonth} days
                  </Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <Pressable style={styles.newEntryBtn} onPress={handleNewEntry}>
                  <Text style={styles.newEntryBtnText}>+ NEW ENTRY</Text>
                </Pressable>
              </View>
            </View>

            <View style={styles.affirmationWrapper}>
              <InlineAffirmation />
            </View>
          </>
        ) : (
          <>
            <View style={styles.summaryCard}>
              <View style={styles.streakPillContainer}>
                <View style={styles.streakPill}>
                  <Flame size={13} color={streak > 0 ? colors.accent : colors.onSurfaceFaint} strokeWidth={2.2} />
                  <Text style={[styles.streakText, streak === 0 && styles.streakTextZero]}>
                    {streak} day{streak === 1 ? '' : 's'}
                  </Text>
                </View>
              </View>
              <Text style={styles.summaryTitle}>Year {joinYear}</Text>
              <Text style={styles.yearSubtext}>your journal, since you joined</Text>
              <View style={styles.cardFooter}>
                <Pressable style={styles.newEntryBtn} onPress={() => navigation.navigate('Calendar')}>
                  <Text style={styles.newEntryBtnText}>VIEW CALENDAR</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.affirmationWrapper}>
              <InlineAffirmation />
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = () => StyleSheet.create({
  safeArea: { 
    flex: 1, 
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  flex: { flex: 1 },
  container: {
    paddingHorizontal: spacing.gutter,
    paddingBottom: 40,
  },

  greetingWrapper: {
    marginTop: spacing.gutter,
    marginBottom: spacing.gutter,
  },

  toggleWrapper: { alignItems: 'center', marginBottom: 12 },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceMuted,
    borderRadius: 24,
    padding: 3,
    width: 230,
    alignItems: 'center',
    shadowColor: colors.onBackground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentBtn: { flex: 1, paddingVertical: 8, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  segmentBtnActive: { backgroundColor: colors.accent },
  segmentText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  segmentTextActive: { color: colors.accentInk, fontWeight: '700' },

  shelfWrapper: { alignItems: 'center', marginBottom: 28 },
  booksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: '100%',
    height: 180,
    paddingHorizontal: 12,
  },
  bookSpine: {
    width: 40,
    height: 130,
    borderRadius: 6,
    marginHorizontal: 3,
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: colors.onBackground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  bookmarkWrap: {
    position: 'absolute',
    top: -9,
    right: 6,
    alignItems: 'center',
    zIndex: 20,
  },
  bookmarkTab: {
    width: 12,
    height: 16,
    backgroundColor: colors.surface,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    shadowColor: colors.onBackground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 4,
  },
  bookmarkTail: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.surface,
  },
  iconBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  bookMonthText: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    transform: [{ rotate: '-90deg' }],
    marginVertical: 14,
  },
  spineLines: { width: '60%', height: 8, justifyContent: 'space-between' },
  spineLine: { height: 1.5, width: '100%', borderRadius: 1 },
  shelfBase: { width: '100%', height: 12, backgroundColor: colors.surfaceMuted, borderRadius: 6, marginTop: 4 },

  summaryCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    position: 'relative',
    shadowColor: colors.onBackground,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  streakPillContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 5,
  },
  streakPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  streakText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
  streakTextZero: {
    color: colors.onSurfaceFaint,
  },
  summaryTitle: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: colors.onBackground,
    marginBottom: 20,
    paddingRight: 70,
  },
  yearSubtext: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: -10, marginBottom: 16 },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceMuted,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
  },
  metricIconBox: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  metricSubLabel: { fontSize: 10, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '800', color: colors.onSurfaceVariant, letterSpacing: 0.5, marginBottom: 2 },
  metricValText: { fontSize: 15, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '700', color: colors.onBackground },
  cardFooter: { alignItems: 'flex-end', marginTop: 6 },
  newEntryBtn: {
    backgroundColor: colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: radius.lg,
    minHeight: 44,
    justifyContent: 'center',
  },
  newEntryBtnText: { color: colors.accentInk, fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace', fontWeight: '800', fontSize: 12, letterSpacing: 0.5 },
  affirmationWrapper: {
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
});