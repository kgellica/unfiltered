import { useEffect, useCallback, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

function reverseClientIdScheme(clientId) {
  if (!clientId) return null;
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/, '');
  return `com.googleusercontent.apps.${prefix}`;
}

export function useGoogleAuth({ onSuccess, onError } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const clientId = WEB_CLIENT_ID;
  const customScheme = reverseClientIdScheme(clientId);

  // Generate valid redirect URL based on environment (Expo Go vs Standalone vs Web)
  const isExpoGo = Constants.appOwnership === 'expo';

  const redirectUri = AuthSession.makeRedirectUri({
    // In Expo Go, use default expo scheme; in standalone app, use Google reverse scheme
    scheme: isExpoGo ? 'unfiltered' : (customScheme || 'unfiltered'),
    path: 'oauthredirect',
    preferLocalhost: true,
  });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: clientId || '',
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
                code_verifier: request?.codeVerifier || '',
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
            ? ' Make sure this exact redirect URI is added under "Authorized redirect URIs" on the Web OAuth client in Google Cloud Console: ' + redirectUri
            : '';
        onError?.(new Error((response.error?.message || 'Google sign-in failed.') + hint));
      }
    })();
  }, [response]);

  const signIn = useCallback(() => {
    if (!clientId) {
      onError?.(new Error('Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env file.'));
      return;
    }
    promptAsync();
  }, [promptAsync, onError, clientId]);

  return { signIn, ready: !!request, submitting, redirectUri };
}