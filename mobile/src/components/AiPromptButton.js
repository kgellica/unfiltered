import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Sparkles, RefreshCw } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { generateJournalPrompt } from '../api/groq';

/**
 * Simple, self-contained "AI Prompt" button for the New Entry screen.
 * Not a chatbot — no history, no state beyond the single most recent
 * generated prompt. Calls the existing Laravel /ai/journal-prompt
 * endpoint (Groq key stays server-side) and shows the result inline.
 *
 * `colors` is a mutable object that ThemeContext repaints in place
 * (applyMode/applyAccent) whenever the user changes theme. Styles have
 * to be rebuilt after that happens, so — same pattern as PromptBar.js —
 * we pull `mode`/`accent` from useTheme() purely to know *when* to
 * recompute, and rebuild styles with useMemo. Previously this component
 * built its `styles` once at module load time, before the theme had even
 * been applied, so the button was frozen on the default light-pink
 * palette regardless of the user's actual theme — which made it easy to
 * miss or misread as broken in dim/dark mode.
 */
export default function AiPromptButton() {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const [prompt, setPrompt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handlePress = async () => {
    setLoading(true);
    setError(false);
    const generated = await generateJournalPrompt();
    setLoading(false);
    if (generated) {
      setPrompt(generated);
    } else {
      setPrompt(null);
      setError(true);
    }
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
          loading && styles.buttonDisabled,
        ]}
        onPress={handlePress}
        disabled={loading}
        accessibilityRole="button"
        accessibilityLabel={error ? 'Retry generating an AI journal prompt' : 'Generate an AI journal prompt'}
        accessibilityState={{ disabled: loading, busy: loading }}
        hitSlop={6}
      >
        {loading ? (
          <>
            <ActivityIndicator size="small" color={colors.accentInk} />
            <Text style={styles.buttonText}>Thinking...</Text>
          </>
        ) : error ? (
          <>
            <RefreshCw size={15} color={colors.accentInk} strokeWidth={2.4} />
            <Text style={styles.buttonText}>Try Again</Text>
          </>
        ) : (
          <>
            <Sparkles size={15} color={colors.accentInk} strokeWidth={2.4} />
            <Text style={styles.buttonText}>AI Prompt</Text>
          </>
        )}
      </Pressable>

      {prompt ? (
        <Text style={styles.promptText}>{prompt}</Text>
      ) : error ? (
        <Text style={styles.errorText}>Couldn't generate a prompt right now — try again.</Text>
      ) : null}
    </View>
  );
}

const createStyles = () => StyleSheet.create({
  wrap: {
    marginTop: 12,
    marginBottom: 4,
  },
  button: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 44,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radius.lg,
    backgroundColor: colors.accent,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accentInk,
  },
  promptText: {
    marginTop: 10,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    color: colors.onSurfaceVariant,
  },
  errorText: {
    marginTop: 10,
    fontSize: 12,
    color: colors.error,
  },
});
