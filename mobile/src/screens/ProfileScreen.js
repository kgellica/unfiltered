import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Modal, ActivityIndicator, SafeAreaView, Platform, StatusBar } from 'react-native';
import { Pencil, User as UserIcon, Lock, Palette, BellRing, ChevronRight, LogOut, X } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, radius, spacing, cardShadow } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

const MENU_ITEMS = [
  { key: 'EditProfile', label: 'Edit Profile', hint: 'Name & profile photo', Icon: Pencil },
  { key: 'UserProfile', label: 'User Profile', hint: 'Your account details', Icon: UserIcon },
  { key: 'ChangePassword', label: 'Change Password', hint: 'Update your login password', Icon: Lock },
  { key: 'ThemeAmbience', label: 'Theme & Ambience', hint: 'Color mode & accent', Icon: Palette },
  { key: 'Reminders', label: 'Reminders', hint: 'Daily journaling nudges', Icon: BellRing },
];

export default function ProfileScreen({ navigation }) {
  const { mode, accent } = useTheme(); // subscribe so styles rebuild with the current accent/mode
  const styles = useMemo(() => createStyles(), [mode, accent]);
  const { user, logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* HCI FIXED Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        <View style={styles.content}>
        {/* Identity */}
        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.avatarWrapper}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('EditProfile')}
            accessibilityRole="button"
            accessibilityLabel="Edit profile photo and details"
          >
            {user?.avatar_url ? (
              <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
            ) : (
              <View style={[styles.avatarImage, styles.avatarFallback]}>
                <Text style={styles.avatarInitial}>{(user?.name || '?').charAt(0).toUpperCase()}</Text>
              </View>
            )}
            <View style={styles.avatarEditBadge}>
              <Pencil size={13} color="#fff" strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
          <Text style={styles.userName}>{user?.name || 'Your name'}</Text>
        </View>

        {/* Settings box */}
        <View style={styles.menuGroup}>
          {MENU_ITEMS.map(({ key, label, hint, Icon }, i) => (
            <TouchableOpacity
              key={key}
              style={[styles.menuItem, i !== MENU_ITEMS.length - 1 && styles.menuItemBorder]}
              activeOpacity={0.7}
              onPress={() => navigation.navigate(key)}
              accessibilityRole="button"
              accessibilityLabel={label}
            >
              <View style={styles.menuIconContainer}>
                <Icon size={18} color={colors.accent} strokeWidth={2.2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.menuText}>{label}</Text>
                <Text style={styles.menuHint}>{hint}</Text>
              </View>
              <ChevronRight size={20} color={colors.onSurfaceFaint} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Log out */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => setShowLogoutModal(true)}
        >
          <LogOut size={16} color={colors.error} strokeWidth={2.3} />
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.logoutIconBadge}>
              <LogOut size={24} color={colors.error} strokeWidth={2.2} />
            </View>
            <Text style={styles.modalTitle}>Log out of UNFILTERED?</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to log out? You'll need to sign back in to access your entries.
            </Text>
            <TouchableOpacity style={styles.modalConfirmBtn} activeOpacity={0.85} onPress={handleLogoutConfirm} disabled={loggingOut}>
              {loggingOut ? <ActivityIndicator color="#FFFFFF" size="small" /> : <Text style={styles.modalConfirmBtnText}>Log out</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalCancelBtn} activeOpacity={0.85} onPress={() => setShowLogoutModal(false)} disabled={loggingOut}>
              <X size={14} color={colors.onSurfaceVariant} strokeWidth={2.4} />
              <Text style={styles.modalCancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = () => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 24 : 0,
  },
  scrollContent: { paddingBottom: 48 },
  content: { paddingHorizontal: spacing.gutter },

  headerContainer: {
    paddingHorizontal: spacing.gutter,
    paddingTop: 0,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.onBackground,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    letterSpacing: -0.5,
  },

  profileSection: { alignItems: 'center', marginBottom: 32 },
  avatarWrapper: { position: 'relative', marginBottom: 14 },
  avatarImage: { width: 104, height: 104, borderRadius: 52, backgroundColor: colors.surfaceMuted },
  avatarFallback: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.accentSoft },
  avatarInitial: { fontSize: 38, fontWeight: '800', color: colors.accent },
  avatarEditBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  userName: { fontSize: 21, fontWeight: '800', color: colors.onBackground },

  menuGroup: {
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    marginBottom: 28,
    ...cardShadow,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 64,
  },
  menuItemBorder: { borderBottomWidth: 1, borderBottomColor: colors.borderSoft },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuText: { fontSize: 15.5, fontWeight: '700', color: colors.onSurface },
  menuHint: { fontSize: 12, color: colors.onSurfaceVariant, marginTop: 2 },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.lg,
    height: 52,
  },
  logoutText: { color: colors.error, fontWeight: '800', fontSize: 14.5 },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(50, 36, 30, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    ...cardShadow,
  },
  logoutIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.errorContainer,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: { fontSize: 19, fontWeight: '800', color: colors.onBackground, textAlign: 'center', marginBottom: 10 },
  modalDescription: {
    fontSize: 13,
    color: colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalConfirmBtn: {
    width: '100%',
    height: 48,
    backgroundColor: colors.error,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalConfirmBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  modalCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    width: '100%',
    height: 48,
    backgroundColor: colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.borderStrong,
  },
  modalCancelBtnText: { color: colors.onSurfaceVariant, fontWeight: '800', fontSize: 14 },
});