import { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// IMPORTANT — why this file changed:
// The old implementation used ResponseType.Token (implicit flow) against
// EXPO_PUBLIC_GOOGLE_CLIENT_ID, which is a "Web application" OAuth client
// (the same one unfiltered-web uses with Google Identity Services). Web
// application clients only allow http(s):// redirect origins — they do NOT
// accept the app's custom-scheme redirect (unfiltered://...). Google rejects
// that combination up front with "Access blocked" / Error 400: invalid_request,
// which is exactly the reported bug.
//
// Fix: use separate native OAuth clients (type "iOS" / "Android" in Google
// Cloud Console, one per platform, no client secret) with the Authorization
// Code + PKCE flow. Native clients are allowed to redirect to the app's
// custom scheme. See unfiltered-mobile/README section on Google Sign-In.
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

function getClientId() {
  const shared = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  if (Platform.OS === 'ios') return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || shared;
  if (Platform.OS === 'android') return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || shared;
  // Web/dev fallback (Expo web build) can keep using the web client.
  return shared;
}

// Reusable Google sign-in hook. Runs the Authorization Code + PKCE flow,
// exchanges the code for Google tokens on-device, then hands the resulting
// Google access token to AuthContext.loginWithGoogle, which forwards it to
// the backend (POST /auth/google -> Socialite::userFromToken). Backend
// contract is unchanged: it still expects a Google *access_token*.
export function useGoogleAuth({ onSuccess, onError } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const clientId = getClientId();

  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'unfiltered', path: 'redirect' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId,
      scopes: ['openid', 'profile', 'email'],
      redirectUri,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
    },
    discovery
  );

  useEffect(() => {
    (async () => {
      if (response?.type === 'success' && response.params?.code) {
        setSubmitting(true);
        try {
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId,
              code: response.params.code,
              redirectUri,
              extraParams: {
                code_verifier: request?.codeVerifier,
              },
            },
            discovery
          );
          const accessToken = tokenResult.accessToken;
          if (!accessToken) throw new Error('No access token returned by Google.');
          await onSuccess?.(accessToken);
        } catch (e) {
          onError?.(e);
        } finally {
          setSubmitting(false);
        }
      } else if (response?.type === 'error') {
        const code = response.error?.code || response.params?.error;
        const hint =
          code === 'invalid_request' || code === 'access_denied'
            ? ' Your Google OAuth client is probably set up as a "Web application" client — native apps need a separate iOS/Android OAuth client (no secret) in Google Cloud Console for this redirect to be accepted.'
            : '';
        onError?.(new Error((response.error?.message || 'Google sign-in failed.') + hint));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = useCallback(() => {
    if (!clientId) {
      onError?.(new Error('Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env — add your Google OAuth client ID.'));
      return;
    }
    promptAsync();
  }, [promptAsync, onError, clientId]);

  return { signIn, ready: !!request, submitting };
}