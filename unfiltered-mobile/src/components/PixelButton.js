import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { colors, radius, cardShadow } from '../theme/theme';

export default function PixelButton({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  style,
  textStyle,
  icon, // optional React node (e.g. a lucide icon or <GoogleIcon />) rendered before the label
}) {
  const isPrimary = variant === 'primary';
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={title}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        cardShadow,
        pressed && styles.pressed,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.accentInk : colors.accent} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary, textStyle]}>
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.lg,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primary: {
    backgroundColor: colors.accent,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.borderStrong,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontWeight: '700',
    fontSize: 15,
  },
  textPrimary: {
    color: colors.accentInk,
  },
  textSecondary: {
    color: colors.onSurface,
  },
});
