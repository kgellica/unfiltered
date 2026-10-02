import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius } from '../../theme/theme';
import { toDateKey } from './journalDateUtils';

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MonthCalendar({ visibleMonth, onChangeMonth, selectedKey, onSelectDay }) {
  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startWeekday = firstOfMonth.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const todayKey = toDateKey(new Date());
  const isCurrentOrFutureMonth = (() => {
    const now = new Date();
    return year > now.getFullYear() || (year === now.getFullYear() && month >= now.getMonth());
  })();

  const cells = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(day);

  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View>
      <View style={calStyles.header}>
        <Pressable
          hitSlop={8}
          onPress={() => onChangeMonth(new Date(year, month - 1, 1))}
          style={calStyles.navBtn}
          accessibilityLabel="Previous month"
        >
          <ChevronLeft size={18} color={colors.onSurfaceVariant} strokeWidth={2.4} />
        </Pressable>
        <Text style={calStyles.headerLabel}>
          {firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
        <Pressable
          hitSlop={8}
          onPress={() => !isCurrentOrFutureMonth && onChangeMonth(new Date(year, month + 1, 1))}
          style={[calStyles.navBtn, isCurrentOrFutureMonth && calStyles.navBtnDisabled]}
          disabled={isCurrentOrFutureMonth}
          accessibilityLabel="Next month"
        >
          <ChevronRight
            size={18}
            color={isCurrentOrFutureMonth ? colors.onSurfaceFaint : colors.onSurfaceVariant}
            strokeWidth={2.4}
          />
        </Pressable>
      </View>

      <View style={calStyles.weekRow}>
        {WEEKDAY_LABELS.map((lbl, idx) => (
          <Text key={`weekday-${idx}`} style={calStyles.weekLabel}>
            {lbl}
          </Text>
        ))}
      </View>

      {rows.map((row, rIdx) => (
        <View key={`row-${rIdx}`} style={calStyles.weekRow}>
          {row.map((day, cIdx) => {
            if (!day) {
              return <View key={`empty-${cIdx}`} style={calStyles.dayCell} />;
            }
            const cellKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const isFuture = cellKey > todayKey;
            const isSelected = selectedKey === cellKey;
            const isToday = cellKey === todayKey;

            return (
              <Pressable
                key={cellKey}
                style={[calStyles.dayCell, isSelected && calStyles.dayCellSelected]}
                disabled={isFuture}
                onPress={() => onSelectDay(cellKey)}
                accessibilityRole="button"
                accessibilityLabel={`${month + 1}/${day}/${year}`}
                accessibilityState={{ selected: isSelected, disabled: isFuture }}
              >
                <Text
                  style={[
                    calStyles.dayText,
                    isFuture && calStyles.dayTextDisabled,
                    isToday && !isSelected && calStyles.dayTextToday,
                    isSelected && calStyles.dayTextSelected,
                  ]}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const calStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
  },
  navBtn: {
    width: 30,
    height: 30,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  weekLabel: {
    width: 32,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceFaint,
    marginBottom: 6,
  },
  dayCell: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: colors.accent,
  },
  dayText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.onSurface,
  },
  dayTextDisabled: {
    color: colors.onSurfaceFaint,
    opacity: 0.4,
  },
  dayTextToday: {
    color: colors.accent,
    fontWeight: '800',
  },
  dayTextSelected: {
    color: colors.accentInk,
    fontWeight: '800',
  },
});
