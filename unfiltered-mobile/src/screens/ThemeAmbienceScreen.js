import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Animated } from 'react-native';
import { Sun, Moon, Coffee, Crown, Check, Save } from 'lucide-react-native';
import { useTheme, ACCENT_PRESETS } from '../context/ThemeContext';
import { colors, radius, spacing } from '../theme/theme';

export default function ThemeAmbienceScreen({ navigation }) {
  const { mode, setMode, accent, setAccent, customAccent, setCustomAccent, isPremium, togglePremium } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const [hexDraft, setHexDraft] = useState(customAccent);
  const [dirty, setDirty] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const savedFade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    setHexDraft(customAccent);
  }, [customAccent]);

  // Selections already apply + persist live (for instant preview), but the
  // person still gets an explicit Save action + confirmation, per request.
  const markDirty = () => setDirty(true);

  const handleSave = () => {
    setDirty(false);
    setJustSaved(true);
    savedFade.setValue(0);
    Animated.sequence([
      Animated.timing(savedFade, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.delay(1400),
      Animated.timing(savedFade, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setJustSaved(false));
  };

  const applyCustomHex = (raw) => {
    setHexDraft(raw);
    if (/^#[0-9a-fA-F]{6}$/.test(raw)) {
      setCustomAccent(raw);
      setAccent('custom');
    }
  };

  const onPressColorWheel = () => {
    if (!isPremium) return;
    setAccent('custom');
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.label}>color mode</Text>
      <View style={styles.modeRow}>
        {[
          { id: 'light', label: 'light (milk tea)', Icon: Sun },
          { id: 'dim', label: 'dim (warm cocoa)', Icon: Coffee },
          { id: 'dark', label: 'dark (espresso)', Icon: Moon },
        ].map(({ id, label, Icon }) => (
          <Pressable
            key={id}
            onPress={() => { setMode(id); markDirty(); }}
            style={[styles.modeCard, mode === id && styles.modeCardActive]}
          >
            <Icon size={20} color={mode === id ? colors.accent : colors.onSurfaceVariant} strokeWidth={2.2} />
            <Text style={[styles.modeCardText, mode === id && styles.modeCardTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={[styles.label, { marginTop: 26 }]}>accent tone</Text>
      <View style={styles.accentWrap}>
        {ACCENT_PRESETS.map((p) => (
          <Pressable
            key={p.id}
            onPress={() => { setAccent(p.id); markDirty(); }}
            style={[styles.accentChip, accent === p.id && styles.accentChipActive]}
          >
            <View style={[styles.accentDot, { backgroundColor: p.hex }]} />
            <Text style={styles.accentChipText}>{p.label}</Text>
            {accent === p.id && <Check size={13} color={colors.accent} strokeWidth={2.6} />}
          </Pressable>
        ))}

        <Pressable
          onPress={onPressColorWheel}
          style={[styles.accentChip, accent === 'custom' && styles.accentChipActive]}
        >
          <View style={[styles.accentDot, { backgroundColor: customAccent }]} />
          <Text style={styles.accentChipText}>color wheel 🎨</Text>
          {!isPremium && <Crown size={12} color="#d97706" strokeWidth={2.4} />}
        </Pressable>
      </View>

      {isPremium && (
        <TextInput
          value={hexDraft}
          onChangeText={applyCustomHex}
          placeholder="#f472b6"
          placeholderTextColor={colors.onSurfaceFaint}
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={7}
          style={styles.hexInput}
        />
      )}

      <View style={styles.plusCard}>
        <View style={styles.plusHeaderRow}>
          <View style={styles.plusIconBadge}>
            <Crown size={16} color="#b45309" strokeWidth={2.2} />
          </View>
          <Text style={styles.plusTitle}>unfiltered plus+</Text>
        </View>
        <Text style={styles.plusSub}>
          unlock unlimited pastel card backgrounds, custom hex color wheel, and cloud backup.
        </Text>

        <Pressable onPress={togglePremium} style={[styles.plusBtn, isPremium && styles.plusBtnActive]}>
          <Text style={styles.plusBtnText}>{isPremium ? '✓ premium active' : 'upgrade for free (demo) 🌸'}</Text>
        </Pressable>

        <View style={styles.plusFeatureList}>
          {['custom hex color wheel', 'all 7 pastel card palettes', 'priority streak badges'].map((f) => (
            <View key={f} style={styles.plusFeatureRow}>
              <Check size={13} color="#b45309" strokeWidth={2.6} />
              <Text style={styles.plusFeatureText}>{f}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.saveBar}>
        {justSaved && (
          <Animated.View style={[styles.savedToast, { opacity: savedFade }]}>
            <Check size={13} color="#059669" strokeWidth={2.8} />
            <Text style={styles.savedToastText}>ambience saved</Text>
          </Animated.View>
        )}
        <Pressable
          onPress={handleSave}
          disabled={!dirty}
          style={[styles.saveBtn, !dirty && styles.saveBtnDisabled]}
        >
          <Save size={15} color="#fff" strokeWidth={2.3} />
          <Text style={styles.saveBtnText}>{dirty ? 'save changes' : 'saved'}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 48 },
  label: { fontSize: 12, fontWeight: '800', color: colors.onSurfaceVariant, marginBottom: 12, letterSpacing: 0.4 },

  modeRow: { flexDirection: 'row', gap: 10 },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 16,
    paddingHorizontal: 6,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
  },
  modeCardActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  modeCardText: { fontSize: 11.5, fontWeight: '600', color: colors.onSurface, textAlign: 'center' },
  modeCardTextActive: { fontWeight: '800' },

  accentWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  accentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radius.full,
    borderWidth: 2,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
  },
  accentChipActive: { borderColor: colors.accent, backgroundColor: colors.accentSoft },
  accentDot: { width: 14, height: 14, borderRadius: 7 },
  accentChipText: { fontSize: 12.5, fontWeight: '600', color: colors.onSurface },

  hexInput: {
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: colors.onSurface,
    backgroundColor: colors.surface,
  },

  plusCard: {
    marginTop: 28,
    borderRadius: radius.xl,
    borderWidth: 2,
    borderColor: '#fde68a',
    backgroundColor: '#fffbeb',
    padding: 18,
  },
  plusHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  plusIconBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fde68a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusTitle: { fontSize: 16, fontWeight: '800', color: '#78350f' },
  plusSub: { fontSize: 12.5, color: '#92400e', fontWeight: '500', lineHeight: 18, marginBottom: 14 },
  plusBtn: { backgroundColor: '#f59e0b', borderRadius: radius.lg, paddingVertical: 14, alignItems: 'center' },
  plusBtnActive: { backgroundColor: '#059669' },
  plusBtnText: { color: '#ffffff', fontWeight: '800', fontSize: 13 },
  plusFeatureList: { marginTop: 14, gap: 8 },
  plusFeatureRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  plusFeatureText: { fontSize: 12.5, fontWeight: '700', color: '#78350f' },

  saveBar: { marginTop: 24, alignItems: 'center' },
  savedToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
  },
  savedToastText: { color: '#059669', fontWeight: '700', fontSize: 12 },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    backgroundColor: colors.accent,
    borderRadius: radius.lg,
    paddingVertical: 15,
  },
  saveBtnDisabled: { backgroundColor: colors.borderStrong },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 14, letterSpacing: 0.3 },
});