import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Mail, CalendarDays, NotebookPen, Flame, Sparkles } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getStats } from '../api/entries';
import { colors, radius, spacing, cardShadow } from '../theme/theme';

// Read-only view of the account: who you are + a quick snapshot of your
// journaling stats. Editing lives on the separate "Edit Profile" screen.
export default function UserProfileScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total_entries: 0, current_streak: 0, total_tags: 0 });

  const loadStats = useCallback(async () => {
    try {
      const data = await getStats();
      setStats(data);
    } catch (e) {
      // keep previous stats on failure
    }
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const joinDate = (() => {
    if (!user?.created_at) return null;
    const d = new Date(user.created_at);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'long' });
  })();

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.identityCard}>
        {user?.avatar_url ? (
          <Image source={{ uri: user.avatar_url }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarFallback]}>
            <Text style={styles.avatarInitial}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{user?.name || 'Your name'}</Text>

        <View style={styles.infoRow}>
          <Mail size={15} color={colors.onSurfaceVariant} strokeWidth={2.2} />
          <Text style={styles.infoText}>{user?.email || '—'}</Text>
        </View>
        {joinDate && (
          <View style={styles.infoRow}>
            <CalendarDays size={15} color={colors.onSurfaceVariant} strokeWidth={2.2} />
            <Text style={styles.infoText}>member since {joinDate}</Text>
          </View>
        )}
      </View>

      <Text style={styles.sectionLabel}>YOUR JOURNAL, AT A GLANCE</Text>
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <NotebookPen size={18} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.statValue}>{stats.total_entries}</Text>
          <Text style={styles.statLabel}>entries</Text>
        </View>
        <View style={styles.statCard}>
          <Flame size={18} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.statValue}>{stats.current_streak}</Text>
          <Text style={styles.statLabel}>day streak</Text>
        </View>
        <View style={styles.statCard}>
          <Sparkles size={18} color={colors.accent} strokeWidth={2.2} />
          <Text style={styles.statValue}>{stats.total_tags}</Text>
          <Text style={styles.statLabel}>tags used</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 48 },
  identityCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    alignItems: 'center',
    padding: 24,
    marginBottom: 24,
    ...cardShadow,
  },
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.surfaceMuted, marginBottom: 12 },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  avatarInitial: { fontSize: 32, fontWeight: '800', color: colors.accent },
  name: { fontSize: 19, fontWeight: '800', color: colors.onBackground, marginBottom: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  infoText: { fontSize: 13.5, color: colors.onSurfaceVariant, fontWeight: '500' },
  sectionLabel: { fontSize: 11, fontWeight: '800', color: colors.onSurfaceVariant, letterSpacing: 0.6, marginBottom: 10 },
  statsRow: { flexDirection: 'row', gap: 10 },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
    ...cardShadow,
  },
  statValue: { fontSize: 17, fontWeight: '800', color: colors.onBackground },
  statLabel: { fontSize: 10.5, fontWeight: '700', color: colors.onSurfaceFaint },
});
