import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { colors, radius, spacing, pixelShadow } from '../theme/theme';
import { RefreshCw, Heart, Copy, Check, X, Sparkles } from 'lucide-react-native';

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

// Rendered as a centered modal card (not a full screen) — better HCI for a
// lightweight, glanceable action reached from the "More" menu.
export default function AffirmationsScreen({ visible, onClose }) {
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
    <Modal visible={!!visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <ScrollView
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.headerRow}>
              <View style={styles.headerRowLeft}>
                <Sparkles size={20} color={colors.accent} strokeWidth={2.2} />
                <Text style={styles.headerTitle}>Daily Affirmations</Text>
              </View>
              <Pressable onPress={onClose} hitSlop={10} accessibilityRole="button" accessibilityLabel="Close">
                <X size={20} color={colors.onSurfaceVariant} strokeWidth={2.2} />
              </Pressable>
            </View>
            <Text style={styles.headerSub}>gentle words to nurture your mindset and bring warmth to your day.</Text>

            <View style={styles.card}>
              <Text style={styles.quoteMark}>"</Text>
              <Text style={styles.affirmationText}>{currentText}</Text>

              <View style={styles.actionsRow}>
                <Pressable style={styles.primaryBtn} onPress={nextAffirmation} accessibilityRole="button" accessibilityLabel="Show a new affirmation">
                  <RefreshCw size={14} color={colors.accentInk} strokeWidth={2.4} />
                  <Text style={styles.primaryBtnText}>NEW</Text>
                </Pressable>

                <Pressable
                  style={[styles.secondaryBtn, isFav && styles.secondaryBtnActive]}
                  onPress={() => toggleFavorite(currentText)}
                  accessibilityRole="button"
                  accessibilityLabel={isFav ? 'Remove from favorites' : 'Save to favorites'}
                >
                  <Heart
                    size={14}
                    color={isFav ? colors.accent : colors.onSurfaceVariant}
                    fill={isFav ? colors.accent : 'none'}
                    strokeWidth={2.2}
                  />
                  <Text style={[styles.secondaryBtnText, isFav && styles.secondaryBtnTextActive]}>
                    {isFav ? 'SAVED' : 'SAVE'}
                  </Text>
                </Pressable>

                <Pressable style={styles.secondaryBtn} onPress={copyCurrent} accessibilityRole="button" accessibilityLabel="Copy affirmation text">
                  {copied ? (
                    <Check size={14} color={colors.onSurfaceVariant} strokeWidth={2.4} />
                  ) : (
                    <Copy size={14} color={colors.onSurfaceVariant} strokeWidth={2.2} />
                  )}
                  <Text style={styles.secondaryBtnText}>{copied ? 'COPIED' : 'COPY'}</Text>
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
                      <X size={16} color={colors.onSurfaceFaint} strokeWidth={2.2} />
                    </Pressable>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 36, 30, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '82%',
    backgroundColor: colors.background,
    borderRadius: radius.xl,
    overflow: 'hidden',
    ...pixelShadow,
  },
  container: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 20,
    paddingBottom: 28,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  headerRowLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: {
    fontSize: 19,
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
    padding: 24,
    alignItems: 'center',
  },
  quoteMark: {
    fontSize: 28,
    color: colors.primary,
    marginBottom: 4,
    fontWeight: '900',
  },
  affirmationText: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.onSurface,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  actionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
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
    marginTop: 24,
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