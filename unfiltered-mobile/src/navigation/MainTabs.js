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
          headerShown: false,
        };
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Journal" component={JournalScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Memories" component={MemoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}