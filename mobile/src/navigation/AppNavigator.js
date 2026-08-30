import React, { useMemo } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import SignUpScreen from '../screens/SignUpScreen';
import PinSetupScreen from '../screens/PinSetupScreen';
import NewEntryScreen from '../screens/NewEntryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ThemeAmbienceScreen from '../screens/ThemeAmbienceScreen';
import RemindersScreen from '../screens/RemindersScreen';
import MainTabs from './MainTabs';
import { colors } from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="PinSetup" component={PinSetupScreen} />
    </Stack.Navigator>
  );
}

function AppStack() {
  // `colors` is a mutable singleton that ThemeContext updates in place
  // (see applyMode/applyAccent). Subscribing to useTheme() here forces this
  // component to re-render whenever the mode/accent change, so the header
  // (including the back button tint) always reflects the current theme
  // instead of being frozen at whatever it was on first import.
  const { mode, accent } = useTheme();
  const modalHeaderOptions = useMemo(
    () => ({
      headerStyle: { backgroundColor: colors.surface },
      headerTitleStyle: { color: colors.onSurface, fontWeight: '700' },
      headerTintColor: colors.accent,
    }),
    [mode, accent]
  );

  return (
    <Stack.Navigator>
      <Stack.Screen name="MainTabs" component={MainTabs} options={{ headerShown: false }} />
      <Stack.Screen
        name="NewEntry"
        component={NewEntryScreen}
        options={{ title: 'Journal Entry', ...modalHeaderOptions }}
      />
      {/* Reached from the Profile tab's menu */}
      <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile', ...modalHeaderOptions }} />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} options={{ title: 'User Profile', ...modalHeaderOptions }} />
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} options={{ title: 'Change Password', ...modalHeaderOptions }} />
      <Stack.Screen name="ThemeAmbience" component={ThemeAmbienceScreen} options={{ title: 'Theme & Ambience', ...modalHeaderOptions }} />
      <Stack.Screen name="Reminders" component={RemindersScreen} options={{ title: 'Reminders', ...modalHeaderOptions }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? <AppStack /> : <AuthStack />}
    </NavigationContainer>
  );
}