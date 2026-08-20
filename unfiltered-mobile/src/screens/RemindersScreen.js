import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Switch, Platform } from 'react-native';
import { colors, radius, spacing, pixelShadow } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { ChevronLeft, ChevronRight, Bell, Check, Sunrise, Moon, Sparkles } from 'lucide-react-native';

const PROMPT_IDEAS = [
  { prompt: 'what made you smile today, even for a split second? 🌸', tag: 'gratitude' },
  { prompt: 'write down one feeling or burden you want to release tonight. ☁️', tag: 'letting go' },
  { prompt: 'describe a sensory detail you noticed today (a smell, sound, or taste). ☕', tag: 'mindfulness' },
  { prompt: "what is something you accomplished today that you're proud of? ✨", tag: 'wins' },
  { prompt: 'if you could whisper advice to yourself this morning, what would it be? 💌', tag: 'reflection' },
];

function TimeStepper({ value, onChange, disabled }) {
  const [h, m] = value.split(':').map(Number);

  const shift = (minutes) => {
    const total = (h * 60 + m + minutes + 24 * 60) % (24 * 60);
    const nh = String(Math.floor(total / 60)).padStart(2, '0');
    const nm = String(total % 60).padStart(2, '0');
    onChange(`${nh}:${nm}`);
  };

  return (
    <View style={[stepperStyles.row, disabled && stepperStyles.disabled]}>
      <Pressable onPress={() => shift(-30)} disabled={disabled} hitSlop={8} accessibilityRole="button" accessibilityLabel="Earlier">
        <ChevronLeft size={18} color={colors.onSurfaceVariant} strokeWidth={2.2} />
      </Pressable>
      <Text style={stepperStyles.time}>{value}</Text>
      <Pressable onPress={() => shift(30)} disabled={disabled} hitSlop={8} accessibilityRole="button" accessibilityLabel="Later">
        <ChevronRight size={18} color={colors.onSurfaceVariant} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

export default function RemindersScreen() {
  const { mode, accent } = useTheme(); // subscribe so styles rebuild with the current accent/mode
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:30');
  const [eveningTime, setEveningTime] = useState('21:30');
  const [savedNotice, setSavedNotice] = useState(false);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.headerRow}>
        <Bell size={20} color={colors.accent} strokeWidth={2.2} />
        <Text style={styles.headerTitle}>Gentle Reminders</Text>
      </View>
      <Text style={styles.headerSub}>keep your streak glowing with gentle nudges and inspiring questions.</Text>

      <View style={styles.card}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.cardHeaderTitle}>daily journaling schedule</Text>
          {savedNotice && (
            <View style={styles.savedBadgeRow}>
              <Check size={12} color={colors.tertiary} strokeWidth={2.6} />
              <Text style={styles.savedBadge}>saved</Text>
            </View>
          )}
        </View>

        <View style={styles.scheduleRow}>
          <View style={styles.scheduleTitleRow}>
            <View style={styles.scheduleLabelRow}>
              <Sunrise size={15} color={colors.onSurfaceVariant} strokeWidth={2.1} />
              <Text style={styles.scheduleLabel}>morning intention</Text>
            </View>
            <Switch
              value={morningEnabled}
              onValueChange={setMorningEnabled}
              trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
              thumbColor={morningEnabled ? colors.primary : '#f4f3f4'}
              accessibilityLabel="Toggle morning reminder"
            />
          </View>
          <Text style={styles.scheduleHint}>set a gentle tone before the day begins.</Text>
          <TimeStepper value={morningTime} onChange={setMorningTime} disabled={!morningEnabled} />
        </View>

        <View style={styles.scheduleRow}>
          <View style={styles.scheduleTitleRow}>
            <View style={styles.scheduleLabelRow}>
              <Moon size={15} color={colors.onSurfaceVariant} strokeWidth={2.1} />
              <Text style={styles.scheduleLabel}>evening unwind</Text>
            </View>
            <Switch
              value={eveningEnabled}
              onValueChange={setEveningEnabled}
              trackColor={{ false: colors.outlineVariant, true: colors.primaryContainer }}
              thumbColor={eveningEnabled ? colors.primary : '#f4f3f4'}
              accessibilityLabel="Toggle evening reminder"
            />
          </View>
          <Text style={styles.scheduleHint}>reflect and release your thoughts before sleep.</Text>
          <TimeStepper value={eveningTime} onChange={setEveningTime} disabled={!eveningEnabled} />
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSave} accessibilityRole="button" accessibilityLabel="Save reminder times">
          <Text style={styles.saveBtnText}>SAVE REMINDER TIMES</Text>
        </Pressable>
      </View>

      <View style={styles.sectionTitleRow}>
        <Sparkles size={16} color={colors.accent} strokeWidth={2.2} />
        <Text style={styles.sectionTitle}>daily prompt inspiration</Text>
      </View>
      {PROMPT_IDEAS.map((item, idx) => (
        <View key={idx} style={styles.promptCard}>
          <Text style={styles.promptText}>"{item.prompt}"</Text>
          <View style={styles.promptTag}>
            <Text style={styles.promptTagText}>#{item.tag}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const stepperStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 14,
  },
  disabled: { opacity: 0.5 },
  arrow: { fontSize: 16, fontWeight: '800', color: colors.primary },
  time: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: colors.onSurface,
  },
});

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.gutter,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: colors.onSurface,
  },
  headerSub: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 20,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: 20,
    gap: 18,
    ...pixelShadow,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.onSurface,
  },
  savedBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  savedBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.tertiary,
  },
  scheduleRow: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 14,
    gap: 8,
  },
  scheduleTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scheduleLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scheduleLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: colors.onSurface,
  },
  scheduleHint: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
  },
  saveBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingVertical: 12,
    alignItems: 'center',
    ...pixelShadow,
  },
  saveBtnText: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: 14,
    marginBottom: 10,
    gap: 8,
  },
  promptText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurface,
    fontWeight: '500',
  },
  promptTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  promptTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
});