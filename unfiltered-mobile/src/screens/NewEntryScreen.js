import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert, Pressable, Image, KeyboardAvoidingView, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import client from '../api/client';
import { createEntry, updateEntry, deleteEntry } from '../api/entries';
import { uploadFile } from '../api/uploads';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing } from '../theme/theme';

// Same 5 moods as unfiltered-web (see src/lib/color.js MOOD_META) so
// entries created on mobile line up with the web app.
const MOOD_META = {
  great: { label: 'great', emoji: '😄', color: colors.moodGreat, text: 'feeling amazing ✨' },
  good: { label: 'good', emoji: '🌸', color: colors.moodGood, text: 'feeling happy 🌸' },
  okay: { label: 'okay', emoji: '☁️', color: colors.moodOkay, text: 'feeling okay ☁️' },
  low: { label: 'low', emoji: '🌧️', color: colors.moodLow, text: 'feeling a bit low 🌧️' },
  sad: { label: 'sad', emoji: '🧸', color: colors.moodSad, text: 'feeling down 🧸' },
};
const MOOD_ORDER = ['great', 'good', 'okay', 'low', 'sad'];

// Ready-to-use tags so entries can be tagged immediately without typing.
const SUGGESTED_TAGS = [
  'grateful', 'reflection', 'family', 'friends', 'work',
  'school', 'health', 'travel', 'goals', 'rest', 'love', 'growth',
];

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
  const [mood, setMood] = useState('good');
  const [selectedTags, setSelectedTags] = useState([]);
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
        setMood(e.mood && MOOD_META[e.mood] ? e.mood : 'good');
        setSelectedTags((e.tags || []).map((t) => (typeof t === 'string' ? t : t.name)));
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

  const toggleTag = (t) => {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
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
        mood,
        tags: selectedTags,
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

        <Text style={styles.sectionLabel}>MOOD</Text>
        <View style={styles.moodRow}>
          {MOOD_ORDER.map((key) => {
            const m = MOOD_META[key];
            const active = mood === key;
            return (
              <Pressable
                key={key}
                onPress={() => setMood(key)}
                style={[styles.moodChip, { backgroundColor: active ? m.color : colors.surfaceContainerLow, borderColor: active ? m.color : colors.outlineVariant }]}
                accessibilityRole="button"
                accessibilityLabel={`Mood: ${m.label}`}
              >
                <Text style={styles.moodEmoji}>{m.emoji}</Text>
                <Text style={[styles.moodLabel, active && styles.moodLabelActive]}>{m.label}</Text>
              </Pressable>
            );
          })}
        </View>

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

        <Text style={styles.sectionLabel}>TAGS</Text>
        <View style={styles.tagRow}>
          {SUGGESTED_TAGS.map((t) => {
            const active = selectedTags.includes(t);
            return (
              <Pressable
                key={t}
                onPress={() => toggleTag(t)}
                style={[styles.tagChip, active && styles.tagChipSelected]}
                accessibilityRole="button"
                accessibilityLabel={`Tag: ${t}`}
              >
                <Text style={[styles.tagChipText, active && styles.tagChipTextSelected]}>#{t}</Text>
              </Pressable>
            );
          })}
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
  moodRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  moodChip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    width: 62,
    paddingVertical: 10,
    borderRadius: radius.lg,
    borderWidth: 2,
  },
  moodEmoji: { fontSize: 20 },
  moodLabel: { fontSize: 10.5, fontWeight: '700', color: colors.onSurfaceVariant },
  moodLabelActive: { color: colors.onSurface, fontWeight: '800' },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap' },
  tagChip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
    marginRight: 8,
    marginBottom: 8,
    minHeight: 40,
    justifyContent: 'center',
  },
  tagChipSelected: { borderColor: colors.primary, backgroundColor: colors.primaryContainer },
  tagChipText: { fontSize: 13, fontWeight: '600', color: colors.onSurfaceVariant },
  tagChipTextSelected: { color: colors.primary, fontWeight: '700' },
});