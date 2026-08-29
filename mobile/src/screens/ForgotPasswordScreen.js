import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  Pressable,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Eye, EyeOff, ArrowLeft, KeyRound } from 'lucide-react-native';
import { colors } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import PixelButton from '../components/PixelButton';
import * as authApi from '../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Focus states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  
  // Error states
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validateEmail = (text) => {
    setEmail(text);
    if (text && !text.includes('@')) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validatePassword = (text) => {
    setPassword(text);
    if (text && text.length > 0 && text.length < 8) {
      setPasswordError('Password must be at least 8 characters');
    } else if (text && text.length >= 8) {
      setPasswordError('');
    } else {
      setPasswordError('');
    }
    
    // Also validate confirm password if it has content
    if (confirmPassword && text !== confirmPassword) {
      setConfirmError('Passwords do not match');
    } else if (confirmPassword && text === confirmPassword) {
      setConfirmError('');
    }
  };

  const validateConfirmPassword = (text) => {
    setConfirmPassword(text);
    if (text && password && text !== password) {
      setConfirmError('Passwords do not match');
    } else if (text && password && text === password) {
      setConfirmError('');
    } else if (text && !password) {
      setConfirmError('Please enter a password first');
    } else {
      setConfirmError('');
    }
  };

  const isFormValid = () => {
    return (
      email && 
      email.includes('@') && 
      password && 
      password.length >= 8 && 
      confirmPassword && 
      confirmPassword === password &&
      !emailError &&
      !passwordError &&
      !confirmError
    );
  };

  const onSubmit = async () => {
    // Check each field individually for better error messages
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!email.includes('@')) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setPasswordError('Password is required');
      return;
    }
    if (password.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      return;
    }
    if (password !== confirmPassword) {
      setConfirmError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email, password, passwordConfirmation: confirmPassword });
      Alert.alert('Password updated', 'You can now log in with your new password.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('Could not reset password', e?.response?.data?.message || e?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView 
        contentContainerStyle={styles.container} 
        keyboardShouldPersistTaps="handled" 
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => navigation.goBack()} hitSlop={12} style={styles.backBtn} accessibilityLabel="Go back">
          <ArrowLeft size={22} color={colors.onSurface} />
        </Pressable>

        <View style={styles.header}>
          <View style={styles.iconBadge}>
            <KeyRound size={26} color={colors.accent} />
          </View>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>Enter your account email and choose a new password</Text>
        </View>

        <View style={styles.card}>
          {/* Email Input */}
          <View style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer,
              (emailFocused || email) && styles.inputContainerActive,
              emailError && styles.inputContainerError
            ]}>
              <Text style={[
                styles.floatingLabel,
                (emailFocused || email) && styles.floatingLabelActive,
                emailError && styles.floatingLabelError
              ]}>
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  (emailFocused || email) && styles.inputWithText
                ]}
                placeholderTextColor="#999"
                value={email}
                onChangeText={validateEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* New Password Input */}
          <View style={[styles.inputWrapper, { marginTop: 8 }]}>
            <View style={[
              styles.inputContainer,
              (passwordFocused || password) && styles.inputContainerActive,
              passwordError && styles.inputContainerError
            ]}>
              <Text style={[
                styles.floatingLabel,
                (passwordFocused || password) && styles.floatingLabelActive,
                passwordError && styles.floatingLabelError
              ]}>
                New Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    (passwordFocused || password) && styles.inputWithText
                  ]}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={validatePassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.onSurfaceFaint} />
                  ) : (
                    <Eye size={20} color={colors.onSurfaceFaint} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password Input */}
          <View style={[styles.inputWrapper, { marginTop: 8 }]}>
            <View style={[
              styles.inputContainer,
              (confirmFocused || confirmPassword) && styles.inputContainerActive,
              confirmError && styles.inputContainerError
            ]}>
              <Text style={[
                styles.floatingLabel,
                (confirmFocused || confirmPassword) && styles.floatingLabelActive,
                confirmError && styles.floatingLabelError
              ]}>
                Confirm New Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    (confirmFocused || confirmPassword) && styles.inputWithText
                  ]}
                  placeholderTextColor="#999"
                  value={confirmPassword}
                  onChangeText={validateConfirmPassword}
                  onFocus={() => setConfirmFocused(true)}
                  onBlur={() => setConfirmFocused(false)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  hitSlop={8}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} color={colors.onSurfaceFaint} />
                  ) : (
                    <Eye size={20} color={colors.onSurfaceFaint} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
            {confirmError ? <Text style={styles.errorText}>{confirmError}</Text> : null}
          </View>

          <PixelButton 
            title="Reset Password" 
            onPress={onSubmit} 
            loading={loading} 
            style={[
              styles.submitBtn,
              !isFormValid() && styles.submitBtnDisabled
            ]}
            disabled={!isFormValid()}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { 
    flexGrow: 1, 
    justifyContent: 'center',
    paddingHorizontal: 24, 
    paddingVertical: 32,
  },
  backBtn: { 
    position: 'absolute', 
    top: 20, 
    left: 20, 
    zIndex: 1, 
    padding: 8 
  },
  header: { 
    alignItems: 'center', 
    marginBottom: 28 
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { 
    fontSize: 24, 
    fontWeight: '800', 
    color: colors.onBackground 
  },
  subtitle: { 
    fontSize: 13, 
    color: colors.onSurfaceVariant, 
    marginTop: 6, 
    textAlign: 'center', 
    paddingHorizontal: 20 
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  inputWrapper: {
    marginBottom: 0,
  },
  inputContainer: {
    position: 'relative',
    height: 60,
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
  },
  inputContainerActive: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  inputContainerError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  floatingLabel: {
    position: 'absolute',
    top: 18,
    left: 14,
    fontSize: 16,
    color: colors.onSurfaceFaint,
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  floatingLabelActive: {
    top: -10,
    left: 12,
    fontSize: 12,
    color: colors.accent,
    backgroundColor: colors.surface,
    paddingHorizontal: 6,
    fontWeight: '600',
  },
  floatingLabelError: {
    color: '#FF3B30',
  },
  input: {
    height: 60,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  inputWithText: {
    paddingTop: 22,
    paddingBottom: 8,
  },
  passwordContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    height: 60,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: 'transparent',
    textAlign: 'left',
  },
  eyeIcon: {
    padding: 10,
    marginRight: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
  },
  submitBtn: { 
    backgroundColor: colors.accent, 
    borderRadius: 25, 
    height: 50, 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 24 
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
});