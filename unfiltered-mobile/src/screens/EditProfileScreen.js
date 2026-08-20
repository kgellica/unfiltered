import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, X, Check } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../api/auth';
import { uploadAvatar } from '../api/uploads';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing, cardShadow } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

// Simple email format check — good enough for client-side validation;
// the server is still the source of truth.
function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export default function EditProfileScreen({ navigation }) {
  const { mode, accent } = useTheme(); // subscribe so styles rebuild with the current accent/mode
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarUri, setAvatarUri] = useState(user?.avatar_url || null);
  const [pickedLocalUri, setPickedLocalUri] = useState(null); // uncommitted local photo, uploaded on Save
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const hasChanges =
    name.trim() !== (user?.name || '') ||
    email.trim() !== (user?.email || '') ||
    !!pickedLocalUri;

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Photo access needed',
        'Allow access to your photos to update your profile picture.'
      );
      return;
    }

    // allowsEditing opens the native crop tool (drag/pinch to reposition,
    // square aspect lock) — simplest, most reliable mobile-friendly crop UX.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      const uri = result.assets[0].uri;
      setAvatarUri(uri);
      setPickedLocalUri(uri);
    }
  };

  const handleSave = async () => {
    setError('');
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError('Please enter your name.');
      return;
    }
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      let updatedUser = user;

      // Upload the new photo first (if one was picked) — uploadAvatar
      // already PATCHes avatar_url on the backend for us.
      if (pickedLocalUri) {
        updatedUser = await uploadAvatar(pickedLocalUri);
      }

      // Then update name/email in the same profile record.
      updatedUser = await updateProfile({ name: trimmedName, email: trimmedEmail });

      setUser(updatedUser);
      navigation.goBack();
    } catch (e) {
      const serverMessage =
        e?.response?.data?.errors?.email?.[0] ||
        e?.response?.data?.message ||
        e?.message ||
        'Could not save your changes. Please try again.';
      setError(serverMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert('Discard changes?', 'Your edits will be lost.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.avatarSection}>
        <Pressable
          style={styles.avatarWrapper}
          onPress={handleChangePhoto}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{(name || '?').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.avatarEditBadge}>
            <Camera size={14} color={colors.accentInk} strokeWidth={2.4} />
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>Tap the photo to change it</Text>
      </View>

      <Text style={styles.fieldLabel}>NAME</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Your name"
          placeholderTextColor={colors.onSurfaceFaint}
          autoCapitalize="words"
          returnKeyType="next"
        />
      </View>

      <Text style={styles.fieldLabel}>EMAIL</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={colors.onSurfaceFaint}
          autoCapitalize="none"
          keyboardType="email-address"
          returnKeyType="done"
        />
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <View style={styles.actionsRow}>
        <PixelButton
          title="Cancel"
          variant="secondary"
          onPress={handleCancel}
          disabled={saving}
          style={styles.actionBtn}
        />
        <PixelButton
          title="Save Changes"
          onPress={handleSave}
          loading={saving}
          disabled={!hasChanges}
          style={styles.actionBtn}
        />
      </View>
    </ScrollView>
  );
}

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 48 },

  avatarSection: { alignItems: 'center', marginBottom: 8 },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  avatarImage: {
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: colors.surfaceMuted,
  },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  avatarInitial: { fontSize: 40, fontWeight: '800', color: colors.accent },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
    ...cardShadow,
  },
  avatarHint: { fontSize: 12.5, color: colors.onSurfaceVariant, marginBottom: 24 },

  fieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.6,
    marginTop: 16,
    marginBottom: 8,
  },
  inputWrapper: {
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.onSurface,
    minHeight: 48,
  },
  errorText: { color: colors.error, fontSize: 12.5, fontWeight: '600', marginTop: 14 },

  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 28,
  },
  actionBtn: { flex: 1 },
});