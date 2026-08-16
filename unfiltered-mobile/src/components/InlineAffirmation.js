import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { RefreshCw, Heart, Copy, Check, Sparkles } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';

const AFFIRMATION_PRESETS = [
  'i am worthy of peace, joy, and gentle days. 🌸',
  "my feelings are valid, and i give myself permission to feel them. ☕",
  'today is a fresh page in my story, and i get to choose the words. ✨',
  'small steps every day lead to beautiful transformations. 🌱',
  "i am gentle with my mind and proud of how far i've come. 🧸",
  'i deserve the same unconditional kindness i give to others. 💕',
  'my voice and reflections are precious and true. ✍️',
];

const FAV_KEY = 'uf_fav_affirmations';

// Rendered inline on the Dashboard, right in the flow of the page — not a
// modal — so it reads as a small daily-ritual card rather than an
// interruption.
export default function InlineAffirmation() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AFFIRMATION_PRESETS.length));
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((raw) => {
      try {
        setFavorites(raw ? JSON.parse(raw) : []);
      } catch {
        setFavorites([]);
      }
    });
  }, []);

  const currentText = AFFIRMATION_PRESETS[index];
  const isFav = favorites.includes(currentText);

  const nextAffirmation = () => {
    setIndex((prev) => (prev + 1) % AFFIRMATION_PRESETS.length);
    setCopied(false);
  };

  const copyCurrent = async () => {
    await Clipboard.setStringAsync(currentText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFavorite = async () => {
    const next = isFav ? favorites.filter((x) => x !== currentText) : [...favorites, currentText];
    setFavorites(next);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Sparkles size={15} color={colors.accent} strokeWidth={2.2} />
        <Text style={styles.headerLabel}>daily affirmation</Text>
      </View>

      <Text style={styles.affirmationText}>{currentText}</Text>

      <View style={styles.actionsRow}>
        <Pressable
          style={styles.iconBtn}
          onPress={nextAffirmation}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Show a new affirmation"
        >
          <RefreshCw size={14} color={colors.onSurfaceVariant} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={toggleFavorite}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={isFav ? 'Remove from favorites' : 'Save to favorites'}
        >
          <Heart size={14} color={isFav ? colors.accent : colors.onSurfaceVariant} fill={isFav ? colors.accent : 'none'} strokeWidth={2.2} />
        </Pressable>
        <Pressable
          style={styles.iconBtn}
          onPress={copyCurrent}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Copy affirmation text"
        >
          {copied ? (
            <Check size={14} color={colors.accent} strokeWidth={2.4} />
          ) : (
            <Copy size={14} color={colors.onSurfaceVariant} strokeWidth={2.2} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 18,
    marginTop: 16,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  headerLabel: { fontSize: 11, fontWeight: '800', color: colors.onSurfaceVariant, letterSpacing: 0.5, textTransform: 'uppercase' },
  affirmationText: { fontSize: 14.5, fontWeight: '600', color: colors.onSurface, lineHeight: 21 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
});
