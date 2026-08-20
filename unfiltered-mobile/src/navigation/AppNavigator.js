import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import NewEntryScreen from '../screens/NewEntryScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import ThemeAmbienceScreen from '../screens/ThemeAmbienceScreen';
import MainTabs from './MainTabs';
import { colors } from '../theme/theme';

const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
    </Stack.Navigator>
  );
}

const modalHeaderOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: { color: colors.onSurface, fontWeight: '700' },
  headerTintColor: colors.accent,
};

function AppStack() {
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