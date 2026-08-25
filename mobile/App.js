import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

// We separate this component to access the theme context inside the Provider
function MainApp() {
  const { mode } = useTheme();

  // Determine the correct Status Bar style based on the current theme
  const barStyle = mode === 'light' ? 'dark' : 'light';

  return (
    <>
      <StatusBar style={barStyle} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}