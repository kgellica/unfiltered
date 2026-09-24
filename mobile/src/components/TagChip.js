import React, { useMemo } from 'react';
import { Text, StyleSheet, Pressable, View } from 'react-native';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * Single tag pill used everywhere tags appear.
 * - Pass `onPress` to make it a selectable chip (tag picker); `selected` shows the active state.
 * - Omit `onPress` for a read-only chip (entry/memory cards); `compact` shrinks it for cards.
 * The label is shown as-is (no "#" prefix).
 */
export default function TagChip({ label, selected = false, onPress, compact = false }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const chipStyle = [
    styles.chip,
    compact ? styles.chipCompact : styles.chipRegular,
    selected && styles.chipSelected,
  ];
  const textStyle = [
    styles.text,
    compact ? styles.textCompact : styles.textRegular,
    selected && styles.textSelected,
  ];

  if (!onPress) {
    return (
      <View style={chipStyle}>
        <Text style={textStyle}>{label}</Text>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [...chipStyle, pressed && styles.chipPressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
    >
      <Text style={textStyle}>{label}</Text>
    </Pressable>
  );
}

const createStyles = () => StyleSheet.create({
  chip: {
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
  },
  chipRegular: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipCompact: {
    paddingHorizontal: 10,
    paddingVertical: 1,
    borderColor: 'transparent',
    backgroundColor: colors.accentSoft,
  },
  chipSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  chipPressed: {
    opacity: 0.7,
  },
  text: {
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  textRegular: {
    fontSize: 12,
  },
  textCompact: {
    fontSize: 11,
    color: colors.onSurface,
  },
  textSelected: {
    fontWeight: '700',
    color: colors.onSurface,
  },
});