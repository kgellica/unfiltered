import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ScrollView, 
  Switch, 
  Platform, 
  TextInput,
  Dimensions,
  Animated,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  PanResponder
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, radius, spacing, pixelShadow } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  Sunrise, 
  Moon, 
  Heart,
  X,
  AlertCircle
} from 'lucide-react-native';
import { CUSTOM_AFFIRMATIONS_KEY } from '../components/InlineAffirmation';
import ScrollableTextInput from '../components/ScrollableTextInput';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

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
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const [morningEnabled, setMorningEnabled] = useState(true);
  const [eveningEnabled, setEveningEnabled] = useState(true);
  const [morningTime, setMorningTime] = useState('08:30');
  const [eveningTime, setEveningTime] = useState('21:30');
  const [savedNotice, setSavedNotice] = useState(false);

  const [customAffirmations, setCustomAffirmations] = useState([]);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [affirmationError, setAffirmationError] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(CUSTOM_AFFIRMATIONS_KEY).then((raw) => {
      try {
        setCustomAffirmations(raw ? JSON.parse(raw) : []);
      } catch {
        setCustomAffirmations([]);
      }
    });
  }, []);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const addAffirmation = async () => {
    const text = newAffirmation.trim();
    if (!text) {
      setAffirmationError('Please write an affirmation first.');
      return;
    }
    if (customAffirmations.includes(text)) {
      setAffirmationError('This affirmation already exists.');
      return;
    }
    setAffirmationError('');
    const next = [...customAffirmations, text];
    setCustomAffirmations(next);
    setNewAffirmation('');
    await AsyncStorage.setItem(CUSTOM_AFFIRMATIONS_KEY, JSON.stringify(next));
  };

  const removeAffirmation = async (text) => {
    const next = customAffirmations.filter((a) => a !== text);
    setCustomAffirmations(next);
    await AsyncStorage.setItem(CUSTOM_AFFIRMATIONS_KEY, JSON.stringify(next));
  };

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView 
          style={styles.flex} 
          contentContainerStyle={styles.container} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Schedule Card */}
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

          {/* Custom Affirmations Section */}
          <View style={styles.sectionTitleRow}>
            <Heart size={16} color={colors.accent} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>your custom affirmations</Text>
          </View>
          
          <Text style={styles.sectionHint}>
            Add your own affirmations — they'll appear in the affirmation card on Home.
            {customAffirmations.length > 0 && ` You have ${customAffirmations.length} custom affirmation${customAffirmations.length !== 1 ? 's' : ''}.`}
          </Text>
          
          <View style={styles.addRow}>
            <View style={styles.addInputWrapper}>
              <ScrollableTextInput
                style={styles.addInput}
                placeholder="e.g. I am proud of my progress"
                placeholderTextColor={colors.onSurfaceFaint}
                value={newAffirmation}
                onChangeText={(text) => {
                  setNewAffirmation(text);
                  if (affirmationError) setAffirmationError('');
                }}
                onSubmitEditing={addAffirmation}
                returnKeyType="done"
                scrollEnabled
                multiline
                textAlignVertical="center"
                minHeight={48}
                maxHeight={120}
              />
            </View>
            <Pressable style={styles.addBtn} onPress={addAffirmation} accessibilityRole="button" accessibilityLabel="Add affirmation">
              <Text style={styles.addBtnText}>Add</Text>
            </Pressable>
          </View>
          
          {affirmationError ? (
            <View style={styles.errorRow}>
              <AlertCircle size={14} color={colors.error} strokeWidth={2.2} />
              <Text style={styles.errorText}>{affirmationError}</Text>
            </View>
          ) : null}

          {/* List of Custom Affirmations */}
          {customAffirmations.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No custom affirmations yet. Add your first one above!
              </Text>
            </View>
          ) : (
            <View style={styles.affirmationsList}>
              {customAffirmations.map((text, idx) => (
                <View key={idx} style={styles.customCard}>
                  <View style={styles.customCardContent}>
                    <Text style={styles.customCardNumber}>#{idx + 1}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.customCardScroll}>
                      <Text style={styles.customCardText}>"{text}"</Text>
                    </ScrollView>
                  </View>
                  <Pressable 
                    onPress={() => removeAffirmation(text)} 
                    hitSlop={8} 
                    style={styles.removeBtn}
                    accessibilityLabel="Remove affirmation"
                  >
                    <X size={16} color={colors.onSurfaceFaint} />
                  </Pressable>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
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
    paddingBottom: 60,
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
  sectionHint: {
    fontSize: 11.5,
    color: colors.onSurfaceVariant,
    marginTop: -6,
    marginBottom: 12,
    lineHeight: 16,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
    width: '100%',
  },
  addInputWrapper: {
    flex: 1,
  },
  addInput: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.onSurface,
  },
  addBtn: {
    paddingHorizontal: 18,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...pixelShadow,
  },
  addBtnText: {
    color: colors.accentInk,
    fontWeight: '800',
    fontSize: 12,
    letterSpacing: 0.3,
  },
  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  emptyStateText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  affirmationsList: {
    gap: 10,
    marginTop: 4,
  },
  customCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    padding: 14,
    gap: 8,
  },
  customCardContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  customCardNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurfaceFaint,
    minWidth: 28,
  },
  customCardScroll: {
    flex: 1,
  },
  customCardText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.onSurface,
    lineHeight: 18,
  },
  removeBtn: {
    padding: 4,
  },
});