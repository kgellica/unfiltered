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
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  Dimensions,
  PanResponder,
  Animated
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { createEntry, updateEntry, deleteEntry } from '../api/entries';
import { uploadFile } from '../api/uploads';
import PixelButton from '../components/PixelButton';
import ScrollableTextInput from '../components/ScrollableTextInput';
import { Camera, Mic, Square, Play, Pause, X, Trash2, Plus, Minus, ChevronLeft, ChevronRight } from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

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

const MAX_PHOTOS = 5;
const MAX_VOICE_DURATION = 600; // 10 minutes in seconds

export default function NewEntryScreen({ route, navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const entryId = route.params?.entryId;
  const initialDate = route.params?.date || new Date().toISOString().slice(0, 10);
  const isEditing = !!entryId;

  const [entryDate] = useState(initialDate);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [photoUris, setPhotoUris] = useState([]);
  const [voiceUri, setVoiceUri] = useState(null);
  const [mood, setMood] = useState('good');
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingVoice, setUploadingVoice] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const soundRef = useRef(null);
  const recordingTimerRef = useRef(null);
  
  // Photo viewer state
  const [photoViewerVisible, setPhotoViewerVisible] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [lastScale, setLastScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  
  // Pinch to zoom refs
  const pinchRef = useRef(null);
  const lastPinchDistance = useRef(0);
  const isPinching = useRef(false);

  const ZOOM_STEP = 0.5;
  const MIN_SCALE = 1;
  const MAX_SCALE = 3;

  // Cleanup sound on unmount
  useEffect(() => {
    return () => {
      if (soundRef.current) {
        soundRef.current.unloadAsync().catch(() => {});
        soundRef.current = null;
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (isEditing) {
      client.get(`/entries/${entryId}`).then((res) => {
        const e = res.data.entry;
        setTitle(e.title || '');
        setContent(e.content || '');
        // Handle both single photo and multiple photos
        if (e.photo_path) {
          if (Array.isArray(e.photo_path)) {
            setPhotoUris(e.photo_path);
          } else {
            setPhotoUris([e.photo_path]);
          }
        }
        setVoiceUri(e.voice_path || null);
        setMood(e.mood && MOOD_META[e.mood] ? e.mood : 'good');
        setSelectedTags((e.tags || []).map((t) => (typeof t === 'string' ? t : t.name)));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [entryId]);

  const pickPhoto = async () => {
    if (photoUris.length >= MAX_PHOTOS) {
      Alert.alert('Limit reached', `You can attach up to ${MAX_PHOTOS} photos per entry.`);
      return;
    }

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
          setPhotoUris(prev => [...prev, uploadedUrl]);
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

  const removePhoto = (index) => {
    setPhotoUris(prev => prev.filter((_, i) => i !== index));
  };

  const openPhotoViewer = (index) => {
    setSelectedPhotoIndex(index);
    setPhotoViewerVisible(true);
    setScale(1);
    setLastScale(1);
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
    lastPinchDistance.current = 0;
    isPinching.current = false;
  };

  const closePhotoViewer = () => {
    setPhotoViewerVisible(false);
    setScale(1);
    setLastScale(1);
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
  };

  // Handle pinch gestures
  const handlePinchStart = (event) => {
    const touches = event.nativeEvent.touches;
    if (touches.length >= 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.pageX - touch1.pageX, 2) +
        Math.pow(touch2.pageY - touch1.pageY, 2)
      );
      lastPinchDistance.current = distance;
      isPinching.current = true;
      setLastScale(scale);
      setLastPanOffset({ ...panOffset });
    }
  };

  const handlePinchMove = (event) => {
    if (!isPinching.current) return;
    
    const touches = event.nativeEvent.touches;
    if (touches.length >= 2) {
      const touch1 = touches[0];
      const touch2 = touches[1];
      const distance = Math.sqrt(
        Math.pow(touch2.pageX - touch1.pageX, 2) +
        Math.pow(touch2.pageY - touch1.pageY, 2)
      );
      
      if (lastPinchDistance.current > 0) {
        const newScale = Math.min(Math.max(
          lastScale * (distance / lastPinchDistance.current),
          0.5,
          3
        ), 3);
        setScale(newScale);
      }
    }
  };

  const handlePinchEnd = () => {
    isPinching.current = false;
    lastPinchDistance.current = 0;
    setLastScale(scale);
    setLastPanOffset({ ...panOffset });
  };

  // Handle pan (drag) for zoomed images
  const handlePanStart = (event) => {
    if (scale > 1) {
      setLastPanOffset({ ...panOffset });
    }
  };

  const handlePanMove = (event) => {
    if (scale > 1) {
      const dx = event.nativeEvent.pageX - event.nativeEvent.locationX;
      const dy = event.nativeEvent.pageY - event.nativeEvent.locationY;
      const maxPanX = (scale - 1) * (SCREEN_WIDTH / 2);
      const maxPanY = (scale - 1) * (SCREEN_HEIGHT / 2);
      
      setPanOffset({
        x: Math.min(Math.max(lastPanOffset.x + dx, -maxPanX), maxPanX),
        y: Math.min(Math.max(lastPanOffset.y + dy, -maxPanY), maxPanY),
      });
    }
  };

  const resetZoom = () => {
    setScale(1);
    setLastScale(1);
    setPanOffset({ x: 0, y: 0 });
    setLastPanOffset({ x: 0, y: 0 });
  };

  // Discrete zoom via +/- buttons (replaces laggy continuous pinch tracking)
  const zoomIn = () => {
    setScale((prev) => {
      const next = Math.min(MAX_SCALE, +(prev + ZOOM_STEP).toFixed(2));
      setLastScale(next);
      return next;
    });
  };

  const zoomOut = () => {
    setScale((prev) => {
      const next = Math.max(MIN_SCALE, +(prev - ZOOM_STEP).toFixed(2));
      setLastScale(next);
      if (next === MIN_SCALE) {
        setPanOffset({ x: 0, y: 0 });
        setLastPanOffset({ x: 0, y: 0 });
      }
      return next;
    });
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
      setRecordingDuration(0);
      
      // Start timer to track duration
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => {
          if (prev >= MAX_VOICE_DURATION) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
      
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
      
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      
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
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const togglePlayVoice = async () => {
    if (!voiceUri) return;

    try {
      // If sound exists and is loaded
      if (soundRef.current) {
        const status = await soundRef.current.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundRef.current.pauseAsync();
            setIsPlaying(false);
            setIsPaused(true);
          } else if (status.positionMillis > 0 && status.positionMillis < status.durationMillis) {
            // Resume from paused position
            await soundRef.current.playAsync();
            setIsPlaying(true);
            setIsPaused(false);
          } else {
            // Replay from start
            await soundRef.current.setPositionAsync(0);
            await soundRef.current.playAsync();
            setIsPlaying(true);
            setIsPaused(false);
          }
        }
        return;
      }

      // Create new sound
      const { sound } = await Audio.Sound.createAsync(
        { uri: voiceUri },
        { shouldPlay: true }
      );
      soundRef.current = sound;
      setIsPlaying(true);
      setIsPaused(false);
      
      sound.setOnPlaybackStatusUpdate((status) => {
        if (!status.isLoaded) return;
        if (status.didJustFinish) {
          setIsPlaying(false);
          setIsPaused(false);
          // Use stopAsync (not setPositionAsync) — shouldPlay is still true at this
          // point, so seeking alone would resume playback instead of stopping it,
          // which is why audio kept playing after it "finished".
          sound.stopAsync().catch(() => {});
        }
      });
    } catch (error) {
      console.error('Play voice error:', error);
      Alert.alert('Error', 'Could not play voice recording.');
    }
  };

  const stopVoice = async () => {
    if (!soundRef.current) {
      setIsPlaying(false);
      setIsPaused(false);
      return;
    }
    try {
      await soundRef.current.stopAsync();
      await soundRef.current.setPositionAsync(0);
      setIsPlaying(false);
      setIsPaused(false);
    } catch (error) {
      // no-op — sound may already be unloaded
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const onSave = async () => {
    if (!title.trim() && !content.trim() && photoUris.length === 0 && !voiceUri) {
      Alert.alert('Empty entry', 'Please add a title, content, photo, or voice recording before saving.');
      return;
    }

    setSaving(true);
    try {
      let finalPhotoUris = photoUris;
      let finalVoiceUri = voiceUri;

      // Upload any local photos
      const uploadPromises = photoUris.map(async (uri) => {
        if (!uri.startsWith('http://') && !uri.startsWith('https://')) {
          return await uploadFile(uri, 'photo');
        }
        return uri;
      });
      
      const uploadedPhotos = await Promise.all(uploadPromises);
      finalPhotoUris = uploadedPhotos;

      if (voiceUri && !voiceUri.startsWith('http://') && !voiceUri.startsWith('https://')) {
        finalVoiceUri = await uploadFile(voiceUri, 'voice');
      }

      const payload = {
        entry_date: entryDate,
        title: title.trim(),
        content: content.trim(),
        // Send the full array — the backend now stores photo_path as JSON,
        // so every attached photo is kept instead of only the first one.
        photo_path: finalPhotoUris.length > 0 ? finalPhotoUris : null,
        voice_path: finalVoiceUri || null,
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
    <>
      <KeyboardAvoidingView 
        style={styles.flex} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
          
          <ScrollableTextInput
            style={styles.contentInput}
            placeholder="Write about your day..."
            placeholderTextColor={colors.outline}
            value={content}
            onChangeText={setContent}
            textAlignVertical="top"
            scrollEnabled
            showsVerticalScrollIndicator={true}
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

          <Text style={styles.sectionLabel}>PHOTOS ({photoUris.length}/{MAX_PHOTOS})</Text>
          {uploadingPhoto && (
            <View style={styles.uploadingContainer}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.uploadingText}>Uploading photo...</Text>
            </View>
          )}
          
          {photoUris.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScrollView}>
              {photoUris.map((uri, index) => (
                <View key={index} style={styles.photoItemContainer}>
                  <Pressable onPress={() => openPhotoViewer(index)}>
                    <Image source={{ uri }} style={styles.photoPreview} resizeMode="cover" />
                  </Pressable>
                  <Pressable 
                    onPress={() => removePhoto(index)} 
                    style={styles.removePhotoButton}
                    hitSlop={10}
                    accessibilityRole="button"
                    accessibilityLabel="Remove photo"
                  >
                    <X size={14} color={colors.error} strokeWidth={2.4} />
                  </Pressable>
                </View>
              ))}
            </ScrollView>
          )}

          {photoUris.length < MAX_PHOTOS && (
            <Pressable 
              style={({ pressed }) => [styles.attachButton, pressed && styles.attachButtonPressed]} 
              onPress={pickPhoto}
              disabled={uploadingPhoto}
              accessibilityRole="button"
              accessibilityLabel="Attach a photo"
            >
              <Plus size={18} color={colors.accent} strokeWidth={2.2} />
              <Text style={styles.attachButtonText}>Add Photo ({photoUris.length}/{MAX_PHOTOS})</Text>
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
                style={({ pressed }) => [styles.voiceButton, pressed && styles.attachButtonPressed]} 
                onPress={startRecording}
                accessibilityRole="button"
                accessibilityLabel="Start voice recording"
              >
                <Mic size={18} color={colors.onSurface} strokeWidth={2.2} />
                <Text style={styles.voiceButtonText}>Start Recording</Text>
              </Pressable>
            )}
            {recording && (
              <Pressable 
                style={[styles.voiceButton, styles.voiceButtonActive]} 
                onPress={stopRecording}
                accessibilityRole="button"
                accessibilityLabel="Stop voice recording"
              >
                <View style={styles.recPulseDot} />
                <Text style={[styles.voiceButtonText, styles.voiceButtonTextActive]}>
                  {formatDuration(recordingDuration)} / 10:00
                </Text>
              </Pressable>
            )}
            {voiceUri && !recording && (
              <View style={styles.voiceActions}>
                <Pressable
                  style={({ pressed }) => [styles.voicePlayButton, pressed && { opacity: 0.85 }]}
                  onPress={togglePlayVoice}
                  accessibilityRole="button"
                  accessibilityLabel={isPlaying ? 'Pause voice recording' : 'Play voice recording'}
                >
                  {isPlaying ? (
                    <Pause size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                  ) : (
                    <Play size={16} color="#FFFFFF" fill="#FFFFFF" strokeWidth={0} />
                  )}
                  <Text style={styles.voicePlayText}>{isPlaying ? 'Pause' : 'Play'}</Text>
                </Pressable>
                <Pressable
                  style={({ pressed }) => [styles.voiceStopButton, pressed && { opacity: 0.85 }]}
                  onPress={stopVoice}
                  disabled={!isPlaying && !isPaused}
                  accessibilityRole="button"
                  accessibilityLabel="Stop voice recording"
                >
                  <Square size={14} color={isPlaying || isPaused ? colors.onSurface : colors.onSurfaceFaint} fill={isPlaying || isPaused ? colors.onSurface : colors.onSurfaceFaint} strokeWidth={0} />
                </Pressable>
                <Pressable 
                  style={styles.voiceDeleteButton} 
                  onPress={async () => {
                    await stopVoice();
                    if (soundRef.current) {
                      await soundRef.current.unloadAsync();
                      soundRef.current = null;
                    }
                    setVoiceUri(null);
                  }}
                  accessibilityRole="button"
                  accessibilityLabel="Delete voice recording"
                >
                  <Trash2 size={15} color={colors.error} strokeWidth={2.2} />
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

      {/* Photo Viewer Modal with Pinch to Zoom */}
      <Modal
        visible={photoViewerVisible}
        transparent={true}
        onRequestClose={closePhotoViewer}
        statusBarTranslucent={true}
      >
        <View style={styles.photoViewerContainer}>
          <View style={styles.photoViewerHeader}>
            <Text style={styles.photoViewerCounter}>
              {selectedPhotoIndex + 1} / {photoUris.length}
            </Text>
            <TouchableOpacity onPress={closePhotoViewer} style={styles.photoViewerClose}>
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <View 
            style={styles.photoViewerBody}
            onStartShouldSetResponder={() => true}
            onMoveShouldSetResponder={() => true}
            onResponderStart={handlePanStart}
            onResponderMove={handlePanMove}
          >
            <Animated.Image
              source={{ uri: photoUris[selectedPhotoIndex] }}
              style={[
                styles.photoViewerImage,
                {
                  transform: [
                    { scale: scale },
                    { translateX: panOffset.x },
                    { translateY: panOffset.y },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </View>

          <View style={styles.photoViewerControls}>
            <View style={styles.photoViewerZoomGroup}>
              <TouchableOpacity
                onPress={zoomOut}
                disabled={scale <= MIN_SCALE}
                style={[styles.photoViewerZoomBtn, scale <= MIN_SCALE && styles.photoViewerNavBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Zoom out"
              >
                <Minus size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.photoViewerControlText}>{Math.round(scale * 100)}%</Text>
              <TouchableOpacity
                onPress={zoomIn}
                disabled={scale >= MAX_SCALE}
                style={[styles.photoViewerZoomBtn, scale >= MAX_SCALE && styles.photoViewerNavBtnDisabled]}
                accessibilityRole="button"
                accessibilityLabel="Zoom in"
              >
                <Plus size={16} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={resetZoom} style={styles.photoViewerControlBtn}>
                <Text style={styles.photoViewerControlText}>Reset</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.photoViewerNav}>
              <TouchableOpacity 
                onPress={() => {
                  setSelectedPhotoIndex(prev => Math.max(0, prev - 1));
                  resetZoom();
                }}
                disabled={selectedPhotoIndex === 0}
                style={[styles.photoViewerNavBtn, selectedPhotoIndex === 0 && styles.photoViewerNavBtnDisabled]}
              >
                <ChevronLeft size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => {
                  setSelectedPhotoIndex(prev => Math.min(photoUris.length - 1, prev + 1));
                  resetZoom();
                }}
                disabled={selectedPhotoIndex === photoUris.length - 1}
                style={[styles.photoViewerNavBtn, selectedPhotoIndex === photoUris.length - 1 && styles.photoViewerNavBtnDisabled]}
              >
                <ChevronRight size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
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
    height: 180,
    maxHeight: 300,
    fontSize: 16,
    lineHeight: 22,
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
  
  photoScrollView: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  photoItemContainer: {
    marginRight: 10,
    position: 'relative',
  },
  photoPreview: { 
    width: 120, 
    height: 120, 
    borderRadius: radius.md,
    backgroundColor: colors.surfaceMuted,
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  
  attachButton: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
    marginBottom: 8,
  },
  attachButtonPressed: {
    backgroundColor: colors.accentSoft,
    borderColor: colors.accent,
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
    flexDirection: 'row',
    gap: 8,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  voiceButtonTextActive: {
    color: '#FFFFFF',
  },
  recPulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#FFFFFF',
  },
  voiceActions: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
    alignItems: 'stretch',
  },
  voicePlayButton: {
    flexDirection: 'row',
    gap: 6,
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voicePlayText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  voiceStopButton: {
    width: 44,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceDeleteButton: {
    flexDirection: 'row',
    gap: 6,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
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

  // Photo Viewer Styles
  photoViewerContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  photoViewerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  photoViewerCounter: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  photoViewerClose: {
    padding: 8,
  },
  photoViewerBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoViewerImage: {
    width: SCREEN_WIDTH - 40,
    height: SCREEN_HEIGHT - 200,
  },
  photoViewerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  photoViewerControlBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: radius.md,
  },
  photoViewerControlText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  photoViewerZoomGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  photoViewerZoomBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 8,
    borderRadius: radius.full,
  },
  photoViewerNav: {
    flexDirection: 'row',
    gap: 12,
  },
  photoViewerNavBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
    borderRadius: radius.full,
  },
  photoViewerNavBtnDisabled: {
    opacity: 0.3,
  },
});