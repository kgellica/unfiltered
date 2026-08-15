import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import client from '../api/client';
import { createEntry, updateEntry, deleteEntry } from '../api/entries';
import { uploadFile } from '../api/uploads';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing } from '../theme/theme';

const STICKERS = ['⭐', '❤️', '🌸', '☀️', '🌙', '🍜', '🐱', '☁️'];

export default function NewEntryScreen({ route, navigation }) {
  const entryId = route.params?.entryId;
  const initialDate = route.params?.date || new Date().toISOString().slice(0, 10);
  const isEditing = !!entryId;

  const [entryDate] = useState(initialDate);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [recording, setRecording] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const [selectedStickers, setSelectedStickers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (isEditing) {
      client.get(`/entries/${entryId}`).then((res) => {
        const e = res.data.entry;
        setTitle(e.title || '');
        setContent(e.content || '');
        setPhotoUri(e.photo_path || null);
        setVoiceUri(e.voice_path || null);
        setSelectedStickers(e.stickers || []);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [entryId]);

  const pickPhoto = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Photo library access is required to attach a photo.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.7 });
    if (!result.canceled) setPhotoUri(result.assets[0].uri);
  };

  const toggleSticker = (s) => {
    setSelectedStickers((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Microphone access is required to record a voice journal.');
        return;
      }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: rec } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(rec);
    } catch (e) {
      Alert.alert('Recording error', 'Could not start recording.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    await recording.stopAndUnloadAsync();
    setVoiceUri(recording.getURI());
    setRecording(null);
  };

  const playVoice = async () => {
    if (!voiceUri) return;
    const { sound } = await Audio.Sound.createAsync({ uri: voiceUri });
    await sound.playAsync();
  };

  const onSave = async () => {
    setSaving(true);
    try {
      // Upload any new local photo/voice files first; uploadFile() is a
      // no-op passthrough for URLs that are already remote.
      const [uploadedPhoto, uploadedVoice] = await Promise.all([
        uploadFile(photoUri, 'photo'),
        uploadFile(voiceUri, 'voice'),
      ]);

      const payload = {
        entry_date: entryDate,
        title,
        content,
        photo_path: uploadedPhoto,
        voice_path: uploadedVoice,
        stickers: selectedStickers,
      };

      if (isEditing) {
        await updateEntry(entryId, payload);
      } else {
        await createEntry(payload);
      }
      navigation.goBack();
    } catch (e) {
      Alert.alert('Save failed', e?.response?.data?.message || 'Could not save entry (upload or network error).');
    } finally {
      setSaving(false);
    }
  };

  const onDelete = () => {
    Alert.alert('Delete entry?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteEntry(entryId);
            navigation.goBack();
          } catch (e) {
            Alert.alert('Delete failed', 'Could not delete entry.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return <View style={styles.flex}><Text style={styles.loading}>Loading…</Text></View>;
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.dateLabel}>{entryDate}</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="Entry title"
          placeholderTextColor={colors.outline}
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={styles.contentInput}
          placeholder="Write about your day…"
          placeholderTextColor={colors.outline}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />

        <Text style={styles.sectionLabel}>PHOTO</Text>
        {photoUri ? (
          <View>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} />
            <Pressable onPress={() => setPhotoUri(null)}><Text style={styles.removeLink}>Remove photo</Text></Pressable>
          </View>
        ) : (
          <PixelButton title="Attach Photo" variant="secondary" onPress={pickPhoto} />
        )}

        <Text style={styles.sectionLabel}>VOICE JOURNAL</Text>
        <View style={styles.row}>
          {!recording && !voiceUri && (
            <PixelButton title="Start Recording" variant="secondary" onPress={startRecording} />
          )}
          {recording && (
            <PixelButton title="Stop Recording" onPress={stopRecording} />
          )}
          {voiceUri && !recording && (
            <>
              <PixelButton title="▶ Play" variant="secondary" onPress={playVoice} style={{ marginRight: 8 }} />
              <PixelButton title="Delete" variant="secondary" onPress={() => setVoiceUri(null)} />
            </>
          )}
        </View>

        <Text style={styles.sectionLabel}>STICKERS</Text>
        <View style={styles.stickerRow}>
          {STICKERS.map((s) => (
            <Pressable
              key={s}
              onPress={() => toggleSticker(s)}
              style={[styles.sticker, selectedStickers.includes(s) && styles.stickerSelected]}
            >
              <Text style={styles.stickerEmoji}>{s}</Text>
            </Pressable>
          ))}
        </View>

        <PixelButton title={isEditing ? 'Save Changes' : 'Save Entry'} onPress={onSave} loading={saving} style={{ marginTop: 24 }} />
        {isEditing && (
          <PixelButton title="Delete Entry" variant="secondary" onPress={onDelete} style={{ marginTop: 12 }} />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  loading: { padding: spacing.gutter, color: colors.onSurfaceVariant },
  container: { padding: spacing.gutter, paddingBottom: 60 },
  dateLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, marginBottom: 8 },
  titleInput: { fontSize: 22, fontWeight: '700', color: colors.onSurface, marginBottom: 12 },
  contentInput: {
    minHeight: 140,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: colors.onSurfaceVariant, marginTop: 8, marginBottom: 8, letterSpacing: 0.5 },
  photoPreview: { width: '100%', height: 180, borderRadius: radius.md, marginBottom: 6 },
  removeLink: { color: colors.error, fontWeight: '600', fontSize: 13 },
  row: { flexDirection: 'row', alignItems: 'center' },
  stickerRow: { flexDirection: 'row', flexWrap: 'wrap' },
  sticker: {
    width: 48, height: 48, borderRadius: radius.md, borderWidth: 2, borderColor: colors.outlineVariant,
    alignItems: 'center', justifyContent: 'center', marginRight: 8, marginBottom: 8,
    backgroundColor: colors.surfaceContainerLow,
  },
  stickerSelected: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  stickerEmoji: { fontSize: 22 },
});
