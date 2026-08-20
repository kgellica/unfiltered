import React, { useEffect, useState, useRef, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Alert, 
  Pressable, 
  Image, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { createEntry, updateEntry, deleteEntry } from '../api/entries';
import { uploadFile } from '../api/uploads';
import PixelButton from '../components/PixelButton';
import { colors, radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';

const MOOD_META = {
  great: { label: 'great', emoji: '😄', color: colors.moodGreat, text: 'feeling amazing ✨' },
  good: { label: 'good', emoji: '🌸', color: colors.moodGood, text: 'feeling happy 🌸' },
  okay: { label: 'okay', emoji: '☁️', color: colors.moodOkay, text: 'feeling okay ☁️' },
  low: { label: 'low', emoji: '🌧️', color: colors.moodLow, text: 'feeling a bit low 🌧️' },
  sad: { label: 'sad', emoji: '🧸', color: colors.moodSad, text: 'feeling down 🧸' },
};
const MOOD_ORDER = ['great', 'good', 'okay', 'low', 'sad'];

const SUGGESTED_TAGS = [
  'grateful', 'reflection', 'family', 'friends', 'work',
  'school', 'health', 'travel', 'goals', 'rest', 'love', 'growth',
];

export default function NewEntryScreen({ route, navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const entryId = route.params?.entryId;
  const initialDate = route.params?.date || new Date().toISOString().slice(0, 10);
  const isEditing = !!entryId;

  const [entryDate] = useState(initialDate);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUri, setPhotoUri] = useState(null);
  const [voiceUri, setVoiceUri] = useState(null);
  const [mood, setMood] = useState('good');
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);

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
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        Alert.alert('Permission needed', 'Photo library access is required to attach a photo.');
        return;
      }
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
      });
      
      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        console.log('Photo selected:', uri);
        
        setUploadingPhoto(true);
        try {
          const uploadedUrl = await uploadFile(uri, 'photo');
          console.log('Photo uploaded:', uploadedUrl);
          setPhotoUri(uploadedUrl);
        } catch (error) {
          console.error('Photo upload error:', error);
          Alert.alert('Upload Error', error.message || 'Failed to upload photo. Please try again.');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      Alert.alert('Error', 'Failed to pick photo. Please try again.');
    }
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
      
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      
      const { recording: rec } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(rec);
      setIsRecording(true);
      console.log('Recording started');
    } catch (error) {
      console.error('Recording error:', error);
      Alert.alert('Recording error', 'Could not start recording. Please try again.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    
    try {
      console.log('Stopping recording...');
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log('Recording saved:', uri);
      
      setRecording(null);
      setIsRecording(false);
      
      if (uri) {
        setUploadingVoice(true);
        try {
          const uploadedUrl = await uploadFile(uri, 'voice');
          console.log('Voice uploaded:', uploadedUrl);
          setVoiceUri(uploadedUrl);
        } catch (error) {
          console.error('Voice upload error:', error);
          Alert.alert('Upload Error', error.message || 'Failed to upload voice recording. Please try again.');
          setVoiceUri(uri);
        } finally {
          setUploadingVoice(false);
        }
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      Alert.alert('Error', 'Failed to stop recording. Please try again.');
      setRecording(null);
      setIsRecording(false);
    }
  };

  const playVoice = async () => {
    if (!voiceUri) return;
    
    try {
      console.log('Playing voice:', voiceUri);
      const { sound } = await Audio.Sound.createAsync({ uri: voiceUri });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error('Play voice error:', error);
      Alert.alert('Error', 'Could not play voice recording.');
    }
  };

  const onSave = async () => {
    if (!title.trim() && !content.trim() && !photoUri && !voiceUri) {
      Alert.alert('Empty entry', 'Please add a title, content, photo, or voice recording before saving.');
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUri = photoUri;
      let finalVoiceUri = voiceUri;

      if (photoUri && !photoUri.startsWith('http://') && !photoUri.startsWith('https://')) {
        setUploadingPhoto(true);
        try {
          finalPhotoUri = await uploadFile(photoUri, 'photo');
          setPhotoUri(finalPhotoUri);
        } finally {
          setUploadingPhoto(false);
        }
      }

      if (voiceUri && !voiceUri.startsWith('http://') && !voiceUri.startsWith('https://')) {
        setUploadingVoice(true);
        try {
          finalVoiceUri = await uploadFile(voiceUri, 'voice');
          setVoiceUri(finalVoiceUri);
        } finally {
          setUploadingVoice(false);
        }
      }

      const payload = {
        entry_date: entryDate,
        title: title.trim(),
        content: content.trim(),
        photo_path: finalPhotoUri,
        voice_path: finalVoiceUri,
        mood,
        tags: selectedTags,
      };

      console.log('Saving entry:', payload);

      if (isEditing) {
        await updateEntry(entryId, payload);
      } else {
        await createEntry(payload);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Save error:', error);
      const message = error?.response?.data?.message || error.message || 'Could not save entry. Please try again.';
      Alert.alert('Save failed', message);
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
          } catch (error) {
            Alert.alert('Delete failed', 'Could not delete entry.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={[styles.flex, styles.center]}>
        <ActivityIndicator size="large" color={colors.accent} />
        <Text style={styles.loadingText}>Loading entry...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.flex} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView 
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.dateLabel}>{entryDate}</Text>
        
        <TextInput
          style={styles.titleInput}
          placeholder="Entry title"
          placeholderTextColor={colors.outline}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />
        
        <TextInput
          style={styles.contentInput}
          placeholder="Write about your day..."
          placeholderTextColor={colors.outline}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
          numberOfLines={8}
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
                style={[
                  styles.moodChip,
                  { 
                    backgroundColor: active ? m.color : colors.surfaceContainerLow,
                    borderColor: active ? m.color : colors.outlineVariant,
                    borderWidth: active ? 2 : 1.5,
                  }
                ]}
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
        {uploadingPhoto && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.uploadingText}>Uploading photo...</Text>
          </View>
        )}
        {photoUri ? (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            <Pressable 
              onPress={() => setPhotoUri(null)} 
              style={styles.removeButton}
              hitSlop={10}
            >
              <Text style={styles.removeLink}>✕ Remove photo</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable 
            style={styles.attachButton} 
            onPress={pickPhoto}
            disabled={uploadingPhoto}
          >
            <Text style={styles.attachButtonText}>Attach Photo</Text>
          </Pressable>
        )}

        <Text style={styles.sectionLabel}>VOICE JOURNAL</Text>
        {uploadingVoice && (
          <View style={styles.uploadingContainer}>
            <ActivityIndicator size="small" color={colors.accent} />
            <Text style={styles.uploadingText}>Uploading voice...</Text>
          </View>
        )}
        <View style={styles.voiceRow}>
          {!recording && !voiceUri && (
            <Pressable 
              style={styles.voiceButton} 
              onPress={startRecording}
            >
              <Text style={styles.voiceButtonText}>Start Recording</Text>
            </Pressable>
          )}
          {recording && (
            <Pressable 
              style={[styles.voiceButton, styles.voiceButtonActive]} 
              onPress={stopRecording}
            >
              <Text style={styles.voiceButtonText}>Stop Recording</Text>
            </Pressable>
          )}
          {voiceUri && !recording && (
            <View style={styles.voiceActions}>
              <Pressable style={styles.voicePlayButton} onPress={playVoice}>
                <Text style={styles.voicePlayText}>Play</Text>
              </Pressable>
              <Pressable 
                style={styles.voiceDeleteButton} 
                onPress={() => setVoiceUri(null)}
              >
                <Text style={styles.voiceDeleteText}>Delete</Text>
              </Pressable>
            </View>
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

        <View style={styles.buttonContainer}>
          <Pressable 
            style={[styles.saveButton, (saving || uploadingPhoto || uploadingVoice) && styles.saveButtonDisabled]} 
            onPress={onSave}
            disabled={saving || uploadingPhoto || uploadingVoice}
          >
            {(saving || uploadingPhoto || uploadingVoice) ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.saveButtonText}>{isEditing ? 'Save Changes' : 'Save Entry'}</Text>
            )}
          </Pressable>
          
          {isEditing && (
            <Pressable style={styles.deleteButton} onPress={onDelete}>
              <Text style={styles.deleteButtonText}>Delete Entry</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = () => StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  center: { justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: colors.onSurfaceVariant, fontSize: 14 },
  container: { padding: spacing.gutter, paddingBottom: 60 },
  dateLabel: { 
    fontSize: 12, 
    fontWeight: '700', 
    color: colors.onSurfaceVariant, 
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  titleInput: { 
    fontSize: 22, 
    fontWeight: '700', 
    color: colors.onSurface, 
    marginBottom: 12,
    paddingVertical: 4,
  },
  contentInput: {
    minHeight: 140,
    fontSize: 16,
    color: colors.onSurface,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
    marginBottom: spacing.md,
  },
  sectionLabel: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: colors.onSurfaceVariant, 
    marginTop: 12, 
    marginBottom: 8, 
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  
  photoContainer: {
    marginBottom: 8,
  },
  photoPreview: { 
    width: '100%', 
    height: 180, 
    borderRadius: radius.md, 
    marginBottom: 6,
    backgroundColor: colors.surfaceMuted,
  },
  removeButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  removeLink: { 
    color: colors.error, 
    fontWeight: '600', 
    fontSize: 13,
  },
  
  attachButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderStyle: 'dashed',
  },
  attachButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  
  uploadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radius.sm,
    marginBottom: 8,
  },
  uploadingText: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
  },
  
  voiceRow: { 
    flexDirection: 'row', 
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
  },
  voiceButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
  },
  voiceButtonActive: {
    backgroundColor: colors.error,
    borderColor: colors.error,
  },
  voiceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.onSurface,
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 10,
    flex: 1,
  },
  voicePlayButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  voicePlayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  voiceDeleteButton: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  voiceDeleteText: {
    color: colors.error,
    fontWeight: '600',
    fontSize: 14,
  },
  
  moodRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8,
    marginBottom: 4,
  },
  moodChip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 62,
    paddingVertical: 8,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  moodEmoji: { fontSize: 20 },
  moodLabel: { 
    fontSize: 10, 
    fontWeight: '600', 
    color: colors.onSurfaceVariant,
  },
  moodLabelActive: { 
    color: colors.onSurface, 
    fontWeight: '800' 
  },
  
  tagRow: { 
    flexDirection: 'row', 
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  tagChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLow,
  },
  tagChipSelected: { 
    borderColor: colors.primary, 
    backgroundColor: colors.primaryContainer 
  },
  tagChipText: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: colors.onSurfaceVariant 
  },
  tagChipTextSelected: { 
    color: colors.primary, 
    fontWeight: '700' 
  },
  
  buttonContainer: {
    marginTop: 24,
    gap: 12,
  },
  saveButton: {
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  deleteButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: colors.error,
    fontSize: 14,
    fontWeight: '600',
  },
});