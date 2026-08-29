import React, { useRef, useState, useImperativeHandle, forwardRef, useMemo } from 'react';
import { View, TextInput, StyleSheet, Pressable, Animated } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';

// A 6-box code entry used for the PIN pad, PIN confirmation, and OTP screen.
// Keeps the value in local component state only (via onChange) — callers
// decide what to do with it (e.g. AuthContext keeps a PIN only in memory,
// never persisted).
//
// Exposes `shake()` via ref so callers can play an error animation
// (e.g. PIN mismatch) without owning any animation state themselves.
//
// `allowReveal` adds a show/hide toggle next to a `secure` code — off by
// default so OTP entry (never sensitive, always shown as digits already)
// and any other caller that doesn't ask for it keeps its current look.
const CodeInput = forwardRef(function CodeInput(
  { value, onChange, secure = false, length = 6, autoFocus = true, size = 'md', allowReveal = false },
  ref
) {
  const inputRef = useRef(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const [revealed, setRevealed] = useState(false);
  const digits = value.split('');
  const isLarge = size === 'lg';
  const showDigits = !secure || revealed;

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    shake: () => {
      shakeAnim.setValue(0);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 1, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 1, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -1, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 45, useNativeDriver: true }),
      ]).start();
    },
  }));

  const translateX = shakeAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-8, 8],
  });

  const styles = useMemo(() => createStyles(isLarge), [isLarge]);

  return (
    <Animated.View style={{ transform: [{ translateX }] }}>
      <Pressable onPress={() => inputRef.current?.focus()} style={styles.row}>
        {Array.from({ length }).map((_, i) => {
          const filled = !!digits[i];
          const active = i === value.length;
          return (
            <View key={i} style={[styles.box, active && styles.boxActive, filled && styles.boxFilled]}>
              {showDigits ? (
                <TextInput editable={false} style={styles.boxText} value={digits[i] || ''} />
              ) : (
                filled ? <View style={styles.dot} /> : null
              )}
            </View>
          );
        })}
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={(t) => onChange(t.replace(/[^0-9]/g, '').slice(0, length))}
          keyboardType="number-pad"
          maxLength={length}
          autoFocus={autoFocus}
          style={styles.hiddenInput}
          textContentType="oneTimeCode"
        />
      </Pressable>
      {secure && allowReveal && (
        <Pressable
          onPress={() => setRevealed((r) => !r)}
          hitSlop={10}
          style={styles.revealButton}
          accessibilityRole="button"
          accessibilityLabel={revealed ? 'Hide PIN' : 'Show PIN'}
        >
          {revealed ? (
            <EyeOff size={16} color={colors.onSurfaceFaint} />
          ) : (
            <Eye size={16} color={colors.onSurfaceFaint} />
          )}
          <Animated.Text style={styles.revealText}>{revealed ? 'Hide PIN' : 'Show PIN'}</Animated.Text>
        </Pressable>
      )}
    </Animated.View>
  );
});

export default CodeInput;

const createStyles = (isLarge) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: isLarge ? 10 : 8,
    },
    box: {
      width: isLarge ? 46 : 40,
      height: isLarge ? 56 : 48,
      borderWidth: 1.5,
      borderColor: colors.borderSoft,
      borderRadius: radius.md,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
    },
    boxActive: {
      borderColor: colors.accent,
      borderWidth: 2,
      shadowColor: colors.accent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 2,
    },
    boxFilled: {
      backgroundColor: colors.accentSoft,
      borderColor: colors.accent,
    },
    dot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.accent,
    },
    boxText: {
      fontSize: isLarge ? 22 : 19,
      fontWeight: '700',
      color: colors.onSurface,
      textAlign: 'center',
      padding: 0,
    },
    hiddenInput: {
      position: 'absolute',
      opacity: 0,
      width: '100%',
      height: '100%',
    },
    revealButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      marginTop: 14,
      alignSelf: 'center',
      paddingVertical: 6,
      paddingHorizontal: 10,
    },
    revealText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.onSurfaceFaint,
    },
  });