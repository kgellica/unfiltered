import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, Modal, ScrollView, ActivityIndicator, TextInput, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Shuffle, Plus, X, NotebookPen, Sparkles, Trash2, PenLine } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { generateJournalPrompt } from '../api/gemini';

const MY_PROMPTS_KEY = 'unfiltered.myPrompts.v1';
const MAX_MY_PROMPTS = 50;
const MAX_PROMPT_LENGTH = 200;

// Local fallback prompts — used when Gemini isn't configured or a request
// fails, and also shown in the "Show All" list alongside anything generated
// this session.
const PRESET_PROMPTS = [
  'Write about the beautiful moments of this week.',
  'What made you smile today, even briefly?',
  'Describe a small win you had recently.',
  'What is something you are looking forward to?',
  'Write a letter to yourself a year from now.',
  'What is weighing on your mind right now?',
  'Name three things you are grateful for today.',
  'What would make today feel like a good day?',
];

export default function PromptBar({ onUsePrompt }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const [visible, setVisible] = useState(true);
  const [prompt, setPrompt] = useState(
    () => PRESET_PROMPTS[Math.floor(Math.random() * PRESET_PROMPTS.length)]
  );
  const [isAi, setIsAi] = useState(false);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [showAll, setShowAll] = useState(false);

  // User-authored prompts — persisted locally so they survive app restarts.
  const [myPrompts, setMyPrompts] = useState([]);
  const [myPromptsLoaded, setMyPromptsLoaded] = useState(false);
  const [composerVisible, setComposerVisible] = useState(false);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    AsyncStorage.getItem(MY_PROMPTS_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setMyPrompts(parsed);
        }
      })
      .catch(() => {})
      .finally(() => setMyPromptsLoaded(true));
  }, []);

  const persistMyPrompts = useCallback((next) => {
    setMyPrompts(next);
    AsyncStorage.setItem(MY_PROMPTS_KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const openComposer = () => {
    setDraft('');
    setComposerVisible(true);
  };

  const saveDraftPrompt = () => {
    const text = draft.trim();
    if (!text) return;
    if (myPrompts.includes(text)) {
      Alert.alert('Already saved', 'That prompt is already in My Prompts.');
      return;
    }
    const next = [text, ...myPrompts].slice(0, MAX_MY_PROMPTS);
    persistMyPrompts(next);
    setDraft('');
    setComposerVisible(false);
    // Immediately put the new prompt to use, same as picking one from the list.
    setPrompt(text);
    setIsAi(false);
    setVisible(true);
  };

  const deleteMyPrompt = (text) => {
    Alert.alert('Delete prompt?', 'This removes it from My Prompts.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => persistMyPrompts(myPrompts.filter((p) => p !== text)),
      },
    ]);
  };

  const newPrompt = async () => {
    setLoading(true);
    const generated = await generateJournalPrompt();
    setLoading(false);
    if (generated) {
      setPrompt(generated);
      setIsAi(true);
      setHistory((prev) => [generated, ...prev].slice(0, 20));
      return;
    }
    // Backend has no key configured, or the request failed — cycle through
    // the local presets instead.
    const pool = PRESET_PROMPTS.filter((p) => p !== prompt);
    setPrompt(pool[Math.floor(Math.random() * pool.length)] || PRESET_PROMPTS[0]);
    setIsAi(false);
  };

  const allPrompts = useMemo(() => {
    const seen = new Set();
    return [prompt, ...myPrompts, ...history, ...PRESET_PROMPTS].filter((p) => {
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    });
  }, [prompt, myPrompts, history]);

  if (!visible) {
    return (
      <Pressable
        style={({ pressed }) => [styles.addPromptBtn, pressed && styles.addPromptBtnPressed]}
        onPress={() => setVisible(true)}
        accessibilityRole="button"
        accessibilityLabel="Add a writing prompt"
      >
        <Plus size={16} color={colors.accent} strokeWidth={2.4} />
        <Text style={styles.addPromptText}>Add Prompt</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.promptTextWrap}>
          {isAi && (
            <View style={styles.aiBadge}>
              <Sparkles size={10} color={colors.accent} strokeWidth={2.6} />
              <Text style={styles.aiBadgeText}>AI</Text>
            </View>
          )}
          <Text style={styles.promptText}>{prompt}</Text>
        </View>
        <Pressable
          onPress={() => setVisible(false)}
          hitSlop={8}
          style={styles.closeBtn}
          accessibilityRole="button"
          accessibilityLabel="Dismiss prompt"
        >
          <X size={16} color={colors.onSurfaceVariant} strokeWidth={2.2} />
        </Pressable>
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={({ pressed }) => [styles.newPromptBtn, pressed && styles.newPromptBtnPressed]}
          onPress={newPrompt}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Get a new prompt"
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.onSurface} />
          ) : (
            <>
              <Shuffle size={15} color={colors.onSurface} strokeWidth={2.2} />
              <Text style={styles.newPromptText}>New Prompt</Text>
            </>
          )}
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={() => onUsePrompt && onUsePrompt(prompt)}
          accessibilityRole="button"
          accessibilityLabel="Use this prompt as your entry title"
        >
          <NotebookPen size={16} color={colors.onSurface} strokeWidth={2.2} />
        </Pressable>

        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
          onPress={openComposer}
          accessibilityRole="button"
          accessibilityLabel="Create your own prompt"
        >
          <PenLine size={16} color={colors.onSurface} strokeWidth={2.2} />
        </Pressable>

        <Pressable onPress={() => setShowAll(true)} hitSlop={6}>
          <Text style={styles.showAllText}>Show All</Text>
        </Pressable>
      </View>

      <Modal visible={showAll} transparent animationType="fade" onRequestClose={() => setShowAll(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAll(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Writing Prompts</Text>
              <Pressable
                style={({ pressed }) => [styles.modalCreateBtn, pressed && { opacity: 0.8 }]}
                onPress={() => {
                  setShowAll(false);
                  openComposer();
                }}
                accessibilityRole="button"
                accessibilityLabel="Create a new prompt"
              >
                <Plus size={14} color={colors.accent} strokeWidth={2.6} />
                <Text style={styles.modalCreateBtnText}>New</Text>
              </Pressable>
            </View>
            <ScrollView style={styles.modalList} showsVerticalScrollIndicator={false}>
              {myPrompts.length > 0 && (
                <>
                  <Text style={styles.modalSectionLabel}>MY PROMPTS</Text>
                  {myPrompts.map((p, i) => (
                    <View key={`mine-${i}-${p}`} style={styles.modalItemRow}>
                      <Pressable
                        style={({ pressed }) => [styles.modalItem, styles.modalItemFlex, pressed && styles.modalItemPressed]}
                        onPress={() => {
                          setPrompt(p);
                          setIsAi(false);
                          setShowAll(false);
                        }}
                      >
                        <Text style={styles.modalItemText}>{p}</Text>
                      </Pressable>
                      <Pressable
                        onPress={() => deleteMyPrompt(p)}
                        hitSlop={8}
                        style={styles.modalDeleteBtn}
                        accessibilityRole="button"
                        accessibilityLabel="Delete this prompt"
                      >
                        <Trash2 size={15} color={colors.error} strokeWidth={2.2} />
                      </Pressable>
                    </View>
                  ))}
                  <Text style={styles.modalSectionLabel}>SUGGESTED</Text>
                </>
              )}
              {allPrompts.filter((p) => !myPrompts.includes(p)).map((p, i) => (
                <Pressable
                  key={`${i}-${p}`}
                  style={({ pressed }) => [styles.modalItem, pressed && styles.modalItemPressed]}
                  onPress={() => {
                    setPrompt(p);
                    setIsAi(false);
                    setShowAll(false);
                  }}
                >
                  <Text style={styles.modalItemText}>{p}</Text>
                </Pressable>
              ))}
            </ScrollView>
            <Pressable style={styles.modalCloseBtn} onPress={() => setShowAll(false)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Compose-your-own-prompt modal — kept separate from Show All so it
          works both from the toolbar action and from inside the list. */}
      <Modal visible={composerVisible} transparent animationType="fade" onRequestClose={() => setComposerVisible(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setComposerVisible(false)}>
          <Pressable style={styles.modalCard} onPress={() => {}}>
            <Text style={styles.modalTitle}>Create a prompt</Text>
            <TextInput
              style={styles.composerInput}
              placeholder="e.g. What surprised you today?"
              placeholderTextColor={colors.outline}
              value={draft}
              onChangeText={setDraft}
              multiline
              maxLength={MAX_PROMPT_LENGTH}
              autoFocus
            />
            <Text style={styles.composerCounter}>{draft.length}/{MAX_PROMPT_LENGTH}</Text>
            <View style={styles.composerActions}>
              <Pressable style={styles.modalCloseBtn} onPress={() => setComposerVisible(false)}>
                <Text style={styles.modalCloseText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.composerSaveBtn, !draft.trim() && styles.composerSaveBtnDisabled]}
                onPress={saveDraftPrompt}
                disabled={!draft.trim()}
                accessibilityRole="button"
                accessibilityLabel="Save prompt"
              >
                <Text style={styles.composerSaveBtnText}>Save &amp; Use</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    padding: 14,
    marginBottom: 14,
  },
  topRow: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 },
  promptTextWrap: { flex: 1 },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    alignSelf: 'flex-start',
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 4,
  },
  aiBadgeText: { fontSize: 9, fontWeight: '800', color: colors.accent, letterSpacing: 0.4 },
  promptText: { fontSize: 15, fontWeight: '700', color: colors.onSurface, lineHeight: 21 },
  closeBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  actionsRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  newPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  newPromptBtnPressed: { opacity: 0.8 },
  newPromptText: { fontSize: 12.5, fontWeight: '700', color: colors.onSurface },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  iconBtnPressed: { opacity: 0.8 },
  showAllText: { fontSize: 12.5, fontWeight: '700', color: colors.accent, marginLeft: 'auto' },

  addPromptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    marginBottom: 14,
  },
  addPromptBtnPressed: { opacity: 0.8 },
  addPromptText: { fontSize: 13, fontWeight: '700', color: colors.accent },

  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  modalCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 18,
    maxHeight: '70%',
  },
  modalHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modalTitle: { fontSize: 15, fontWeight: '800', color: colors.onSurface },
  modalCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modalCreateBtnText: { fontSize: 12.5, fontWeight: '700', color: colors.accent },
  modalSectionLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.6,
    color: colors.onSurfaceFaint,
    marginTop: 10,
    marginBottom: 4,
    paddingHorizontal: 10,
  },
  modalList: { marginBottom: 8 },
  modalItemRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  modalItemFlex: { flex: 1 },
  modalDeleteBtn: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.md,
  },
  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: radius.md,
  },
  modalItemPressed: { backgroundColor: colors.surfaceMuted },
  modalItemText: { fontSize: 13.5, color: colors.onSurface, lineHeight: 19 },
  modalCloseBtn: { alignSelf: 'center', paddingVertical: 10, paddingHorizontal: 20 },
  modalCloseText: { fontSize: 13, fontWeight: '700', color: colors.accent },

  composerInput: {
    minHeight: 90,
    maxHeight: 160,
    fontSize: 14.5,
    color: colors.onSurface,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    padding: 12,
    textAlignVertical: 'top',
  },
  composerCounter: {
    fontSize: 11,
    color: colors.onSurfaceFaint,
    textAlign: 'right',
    marginTop: 4,
    marginBottom: 12,
  },
  composerActions: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8 },
  composerSaveBtn: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  composerSaveBtnDisabled: { opacity: 0.5 },
  composerSaveBtnText: { fontSize: 13, fontWeight: '800', color: '#FFFFFF' },
});