import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, Pencil } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { uploadAvatar } from '../api/uploads';
import { updateProfile } from '../api/auth';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing } from '../theme/theme';

export default function EditProfileScreen({ navigation }) {
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [emailError, setEmailError] = useState('');
  const [localUri, setLocalUri] = useState(null); // pending image not yet saved
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  // Opens the native picker with `allowsEditing` — this gives the user a
  // crop/reposition step (square) before the photo ever leaves the device.
  const pickAndCropAvatar = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Please allow photo library access to set a profile photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // crop step
      aspect: [1, 1],
      quality: 0.85,
    });

    if (result.canceled || !result.assets?.[0]?.uri) return;

    // Show the cropped photo immediately (optimistic), then upload+save.
    setLocalUri(result.assets[0].uri);
    setUploadingAvatar(true);
    try {
      const updatedUser = await uploadAvatar(result.assets[0].uri);
      setUser(updatedUser);
      setLocalUri(null); // now sourced from user.avatar_url
    } catch (e) {
      setLocalUri(null);
      Alert.alert('Upload failed', e.message || 'Could not update your profile photo. Please try again.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const onSaveName = async () => {
    setEmailError('');
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      Alert.alert('Name required', 'Please enter a name.');
      return;
    }
    if (!trimmedEmail || !emailPattern.test(trimmedEmail)) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await updateProfile({ name: trimmedName, email: trimmedEmail });
      setUser(updatedUser);
      navigation.goBack();
    } catch (e) {
      const serverMessage =
        e?.response?.data?.errors?.email?.[0] ||
        e?.response?.data?.message ||
        'Could not save your changes.';
      if (e?.response?.data?.errors?.email) {
        setEmailError(serverMessage);
      } else {
        Alert.alert('Save failed', serverMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const displayUri = localUri || user?.avatar_url;

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.avatarSection}>
        <Pressable
          style={styles.avatarWrapper}
          onPress={pickAndCropAvatar}
          disabled={uploadingAvatar}
          accessibilityRole="button"
          accessibilityLabel="Change profile photo"
        >
          {displayUri ? (
            <Image source={{ uri: displayUri }} style={styles.avatarImage} />
          ) : (
            <View style={[styles.avatarImage, styles.avatarFallback]}>
              <Text style={styles.avatarInitial}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
            </View>
          )}
          <View style={styles.badgeIcon}>
            {uploadingAvatar ? <ActivityIndicator size="small" color="#fff" /> : <Pencil size={13} color="#fff" strokeWidth={2.4} />}
          </View>
        </Pressable>
        <Text style={styles.avatarHint}>tap your photo to crop & change it</Text>
      </View>

      <Text style={styles.fieldLabel}>NAME</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Your name"
        placeholderTextColor={colors.onSurfaceFaint}
      />

      <Text style={styles.fieldLabel}>EMAIL</Text>
      <TextInput
        style={[styles.input, !!emailError && styles.inputError]}
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          if (emailError) setEmailError('');
        }}
        placeholder="you@example.com"
        placeholderTextColor={colors.onSurfaceFaint}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {!!emailError && <Text style={styles.errorText}>{emailError}</Text>}

      <PixelButton title="Save Changes" onPress={onSaveName} loading={saving} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 48 },
  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { position: 'relative', marginBottom: 10 },
  avatarImage: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.surfaceMuted },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  avatarInitial: { fontSize: 38, fontWeight: '800', color: colors.accent },
  badgeIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: colors.accent,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.background,
  },
  avatarHint: { fontSize: 12, color: colors.onSurfaceFaint },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: colors.onSurfaceVariant, letterSpacing: 0.6, marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1.5,
    borderColor: colors.borderSoft,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: colors.onSurface,
    backgroundColor: colors.surface,
  },
  inputError: { borderColor: colors.error },
  errorText: { color: colors.error, fontSize: 12.5, fontWeight: '600', marginTop: 8 },
});
