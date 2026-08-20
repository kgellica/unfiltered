import { useEffect, useCallback, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};

// IMPORTANT — why this file changed (again):
// The previous version used the per-platform "iOS" / "Android" OAuth
// client types with a plain custom-scheme redirect (unfiltered://redirect).
// That combination is what Google's server is rejecting with:
//   "Access blocked: Authorization Error — this app doesn't comply with
//    Google's OAuth 2.0 policy for keeping apps secure"
// Reason: "iOS" / "Android" client types in Google Cloud Console don't
// have a redirect-URI field at all — they authenticate the calling app by
// bundle ID / package name + SHA-1 fingerprint, not by whatever redirect_uri
// the app happens to send. Sending an arbitrary custom scheme (unfiltered://)
// to that client type is exactly the "app not verified for this redirect"
// case the policy blocks.
//
// Fix: use the single "Web application" OAuth client
// (EXPO_PUBLIC_GOOGLE_CLIENT_ID) for the Authorization Code + PKCE flow,
// and redirect to Google's reserved reverse-domain scheme derived from
// that client ID:
//   com.googleusercontent.apps.<CLIENT_ID_PREFIX>:/oauthredirect
// This exact scheme is the one Google recognizes as a valid installed-app
// redirect for a Web client (see Google's "OAuth 2.0 for Mobile & Desktop
// Apps" guide) — it must ALSO be added to that Web client's "Authorized
// redirect URIs" list in Google Cloud Console, and to app.json's "scheme".
const WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;

// Client IDs look like "710551658590-xxxx.apps.googleusercontent.com" —
// the reverse-domain scheme uses everything before ".apps.googleusercontent.com".
function reverseClientIdScheme(clientId) {
  if (!clientId) return null;
  const prefix = clientId.replace(/\.apps\.googleusercontent\.com$/, '');
  return `com.googleusercontent.apps.${prefix}`;
}

// Reusable Google sign-in hook. Runs the Authorization Code + PKCE flow,
// exchanges the code for Google tokens on-device, then hands the resulting
// Google access token to AuthContext.loginWithGoogle, which forwards it to
// the backend (POST /auth/google -> Socialite::userFromToken). Backend
// contract is unchanged: it still expects a Google *access_token*.
export function useGoogleAuth({ onSuccess, onError } = {}) {
  const [submitting, setSubmitting] = useState(false);
  const clientId = WEB_CLIENT_ID;
  const scheme = reverseClientIdScheme(clientId);

  const redirectUri = scheme
    ? AuthSession.makeRedirectUri({ scheme, path: 'oauthredirect' })
    : undefined;

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
            ? ' Make sure this exact redirect URI is added under "Authorized redirect URIs" on the Web OAuth client in Google Cloud Console: ' + redirectUri
            : '';
        onError?.(new Error((response.error?.message || 'Google sign-in failed.') + hint));
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [response]);

  const signIn = useCallback(() => {
    if (!clientId) {
      onError?.(new Error('Missing EXPO_PUBLIC_GOOGLE_CLIENT_ID in .env — add your Web OAuth client ID.'));
      return;
    }
    promptAsync();
  }, [promptAsync, onError, clientId]);

  return { signIn, ready: !!request, submitting, redirectUri };
}