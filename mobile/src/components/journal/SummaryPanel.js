import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  ActivityIndicator,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { Bot, X } from 'lucide-react-native';
import { colors, cardShadow } from '../../theme/theme';
import { useTheme } from '../../context/ThemeContext';

export default function SummaryPanel({
  summaryOpen,
  summaryFade,
  summaryLoading,
  summaryError,
  summary,
  closeSummaryPanel,
}) {
  // Rebuild styles when the ambience changes so the bot avatar, panel and
  // header follow the selected mode + accent (module-level styles would
  // freeze the accent at whatever it was on first import).
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const { height: windowHeight } = useWindowDimensions();

  if (!summaryOpen) return null;

  return (
    <Animated.View
      style={[
        styles.summaryPanel,
        {
          opacity: summaryFade,
          transform: [
            {
              translateY: summaryFade.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0],
              }),
            },
          ],
        },
      ]}
    >
      <View style={styles.summaryPanelHeader}>
        <View style={styles.summaryPanelHeaderLeft}>
          <View style={styles.summaryPanelAvatar}>
            <Bot size={15} color={colors.accentInk} strokeWidth={2.4} />
          </View>
          <Text style={styles.summaryPanelTitle}>journal insights</Text>
        </View>
        <Pressable
          onPress={closeSummaryPanel}
          hitSlop={8}
          style={styles.summaryPanelCloseBtn}
          accessibilityRole="button"
          accessibilityLabel="Close AI summary"
        >
          <X size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
        </Pressable>
      </View>

      <View style={styles.summaryPanelBody}>
        {summaryLoading ? (
          <View style={styles.summaryTypingRow}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.summaryTypingText}>reading your entry...</Text>
          </View>
        ) : summaryError ? (
          <Text style={styles.summaryErrorText}>
            couldn't summarize this entry. close and reopen this panel to try again.
          </Text>
        ) : summary ? (
          // Long summaries scroll inside the panel instead of being clipped.
          <ScrollView
            style={{ maxHeight: Math.round(windowHeight * 0.4) }}
            nestedScrollEnabled
            persistentScrollbar
            showsVerticalScrollIndicator
          >
            <Text style={styles.summaryBodyText}>{summary}</Text>
          </ScrollView>
        ) : null}
      </View>
    </Animated.View>
  );
}

const createStyles = () => StyleSheet.create({
  summaryPanel: {
    position: 'absolute',
    right: 20,
    bottom: 84,
    width: 280,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderBottomRightRadius: 4,
    ...cardShadow,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    overflow: 'hidden',
    zIndex: 999,
  },
  summaryPanelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
  },
  summaryPanelHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryPanelAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  summaryPanelTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.onSurface,
    letterSpacing: 0.3,
  },
  summaryPanelCloseBtn: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: colors.surfaceMuted,
  },
  summaryPanelBody: {
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 60,
    justifyContent: 'center',
  },
  summaryTypingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryTypingText: {
    marginLeft: 10,
    fontSize: 13,
    color: colors.onSurfaceFaint,
    fontStyle: 'italic',
  },
  summaryErrorText: {
    fontSize: 13,
    color: colors.error,
    lineHeight: 18,
  },
  summaryBodyText: {
    fontSize: 14,
    color: colors.onSurface,
    lineHeight: 20,
  },
});