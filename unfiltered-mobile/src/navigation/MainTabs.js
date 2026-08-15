import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import MemoriesScreen from '../screens/MemoriesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { colors } from '../theme/theme';

const Tab = createBottomTabNavigator();

const ICONS = { Dashboard: '🏠', Calendar: '📅', Memories: '🖼️', Profile: '👤' };

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerStyle: { backgroundColor: colors.surface },
        headerTitleStyle: { color: colors.onSurface, fontWeight: '700' },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.outline,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant },
        tabBarIcon: () => <Text style={{ fontSize: 20 }}>{ICONS[route.name]}</Text>,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="Memories" component={MemoriesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
