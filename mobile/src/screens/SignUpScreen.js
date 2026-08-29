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
import PixelButton from '../components/PixelButton';
import { colors } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { Eye, EyeOff } from 'lucide-react-native';

export default function SignUpScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Focus states
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  
  // Error states
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');

  const validateName = (text) => {
    setName(text);
    if (text && text.length < 2) {
      setNameError('Name must be at least 2 characters');
    } else {
      setNameError('');
    }
  };

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
    } else {
      setPasswordError('');
    }
    
    // Also validate confirm password if it has content
    if (confirm && text !== confirm) {
      setConfirmError('Passwords do not match');
    } else if (confirm && text === confirm) {
      setConfirmError('');
    }
  };

  const validateConfirm = (text) => {
    setConfirm(text);
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
      name && 
      name.length >= 2 &&
      email && 
      email.includes('@') && 
      password && 
      password.length >= 8 && 
      confirm && 
      confirm === password &&
      !nameError &&
      !emailError &&
      !passwordError &&
      !confirmError
    );
  };

  const onSubmit = () => {
    if (!name) {
      setNameError('Name is required');
      return;
    }
    if (name.length < 2) {
      setNameError('Name must be at least 2 characters');
      return;
    }
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
    if (!confirm) {
      setConfirmError('Please confirm your password');
      return;
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match');
      return;
    }
    
    navigation.navigate('PinSetup', { name, email, password, passwordConfirmation: confirm });
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

        {/* Name Input */}
        <View style={styles.inputWrapper}>
          <View style={[
            styles.inputContainer,
            (nameFocused || name) && styles.inputContainerActive,
            nameError && styles.inputContainerError
          ]}>
            <Text style={[
              styles.floatingLabel,
              (nameFocused || name) && styles.floatingLabelActive,
              nameError && styles.floatingLabelError
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
              onChangeText={validateName}
              onFocus={() => setNameFocused(true)}
              onBlur={() => setNameFocused(false)}
            />
          </View>
          {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
        </View>

        {/* Email Input */}
        <View style={[styles.inputWrapper, { marginTop: 8 }]}>
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
              Email
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
            />
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* Password Input */}
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
            (confirmFocused || confirm) && styles.inputContainerActive,
            confirmError && styles.inputContainerError
          ]}>
            <Text style={[
              styles.floatingLabel,
              (confirmFocused || confirm) && styles.floatingLabelActive,
              confirmError && styles.floatingLabelError
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
                onChangeText={validateConfirm}
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
          title="Continue"
          onPress={onSubmit}
          style={[
            { marginTop: 24 },
            !isFormValid() && styles.submitBtnDisabled
          ]}
          disabled={!isFormValid()}
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
  submitBtnDisabled: {
    opacity: 0.5,
  },
});