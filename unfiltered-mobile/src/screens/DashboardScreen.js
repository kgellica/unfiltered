import React, { useCallback, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Animated,
  Image,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { getEntriesByMonth } from '../api/entries';

const MONTHS = [
  { short: 'JAN', full: 'January', icon: '❄️', color: '#5C5B72' },
  { short: 'FEB', full: 'February', icon: '❤️', color: '#6E5253' },
  { short: 'MAR', full: 'March', icon: '🌿', color: '#4B6354' },
  { short: 'APR', full: 'April', icon: '💧', color: '#C2B8E0', ribbon: true },
  { short: 'MAY', full: 'May', icon: '☀️', color: '#E2E0D8' },
  { short: 'JUN', full: 'June', icon: '🌊', color: '#DCD9CE' },
];

function BookItem({ item, isSelected, onPress }) {
  const anim = useRef(new Animated.Value(isSelected ? 1 : 0)).current;

  React.useEffect(() => {
    Animated.spring(anim, {
      toValue: isSelected ? 1 : 0,
      friction: 6,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [isSelected]);

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -12],
  });

  const scaleY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  const scaleX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.05],
  });

  const isLight = item.color === '#E2E0D8' || item.color === '#DCD9CE' || item.color === '#C2B8E0';
  const textColor = isLight ? '#4A4A4A' : '#FFFFFF';

  return (
    <Pressable onPress={() => onPress(item)}>
      <Animated.View
        style={[
          styles.bookSpine,
          {
            backgroundColor: item.color,
            transform: [{ translateY }, { scaleY }, { scaleX }],
            zIndex: isSelected ? 10 : 1,
          },
        ]}
      >
        {item.ribbon && <View style={styles.ribbon} />}

        <Text style={[styles.bookIcon, { color: textColor }]}>{item.icon}</Text>
        <Text style={[styles.bookMonthText, { color: textColor }]}>{item.short}</Text>

        <View style={styles.spineLines}>
          <View style={[styles.spineLine, { backgroundColor: textColor, opacity: 0.3 }]} />
          <View style={[styles.spineLine, { backgroundColor: textColor, opacity: 0.3 }]} />
          <View style={[styles.spineLine, { backgroundColor: textColor, opacity: 0.3 }]} />
        </View>
      </Animated.View>
    </Pressable>
  );
}

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('Month'); // 'Month' | 'Year'
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[3]); // Default April
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const monthIndex = MONTHS.findIndex((m) => m.short === selectedMonth.short) + 1;
      const monthKey = `${selectedYear}-${String(monthIndex).padStart(2, '0')}`;
      const data = await getEntriesByMonth(monthKey);
      setEntries(data || []);
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedMonth]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={load} />}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View style={styles.userRow}>
          <Image
            source={{ uri: 'https://i.pravatar.cc/300?img=47' }}
            style={styles.headerAvatar}
          />
          <Text style={styles.greetingText}>
            {greeting}, {user?.name?.split(' ')[0] || 'Fatima'}
          </Text>
        </View>
        <View style={styles.headerIcons}>
          <Pressable hitSlop={8} style={{ marginRight: 12 }}>
            <Text style={styles.topIcon}>🔔</Text>
          </Pressable>
          <Pressable hitSlop={8} onPress={() => navigation.navigate('Settings')}>
            <Text style={styles.topIcon}>⚙️</Text>
          </Pressable>
        </View>
      </View>

      {/* Segmented Toggle Control (Month / Year) */}
      <View style={styles.toggleWrapper}>
        <View style={styles.segmentedControl}>
          <Pressable
            style={[
              styles.segmentBtn,
              viewMode === 'Month' && styles.segmentBtnActive,
            ]}
            onPress={() => setViewMode('Month')}
          >
            <Text
              style={[
                styles.segmentText,
                viewMode === 'Month' && styles.segmentTextActive,
              ]}
            >
              Month
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.segmentBtn,
              viewMode === 'Year' && styles.segmentBtnActive,
            ]}
            onPress={() => setViewMode('Year')}
          >
            <Text
              style={[
                styles.segmentText,
                viewMode === 'Year' && styles.segmentTextActive,
              ]}
            >
              Year
            </Text>
          </Pressable>
        </View>
      </View>

      {/* Year Switcher Control (Active when Year mode or viewing bookshelf) */}
      <View style={styles.yearPickerContainer}>
        <View style={styles.yearPickerPill}>
          <Pressable
            hitSlop={12}
            onPress={() => setSelectedYear((prev) => prev - 1)}
          >
            <Text style={styles.arrowText}>‹</Text>
          </Pressable>
          <Text style={styles.yearText}>{selectedYear}</Text>
          <Pressable
            hitSlop={12}
            onPress={() => setSelectedYear((prev) => prev + 1)}
          >
            <Text style={styles.arrowText}>›</Text>
          </Pressable>
        </View>
      </View>

      {/* Bookshelf Section */}
      <View style={styles.shelfWrapper}>
        <View style={styles.booksRow}>
          {MONTHS.map((item) => (
            <BookItem
              key={item.short}
              item={item}
              isSelected={selectedMonth.short === item.short}
              onPress={(m) => setSelectedMonth(m)}
            />
          ))}
        </View>
        <View style={styles.shelfBase} />
      </View>

      {/* Dynamic Month/Year Summary Card */}
      <View style={styles.summaryCard}>
        <Text style={styles.sparkleIcon}>✦</Text>
        <Text style={styles.summaryTitle}>
          {viewMode === 'Month'
            ? `${selectedMonth.full} ${selectedYear}`
            : `Year ${selectedYear}`}
        </Text>

        {/* Entries Metric */}
        <View style={styles.metricRow}>
          <View style={[styles.metricIconBox, { backgroundColor: '#EDE7F6' }]}>
            <Text style={{ fontSize: 16 }}>📝</Text>
          </View>
          <View>
            <Text style={styles.metricSubLabel}>ENTRIES</Text>
            <Text style={styles.metricValText}>
              {viewMode === 'Month'
                ? `${entries.length || 12} this month`
                : `${(entries.length || 12) * 8} total this year`}
            </Text>
          </View>
        </View>

        {/* Consistency Metric */}
        <View style={styles.metricRow}>
          <View style={[styles.metricIconBox, { backgroundColor: '#FDE8E8' }]}>
            <Text style={{ fontSize: 16 }}>📅</Text>
          </View>
          <View>
            <Text style={styles.metricSubLabel}>CONSISTENCY</Text>
            <Text style={styles.metricValText}>
              {viewMode === 'Month' ? '8/30 days' : '142/365 days'}
            </Text>
          </View>
        </View>

        {/* Action CTA Button */}
        <View style={styles.cardFooter}>
          <Pressable
            style={styles.newEntryBtn}
            onPress={() => navigation.navigate('NewEntry')}
          >
            <Text style={styles.newEntryBtnText}>+ NEW ENTRY</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 52 : 20,
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
  },
  greetingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333333',
  },
  headerIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topIcon: {
    fontSize: 18,
  },

  /* Segmented Toggle Bar Styles */
  toggleWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#EBF3FF',
    borderRadius: 24,
    padding: 3,
    width: 230,
    alignItems: 'center',
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#2563EB',
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4B5563',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  yearPickerContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  yearPickerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0EFEA',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    width: 120,
    justifyContent: 'space-between',
  },
  arrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666666',
  },
  yearText: {
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#222222',
  },
  shelfWrapper: {
    alignItems: 'center',
    marginBottom: 28,
  },
  booksRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 180,
    paddingHorizontal: 10,
  },
  bookSpine: {
    width: 44,
    height: 130,
    borderRadius: 6,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 10,
    justifyContent: 'space-between',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  ribbon: {
    position: 'absolute',
    top: -6,
    width: 10,
    height: 16,
    backgroundColor: '#FFC1C1',
    borderRadius: 2,
  },
  bookIcon: {
    fontSize: 12,
  },
  bookMonthText: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    transform: [{ rotate: '-90deg' }],
    marginVertical: 18,
  },
  spineLines: {
    width: '60%',
    height: 12,
    justifyContent: 'space-between',
  },
  spineLine: {
    height: 1.5,
    width: '100%',
    borderRadius: 1,
  },
  shelfBase: {
    width: '100%',
    height: 12,
    backgroundColor: '#E6E4DF',
    borderRadius: 6,
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F0EFF2',
  },
  sparkleIcon: {
    position: 'absolute',
    top: 16,
    right: 18,
    fontSize: 18,
    color: '#D1D5DB',
  },
  summaryTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 16,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
  },
  metricIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  metricSubLabel: {
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 0.5,
  },
  metricValText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#111827',
    marginTop: 2,
  },
  cardFooter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  newEntryBtn: {
    backgroundColor: '#5C5B72',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  newEntryBtnText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
});