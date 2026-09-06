import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Bold, ALargeSmall, List, ListOrdered } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

/**
 * EditorToolbar — a tiny, borderless-against-the-page formatting strip meant
 * to sit *inside* the text box it edits (overlaid in a corner), not as a
 * separate boxed row below it. Pure Expo Go / JS: no native modules.
 *
 * Only text formatting lives here now (Bold, Size, List) — Mood / Photo /
 * Color / Voice / Tag already have their own sections further down the
 * screen, so duplicating them here was redundant.
 *
 * RN's <TextInput> can't mix styles per character without a native rich-text
 * module, so Bold/Size apply to the whole entry's text rather than a
 * selection — the honest tradeoff for staying Expo-Go-compatible.
 *
 * List: tap inserts the next bullet/numbered item at the cursor; long-press
 * switches between bullet and numbered mode.
 */
export default function EditorToolbar({
  bold,
  onToggleBold,
  textSizeLabel,
  onCycleTextSize,
  listMode,
  onInsertListItem,
  onToggleListMode,
}) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const ListIcon = listMode === 'number' ? ListOrdered : List;

  return (
    <View style={styles.row}>
      <Pressable
        onPress={onToggleBold}
        style={({ pressed }) => [styles.btn, bold && styles.btnActive, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityState={{ selected: !!bold }}
        accessibilityLabel="Toggle bold text"
        hitSlop={4}
      >
        <Bold size={16} color={bold ? colors.accent : colors.onSurfaceVariant} strokeWidth={2.3} />
      </Pressable>

      <Pressable
        onPress={onCycleTextSize}
        style={({ pressed }) => [styles.btn, styles.sizeBtn, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Text size: ${textSizeLabel}. Tap to change.`}
        hitSlop={4}
      >
        <ALargeSmall size={16} color={colors.onSurfaceVariant} strokeWidth={2.1} />
        <Text style={styles.sizeLabel}>{textSizeLabel}</Text>
      </Pressable>

      <View style={styles.divider} />

      <Pressable
        onPress={onInsertListItem}
        onLongPress={onToggleListMode}
        delayLongPress={350}
        style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
        accessibilityRole="button"
        accessibilityLabel={`Insert ${listMode === 'number' ? 'numbered' : 'bullet'} list item. Long-press to switch style.`}
        hitSlop={4}
      >
        <ListIcon size={16} color={colors.onSurfaceVariant} strokeWidth={2.1} />
      </Pressable>
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: 4,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    minWidth: 30,
    minHeight: 28,
    paddingHorizontal: 5,
    borderRadius: radius.sm,
  },
  btnActive: { backgroundColor: colors.accentSoft },
  btnPressed: { backgroundColor: colors.surfaceMuted },
  sizeBtn: { flexDirection: 'row' },
  sizeLabel: { fontSize: 10, fontWeight: '800', color: colors.onSurfaceVariant },
  divider: {
    width: 1,
    height: 16,
    backgroundColor: colors.borderSoft,
    marginHorizontal: 2,
  },
});