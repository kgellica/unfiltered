import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { colors, radius, spacing, pixelShadow } from '../theme/theme';

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

export default function AffirmationsScreen() {
  const [index, setIndex] = useState(0);
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

  const toggleFavorite = async (text) => {
    const next = favorites.includes(text) ? favorites.filter((x) => x !== text) : [...favorites, text];
    setFavorites(next);
    await AsyncStorage.setItem(FAV_KEY, JSON.stringify(next));
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.headerTitle}>Daily Affirmations ✨</Text>
      <Text style={styles.headerSub}>gentle words to nurture your mindset and bring warmth to your day.</Text>

      <View style={styles.card}>
        <Text style={styles.quoteMark}>"</Text>
        <Text style={styles.affirmationText}>{currentText}</Text>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryBtn} onPress={nextAffirmation} accessibilityRole="button" accessibilityLabel="Show a new affirmation">
            <Text style={styles.primaryBtnText}>↻ NEW</Text>
          </Pressable>

          <Pressable
            style={[styles.secondaryBtn, isFav && styles.secondaryBtnActive]}
            onPress={() => toggleFavorite(currentText)}
            accessibilityRole="button"
            accessibilityLabel={isFav ? 'Remove from favorites' : 'Save to favorites'}
          >
            <Text style={[styles.secondaryBtnText, isFav && styles.secondaryBtnTextActive]}>
              {isFav ? '♥ SAVED' : '♡ SAVE'}
            </Text>
          </Pressable>

          <Pressable style={styles.secondaryBtn} onPress={copyCurrent} accessibilityRole="button" accessibilityLabel="Copy affirmation text">
            <Text style={styles.secondaryBtnText}>{copied ? '✓ COPIED' : '⧉ COPY'}</Text>
          </Pressable>
        </View>
      </View>

      {favorites.length > 0 && (
        <View style={styles.favSection}>
          <Text style={styles.favTitle}>your favorites ({favorites.length})</Text>
          {favorites.map((fav, i) => (
            <View key={i} style={styles.favCard}>
              <Text style={styles.favText}>"{fav}"</Text>
              <Pressable onPress={() => toggleFavorite(fav)} hitSlop={8} accessibilityRole="button" accessibilityLabel="Remove favorite">
                <Text style={styles.favRemove}>✕</Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    paddingHorizontal: spacing.gutter,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 4,
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
    padding: 28,
    alignItems: 'center',
    ...pixelShadow,
  },
  quoteMark: {
    fontSize: 28,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '900',
  },
  affirmationText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: 22,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.full,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  primaryBtnText: {
    color: colors.onPrimary,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  secondaryBtn: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  secondaryBtnActive: {
    backgroundColor: colors.primaryContainer,
    borderColor: colors.primary,
  },
  secondaryBtnText: {
    color: colors.onSurface,
    fontWeight: '800',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  secondaryBtnTextActive: {
    color: colors.primary,
  },
  favSection: {
    marginTop: 28,
  },
  favTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 12,
  },
  favCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 14,
    marginBottom: 10,
    gap: 10,
  },
  favText: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurface,
    lineHeight: 18,
  },
  favRemove: {
    color: colors.error,
    fontWeight: '800',
    fontSize: 13,
  },
});
