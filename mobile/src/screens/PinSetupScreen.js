import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Pressable,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import PixelButton from '../components/PixelButton';
import CodeInput from '../components/CodeInput';
import { colors, radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { ArrowLeft, ShieldCheck } from 'lucide-react-native';

// Dedicated PIN-setup step shown after the account-details form on Sign Up.
// Splits "create" and "confirm" into two focused screens (rather than two
// stacked code inputs on one long form) so the user's attention is on one
// 6-digit entry at a time — fewer simultaneous targets, clearer error
// recovery (a mismatch only ever asks you to redo the confirm step).
export default function PinSetupScreen({ navigation, route }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const { register } = useAuth();

  const { name, email, password, passwordConfirmation } = route.params;

  const [step, setStep] = useState('create'); // 'create' | 'confirm'
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const codeRef = useRef(null);

  const activeValue = step === 'create' ? pin : confirmPin;

  const finishSignup = useCallback(
    async (finalPin) => {
      setLoading(true);
      try {
        await register({ name, email, password, passwordConfirmation, pin: finalPin });
        // AuthContext flips `user` on success — AppNavigator swaps to the
        // main app automatically, nothing to navigate to here.
      } catch (e) {
        const errors = e?.response?.data?.errors;
        const message = errors
          ? Object.values(errors).flat().join('\n')
          : e?.response?.data?.message || 'Could not create account.';
        Alert.alert('Sign up failed', message);
        setStep('create');
        setPin('');
        setConfirmPin('');
      } finally {
        setLoading(false);
      }
    },
    [register, name, email, password, passwordConfirmation]
  );

  const handleChange = (value) => {
    if (step === 'create') {
      setPin(value);
      if (value.length === 6) {
        // Auto-advance the moment the 6th digit lands — no extra tap needed.
        setTimeout(() => setStep('confirm'), 150);
      }
    } else {
      setConfirmPin(value);
      if (value.length === 6) {
        if (value === pin) {
          finishSignup(value);
        } else {
          codeRef.current?.shake();
          setTimeout(() => setConfirmPin(''), 250);
        }
      }
    }
  };

  const goBack = () => {
    if (step === 'confirm') {
      setStep('create');
      setPin('');
      setConfirmPin('');
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Pressable onPress={goBack} hitSlop={12} style={styles.backButton} accessibilityRole="button" accessibilityLabel="Go back">
        <ArrowLeft size={22} color={colors.onSurface} />
      </Pressable>

      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <ShieldCheck size={28} color={colors.accent} />
        </View>

        <Text style={styles.title}>{step === 'create' ? 'Create a PIN' : 'Confirm your PIN'}</Text>
        <Text style={styles.subtitle}>
          {step === 'create'
            ? "You'll use this 6-digit PIN for quick logins instead of your password."
            : 'Enter it once more to make sure it matches.'}
        </Text>

        {/* Step indicator */}
        <View style={styles.stepDots}>
          <View style={[styles.stepDot, styles.stepDotActive]} />
          <View style={[styles.stepDot, step === 'confirm' && styles.stepDotActive]} />
        </View>

        <View style={styles.codeWrap}>
          <CodeInput
            ref={codeRef}
            value={activeValue}
            onChange={handleChange}
            secure
            allowReveal
            size="lg"
            autoFocus
            key={step} // remount on step change so autoFocus re-triggers
          />
        </View>

        {loading && <PixelButton title="Creating account…" onPress={() => {}} loading style={{ marginTop: 32, width: '100%' }} />}

        <Text style={styles.hint}>Choose something only you would guess - avoid birthdays or repeated digits.</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    backButton: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 56 : 24,
      left: 20,
      zIndex: 10,
      width: 40,
      height: 40,
      borderRadius: radius.full,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.borderSoft,
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 28,
    },
    iconCircle: {
      width: 64,
      height: 64,
      borderRadius: radius.full,
      backgroundColor: colors.accentSoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.onBackground,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.onSurfaceVariant,
      textAlign: 'center',
      marginTop: 8,
      marginBottom: 24,
      paddingHorizontal: 12,
      lineHeight: 20,
    },
    stepDots: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 28,
    },
    stepDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.borderSoft,
    },
    stepDotActive: {
      backgroundColor: colors.accent,
      width: 20,
    },
    codeWrap: {
      marginBottom: 8,
    },
    hint: {
      fontSize: 12,
      color: colors.onSurfaceFaint,
      textAlign: 'center',
      marginTop: 32,
      paddingHorizontal: 20,
    },
  });