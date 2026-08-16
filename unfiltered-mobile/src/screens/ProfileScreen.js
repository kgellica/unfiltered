import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Pressable,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { colors, spacing } from '../theme/theme';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || 'Fatima',
    email: user?.email || 'fatima.dreamer@pixeljournal.app',
    totalEntries: 142,
    streakDays: 12,
    memories: 45,
    avatarUrl: 'https://i.pravatar.cc/300?img=47',
  });
  const [loading, setLoading] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;
    client
      .get('/user/profile')
      .then((res) => {
        if (isMounted && res.data) {
          setProfileData((prev) => ({ ...prev, ...res.data }));
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogoutConfirm = async () => {
    setLoggingOut(true);
    try {
      await logout();
    } catch (e) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Navigation Header */}
      <View style={styles.headerBar}>
        <Pressable
          hitSlop={12}
          onPress={() => navigation.navigate('AccountSettings')}
        >
          <Text style={styles.headerIcon}>👤</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Profile</Text>
        <Pressable hitSlop={12} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.headerIcon}>⚙️</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Identity Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image
              source={{ uri: profileData.avatarUrl }}
              style={styles.avatarImage}
            />
            <View style={styles.badgeIcon}>
              <Text style={styles.badgeStar}>★</Text>
            </View>
          </View>
          <Text style={styles.userName}>{profileData.name}</Text>
          <Text style={styles.userEmail}>{profileData.email}</Text>
        </View>

        {/* Hero Metric: Total Entries */}
        <View style={styles.totalEntriesCard}>
          <Text style={styles.totalEntriesValue}>
            {profileData.totalEntries}
          </Text>
          <Text style={styles.metricLabel}>TOTAL ENTRIES</Text>
        </View>

        {/* Secondary Metrics Grid: Streak & Memories */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🔥</Text>
            <Text style={styles.statValue}>{profileData.streakDays} days</Text>
            <Text style={styles.metricLabel}>STREAK</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✨</Text>
            <Text style={styles.statValue}>{profileData.memories}</Text>
            <Text style={styles.metricLabel}>MEMORIES</Text>
          </View>
        </View>

        {/* Menu Actions List */}
        <View style={styles.menuGroup}>
          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Themes')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#EDE7F6' }]}>
              <Text style={styles.menuEmoji}>🎨</Text>
            </View>
            <Text style={styles.menuText}>Journal Themes</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Notifications')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#E8F5E9' }]}>
              <Text style={styles.menuEmoji}>🔔</Text>
            </View>
            <Text style={styles.menuText}>Notifications</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('ExportData')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#FFEBEE' }]}>
              <Text style={styles.menuEmoji}>📥</Text>
            </View>
            <Text style={styles.menuText}>Export Data</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuItem}
            activeOpacity={0.7}
            onPress={() => navigation.navigate('Privacy')}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: '#ECEFF1' }]}>
              <Text style={styles.menuEmoji}>🔒</Text>
            </View>
            <Text style={styles.menuText}>Privacy</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Log Out Action */}
        <TouchableOpacity
          style={styles.logoutButton}
          activeOpacity={0.8}
          onPress={() => setShowLogoutModal(true)}
        >
          <Text style={styles.logoutText}>[→ LOG OUT</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Custom Logout Confirmation Modal */}
      <Modal
        visible={showLogoutModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Top Star Accent */}
            <Text style={styles.modalStar}>★</Text>

            {/* Logout Icon Circle */}
            <View style={styles.logoutIconBadge}>
              <Text style={styles.logoutIconSymbol}>⍈</Text>
            </View>

            {/* Content Text */}
            <Text style={styles.modalTitle}>Log out of UNFILTERED?</Text>
            <Text style={styles.modalDescription}>
              Are you sure you want to log out? You'll need to sign back in to access your entries.
            </Text>

            {/* Action Buttons */}
            <TouchableOpacity
              style={styles.modalConfirmBtn}
              activeOpacity={0.85}
              onPress={handleLogoutConfirm}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.modalConfirmBtnText}>[→ LOG OUT</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCancelBtn}
              activeOpacity={0.85}
              onPress={() => setShowLogoutModal(false)}
              disabled={loggingOut}
            >
              <Text style={styles.modalCancelBtnText}>✕ CANCEL</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 56 : 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#2D3748',
  },
  headerIcon: {
    fontSize: 20,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  profileSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#E2E8F0',
  },
  badgeIcon: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#5A4A42',
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FAF9F6',
  },
  badgeStar: {
    color: '#FFD700',
    fontSize: 12,
  },
  userName: {
    fontSize: 22,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#1A202C',
  },
  userEmail: {
    fontSize: 12,
    color: '#718096',
    marginTop: 4,
  },
  totalEntriesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  totalEntriesValue: {
    fontSize: 28,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#2D3748',
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '700',
    color: '#A0AEC0',
    marginTop: 4,
    letterSpacing: 0.8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 0.485,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 2,
  },
  statEmoji: {
    fontSize: 18,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#2D3748',
  },
  menuGroup: {
    marginBottom: 24,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuEmoji: {
    fontSize: 18,
  },
  menuText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#2D3748',
  },
  chevron: {
    fontSize: 20,
    color: '#CBD5E0',
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 25,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  logoutText: {
    color: '#DC2626',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },

  /* Modal Custom UI Styling */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalStar: {
    position: 'absolute',
    top: 16,
    right: 18,
    fontSize: 16,
    color: '#A0AEC0',
  },
  logoutIconBadge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  logoutIconSymbol: {
    fontSize: 24,
    color: '#DC2626',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 13,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    paddingHorizontal: 8,
  },
  modalConfirmBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#B91C1C',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalConfirmBtnText: {
    color: '#FFFFFF',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
  modalCancelBtn: {
    width: '100%',
    height: 48,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCancelBtnText: {
    color: '#374151',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontWeight: '800',
    fontSize: 13,
    letterSpacing: 0.5,
  },
});