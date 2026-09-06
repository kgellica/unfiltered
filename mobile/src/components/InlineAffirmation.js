import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  ActivityIndicator, 
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Animated,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Clipboard from 'expo-clipboard';
import { RefreshCw, Heart, Copy, Check, Sparkles, Plus, X, AlertCircle, Info } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { generateAffirmation } from '../api/gemini';
import ScrollableTextInput from '../components/ScrollableTextInput';

const AFFIRMATION_PRESETS = [
  'i am worthy of peace, joy, and gentle days.',
  "my feelings are valid, and i give myself permission to feel them.",
  'today is a fresh page in my story, and i get to choose the words.',
  'small steps every day lead to beautiful transformations.',
  "i am gentle with my mind and proud of how far i've come.",
  'i deserve the same unconditional kindness i give to others.',
  'my voice and reflections are precious and true.',
];

const FAV_KEY = 'uf_fav_affirmations';
export const CUSTOM_AFFIRMATIONS_KEY = 'uf_custom_affirmations';
const DAILY_AI_AFFIRMATION_KEY = 'uf_daily_ai_affirmation';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

export default function InlineAffirmation() {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const [customAffirmations, setCustomAffirmations] = useState([]);
  const affirmations = useMemo(
    () => [...AFFIRMATION_PRESETS, ...customAffirmations],
    [customAffirmations]
  );
  const [index, setIndex] = useState(() => Math.floor(Math.random() * AFFIRMATION_PRESETS.length));
  const [copied, setCopied] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [aiText, setAiText] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  
  // Modal state for adding custom affirmations
  const [modalVisible, setModalVisible] = useState(false);
  const [newAffirmation, setNewAffirmation] = useState('');
  const [error, setError] = useState('');
  
  // Animation for the modal
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    AsyncStorage.getItem(FAV_KEY).then((raw) => {
      try {
        setFavorites(raw ? JSON.parse(raw) : []);
      } catch {
        setFavorites([]);
      }
    });
    AsyncStorage.getItem(CUSTOM_AFFIRMATIONS_KEY).then((raw) => {
      try {
        setCustomAffirmations(raw ? JSON.parse(raw) : []);
      } catch {
        setCustomAffirmations([]);
      }
    });

    AsyncStorage.getItem(DAILY_AI_AFFIRMATION_KEY).then(async (raw) => {
      try {
        const cached = raw ? JSON.parse(raw) : null;
        if (cached && cached.date === todayKey() && cached.text) {
          setAiText(cached.text);
          return;
        }
      } catch {
        // fall through to regenerate
      }
      setAiLoading(true);
      const generated = await generateAffirmation();
      setAiLoading(false);
      if (generated) {
        setAiText(generated);
        AsyncStorage.setItem(
          DAILY_AI_AFFIRMATION_KEY,
          JSON.stringify({ date: todayKey(), text: generated })
        ).catch(() => {});
      }
    });
  }, []);

  // Animate modal
  useEffect(() => {
    if (modalVisible) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          tension: 65,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [modalVisible]);

  const currentText = aiText || affirmations[index % affirmations.length];
  const isFav = favorites.includes(currentText);

  const nextAffirmation = async () => {
    setCopied(false);
    setAiLoading(true);
    const generated = await generateAffirmation();
    setAiLoading(false);
    if (generated) {
      setAiText(generated);
      AsyncStorage.setItem(
        DAILY_AI_AFFIRMATION_KEY,
        JSON.stringify({ date: todayKey(), text: generated })
      ).catch(() => {});
      return;
    }
    setAiText(null);
    setIndex((prev) => (prev + 1) % affirmations.length);
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

  const addCustomAffirmation = async () => {
    const text = newAffirmation.trim();
    if (!text) {
      setError('Please write an affirmation first.');
      return;
    }
    if (affirmations.includes(text)) {
      setError('This affirmation already exists.');
      return;
    }
    setError('');
    const next = [...customAffirmations, text];
    setCustomAffirmations(next);
    setNewAffirmation('');
    await AsyncStorage.setItem(CUSTOM_AFFIRMATIONS_KEY, JSON.stringify(next));
    setTimeout(() => {
      setModalVisible(false);
    }, 300);
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.headerLabel}>daily affirmation</Text>
          {Boolean(aiText) && <Sparkles size={11} color={colors.accent} strokeWidth={2.4} />}
        </View>

        {aiLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.loadingText}>finding the right words...</Text>
          </View>
        ) : (
          <Text style={styles.affirmationText}>{currentText}</Text>
        )}

        <View style={styles.actionsRow}>
          <Pressable
            style={styles.iconBtn}
            onPress={nextAffirmation}
            hitSlop={8}
            disabled={aiLoading}
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
            <Heart 
              size={14} 
              color={isFav ? colors.accent : colors.onSurfaceVariant} 
              fill={isFav ? colors.accent : 'none'} 
              strokeWidth={2.2} 
            />
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

          <Pressable
            style={styles.iconBtn}
            onPress={() => setModalVisible(true)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Add custom affirmation"
          >
            <Plus size={14} color={colors.onSurfaceVariant} strokeWidth={2.4} />
          </Pressable>
        </View>
      </View>

      {/* Add Affirmation Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="none"
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <Animated.View 
              style={[
                styles.modalContent,
                {
                  opacity: fadeAnim,
                  transform: [{
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0]
                    })
                  }]
                }
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Your Own Affirmation</Text>
                <Pressable
                  style={styles.modalCloseBtn}
                  onPress={() => {
                    setModalVisible(false);
                    setNewAffirmation('');
                    setError('');
                  }}
                  hitSlop={8}
                >
                  <X size={20} color={colors.onSurfaceVariant} />
                </Pressable>
              </View>

              <Text style={styles.modalSubtitle}>
                Write a personal affirmation that resonates with you. It will appear alongside the daily affirmations on your home screen.
              </Text>

              {/* Enhanced Info Box - Suggests going to Reminders for management */}
              <View style={styles.infoBox}>
                <Info size={14} color={colors.onSurfaceVariant} strokeWidth={2.2} />
                <Text style={styles.infoText}>
                  You can view, edit, or delete all your custom affirmations in the <Text style={styles.infoTextHighlight}>Reminders</Text> screen
                </Text>
              </View>

              <ScrollableTextInput
                style={styles.modalInput}
                placeholder="e.g., I am enough, exactly as I am"
                placeholderTextColor={colors.onSurfaceFaint}
                value={newAffirmation}
                onChangeText={(text) => {
                  setNewAffirmation(text);
                  if (error) setError('');
                }}
                multiline
                scrollEnabled
                textAlignVertical="top"
                minHeight={80}
                maxHeight={160}
                autoFocus
              />

              {error ? (
                <View style={styles.errorRow}>
                  <AlertCircle size={14} color={colors.error} strokeWidth={2.2} />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              ) : null}

              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalBtn, styles.modalCancelBtn]}
                  onPress={() => {
                    setModalVisible(false);
                    setNewAffirmation('');
                    setError('');
                  }}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalBtn, styles.modalAddBtn]}
                  onPress={addCustomAffirmation}
                >
                  <Text style={styles.modalAddBtnText}>Add Affirmation</Text>
                </Pressable>
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}

const createStyles = () => StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 18,
    marginTop: 16,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  headerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    gap: 6,
    marginBottom: 8,
    width: '100%',
  },

  headerLabel: { 
    fontSize: 11, 
    fontWeight: '800', 
    color: colors.onSurfaceVariant, 
    letterSpacing: 0.5, 
    textTransform: 'uppercase' 
  },
  
  affirmationText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: colors.onSurface, 
    lineHeight: 24, 
    textAlign: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 8,
  },

  loadingText: {
    fontSize: 11,
    color: colors.onSurfaceVariant,
    fontWeight: '500',
    fontStyle: 'italic',
  },
  
  actionsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    gap: 10, 
    marginTop: 10,
    flexWrap: 'wrap',
  },
  
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 8,
      },
    }),
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
  },

  modalCloseBtn: {
    padding: 4,
  },

  modalSubtitle: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 16,
  },

  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.surfaceMuted,
    padding: 12,
    borderRadius: radius.md,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  infoText: {
    flex: 1,
    fontSize: 12,
    color: colors.onSurfaceVariant,
    lineHeight: 16,
  },

  infoTextHighlight: {
    fontWeight: '700',
    color: colors.onSurface,
  },

  modalInput: {
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surfaceMuted,
    padding: 14,
    fontSize: 14,
    color: colors.onSurface,
    minHeight: 80,
  },

  errorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },

  errorText: {
    fontSize: 12,
    color: colors.error,
    fontWeight: '600',
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },

  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalCancelBtn: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },

  modalCancelBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },

  modalAddBtn: {
    backgroundColor: colors.accent,
  },

  modalAddBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentInk,
  },
});