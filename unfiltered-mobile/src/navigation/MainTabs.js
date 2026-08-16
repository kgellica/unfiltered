import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, BookOpen, CalendarDays, Images, CircleUserRound } from 'lucide-react-native';
import DashboardScreen from '../screens/DashboardScreen';
import JournalScreen from '../screens/JournalScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

// HCI note: only 5 primary destinations are shown in the tab bar (the max
// comfortably scannable/reachable on a phone). Affirmations now live inline
// on the Dashboard; Reminders were removed. The 5th tab is now a direct
// "Profile" destination (was "More") — Edit Profile, User Profile, Change
// Password, and Theme & Ambience all branch from there.
const ICONS = {
  Dashboard: Home,
  Journal: BookOpen,
  Calendar: CalendarDays,
  Memories: Images,
  Profile: CircleUserRound,
};

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => {
        const Icon = ICONS[route.name];
        return {
          headerStyle: { backgroundColor: colors.surface, shadowColor: 'transparent', elevation: 0 },
          headerTitleStyle: { color: colors.onSurface, fontWeight: '700' },
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.onSurfaceFaint,
          tabBarStyle: {
            backgroundColor: colors.surface,
            borderTopColor: colors.borderSoft,
            height: 64,
            paddingBottom: 10,
            paddingTop: 8,
          },
          tabBarIcon: ({ color, focused }) => (
            <Icon size={22} color={color} strokeWidth={focused ? 2.4 : 2} />
          ),
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Journal" component={JournalScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Memories" component={MemoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}
