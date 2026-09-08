import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, TouchableOpacity } from 'react-native';
import { Calendar, CalendarDays } from 'lucide-react-native';
import { colors, radius, cardShadow } from '../../theme/theme';
import MonthCalendar from './MonthCalendar';

export default function DateFilterModal({
  visible,
  onClose,
  selectedDate,
  todayStr,
  yesterdayStr,
  onPresetPress,
  calendarOpen,
  openDatePicker,
  visibleMonth,
  onChangeMonth,
  onSelectDay,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuSheet} onStartShouldSetResponder={() => true}>
          <View style={styles.dateModalHeader}>
            <CalendarDays size={18} color={colors.accent} strokeWidth={2.4} />
            <Text style={styles.dateModalTitle}>FILTER BY DATE</Text>
          </View>
          <View style={styles.dateModalDivider} />

          <View style={styles.presetRow}>
            <Pressable
              style={[styles.presetBtn, !selectedDate && styles.presetBtnActive]}
              onPress={() => onPresetPress('')}
            >
              <Text style={[styles.presetBtnText, !selectedDate && styles.presetBtnTextActive]}>all</Text>
            </Pressable>

            <Pressable
              style={[styles.presetBtn, selectedDate === todayStr && styles.presetBtnActive]}
              onPress={() => onPresetPress(todayStr)}
            >
              <Text style={[styles.presetBtnText, selectedDate === todayStr && styles.presetBtnTextActive]}>today</Text>
            </Pressable>

            <Pressable
              style={[styles.presetBtn, selectedDate === yesterdayStr && styles.presetBtnActive]}
              onPress={() => onPresetPress(yesterdayStr)}
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

          {calendarOpen && (
            <View style={styles.calendarWrap}>
              <MonthCalendar
                visibleMonth={visibleMonth}
                onChangeMonth={onChangeMonth}
                selectedKey={selectedDate}
                onSelectDay={onSelectDay}
              />
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  calendarWrap: {
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
});
