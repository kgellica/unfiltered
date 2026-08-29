import React from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Bell } from 'lucide-react-native';
import { colors, radius } from '../theme/theme';

// Small logo/icon button used on the Journal, Calendar, and Memories
// screens' headers. Tapping it takes the user to the Reminders screen.
export default function RemindersHeaderButton({ navigation }) {
  return (
    <Pressable
      style={styles.btn}
      onPress={() => navigation.navigate('Reminders')}
      hitSlop={10}
      accessibilityRole="button"
      accessibilityLabel="Open reminders"
    >
      <Bell size={20} color={colors.accent} strokeWidth={2.2} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38,
    height: 38,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.borderSoft,
  },
});
