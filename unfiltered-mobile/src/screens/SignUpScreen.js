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

export default function SignUpScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const { register, loginWithGoogle } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);

  const { signIn: signInWithGoogle, submitting: googleSubmitting } = useGoogleAuth({
    onSuccess: (accessToken) => loginWithGoogle(accessToken),
    onError: (e) => Alert.alert('Google Sign-In failed', e.message || 'Please try again.'),
  });

  const onSubmit = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Passwords do not match', 'Please re-enter your password.');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
    } catch (e) {
      const errors = e?.response?.data?.errors;
      const message = errors ? Object.values(errors).flat().join('\n') : 'Could not create account.';
      Alert.alert('Sign up failed', message);
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
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Start journaling your days.</Text>

        {/* Name Input with Floating Label */}
        <View style={styles.inputWrapper}>
          <View style={[
            styles.inputContainer,
            (nameFocused || name) && styles.inputContainerActive
          ]}>
            <Text style={[
              styles.floatingLabel,
              (nameFocused || name) && styles.floatingLabelActive
            ]}>
              Name
            </Text>
            <TextInput
              style={[
                styles.input,
                (nameFocused || name) && styles.inputWithText
              ]}
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>
        </View>

        {/* Email Input with Floating Label */}
        <View style={[styles.inputWrapper, { marginTop: 4 }]}>
          <View style={[
            styles.inputContainer,
            (emailFocused || email) && styles.inputContainerActive
          ]}>
            <Text style={[
              styles.floatingLabel,
              (emailFocused || email) && styles.floatingLabelActive
            ]}>
              Email
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
            />
          </View>
        </View>

        {/* Password Input with Floating Label and Eye Icon */}
        <View style={[styles.inputWrapper, { marginTop: 4 }]}>
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

        {/* Confirm Password Input with Floating Label and Eye Icon */}
        <View style={[styles.inputWrapper, { marginTop: 4 }]}>
          <View style={[
            styles.inputContainer,
            (confirmFocused || confirm) && styles.inputContainerActive
          ]}>
            <Text style={[
              styles.floatingLabel,
              (confirmFocused || confirm) && styles.floatingLabelActive
            ]}>
              Confirm Password
            </Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[
                  styles.passwordInput,
                  (confirmFocused || confirm) && styles.inputWithText
                ]}
                placeholderTextColor="#999"
                value={confirm}
                onChangeText={setConfirm}
                onFocus={() => setConfirmFocused(true)}
                onBlur={() => setConfirmFocused(false)}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                hitSlop={8}
                accessibilityRole="button"
                accessibilityLabel={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.onSurfaceFaint} />
                ) : (
                  <Eye size={20} color={colors.onSurfaceFaint} />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <PixelButton 
          title="Create Account" 
          onPress={onSubmit} 
          loading={loading} 
          style={{ marginTop: 12 }} 
        />

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <PixelButton
          title="Continue with Google"
          variant="secondary"
          onPress={signInWithGoogle}
          loading={googleSubmitting}
          style={styles.googleBtn}
          icon={<GoogleIcon size={18} />}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Log In</Text>
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
  title: { 
    fontSize: 28, 
    fontWeight: '700', 
    color: colors.onBackground,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: { 
    fontSize: 14, 
    color: colors.onSurfaceVariant,
    marginBottom: 32,
    textAlign: 'center',
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
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 4,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderSoft,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
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
  footer: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    marginTop: 24 
  },
  footerText: { 
    color: colors.onSurfaceVariant,
    fontSize: 13,
  },
  footerLink: { 
    color: colors.accent, 
    fontWeight: '700',
    fontSize: 13,
  },
});