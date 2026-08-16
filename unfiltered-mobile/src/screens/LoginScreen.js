import React, { useState } from 'react';
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
import { colors, spacing } from '../theme/theme';
import Icon from '@expo/vector-icons/FontAwesome';

// Import logo from assets folder - going up two levels
import Logo from '../../assets/logo.png';

export default function LoginScreen({ navigation }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

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
          <Image source={Logo} style={styles.logoImage} />
          <Text style={styles.appName}>UNFILTERED</Text>
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
                >
                  <Icon 
                    name={showPassword ? 'eye' : 'eye-slash'} 
                    size={20} 
                    color="#999"
                  />
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
            title="Log In →"
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
            onPress={() =>
              Alert.alert(
                'Google Sign-In',
                'Not wired up yet — needs Google OAuth client setup.'
              )
            }
            style={styles.googleBtn}
            icon="google"
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

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: '#F9F8FA',
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
    color: '#9E9E9E',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logoImage: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: -30,
  },
  appName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: 2,
    marginTop: -20,
  },
  tagline: {
    fontSize: 14,
    color: '#666666',
    marginTop: 6,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0EFF2',
  },
  inputWrapper: {
    marginBottom: 4,
  },
  inputContainer: {
    position: 'relative',
    height: 60,
    borderWidth: 1.5,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
  },
  inputContainerActive: {
    borderColor: '#4A4E69',
    borderWidth: 2,
  },
  floatingLabel: {
    position: 'absolute',
    top: 18,
    left: 14,
    fontSize: 16,
    color: '#999',
    backgroundColor: 'transparent',
    zIndex: 1,
  },
  floatingLabelActive: {
    top: -10,
    left: 12,
    fontSize: 12,
    color: '#4A4E69',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    fontWeight: '600',
  },
  input: {
    height: 60,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    color: '#1A1A1A',
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
    color: '#1A1A1A',
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
    borderColor: '#CCCCCC',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  checkboxChecked: {
    backgroundColor: '#4A4E69',
    borderColor: '#4A4E69',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  rememberMeText: {
    fontSize: 13,
    color: '#555555',
  },
  forgotText: {
    fontSize: 13,
    color: '#555555',
    textDecorationLine: 'underline',
  },
  loginBtn: {
    backgroundColor: '#E8E5F8',
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    borderWidth: 0,
  },
  loginBtnText: {
    color: '#4A4E69',
    fontWeight: '700',
    fontSize: 14,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E5E5',
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#888888',
  },
  googleBtn: {
    backgroundColor: '#FFFFFF',
    borderRadius: 25,
    height: 48,
    borderWidth: 1.5,
    borderColor: '#1A1A1A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  footerText: {
    fontSize: 13,
    color: '#666666',
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4B5563',
  },
});