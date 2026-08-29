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
  Bell, 
  Check, 
  Sunrise, 
  Moon, 
  Sparkles, 
  Plus, 
  X, 
  Heart,
  Quote,
  Edit2
} from 'lucide-react-native';
import { CUSTOM_AFFIRMATIONS_KEY } from '../components/InlineAffirmation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PROMPT_IDEAS = [
  { prompt: 'what made you smile today, even for a split second? 🌸', tag: 'gratitude' },
  { prompt: 'write down one feeling or burden you want to release tonight. ☁️', tag: 'letting go' },
  { prompt: 'describe a sensory detail you noticed today (a smell, sound, or taste). ☕', tag: 'mindfulness' },
  { prompt: "what is something you accomplished today that you're proud of? ✨", tag: 'wins' },
  { prompt: 'if you could whisper advice to yourself this morning, what would it be? 💌', tag: 'reflection' },
  { prompt: 'what recurring thought have I noticed lately? 🌱', tag: 'mindfulness' },
  { prompt: 'what would make today feel meaningful? 🎯', tag: 'intention' },
  { prompt: 'how am I really feeling right now? 🌊', tag: 'emotional check-in' },
  { prompt: 'what can I let go of that no longer serves me? 🍃', tag: 'letting go' },
  { prompt: 'what brought me joy this week? ✨', tag: 'gratitude' },
];

const getAllTags = () => {
  const tags = new Set();
  PROMPT_IDEAS.forEach(item => tags.add(item.tag));
  return Array.from(tags);
};

const CUSTOM_PROMPTS_KEY = 'uf_custom_prompts';

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

function PromptCard({ prompt, tag, onSwipe, index, total, isCustom }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const translateX = useRef(new Animated.Value(0)).current;
  const [isSwiping, setIsSwiping] = useState(false);

  const getTagColor = (tagName) => {
    const cleanTag = tagName ? tagName.replace(/^#+/, '') : '';
    const colorMap = {
      'gratitude': '#FF6B6B',
      'letting go': '#4ECDC4',
      'mindfulness': '#45B7D1',
      'wins': '#96CEB4',
      'reflection': '#DDA0DD',
      'intention': '#FFD93D',
      'emotional check-in': '#6C5CE7',
      'my own': '#A29BFE',
    };
    return colorMap[cleanTag] || colorMap['my own'];
  };

  const formattedTag = tag ? tag.replace(/^#+/, '') : 'my own';
  const tagColor = getTagColor(formattedTag);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
        translateX.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const dragX = Math.max(-150, Math.min(150, gestureState.dx));
        translateX.setValue(dragX);
      },
      onPanResponderRelease: (_, gestureState) => {
        setIsSwiping(false);
        const { dx, vx } = gestureState;
        
        const swipeThreshold = 40;
        const velocityThreshold = 0.3;
        
        if (dx > swipeThreshold || vx > velocityThreshold) {
          Animated.spring(translateX, {
            toValue: 200,
            useNativeDriver: true,
            speed: 8,
            bounciness: 10,
          }).start(() => {
            translateX.setValue(0);
            onSwipe('right');
          });
        } else if (dx < -swipeThreshold || vx < -velocityThreshold) {
          Animated.spring(translateX, {
            toValue: -200,
            useNativeDriver: true,
            speed: 8,
            bounciness: 10,
          }).start(() => {
            translateX.setValue(0);
            onSwipe('left');
          });
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 12,
            bounciness: 8,
          }).start();
        }
      },
    })
  ).current;

  const dragProgress = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: [0.8, 1, 0.8],
    extrapolate: 'clamp',
  });

  const rotateZ = translateX.interpolate({
    inputRange: [-150, 0, 150],
    outputRange: ['-6deg', '0deg', '6deg'],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View 
      style={[
        styles.promptCardWrapper,
        {
          transform: [
            { translateX },
            { scale: dragProgress },
            { rotateZ }
          ]
        }
      ]}
      {...panResponder.panHandlers}
    >
      <View style={[styles.promptCard, { borderColor: tagColor }]}>
        <View style={styles.promptCardHeader}>
          <View style={styles.promptCardHeaderLeft}>
            <View style={[styles.promptTag, { backgroundColor: tagColor + '20' }]}>
              <Text style={[styles.promptTagText, { color: tagColor }]}>#{formattedTag}</Text>
            </View>
            {isCustom && (
              <View style={styles.customBadge}>
                <Text style={styles.customBadgeText}>custom</Text>
              </View>
            )}
          </View>
          <Text style={styles.promptCounter}>{index + 1}/{total}</Text>
        </View>
        
        <View style={styles.promptQuoteIcon}>
          <Quote size={24} color={tagColor} strokeWidth={1.5} />
        </View>
        
        <Text style={styles.promptText}>"{prompt}"</Text>
        
        <View style={styles.promptNavContainer}>
          <Pressable 
            style={styles.promptNavBtn}
            onPress={() => onSwipe('left')}
            hitSlop={10}
          >
            <ChevronLeft size={20} color={colors.onSurfaceVariant} strokeWidth={2.2} />
          </Pressable>
          
          <View style={styles.promptSwipeIndicator}>
            <Text style={styles.promptSwipeText}>swipe or tap</Text>
          </View>
          
          <Pressable 
            style={styles.promptNavBtn}
            onPress={() => onSwipe('right')}
            hitSlop={10}
          >
            <ChevronRight size={20} color={colors.onSurfaceVariant} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>
    </Animated.View>
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

  const [customPrompts, setCustomPrompts] = useState([]);
  const [newPrompt, setNewPrompt] = useState('');
  const [newPromptTag, setNewPromptTag] = useState('');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [suggestedTags] = useState(getAllTags());
  const [filteredTags, setFilteredTags] = useState([]);
  const [editingPromptIndex, setEditingPromptIndex] = useState(null);
  const [editPromptText, setEditPromptText] = useState('');
  const [editPromptTag, setEditPromptTag] = useState('');

  const allPrompts = useMemo(() => [...PROMPT_IDEAS, ...customPrompts], [customPrompts]);

  useEffect(() => {
    AsyncStorage.getItem(CUSTOM_AFFIRMATIONS_KEY).then((raw) => {
      try {
        setCustomAffirmations(raw ? JSON.parse(raw) : []);
      } catch {
        setCustomAffirmations([]);
      }
    });
    AsyncStorage.getItem(CUSTOM_PROMPTS_KEY).then((raw) => {
      try {
        setCustomPrompts(raw ? JSON.parse(raw) : []);
      } catch {
        setCustomPrompts([]);
      }
    });
  }, []);

  const handleSave = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const addAffirmation = async () => {
    const text = newAffirmation.trim();
    if (!text) return;
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

  const addPrompt = async () => {
    const prompt = newPrompt.trim();
    if (!prompt) return;
    const rawTag = newPromptTag.trim().replace(/^#+/, '');
    const tag = rawTag || 'my own';
    const next = [...customPrompts, { prompt, tag }];
    setCustomPrompts(next);
    setNewPrompt('');
    setNewPromptTag('');
    setFilteredTags([]);
    Keyboard.dismiss();
    await AsyncStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(next));
  };

  const removePrompt = async (idx) => {
    const next = customPrompts.filter((_, i) => i !== idx);
    setCustomPrompts(next);
    if (currentPromptIndex >= allPrompts.length - 1 && currentPromptIndex > 0) {
      setCurrentPromptIndex((prev) => prev - 1);
    }
    await AsyncStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(next));
  };

  const startEditingPrompt = (idx) => {
    setEditingPromptIndex(idx);
    setEditPromptText(customPrompts[idx].prompt);
    setEditPromptTag(customPrompts[idx].tag);
  };

  const saveEditPrompt = async () => {
    if (editingPromptIndex === null) return;
    const text = editPromptText.trim();
    if (!text) return;
    const tag = editPromptTag.trim().replace(/^#+/, '') || 'my own';
    const updated = [...customPrompts];
    updated[editingPromptIndex] = { prompt: text, tag };
    setCustomPrompts(updated);
    setEditingPromptIndex(null);
    setEditPromptText('');
    setEditPromptTag('');
    await AsyncStorage.setItem(CUSTOM_PROMPTS_KEY, JSON.stringify(updated));
  };

  const cancelEditing = () => {
    setEditingPromptIndex(null);
    setEditPromptText('');
    setEditPromptTag('');
  };

  const handleTagInputChange = (text) => {
    setNewPromptTag(text);
    const clean = text.replace(/^#+/, '');
    if (clean.length > 0) {
      const filtered = suggestedTags.filter(tag => 
        tag.toLowerCase().includes(clean.toLowerCase())
      );
      setFilteredTags(filtered);
    } else {
      setFilteredTags([]);
    }
  };

  const selectTag = (tag) => {
    setNewPromptTag(tag);
    setFilteredTags([]);
  };

  const handleSwipe = (direction) => {
    if (direction === 'right') {
      setCurrentPromptIndex((prev) => 
        prev < allPrompts.length - 1 ? prev + 1 : 0
      );
    } else if (direction === 'left') {
      setCurrentPromptIndex((prev) => 
        prev > 0 ? prev - 1 : allPrompts.length - 1
      );
    }
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
            <Heart size={16} color={colors.accent} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>your daily affirmations</Text>
          </View>
          <Text style={styles.sectionHint}>add your own — it'll show up in the affirmation card on Home.</Text>
          
          <View style={styles.addRow}>
            <TextInput
              style={styles.addInput}
              placeholder="e.g. i am proud of my progress ✨"
              placeholderTextColor={colors.onSurfaceFaint}
              value={newAffirmation}
              onChangeText={setNewAffirmation}
              onSubmitEditing={addAffirmation}
              returnKeyType="done"
            />
            <Pressable style={styles.addBtn} onPress={addAffirmation} accessibilityRole="button" accessibilityLabel="Add affirmation">
              <Plus size={18} color={colors.onPrimary} strokeWidth={2.6} />
            </Pressable>
          </View>

          {customAffirmations.map((text, idx) => (
            <View key={idx} style={styles.customCard}>
              <Text style={styles.promptText}>"{text}"</Text>
              <Pressable onPress={() => removeAffirmation(text)} hitSlop={8} accessibilityLabel="Remove affirmation">
                <X size={16} color={colors.onSurfaceFaint} />
              </Pressable>
            </View>
          ))}

          <View style={styles.sectionTitleRow}>
            <Sparkles size={16} color={colors.accent} strokeWidth={2.2} />
            <Text style={styles.sectionTitle}>daily prompt inspiration</Text>
          </View>

          {/* Form placed above carousel */}
          <View style={styles.addPromptSection}>
            <Text style={styles.addPromptLabel}>add your own prompt</Text>
            <TextInput
              style={styles.addPromptInput}
              placeholder="write your journal prompt here..."
              placeholderTextColor={colors.onSurfaceFaint}
              value={newPrompt}
              onChangeText={setNewPrompt}
              returnKeyType="next"
              multiline
            />
            <View style={styles.addPromptTagRow}>
              <TextInput
                style={styles.addPromptTagInput}
                placeholder="add a tag (optional)"
                placeholderTextColor={colors.onSurfaceFaint}
                value={newPromptTag}
                onChangeText={handleTagInputChange}
                returnKeyType="done"
              />
              <Pressable 
                style={styles.addBtn} 
                onPress={addPrompt}
                accessibilityRole="button"
                accessibilityLabel="Add prompt"
              >
                <Plus size={18} color={colors.onPrimary} strokeWidth={2.6} />
              </Pressable>

              {filteredTags.length > 0 && (
                <View style={styles.tagSuggestions}>
                  {filteredTags.slice(0, 4).map((tag) => (
                    <Pressable
                      key={tag}
                      style={styles.tagSuggestion}
                      onPress={() => selectTag(tag)}
                    >
                      <Text style={styles.tagSuggestionText}>#{tag}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Card Carousel */}
          <View style={styles.promptCarouselContainer}>
            {allPrompts.length > 0 && (
              <PromptCard
                prompt={allPrompts[currentPromptIndex].prompt}
                tag={allPrompts[currentPromptIndex].tag}
                onSwipe={handleSwipe}
                index={currentPromptIndex}
                total={allPrompts.length}
                isCustom={currentPromptIndex >= PROMPT_IDEAS.length}
              />
            )}
            
            <View style={styles.promptDots}>
              {allPrompts.map((_, idx) => (
                <Pressable key={idx} onPress={() => setCurrentPromptIndex(idx)} hitSlop={6}>
                  <View
                    style={[
                      styles.promptDot,
                      idx === currentPromptIndex && styles.promptDotActive,
                      idx >= PROMPT_IDEAS.length && styles.promptDotCustom
                    ]}
                  />
                </Pressable>
              ))}
            </View>
          </View>

          {/* Custom Prompts Management List */}
          {customPrompts.length > 0 && (
            <View style={styles.customPromptsList}>
              <Text style={styles.customPromptsLabel}>your custom prompts ({customPrompts.length})</Text>
              {customPrompts.map((item, idx) => (
                <View key={`custom-${idx}`} style={styles.customPromptItem}>
                  {editingPromptIndex === idx ? (
                    <View style={styles.editPromptContainer}>
                      <TextInput
                        style={styles.editPromptInput}
                        value={editPromptText}
                        onChangeText={setEditPromptText}
                        placeholder="Edit your prompt"
                        placeholderTextColor={colors.onSurfaceFaint}
                        multiline
                      />
                      <View style={styles.editRow}>
                        <TextInput
                          style={styles.editTagInput}
                          value={editPromptTag}
                          onChangeText={setEditPromptTag}
                          placeholder="tag"
                          placeholderTextColor={colors.onSurfaceFaint}
                        />
                        <Pressable style={styles.editSaveBtn} onPress={saveEditPrompt}>
                          <Check size={16} color={colors.onPrimary} />
                        </Pressable>
                        <Pressable style={styles.editCancelBtn} onPress={cancelEditing}>
                          <X size={16} color={colors.onSurfaceVariant} />
                        </Pressable>
                      </View>
                    </View>
                  ) : (
                    <>
                      <View style={styles.customPromptContent}>
                        <Text style={styles.customPromptText}>"{item.prompt}"</Text>
                        <View style={[styles.promptTag, { alignSelf: 'flex-start' }]}>
                          <Text style={styles.promptTagText}>#{item.tag.replace(/^#+/, '')}</Text>
                        </View>
                      </View>
                      <View style={styles.customPromptActions}>
                        <Pressable onPress={() => startEditingPrompt(idx)} hitSlop={8} accessibilityLabel="Edit prompt">
                          <Edit2 size={16} color={colors.onSurfaceVariant} />
                        </Pressable>
                        <Pressable onPress={() => removePrompt(idx)} hitSlop={8} accessibilityLabel="Remove prompt">
                          <X size={16} color={colors.onSurfaceFaint} />
                        </Pressable>
                      </View>
                    </>
                  )}
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
  sectionHint: {
    fontSize: 11.5,
    color: colors.onSurfaceVariant,
    marginTop: -6,
    marginBottom: 12,
  },
  addRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  addInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingRight: 16,
    fontSize: 13,
    color: colors.onSurface,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...pixelShadow,
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
    marginBottom: 10,
    gap: 8,
  },
  promptCardWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  promptCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 2,
    padding: 20,
    minHeight: 180,
    width: '100%',
    ...pixelShadow,
  },
  promptCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  promptCardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promptTag: {
    alignSelf: 'flex-start',
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  promptTagText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
  },
  customBadge: {
    backgroundColor: colors.accent + '30',
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: colors.accent,
  },
  customBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.accent,
    textTransform: 'uppercase',
  },
  promptCounter: {
    fontSize: 11,
    color: colors.onSurfaceFaint,
    fontWeight: '600',
  },
  promptQuoteIcon: {
    marginBottom: 8,
  },
  promptText: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.onSurface,
    fontWeight: '600',
    fontStyle: 'italic',
    flex: 1,
  },
  promptNavContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
  },
  promptNavBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  promptSwipeIndicator: {
    alignItems: 'center',
  },
  promptSwipeText: {
    fontSize: 10,
    color: colors.onSurfaceFaint,
    fontWeight: '500',
    letterSpacing: 0.3,
    textTransform: 'uppercase',
  },
  promptCarouselContainer: {
    marginVertical: 12,
  },
  promptDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 14,
  },
  promptDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderSoft,
  },
  promptDotActive: {
    backgroundColor: colors.accent,
    width: 20,
    borderRadius: 4,
  },
  promptDotCustom: {
    backgroundColor: colors.accent + '60',
  },
  addPromptSection: {
    marginTop: 8,
    marginBottom: 12,
  },
  addPromptLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  addPromptInput: {
    minHeight: 70,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingRight: 20,
    fontSize: 13,
    color: colors.onSurface,
    textAlignVertical: 'top',
  },
  addPromptTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    position: 'relative',
  },
  addPromptTagInput: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingRight: 16,
    fontSize: 13,
    color: colors.onSurface,
  },
  tagSuggestions: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 52,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    zIndex: 10,
    ...pixelShadow,
  },
  tagSuggestion: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSoft,
  },
  tagSuggestionText: {
    fontSize: 12,
    color: colors.onSurface,
    fontWeight: '500',
  },
  customPromptsList: {
    marginTop: 16,
  },
  customPromptsLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginBottom: 8,
  },
  customPromptItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    padding: 14,
    marginBottom: 10,
  },
  customPromptContent: {
    flex: 1,
    gap: 6,
    paddingRight: 8,
  },
  customPromptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
    justifyContent: 'flex-end',
  },
  customPromptText: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurface,
    fontWeight: '500',
  },
  editPromptContainer: {
    gap: 8,
  },
  editPromptInput: {
    minHeight: 60,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.accent,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: colors.onSurface,
    textAlignVertical: 'top',
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editTagInput: {
    flex: 1,
    height: 36,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    fontSize: 12,
    color: colors.onSurface,
  },
  editSaveBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editCancelBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
});