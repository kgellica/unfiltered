import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Image } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { listEntries } from '../api/entries';
import { colors, radius, spacing, pixelShadow } from '../theme/theme';

export default function MemoriesScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setEntries(await listEntries());
    } catch (e) {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <FlatList
      style={styles.flex}
      contentContainerStyle={styles.container}
      data={entries}
      keyExtractor={(item) => String(item.id)}
      refreshing={loading}
      onRefresh={load}
      ListEmptyComponent={!loading && <Text style={styles.empty}>No memories yet. Start journaling!</Text>}
      renderItem={({ item }) => (
        <Pressable style={styles.card} onPress={() => navigation.navigate('NewEntry', { entryId: item.id })}>
          {item.photo_path ? (
            <Image source={{ uri: item.photo_path }} style={styles.thumb} />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Text style={{ fontSize: 20 }}>{(item.stickers && item.stickers[0]) || '📝'}</Text>
            </View>
          )}
          <View style={styles.cardBody}>
            <Text style={styles.cardDate}>{item.entry_date}</Text>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title || '(untitled)'}</Text>
            <Text style={styles.cardPreview} numberOfLines={2}>{item.content}</Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.gutter, paddingBottom: 100 },
  empty: { color: colors.onSurfaceVariant, textAlign: 'center', marginTop: 40 },
  card: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    marginBottom: 12,
    overflow: 'hidden',
    ...pixelShadow,
  },
  thumb: { width: 72, height: 72 },
  thumbPlaceholder: { backgroundColor: colors.tertiaryContainer, alignItems: 'center', justifyContent: 'center' },
  cardBody: { flex: 1, padding: 10, justifyContent: 'center' },
  cardDate: { fontSize: 11, color: colors.onSurfaceVariant, fontWeight: '700' },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.onSurface, marginVertical: 2 },
  cardPreview: { fontSize: 12, color: colors.onSurfaceVariant },
});
