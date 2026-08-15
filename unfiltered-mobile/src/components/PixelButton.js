import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { colors, radius, pixelShadow } from '../theme/theme';

export default function PixelButton({ title, onPress, variant = 'primary', loading, disabled, style }) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        pixelShadow,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.onPrimary : colors.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.onSurface,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.outline,
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    shadowOpacity: 0,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 16,
  },
  textPrimary: {
    color: colors.onPrimary,
  },
  textSecondary: {
    color: colors.onSurface,
  },
});
