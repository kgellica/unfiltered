import React from 'react';
import { View, Text, StyleSheet, Pressable, Modal, FlatList } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius, cardShadow } from '../../theme/theme';

export default function TagFilterModal({
  visible,
  onClose,
  allTags,
  selectedTag,
  onSelectTag,
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.menuOverlay} onPress={onClose}>
        <View style={styles.menuSheet} onStartShouldSetResponder={() => true}>
          <Text style={styles.menuTitle}>filter by tag</Text>
          <FlatList
            data={['any', ...allTags]}
            keyExtractor={(t) => t}
            style={{ maxHeight: 320 }}
            ListEmptyComponent={<Text style={styles.menuEmptyText}>no tags yet</Text>}
            renderItem={({ item }) => {
              const isAny = item === 'any';
              const active = isAny ? !selectedTag : selectedTag === item;
              return (
                <Pressable
                  style={styles.menuItem}
                  onPress={() => {
                    onSelectTag(isAny ? '' : item);
                    onClose();
                  }}
                >
                  <Text style={[styles.menuItemText, active && styles.menuItemTextActive]}>
                    {isAny ? 'all tags' : item}
                  </Text>
                  {active && <Check size={15} color={colors.accent} strokeWidth={2.6} />}
                </Pressable>
              );
            }}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 36, 30, 0.35)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    ...cardShadow,
  },
  menuTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.onSurfaceVariant,
    letterSpacing: 0.4,
    paddingHorizontal: 12,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: radius.md,
  },
  menuItemText: {
    fontSize: 14.5,
    color: colors.onSurface,
    fontWeight: '500',
  },
  menuItemTextActive: {
    color: colors.accent,
    fontWeight: '800',
  },
  menuEmptyText: {
    fontSize: 13,
    color: colors.onSurfaceFaint,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});