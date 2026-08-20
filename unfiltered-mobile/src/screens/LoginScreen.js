import React, { useState, useMemo } from 'react';
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
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import PixelButton from '../components/PixelButton';
import GoogleIcon from '../components/GoogleIcon';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { colors, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

// Import logo from assets folder - going up two levels
import Logo from '../../assets/logo.png';

export default function LoginScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const { login, loginWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { signIn: signInWithGoogle, submitting: googleSubmitting } = useGoogleAuth({
    onSuccess: (accessToken) => loginWithGoogle(accessToken),
    onError: (e) => Alert.alert('Google Sign-In failed', e.message || 'Please try again.'),
  });

  const onSubmit = async () => {
    if (!email || !password) {
      Alert.alert('Missing info', 'Please enter your email and password.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
    } catch (e) {
      const message =
        e?.response?.data?.message ||
        e?.response?.data?.errors?.email?.[0] ||
        'Could not log in. Check your connection and credentials.';
      Alert.alert('Login failed', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Background Decorative Element */}
        <Text style={styles.topStarIcon}>☆</Text>

        {/* Branding / Header Section */}
        <View style={styles.header}>
          <View style={styles.brandRow}>
            <Image source={Logo} style={styles.logoImage} />
            <Text style={styles.appName}>UNFILTERED</Text>
          </View>
          <Text style={styles.tagline}>Your little space to remember every day</Text>
        </View>

        {/* Main Form Card Container */}
        <View style={styles.card}>
          {/* Email Input with Floating Label */}
          <View style={styles.inputWrapper}>
            <View style={[
              styles.inputContainer,
              (emailFocused || email) && styles.inputContainerActive
            ]}>
              <Text style={[
                styles.floatingLabel,
                (emailFocused || email) && styles.floatingLabelActive
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
                onChangeText={setEmail}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          </View>

          {/* Password Input with Floating Label and Eye Icon Inside */}
          <View style={[styles.inputWrapper, { marginTop: 20 }]}>
            <View style={[
              styles.inputContainer,
              (passwordFocused || password) && styles.inputContainerActive
            ]}>
              <Text style={[
                styles.floatingLabel,
                (passwordFocused || password) && styles.floatingLabelActive
              ]}>
                Password
              </Text>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[
                    styles.passwordInput,
                    (passwordFocused || password) && styles.inputWithText
                  ]}
                  placeholderTextColor="#999"
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={20} color={colors.onSurfaceFaint} />
                  ) : (
                    <Eye size={20} color={colors.onSurfaceFaint} />
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Remember Me & Forgot Password Row */}
          <View style={styles.rememberForgotContainer}>
            <Pressable
              style={styles.rememberMeContainer}
              onPress={() => setRememberMe(!rememberMe)}
              hitSlop={8}
            >
              <View style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked
              ]}>
                {rememberMe && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.rememberMeText}>Remember me</Text>
            </Pressable>
            
            <Pressable
              onPress={() =>
                Alert.alert('Forgot password', 'Password reset is not implemented yet.')
              }
              hitSlop={8}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </Pressable>
          </View>

          {/* Primary Action Button */}
          <PixelButton
            title="Log In"
            onPress={onSubmit}
            loading={loading}
            style={styles.loginBtn}
            textStyle={styles.loginBtnText}
          />

          {/* Visual Divider */}
          <View style={styles.dividerContainer}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* Secondary Action Button (Google SSO) */}
          <PixelButton
            title="Continue with Google"
            variant="secondary"
            onPress={signInWithGoogle}
            loading={googleSubmitting}
            style={styles.googleBtn}
            textStyle={styles.googleBtnText}
            icon={<GoogleIcon size={18} />}
          />
        </View>

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <Pressable
            onPress={() => navigation.navigate('SignUp')}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.footerLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = () => StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  topStarIcon: {
    position: 'absolute',
    top: 40,
    left: 24,
    fontSize: 24,
    color: colors.onSurfaceFaint,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 60,
    height: 52,
    resizeMode: 'contain',
    marginRight: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onBackground,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginTop: 6,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 20,
    shadowColor: '#46302a',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  inputWrapper: {
    marginBottom: 4,
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
  rememberForgotContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  checkboxChecked: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  checkmark: {
    color: colors.accentInk,
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  forgotText: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: '600',
  },
  loginBtn: {
    backgroundColor: colors.accent,
    borderRadius: 25,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginBtnText: {
    color: colors.accentInk,
    fontWeight: '700',
    fontSize: 15,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: colors.onSurfaceFaint,
  },
  googleBtn: {
    backgroundColor: colors.surface,
    borderRadius: 25,
    height: 50,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleBtnText: {
    color: colors.onSurface,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.accent,
  },
});