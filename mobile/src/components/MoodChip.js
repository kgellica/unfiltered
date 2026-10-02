import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

/** Small read-only pill showing a mood as a plain word (no emoji). */
export default function MoodChip({ label }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  chip: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    minHeight: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
    lineHeight: 14,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});