import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, Alert, ScrollView, Pressable } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { changePassword } from '../api/auth';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing } from '../theme/theme';

// Small labeled password field with an eye icon to toggle visibility.
function PasswordField({ label, value, onChangeText, placeholder }) {
  const [visible, setVisible] = useState(false);
  return (
    <>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.inputWithIcon}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!visible}
          placeholder={placeholder}
          placeholderTextColor={colors.onSurfaceFaint}
          autoCapitalize="none"
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
    </>
  );
}

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const onSave = async () => {
    setError('');
    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
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
      setError(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <PasswordField
        label="CURRENT PASSWORD"
        value={currentPassword}
        onChangeText={setCurrentPassword}
        placeholder="••••••••"
      />

      <PasswordField
        label="NEW PASSWORD"
        value={newPassword}
        onChangeText={setNewPassword}
        placeholder="at least 8 characters"
      />

      <PasswordField
        label="CONFIRM NEW PASSWORD"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        placeholder="re-enter new password"
      />

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <PixelButton title="Update Password" onPress={onSave} loading={saving} style={{ marginTop: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 48 },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: colors.onSurfaceVariant, letterSpacing: 0.6, marginTop: 16, marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  inputWithIcon: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.onSurface,
  },
  eyeButton: { paddingHorizontal: 12, paddingVertical: 12 },
  errorText: { color: colors.error, fontSize: 12.5, fontWeight: '600', marginTop: 14 },
});
