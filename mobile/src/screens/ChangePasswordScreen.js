import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { changePassword } from '../api/auth';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

// Small labeled password field with an eye icon to toggle visibility.
// Takes `styles` as a prop so it always uses the parent's live, theme-aware styles.
function PasswordField({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  styles,
  error,
  onFocus,
  onBlur,
  isFocused
}) {
  const [visible, setVisible] = useState(false);
  const [localFocused, setLocalFocused] = useState(false);
  
  const focused = isFocused !== undefined ? isFocused : localFocused;
  const hasError = !!error;
  
  return (
    <View style={styles.inputWrapperContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        focused && styles.inputWrapperActive,
        hasError && styles.inputWrapperError
      ]}>
        <TextInput
          style={styles.inputWithIcon}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceFaint}
          autoCapitalize="none"
          onFocus={() => {
            setLocalFocused(true);
            if (onFocus) onFocus();
          }}
          onBlur={() => {
            setLocalFocused(false);
            if (onBlur) onBlur();
          }}
        />
        <Pressable
          onPress={() => setVisible((v) => !v)}
          hitSlop={10}
          style={styles.eyeButton}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? (
            <EyeOff size={18} color={colors.onSurfaceVariant} strokeWidth={2} />
          ) : (
            <Eye size={18} color={colors.onSurfaceVariant} strokeWidth={2} />
          )}
        </Pressable>
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

export default function ChangePasswordScreen({ navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Focus states
  const [currentFocused, setCurrentFocused] = useState(false);
  const [newFocused, setNewFocused] = useState(false);
  const [confirmFocused, setConfirmFocused] = useState(false);
  
  // Error states
  const [currentError, setCurrentError] = useState('');
  const [newError, setNewError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [generalError, setGeneralError] = useState('');

  const validateCurrentPassword = (text) => {
    setCurrentPassword(text);
    if (text && text.length > 0 && text.length < 8) {
      setCurrentError('Password must be at least 8 characters');
    } else {
      setCurrentError('');
    }
  };

  const validateNewPassword = (text) => {
    setNewPassword(text);
    if (text && text.length > 0 && text.length < 8) {
      setNewError('Password must be at least 8 characters');
    } else if (text && text.length >= 8) {
      setNewError('');
    } else {
      setNewError('');
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
    if (text && newPassword && text !== newPassword) {
      setConfirmError('Passwords do not match');
    } else if (text && newPassword && text === newPassword) {
      setConfirmError('');
    } else if (text && !newPassword) {
      setConfirmError('Please enter a new password first');
    } else {
      setConfirmError('');
    }
  };

  const isFormValid = () => {
    return (
      currentPassword && 
      currentPassword.length >= 8 &&
      newPassword && 
      newPassword.length >= 8 && 
      confirmPassword && 
      confirmPassword === newPassword &&
      !currentError &&
      !newError &&
      !confirmError
    );
  };

  const onSave = async () => {
    setGeneralError('');
    
    // Validate each field
    if (!currentPassword) {
      setCurrentError('Current password is required');
      return;
    }
    if (currentPassword.length < 8) {
      setCurrentError('Password must be at least 8 characters');
      return;
    }
    if (!newPassword) {
      setNewError('New password is required');
      return;
    }
    if (newPassword.length < 8) {
      setNewError('New password must be at least 8 characters');
      return;
    }
    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      return;
    }
    if (newPassword !== confirmPassword) {
      setConfirmError("Passwords don't match");
      return;
    }

    setSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        password: newPassword,
        password_confirmation: confirmPassword,
      });
      Alert.alert('Success', 'Your password has been updated.', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      const serverMessage =
        e?.response?.data?.errors?.current_password?.[0] ||
        e?.response?.data?.message ||
        'Could not update your password. Please try again.';
      setGeneralError(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView 
      style={styles.flex} 
      contentContainerStyle={styles.container} 
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.pageSubtitle}>Update your account password</Text>

      <PasswordField
        label="CURRENT PASSWORD"
        value={currentPassword}
        onChangeText={validateCurrentPassword}
        placeholder="Enter current password"
        styles={styles}
        error={currentError}
        isFocused={currentFocused}
        onFocus={() => setCurrentFocused(true)}
        onBlur={() => setCurrentFocused(false)}
      />

      <PasswordField
        label="NEW PASSWORD"
        value={newPassword}
        onChangeText={validateNewPassword}
        placeholder="Enter new password"
        styles={styles}
        error={newError}
        isFocused={newFocused}
        onFocus={() => setNewFocused(true)}
        onBlur={() => setNewFocused(false)}
      />

      <PasswordField
        label="CONFIRM NEW PASSWORD"
        value={confirmPassword}
        onChangeText={validateConfirmPassword}
        placeholder="Re-enter new password"
        styles={styles}
        error={confirmError}
        isFocused={confirmFocused}
        onFocus={() => setConfirmFocused(true)}
        onBlur={() => setConfirmFocused(false)}
      />

      {generalError ? <Text style={styles.generalErrorText}>{generalError}</Text> : null}

      <PixelButton 
        title="Update Password" 
        onPress={onSave} 
        loading={saving} 
        style={[
          { marginTop: 20 },
          !isFormValid() && styles.submitBtnDisabled
        ]}
        disabled={!isFormValid()}
      />
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { 
    padding: spacing.gutter, 
    paddingBottom: 48,
    // Removed justifyContent and flexGrow to keep content at top
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.onBackground,
    marginBottom: 4,
    textAlign: 'center',
  },
  pageSubtitle: {
    fontSize: 14,
    color: colors.onSurfaceVariant,
    marginBottom: 28,
    textAlign: 'center',
  },
  inputWrapperContainer: {
    marginBottom: 0,
  },
  fieldLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: colors.onSurfaceVariant, 
    letterSpacing: 0.6, 
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: 14,
    backgroundColor: colors.surface,
  },
  inputWrapperActive: {
    borderColor: colors.accent,
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: '#FF3B30',
    borderWidth: 2,
  },
  inputWithIcon: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: colors.onSurface,
  },
  eyeButton: { 
    paddingHorizontal: 12, 
    paddingVertical: 12 
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 4,
    marginBottom: 0,
  },
  generalErrorText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
    textAlign: 'center',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
});