import React, { useRef, useState } from 'react';
import { View, TextInput, Text, StyleSheet, Animated } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';

// A multiline TextInput that shows a small "scroll" hint pill in the
// bottom-right corner whenever there's more text below the visible area,
// and fades it out once the user has scrolled to the bottom. Native scroll
// indicators on these boxes are easy to miss, so this makes it obvious the
// box is scrollable instead of looking like the text got cut off.
const ScrollableTextInput = React.forwardRef(function ScrollableTextInput(
  { style, onContentSizeChange, onScroll, ...props },
  ref
) {
  const [overflowing, setOverflowing] = useState(false);
  const layoutHeightRef = useRef(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const setHintVisible = (visible) => {
    Animated.timing(fadeAnim, {
      toValue: visible ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const handleLayout = (e) => {
    layoutHeightRef.current = e.nativeEvent.layout.height;
  };

  const handleContentSizeChange = (e) => {
    const contentHeight = e.nativeEvent.contentSize.height;
    const isOverflowing = contentHeight > layoutHeightRef.current + 4;
    setOverflowing(isOverflowing);
    setHintVisible(isOverflowing);
    onContentSizeChange?.(e);
  };

  const handleScroll = (e) => {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
    const distanceFromBottom = contentSize.height - (contentOffset.y + layoutMeasurement.height);
    const nearBottom = distanceFromBottom < 12;
    setHintVisible(overflowing && !nearBottom);
    onScroll?.(e);
  };

  return (
    <View style={styles.wrapper}>
      <TextInput
        {...props}
        ref={ref}
        style={style}
        multiline
        onLayout={handleLayout}
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      <Animated.View pointerEvents="none" style={[styles.hintWrap, { opacity: fadeAnim }]}>
        <View style={styles.hintPill}>
          <ChevronDown size={10} color={colors.onSurfaceVariant} strokeWidth={2.5} />
          <Text style={styles.hintText}>scroll</Text>
        </View>
      </Animated.View>
    </View>
  );
});

export default ScrollableTextInput;

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  hintWrap: {
    position: 'absolute',
    bottom: 6,
    right: 8,
  },
  hintPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderSoft,
    borderRadius: radius.full,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  hintText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.onSurfaceVariant,
  },
});
