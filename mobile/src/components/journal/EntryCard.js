import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Image,
} from 'react-native';
import { Calendar, Mic } from 'lucide-react-native';
import { colors, radius } from '../../theme/theme';
import { formatDateAndTime } from './journalDateUtils';

const MOOD_META = {
  great: { label: 'great', emoji: '😄' },
  good: { label: 'good', emoji: '🙂' },
  okay: { label: 'okay', emoji: '😐' },
  low: { label: 'low', emoji: '🙁' },
  sad: { label: 'sad', emoji: '😢' },
};

export default React.memo(function EntryCard({ item, onPress }) {
  const mood = MOOD_META[item.mood] || MOOD_META.good;
  const plainText = (item.content || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const tags = item.tags || [];
  const firstPhoto = Array.isArray(item.photo_path) ? item.photo_path[0] : item.photo_path;
  const hasPhoto = !!firstPhoto;
  const hasVoice = !!item.voice_path;

  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Open entry: ${item.title || 'untitled reflection'}`}
    >
      <View style={styles.cardTopRow}>
        <View style={styles.cardDateRow}>
          <Calendar size={12} color={colors.onSurfaceFaint} strokeWidth={2.2} />
          <Text style={styles.cardDate}>{formatDateAndTime(item.entry_date, item.created_at)}</Text>
        </View>
        <View style={styles.moodPill}>
          <Text style={styles.moodEmoji}>{mood.emoji}</Text>
          <Text style={styles.moodLabel}>{mood.label}</Text>
        </View>
      </View>

      {hasPhoto && (
        <View style={styles.attachmentPreview}>
          <Image
            source={{ uri: firstPhoto }}
            style={styles.attachmentImage}
            resizeMode="cover"
          />
          {hasVoice && (
            <View style={styles.voiceBadge}>
              <Mic size={12} color="#FFFFFF" strokeWidth={2.2} />
              <Text style={styles.voiceBadgeText}>voice</Text>
            </View>
          )}
        </View>
      )}

      {!hasPhoto && hasVoice && (
        <View style={styles.voicePreview}>
          <Mic size={16} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.voicePreviewText}>voice recording attached</Text>
        </View>
      )}

      <Text style={styles.cardTitle} numberOfLines={1}>
        {item.title || 'untitled reflection'}
      </Text>
      <Text style={styles.cardBody} numberOfLines={2}>
        {plainText || 'no content written yet...'}
      </Text>
      <View style={styles.cardDivider} />
      <View style={styles.cardFooterRow}>
        {tags.length > 0 ? (
          <View style={styles.cardTagsRow}>
            {tags.slice(0, 3).map((t) => {
              const name = t.name || t;
              return (
                <View key={name} style={styles.cardTag}>
                  <Text style={styles.cardTagText}>#{name}</Text>
                </View>
              );
            })}
          </View>
        ) : (
          <Text style={styles.cardNoTags}>no tags</Text>
        )}
        <Text style={styles.cardOpenLink}>open ›</Text>
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.outlineVariant,
    padding: 16,
    marginBottom: 12,
    position: 'relative',
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardDateRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 5 
  },
  cardDate: {
    fontSize: 11.5,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
  moodPill: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
  },
  moodEmoji: {
    fontSize: 12,
    lineHeight: 14,
    marginTop: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.onSurface,
    lineHeight: 14,
    marginLeft: 3,
    marginTop: 0,
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  attachmentPreview: {
    marginBottom: 10,
    borderRadius: radius.md,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceMuted,
  },
  attachmentImage: {
    width: '100%',
    height: 160,
    borderRadius: radius.md,
  },
  voiceBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  voiceBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accentInk,
  },
  voicePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceMuted,
    padding: 10,
    borderRadius: radius.md,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
  voicePreviewText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.onSurfaceVariant,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.onSurface,
    marginBottom: 4,
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.onSurfaceVariant,
  },
  cardDivider: {
    height: 1,
    backgroundColor: colors.borderSoft,
    marginTop: 12,
    marginBottom: 10,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardNoTags: {
    fontSize: 11.5,
    fontStyle: 'italic',
    color: colors.onSurfaceFaint,
  },
  cardOpenLink: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.accent,
  },
  cardTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cardTag: {
    backgroundColor: colors.primaryContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  cardTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.accent,
  },
});
