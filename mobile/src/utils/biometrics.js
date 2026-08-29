import * as LocalAuthentication from 'expo-local-authentication';

// Thin wrapper for biometric authentication
// No biometric data is sent to the backend - only the device OS handles it

export async function isBiometricAvailable() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }
    
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return hasHardware && isEnrolled;
  } catch (error) {
    console.error('Error checking biometric availability:', error);
    return false;
  }
}

export async function authenticateWithBiometrics(promptMessage = 'Log in to Unfiltered') {
  try {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage,
      cancelLabel: 'Cancel',
      disableDeviceFallback: true,
    });
    
    return result.success;
  } catch (error) {
    console.error('Biometric authentication error:', error);
    return false;
  }
}

// Get detailed biometric status for debugging
export async function getBiometricStatus() {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();
    
    const typeNames = {
      1: 'Fingerprint',
      2: 'Face ID',
      3: 'Touch ID (iOS)',
    };
    
    const readableTypes = supportedTypes.map(type => typeNames[type] || 'Unknown');
    
    return {
      hasHardware,
      isEnrolled,
      supportedTypes: readableTypes,
      isAvailable: hasHardware && isEnrolled,
    };
  } catch (error) {
    console.error('Error getting biometric status:', error);
    return {
      hasHardware: false,
      isEnrolled: false,
      supportedTypes: [],
      isAvailable: false,
      error: error.message,
    };
  }
}