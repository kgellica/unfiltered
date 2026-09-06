import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import PixelButton from '../components/PixelButton';
import CodeInput from '../components/CodeInput';
import { colors, radius } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff, Fingerprint, KeyRound, Check, X } from 'lucide-react-native';
import { isBiometricAvailable, authenticateWithBiometrics, getBiometricStatus } from '../utils/biometrics';
import eventEmitter from '../utils/eventEmitter';

import Logo from '../../assets/logo.png';

export default function LoginScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const auth = useAuth();
  const {
    login,
    loginWithPin,
    unlockWithBiometrics,
    enableBiometricLogin,
    savedEmail,
    biometricEnabled,
    token,
  } = auth;

  const hasReturningSession = !!savedEmail;
  const [screen, setScreen] = useState(hasReturningSession ? 'pin' : 'password');
  const [method, setMethod] = useState('pin');
  const [email, setEmail] = useState(savedEmail || '');
  const [password, setPassword] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [isProcessingBiometric, setIsProcessingBiometric] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Modal states
  const [termsModalVisible, setTermsModalVisible] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Listen for token updates from event emitter
  useEffect(() => {
    const handler = (data) => {
      console.log('Event received - token:', !!data.token);
      setForceUpdate(prev => prev + 1);
    };
    eventEmitter.on('TOKEN_UPDATED', handler);
    return () => {
      eventEmitter.off('TOKEN_UPDATED', handler);
    };
  }, []);

  // Check token on every render
  console.log('LoginScreen RENDER - token exists:', !!token, 'forceUpdate:', forceUpdate);

  // Check biometric status on mount
  useEffect(() => {
    const checkBiometricStatus = async () => {
      try {
        const status = await getBiometricStatus();
        console.log('Biometric Status:', status);
      } catch (error) {
        console.error('Error checking biometric status:', error);
      }
    };
    checkBiometricStatus();
  }, []);

  // Try biometric when token becomes available
  useEffect(() => {
    console.log('Token effect - token exists:', !!token);
    if (token && biometricEnabled && hasReturningSession && !isProcessingBiometric) {
      console.log('Token available - trying biometric');
      performBiometricUnlock();
    }
  }, [token, forceUpdate]);

  const maybeOfferBiometricEnrollment = useCallback(async () => {
    if (biometricEnabled) return;
    const available = await isBiometricAvailable();
    if (!available) return;
    Alert.alert(
      'Enable Face ID / Fingerprint?',
      'Use your device biometrics for faster logins next time.',
      [
        { text: 'Not now', style: 'cancel' },
        {
          text: 'Enable',
          onPress: async () => {
            const ok = await authenticateWithBiometrics('Confirm biometrics for Unfiltered');
            if (ok) {
              await enableBiometricLogin();
              Alert.alert('Success', 'Biometric login enabled!');
            } else {
              Alert.alert('Failed', 'Biometric authentication failed.');
            }
          },
        },
      ]
    );
  }, [biometricEnabled, enableBiometricLogin]);

  const performBiometricUnlock = useCallback(async () => {
    console.log('performBiometricUnlock - token:', !!token);
    if (isProcessingBiometric) return false;
    if (!token) {
      console.log('No token');
      return false;
    }
    if (!biometricEnabled) {
      console.log('Biometric not enabled');
      return false;
    }
    setIsProcessingBiometric(true);
    const available = await isBiometricAvailable();
    if (!available) {
      Alert.alert('Biometric Not Available', 'Your device does not have biometric authentication set up.');
      setIsProcessingBiometric(false);
      return false;
    }
    setMethod('biometric');
    const ok = await authenticateWithBiometrics('Unlock Unfiltered');
    if (ok) {
      console.log('Biometric success');
      const unlocked = await unlockWithBiometrics();
      setIsProcessingBiometric(false);
      if (unlocked) {
        console.log('Session unlocked - AppNavigator will switch to MainTabs');
        return true;
      } else {
        Alert.alert('Session expired', 'Please log in again.');
        setMethod('pin');
        return false;
      }
    } else {
      console.log('Biometric failed');
      setMethod('pin');
      setIsProcessingBiometric(false);
      return false;
    }
  }, [token, biometricEnabled, unlockWithBiometrics, navigation, isProcessingBiometric]);

  const tryBiometricUnlock = useCallback(async () => {
    await performBiometricUnlock();
  }, [performBiometricUnlock]);

  const onSubmitPassword = async () => {
    if (!termsAgreed) {
      setTermsModalVisible(true);
      return;
    }
    
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      console.log('Logging in with password');
      await login(email, password, rememberMe);
      console.log('Login successful');

      await maybeOfferBiometricEnrollment();
      if (biometricEnabled) {
        setScreen('pin');
        setPin('');
      }
    } catch (e) {
      console.error('Login error:', e);
      Alert.alert('Login failed', e?.response?.data?.message || e?.message || 'Could not log in.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitPin = async () => {
    if (!termsAgreed) {
      setTermsModalVisible(true);
      return;
    }
    
    if (pin.length !== 6) {
      Alert.alert('Enter your PIN', 'Please enter your 6-digit PIN.');
      return;
    }
    setLoading(true);
    try {
      console.log('Logging in with PIN');
      await loginWithPin(savedEmail, pin);
      console.log('PIN login successful');

      await maybeOfferBiometricEnrollment();
      if (biometricEnabled) {
        setPin('');
      }
    } catch (e) {
      console.error('PIN login error:', e);
      Alert.alert('Login failed', e?.response?.data?.message || e?.message || 'Incorrect PIN.');
      setPin('');
    } finally {
      setLoading(false);
    }
  };

  // Handle terms agreement
  const handleAgreeTerms = () => {
    setTermsAgreed(true);
    setTermsModalVisible(false);
  };

  const handleDeclineTerms = () => {
    setTermsModalVisible(false);
    // User stays on login screen, cannot proceed
  };

  // PIN Login Screen
  if (screen === 'pin') {
    return (
      <>
        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <View style={styles.pinContainer}>
            <View style={styles.brandRow}>
              <Image source={Logo} style={styles.logoImage} />
              <Text style={styles.appName}>UNFILTERED</Text>
            </View>
            <Text style={styles.pinTitle}>Welcome back</Text>
            <Text style={styles.pinSubtitle}>{savedEmail}</Text>
            {biometricEnabled ? (
              <View style={styles.methodToggle}>
                <TouchableOpacity
                  style={[styles.methodOption, method === 'pin' && styles.methodOptionActive]}
                  onPress={() => setMethod('pin')}
                >
                  <KeyRound size={16} color={method === 'pin' ? colors.accentInk : colors.onSurfaceVariant} />
                  <Text style={[styles.methodOptionText, method === 'pin' && styles.methodOptionTextActive]}>PIN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodOption, method === 'biometric' && styles.methodOptionActive]}
                  onPress={tryBiometricUnlock}
                >
                  <Fingerprint size={16} color={method === 'biometric' ? colors.accentInk : colors.onSurfaceVariant} />
                  <Text style={[styles.methodOptionText, method === 'biometric' && styles.methodOptionTextActive]}>Biometric</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <Text style={styles.pinHint}>Enter your 6-digit PIN</Text>
            )}
            <Text style={styles.pinHint}>Enter your 6-digit PIN</Text>
            <View style={{ marginTop: 16, marginBottom: 8 }}>
              <CodeInput value={pin} onChange={setPin} secure allowReveal />
            </View>
            <PixelButton title="Unlock" onPress={onSubmitPin} loading={loading} style={{ marginTop: 20, width: '100%' }} />
            <Pressable onPress={() => setScreen('password')} hitSlop={8} style={{ marginTop: 16 }}>
              <Text style={styles.forgotText}>Use email and password instead</Text>
            </Pressable>
            
            {/* Terms Link */}
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>
                By continuing, you agree to our{' '}
                <Text style={styles.legalLink} onPress={() => setTermsModalVisible(true)}>
                  Terms of Service
                </Text>
                {' and '}
                <Text style={styles.legalLink} onPress={() => setTermsModalVisible(true)}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
        </KeyboardAvoidingView>

        {/* Terms Modal */}
        <TermsModal
          visible={termsModalVisible}
          onAgree={handleAgreeTerms}
          onDecline={handleDeclineTerms}
        />
      </>
    );
  }

  // Password Login Screen
  return (
    <>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.topStarIcon}>☆</Text>
          <View style={styles.header}>
            <View style={styles.brandRow}>
              <Image source={Logo} style={styles.logoImage} />
              <Text style={styles.appName}>UNFILTERED</Text>
            </View>
            <Text style={styles.tagline}>Your little space to remember every day</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.inputWrapper}>
              <View style={[styles.inputContainer, (emailFocused || email) && styles.inputContainerActive]}>
                <Text style={[styles.floatingLabel, (emailFocused || email) && styles.floatingLabelActive]}>Email Address</Text>
                <TextInput
                  style={[styles.input, (emailFocused || email) && styles.inputWithText]}
                  placeholderTextColor="#999"
                  value={email}
                  onChangeText={setEmail}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>
            <View style={[styles.inputWrapper, { marginTop: 20 }]}>
              <View style={[styles.inputContainer, (passwordFocused || password) && styles.inputContainerActive]}>
                <Text style={[styles.floatingLabel, (passwordFocused || password) && styles.floatingLabelActive]}>Password</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, (passwordFocused || password) && styles.inputWithText]}
                    placeholderTextColor="#999"
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                    {showPassword ? <EyeOff size={20} color={colors.onSurfaceFaint} /> : <Eye size={20} color={colors.onSurfaceFaint} />}
                  </TouchableOpacity>
                </View>
              </View>
            </View>
            <View style={styles.rememberForgotContainer}>
              <Pressable
                style={styles.rememberMeRow}
                onPress={() => setRememberMe((prev) => !prev)}
                hitSlop={8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: rememberMe }}
                accessibilityLabel="Remember me"
              >
                <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                  {rememberMe && <Check size={13} color={colors.accentInk} strokeWidth={3} />}
                </View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('ForgotPassword')} hitSlop={8}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </Pressable>
            </View>
            <PixelButton title="Log In" onPress={onSubmitPassword} loading={loading} style={styles.loginBtn} textStyle={styles.loginBtnText} />
            {hasReturningSession && (
              <>
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>or continue with</Text>
                  <View style={styles.dividerLine} />
                </View>
                <View style={styles.quickLoginRow}>
                  <TouchableOpacity style={[styles.quickLoginBtn, !biometricEnabled && styles.quickLoginBtnFull]} onPress={() => setScreen('pin')}>
                    <KeyRound size={18} color={colors.onSurface} />
                    <Text style={styles.quickLoginText}>PIN</Text>
                  </TouchableOpacity>
                  {biometricEnabled && (
                    <TouchableOpacity style={styles.quickLoginBtn} onPress={() => setScreen('pin')}>
                      <Fingerprint size={18} color={colors.onSurface} />
                      <Text style={styles.quickLoginText}>Biometric</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}
            
            {/* Terms Link */}
            <View style={styles.legalContainer}>
              <Text style={styles.legalText}>
                By continuing, you agree to our{' '}
                <Text style={styles.legalLink} onPress={() => setTermsModalVisible(true)}>
                  Terms of Service
                </Text>
                {' and '}
                <Text style={styles.legalLink} onPress={() => setTermsModalVisible(true)}>
                  Privacy Policy
                </Text>
              </Text>
            </View>
          </View>
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Pressable onPress={() => navigation.navigate('SignUp')} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={styles.footerLink}>Sign Up</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Terms Modal */}
      <TermsModal
        visible={termsModalVisible}
        onAgree={handleAgreeTerms}
        onDecline={handleDeclineTerms}
      />
    </>
  );
}

// Terms Modal Component
const TermsModal = ({ visible, onAgree, onDecline }) => {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createTermsModalStyles(), [mode, accent]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDecline}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Terms of Service & Privacy Policy</Text>
            <Pressable onPress={onDecline} hitSlop={8}>
              <X size={24} color={colors.onSurfaceVariant} />
            </Pressable>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.sectionTitle}>Terms of Service</Text>
            <Text style={styles.termsText}>
              By using Unfiltered, you agree to the following terms:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                This app is created for academic purposes as part of an HCI & UX Design project.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                All data entered is for demonstration purposes only and is not stored permanently.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                You are responsible for the content you create and share within the app.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                The app is provided "as is" without warranties of any kind.
              </Text>
            </View>

            <Text style={[styles.sectionTitle, { marginTop: 16 }]}>Privacy Policy</Text>
            <Text style={styles.termsText}>
              Your privacy matters to us. Here's how we handle your data:
            </Text>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                No personal data is collected, stored, or shared with third parties.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                All journal entries are stored locally on your device and are not transmitted to external servers.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                Your email and password are used solely for authentication within the app.
              </Text>
            </View>
            <View style={styles.bulletPoint}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>
                No analytics or tracking tools are implemented in this application.
              </Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.acknowledgment}>
              By tapping "I Agree", you acknowledge that you have read and understood these terms.
            </Text>
          </ScrollView>

          <View style={styles.modalActions}>
            <Pressable style={[styles.modalBtn, styles.declineBtn]} onPress={onDecline}>
              <Text style={styles.declineBtnText}>Decline</Text>
            </Pressable>
            <Pressable style={[styles.modalBtn, styles.agreeBtn]} onPress={onAgree}>
              <Text style={styles.agreeBtnText}>I Agree</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const createTermsModalStyles = () => StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: '85%',
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
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.onSurface,
    flex: 1,
    marginRight: 12,
  },
  modalContent: {
    maxHeight: 400,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.onSurface,
    marginBottom: 8,
  },
  termsText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    marginBottom: 10,
    lineHeight: 18,
  },
  bulletPoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  bulletDot: {
    fontSize: 14,
    color: colors.accent,
    marginRight: 8,
    fontWeight: '700',
  },
  bulletText: {
    flex: 1,
    fontSize: 13,
    color: colors.onSurfaceVariant,
    lineHeight: 18,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginVertical: 16,
  },
  acknowledgment: {
    fontSize: 13,
    color: colors.onSurface,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  declineBtn: {
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
  },
  declineBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  agreeBtn: {
    backgroundColor: colors.accent,
  },
  agreeBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.accentInk,
  },
});

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 },
  topStarIcon: { position: 'absolute', top: 40, left: 24, fontSize: 24, color: colors.onSurfaceFaint },
  header: { alignItems: 'center', marginBottom: 32 },
  brandRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  logoImage: { width: 60, height: 52, resizeMode: 'contain', marginRight: 10 },
  appName: { fontSize: 28, fontWeight: '800', color: colors.onBackground, letterSpacing: 2 },
  tagline: { fontSize: 14, color: colors.onSurfaceVariant, marginTop: 6 },
  card: { backgroundColor: colors.surface, borderRadius: 24, padding: 20, shadowColor: '#46302a', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4, borderWidth: 1, borderColor: colors.borderSoft },
  inputWrapper: { marginBottom: 4 },
  inputContainer: { position: 'relative', height: 60, borderWidth: 1.5, borderColor: colors.borderSoft, borderRadius: 14, backgroundColor: colors.surface, justifyContent: 'center' },
  inputContainerActive: { borderColor: colors.accent, borderWidth: 2 },
  floatingLabel: { position: 'absolute', top: 18, left: 14, fontSize: 16, color: colors.onSurfaceFaint, backgroundColor: 'transparent', zIndex: 1 },
  floatingLabelActive: { top: -10, left: 12, fontSize: 12, color: colors.accent, backgroundColor: colors.surface, paddingHorizontal: 6, fontWeight: '600' },
  input: { height: 60, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 16, color: colors.onSurface, backgroundColor: 'transparent', textAlign: 'left' },
  inputWithText: { paddingTop: 22, paddingBottom: 8 },
  passwordContainer: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  passwordInput: { flex: 1, height: 60, paddingHorizontal: 14, paddingTop: 10, paddingBottom: 10, fontSize: 16, color: colors.onSurface, backgroundColor: 'transparent', textAlign: 'left' },
  eyeIcon: { padding: 10, marginRight: 8 },
  rememberForgotContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 4 },
  rememberMeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: colors.accent, borderColor: colors.accent },
  rememberMeText: { fontSize: 13, color: colors.onSurfaceVariant, fontWeight: '600' },
  forgotText: { fontSize: 13, color: colors.accent, fontWeight: '600' },
  loginBtn: { backgroundColor: colors.accent, borderRadius: 25, height: 50, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  loginBtnText: { color: colors.accentInk, fontWeight: '700', fontSize: 15 },
  dividerContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 22, marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderSoft },
  dividerText: { marginHorizontal: 12, fontSize: 12, fontWeight: '600', color: colors.onSurfaceFaint },
  quickLoginRow: { flexDirection: 'row', gap: 10 },
  quickLoginBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, height: 48, borderRadius: 25, borderWidth: 1.5, borderColor: colors.borderSoft, backgroundColor: colors.surface },
  quickLoginBtnFull: { flex: 1 },
  quickLoginText: { fontSize: 14, fontWeight: '700', color: colors.onSurface },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerText: { fontSize: 13, color: colors.onSurfaceVariant },
  footerLink: { fontSize: 13, fontWeight: '700', color: colors.accent },
  pinContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 28 },
  pinTitle: { fontSize: 22, fontWeight: '700', color: colors.onBackground, marginTop: 24 },
  pinSubtitle: { fontSize: 13, color: colors.onSurfaceVariant, marginTop: 4 },
  pinHint: { fontSize: 13, color: colors.onSurfaceFaint, marginTop: 20, marginBottom: 4 },
  methodToggle: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radius.full, padding: 4, marginTop: 20, gap: 4 },
  methodOption: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 8, paddingHorizontal: 18, borderRadius: radius.full },
  methodOptionActive: { backgroundColor: colors.accent },
  methodOptionText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  methodOptionTextActive: { color: colors.accentInk },
  
  // Legal styles
  legalContainer: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.borderSoft,
    alignItems: 'center',
  },
  legalText: {
    fontSize: 11,
    color: colors.onSurfaceFaint,
    textAlign: 'center',
    lineHeight: 16,
  },
  legalLink: {
    color: colors.accent,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
});