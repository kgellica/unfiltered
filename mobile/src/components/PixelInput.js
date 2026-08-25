import React, { useState } from 'react';
import { View, TextInput, Text, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '../theme/theme';

export default function PixelInput({ label, secureToggle, style, ...props }) {
  const [hidden, setHidden] = useState(!!secureToggle);

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholderTextColor={colors.outline}
          secureTextEntry={secureToggle ? hidden : props.secureTextEntry}
          autoCapitalize="none"
          {...props}
        />
        {secureToggle && (
          <Pressable onPress={() => setHidden((h) => !h)} hitSlop={10}>
            <Text style={styles.toggle}>{hidden ? 'SHOW' : 'HIDE'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 16 },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.outline,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.onSurface,
  },
  toggle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
    marginLeft: 8,
  },
});
