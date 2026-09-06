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
import PromptBar from '../components/PromptBar';
import EditorToolbar from '../components/EditorToolbar';
import { analyzeMood } from '../utils/moodAnalyzer';
import {
  Camera, Mic, Square, Play, Pause, X, Trash2, Plus, Minus, ChevronLeft, ChevronRight,
  Sparkles,
  ChevronDown, ChevronUp, Info,
} from 'lucide-react-native';
import { colors, radius, spacing } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import client from '../api/client';

const BG_COLOR_PRESETS = [
  '#FFFFFF', '#FFF3E0', '#FCE4EC', '#E8F5E9', '#E3F2FD', '#F3E5F5', '#FFFDE7', '#EFEBE9',
];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOOD_META = {
  great: { label: 'great', emoji: '😄', color: colors.moodGreat, text: 'feeling amazing ✨' },
  good: { label: 'good', emoji: '🙂', color: colors.moodGood, text: 'feeling happy 🙂' },
  okay: { label: 'okay', emoji: '😐', color: colors.moodOkay, text: 'feeling okay 😐' },
  low: { label: 'low', emoji: '🙁', color: colors.moodLow, text: 'feeling a bit low 🙁' },
  sad: { label: 'sad', emoji: '😢', color: colors.moodSad, text: 'feeling down 😢' },
};
const MOOD_ORDER = ['great', 'good', 'okay', 'low', 'sad'];

const SUGGESTED_TAGS = [
  'grateful', 'reflection', 'family', 'friends', 'work',
  'school', 'health', 'travel', 'goals', 'rest', 'love', 'growth',
];

const MAX_PHOTOS = 5;
const MAX_VOICE_DURATION = 600; // 10 minutes in seconds

// Whole-entry text formatting — Expo Go has no native rich-text module, so
// Bold/Size apply to the entire content box rather than a per-character
// selection (a real rich-text editor needs a native module and wouldn't
// run in Expo Go).
const TEXT_SIZE_ORDER = ['sm', 'md', 'lg'];
const TEXT_SIZE_PX = { sm: 14, md: 16, lg: 19 };
const TEXT_SIZE_LABEL = { sm: 'S', md: 'M', lg: 'L' };

export default function NewEntryScreen({ route, navigation }) {
  const { mode, accent } = useTheme();
  const styles = useMemo(() => createStyles(), [mode, accent]);

  const entryId = route.params?.entryId;
  const initialDate = route.params?.date || new Date().toISOString().slice(0, 10);
  const isEditing = !!entryId;

  const [entryDate] = useState(initialDate);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [contentBold, setContentBold] = useState(false);
  const [contentTextSize, setContentTextSize] = useState('md');
  const [listMode, setListMode] = useState('bullet');
  const [photoUris, setPhotoUris] = useState([]);
  const [voiceUri, setVoiceUri] = useState(null);
  // No mood is pre-selected. The prior default of 'good' was saved to the
  // entry even if the user never touched the Mood row — silently picking
  // a mood on their behalf contradicts "you're always in control." Mood
  // now stays unset until the user taps a chip or accepts a suggestion.
  const [mood, setMood] = useState(null);
  const [moodInfoVisible, setMoodInfoVisible] = useState(false);
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [selectedTags, setSelectedTags] = useState([]);
  // Which toolbar sections are expanded — mood/tags open by default since
  // most entries touch those; photo/color/voice/list open on demand.
  const [openSections, setOpenSections] = useState({ mood: true, tag: true });
  const scrollRef = useRef(null);
  const sectionY = useRef({});
  const contentInputRef = useRef(null);
  const [contentSelection, setContentSelection] = useState({ start: 0, end: 0 });
  // On-device mood suggestion — no network call, just scores the text
  // locally as the user pauses typing.
  const [suggestedMood, setSuggestedMood] = useState(null);
  const moodDebounceRef = useRef(null);
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
        setMood(e.mood && MOOD_META[e.mood] ? e.mood : null);
        setBgColor(e.bg_color || '#FFFFFF');
        setSelectedTags((e.tags || []).map((t) => (typeof t === 'string' ? t : t.name)));
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [entryId]);

  // Debounced on-device mood suggestion — waits until the user pauses
  // typing, scores the text locally (no network), and offers a suggestion
  // pill near the Mood section if it disagrees with the current selection.
  useEffect(() => {
    if (moodDebounceRef.current) clearTimeout(moodDebounceRef.current);
    moodDebounceRef.current = setTimeout(() => {
      const result = analyzeMood(content);
      if (result && result.confidence >= 0.3 && result.mood !== mood) {
        setSuggestedMood(result.mood);
      } else {
        setSuggestedMood(null);
      }
    }, 700);
    return () => clearTimeout(moodDebounceRef.current);
  }, [content, mood]);

  const acceptSuggestedMood = () => {
    if (suggestedMood) {
      setMood(suggestedMood);
      setOpenSections((p) => ({ ...p, mood: true }));
    }
    setSuggestedMood(null);
  };

  const dismissSuggestedMood = () => setSuggestedMood(null);

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

  // Section jump handler — still used to open + scroll to Mood when Save
  // catches a missing mood (see onSave). No longer wired to any icon row.
  const handleToolbarPress = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: true }));
    requestAnimationFrame(() => {
      const y = sectionY.current[key];
      if (scrollRef.current && typeof y === 'number') {
        scrollRef.current.scrollTo({ y: Math.max(0, y - 12), animated: true });
      }
    });
  };

  const registerSectionY = (key) => (e) => {
    sectionY.current[key] = e.nativeEvent.layout.y;
  };

  // Inserts the next bullet or numbered list item at the cursor. Numbered
  // mode counts existing "N. " lines above the cursor so the sequence keeps
  // counting up correctly even if items were deleted in between.
  const insertListItem = () => {
    const { start, end } = contentSelection;
    const before = content.slice(0, start);
    const after = content.slice(end);
    const needsNewline = before.length > 0 && !before.endsWith('\n');
    let marker = '\u2022 ';
    if (listMode === 'number') {
      const priorNumbers = before.match(/^\d+\.\s/gm) || [];
      const nextNum = priorNumbers.length + 1;
      marker = `${nextNum}. `;
    }
    const insertion = `${needsNewline ? '\n' : ''}${marker}`;
    setContent(`${before}${insertion}${after}`);
    contentInputRef.current?.focus?.();
  };

  const toggleListMode = () => setListMode((m) => (m === 'number' ? 'bullet' : 'number'));


  // "Use this prompt" from PromptBar — drops it in as the title if there
  // isn't one yet, otherwise seeds the content so it doesn't clobber work.
  const handleUsePrompt = (promptText) => {
    if (!title.trim()) {
      setTitle(promptText.length > 100 ? promptText.slice(0, 100) : promptText);
    } else if (!content.trim()) {
      setContent(`${promptText}\n\n`);
    }
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
    if (!mood) {
      handleToolbarPress('mood');
      Alert.alert('Pick a mood', 'Choose how you\u2019re feeling before saving \u2014 or tap the suggested mood if one appears.');
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
        bg_color: bgColor,
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
          ref={scrollRef}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.dateLabel}>{entryDate}</Text>

          <PromptBar onUsePrompt={handleUsePrompt} />

          <TextInput
            style={styles.titleInput}
            placeholder="Entry title"
            placeholderTextColor={colors.outline}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          
          {/* Wrapper is position:relative so the formatting strip can sit
              flush inside the box's top-left corner, overlaid on the text
              area itself instead of as a separate row underneath. */}
          <View style={styles.contentBoxWrap}>
            <ScrollableTextInput
              ref={contentInputRef}
              style={[
                styles.contentInput,
                { backgroundColor: bgColor === '#FFFFFF' ? colors.surfaceContainerLow : bgColor },
                { fontWeight: contentBold ? '700' : '400', fontSize: TEXT_SIZE_PX[contentTextSize], lineHeight: TEXT_SIZE_PX[contentTextSize] * 1.4 },
              ]}
              placeholder="Write about your day..."
              placeholderTextColor={colors.outline}
              value={content}
              onChangeText={setContent}
              onSelectionChange={(e) => setContentSelection(e.nativeEvent.selection)}
              textAlignVertical="top"
              scrollEnabled
              showsVerticalScrollIndicator={true}
            />
            <View style={styles.contentToolbarOverlay} pointerEvents="box-none">
              <EditorToolbar
                bold={contentBold}
                onToggleBold={() => setContentBold((b) => !b)}
                textSizeLabel={TEXT_SIZE_LABEL[contentTextSize]}
                onCycleTextSize={() =>
                  setContentTextSize((s) => TEXT_SIZE_ORDER[(TEXT_SIZE_ORDER.indexOf(s) + 1) % TEXT_SIZE_ORDER.length])
                }
                listMode={listMode}
                onInsertListItem={insertListItem}
                onToggleListMode={toggleListMode}
              />
            </View>
          </View>

          <View onLayout={registerSectionY('mood')} />
          <Pressable
            onPress={() => setOpenSections((p) => ({ ...p, mood: !p.mood }))}
            style={styles.sectionHeaderRow}
            accessibilityRole="button"
            accessibilityLabel={`${openSections.mood ? 'Collapse' : 'Expand'} Mood section`}
          >
            <View style={styles.sectionHeaderLeft}>
              <Text style={styles.sectionLabel}>MOOD{!mood ? ' \u00b7 NOT SET' : ''}</Text>
              <Pressable
                onPress={() => setMoodInfoVisible(true)}
                hitSlop={10}
                style={styles.sectionInfoBtn}
                accessibilityRole="button"
                accessibilityLabel="How mood suggestions work"
              >
                <Info size={14} color={colors.onSurfaceFaint} strokeWidth={2.2} />
              </Pressable>
            </View>
            {openSections.mood ? (
              <ChevronUp size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            )}
          </Pressable>
          {suggestedMood && (
            <View style={styles.moodSuggestRow}>
              <Sparkles size={14} color={colors.accent} strokeWidth={2.4} />
              <Text style={styles.moodSuggestText}>
                Sounds like you're feeling {MOOD_META[suggestedMood].label} {MOOD_META[suggestedMood].emoji}. Use it?
              </Text>
              <Pressable
                onPress={acceptSuggestedMood}
                hitSlop={8}
                style={styles.moodSuggestAction}
                accessibilityRole="button"
                accessibilityLabel={`Use suggested mood: ${MOOD_META[suggestedMood].label}`}
              >
                <Text style={styles.moodSuggestActionText}>Use</Text>
              </Pressable>
              <Pressable
                onPress={dismissSuggestedMood}
                hitSlop={8}
                style={styles.moodSuggestDismiss}
                accessibilityRole="button"
                accessibilityLabel="Dismiss mood suggestion"
              >
                <X size={14} color={colors.onSurfaceVariant} strokeWidth={2.2} />
              </Pressable>
            </View>
          )}
          {!mood && !suggestedMood && openSections.mood && (
            <Text style={styles.moodHintText}>Tap a mood below — nothing is picked for you.</Text>
          )}
          {openSections.mood && (
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
          )}

          <Modal
            visible={moodInfoVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setMoodInfoVisible(false)}
          >
            <Pressable style={styles.infoOverlay} onPress={() => setMoodInfoVisible(false)}>
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>How mood suggestions work</Text>
                <Text style={styles.infoBody}>
                  As you type, your device scans the words on-screen (nothing leaves your phone) and may
                  suggest a mood. It never changes your entry by itself — you decide by tapping Use or
                  dismissing it, and your saved mood only changes when you tap a mood chip yourself.
                </Text>
                <Pressable
                  style={styles.infoCloseBtn}
                  onPress={() => setMoodInfoVisible(false)}
                  accessibilityRole="button"
                  accessibilityLabel="Close"
                >
                  <Text style={styles.infoCloseBtnText}>Got it</Text>
                </Pressable>
              </View>
            </Pressable>
          </Modal>

          <View onLayout={registerSectionY('photo')} />
          <Pressable
            onPress={() => setOpenSections((p) => ({ ...p, photo: !p.photo }))}
            style={styles.sectionHeaderRow}
            accessibilityRole="button"
            accessibilityLabel={`${openSections.photo ? 'Collapse' : 'Expand'} Photos section`}
          >
            <Text style={styles.sectionLabel}>PHOTOS ({photoUris.length}/{MAX_PHOTOS})</Text>
            {openSections.photo ? (
              <ChevronUp size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            )}
          </Pressable>
          {openSections.photo && <>
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
          </>}

          <View onLayout={registerSectionY('color')} />
          <Pressable
            onPress={() => setOpenSections((p) => ({ ...p, color: !p.color }))}
            style={styles.sectionHeaderRow}
            accessibilityRole="button"
            accessibilityLabel={`${openSections.color ? 'Collapse' : 'Expand'} Entry Color section`}
          >
            <Text style={styles.sectionLabel}>ENTRY COLOR</Text>
            {openSections.color ? (
              <ChevronUp size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            )}
          </Pressable>
          {openSections.color && (
            <View style={styles.colorRow}>
              {BG_COLOR_PRESETS.map((c) => (
                <Pressable
                  key={c}
                  onPress={() => setBgColor(c)}
                  style={[
                    styles.colorSwatch,
                    { backgroundColor: c },
                    bgColor === c && styles.colorSwatchActive,
                  ]}
                  accessibilityRole="button"
                  accessibilityLabel={`Background color ${c}`}
                />
              ))}
            </View>
          )}

          <View onLayout={registerSectionY('voice')} />
          <Pressable
            onPress={() => setOpenSections((p) => ({ ...p, voice: !p.voice }))}
            style={styles.sectionHeaderRow}
            accessibilityRole="button"
            accessibilityLabel={`${openSections.voice ? 'Collapse' : 'Expand'} Voice Journal section`}
          >
            <Text style={styles.sectionLabel}>VOICE JOURNAL</Text>
            {openSections.voice ? (
              <ChevronUp size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            )}
          </Pressable>
          {openSections.voice && <>
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
          </>}

          <View onLayout={registerSectionY('tag')} />
          <Pressable
            onPress={() => setOpenSections((p) => ({ ...p, tag: !p.tag }))}
            style={styles.sectionHeaderRow}
            accessibilityRole="button"
            accessibilityLabel={`${openSections.tag ? 'Collapse' : 'Expand'} Tags section`}
          >
            <Text style={styles.sectionLabel}>TAGS</Text>
            {openSections.tag ? (
              <ChevronUp size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            ) : (
              <ChevronDown size={16} color={colors.onSurfaceVariant} strokeWidth={2.4} />
            )}
          </Pressable>
          {openSections.tag && <View style={styles.tagRow}>
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
          </View>}

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
  contentBoxWrap: {
    position: 'relative',
    marginBottom: spacing.md,
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
    paddingTop: 40, // clears the overlaid formatting strip in the top-left corner
    marginBottom: 0,
  },
  contentToolbarOverlay: {
    position: 'absolute',
    top: 6,
    left: 6,
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

  colorRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 4 },
  colorSwatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
  },
  colorSwatchActive: {
    borderColor: colors.accent,
    borderWidth: 3,
  },

  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  sectionHeaderLeft: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  sectionInfoBtn: { padding: 4 },
  moodHintText: {
    fontSize: 12,
    color: colors.onSurfaceFaint,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  moodSuggestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.accentSoft,
    borderRadius: radius.md,
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  moodSuggestText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: colors.onSurface },
  moodSuggestAction: {
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    minHeight: 32,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  moodSuggestActionText: { fontSize: 12, fontWeight: '800', color: '#FFFFFF' },
  moodSuggestDismiss: {
    minHeight: 32,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  infoCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  infoTitle: { fontSize: 15, fontWeight: '800', color: colors.onSurface, marginBottom: 8 },
  infoBody: { fontSize: 13, lineHeight: 19, color: colors.onSurfaceVariant, marginBottom: 16 },
  infoCloseBtn: {
    alignSelf: 'flex-end',
    backgroundColor: colors.accent,
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  infoCloseBtnText: { fontSize: 13, fontWeight: '700', color: '#FFFFFF' },
  
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
    flexWrap: 'nowrap',
    gap: 6,
    marginBottom: 4,
    justifyContent: 'flex-start',
  },
  moodChip: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    flex: 1,
    maxWidth: 62,
    minWidth: 52,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: radius.lg,
    borderWidth: 1.5,
  },
  moodEmoji: { fontSize: 18 },
  moodLabel: { 
    fontSize: 9, 
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