import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, Pressable, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../context/AuthContext';
import PixelButton from '../components/PixelButton';
import CodeInput from '../components/CodeInput';
import { colors } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

const RESEND_COOLDOWN_SECONDS = 30;

export default function OtpVerificationScreen({ navigation, route }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const { verifyOtp, resendOtp } = useAuth();
  const email = route?.params?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN_SECONDS);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const onVerify = async () => {
    if (otp.length !== 6) {
      Alert.alert('Enter your code', 'Please enter the 6-digit code we emailed you.');
      return;
    }
    setLoading(true);
    try {
      await verifyOtp({ email, otp });
      // Successful verification logs the user in — AppNavigator will swap
      // to the authenticated stack automatically.
    } catch (e) {
      const message =
        e?.response?.data?.errors?.otp?.[0] || e?.response?.data?.message || 'Invalid or expired code.';
      Alert.alert('Verification failed', message);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    setResending(true);
    try {
      await resendOtp(email);
      setCooldown(RESEND_COOLDOWN_SECONDS);
      Alert.alert('Code sent', 'A new verification code has been emailed to you.');
    } catch (e) {
      Alert.alert('Could not resend', e?.response?.data?.message || 'Please try again shortly.');
    } finally {
      setResending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.email}>{email}</Text>
        </Text>

        <View style={styles.codeWrapper}>
          <CodeInput value={otp} onChange={setOtp} />
        </View>

        <PixelButton title="Verify" onPress={onVerify} loading={loading} style={{ marginTop: 28 }} />

        <Pressable onPress={onResend} disabled={cooldown > 0 || resending} style={styles.resendRow} hitSlop={8}>
          <Text style={[styles.resendText, cooldown > 0 && styles.resendTextDisabled]}>
            {cooldown > 0 ? `Resend code in ${cooldown}s` : resending ? 'Sending…' : 'Resend code'}
          </Text>
        </Pressable>

        <Pressable onPress={() => navigation.goBack()} hitSlop={8} style={{ marginTop: 8 }}>
          <Text style={styles.backText}>Back</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = () =>
  StyleSheet.create({
    flex: { flex: 1, backgroundColor: colors.background },
    container: { flex: 1, justifyContent: 'center', paddingHorizontal: 28 },
    title: { fontSize: 26, fontWeight: '700', color: colors.onBackground, textAlign: 'center', marginBottom: 8 },
    subtitle: { fontSize: 14, color: colors.onSurfaceVariant, textAlign: 'center', marginBottom: 28, lineHeight: 20 },
    email: { fontWeight: '700', color: colors.onSurface },
    codeWrapper: { alignItems: 'center' },
    resendRow: { alignItems: 'center', marginTop: 20 },
    resendText: { color: colors.accent, fontWeight: '700', fontSize: 13 },
    resendTextDisabled: { color: colors.onSurfaceFaint },
    backText: { color: colors.onSurfaceVariant, fontSize: 13, textAlign: 'center' },
  });
