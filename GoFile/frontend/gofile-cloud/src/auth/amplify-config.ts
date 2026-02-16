import { Amplify } from '@aws-amplify/core';

const region = import.meta.env.VITE_AWS_REGION || 'ap-south-1';
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const userPoolWebClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const oauthDomain = import.meta.env.VITE_COGNITO_DOMAIN;
// Default redirects to the current origin (works for different dev ports like 8080)
const defaultRedirect = typeof window !== 'undefined' ? `${window.location.origin}/auth` : 'http://localhost:8080/auth';
const redirectSignIn = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_IN || defaultRedirect;
const redirectSignOut = import.meta.env.VITE_COGNITO_REDIRECT_SIGN_OUT || defaultRedirect;

// If the env provides only the domain prefix (e.g. "gofile-dev-auth-domain"),
// build the full hosted UI domain expected by Cognito.
const oauthFullDomain = oauthDomain
  ? oauthDomain.includes('.amazoncognito.com')
    ? oauthDomain
    : `${oauthDomain}.auth.${region}.amazoncognito.com`
  : undefined;

// Build a defensive loginWith object so Amplify internals can safely read it
const loginWith: any = {
  // We're OAuth-first: disable username login by default to avoid accidental password flows
  username: false,
  email: true,
  phone: false,
};

// Base Auth config (OAuth will be attached at Auth.oauth)
const authConfig: any = {
  userPoolId,
  // userPoolClientId is required by Auth internals for OAuth flows
  userPoolClientId: userPoolWebClientId,
  // keep the legacy key too
  userPoolWebClientId: userPoolWebClientId,
  region,
  // Attach the safe loginWith object so code that reads loginWith won't crash
  loginWith,
};

if (oauthFullDomain) {
  // Attach OAuth config both under oauth (required) and make sure loginWith.oauth exists
  const oauthConfig = {
    domain: oauthFullDomain,
    // Amplify expects arrays of redirect URLs for OAuth flows
    redirectSignIn: Array.isArray(redirectSignIn) ? redirectSignIn : [redirectSignIn],
    redirectSignOut: Array.isArray(redirectSignOut) ? redirectSignOut : [redirectSignOut],
    responseType: 'code',
    scopes: ['openid', 'profile', 'email'],
  };

  authConfig.oauth = oauthConfig;
  // Ensure loginWith.oauth is present for any internal checks
  loginWith.oauth = oauthConfig;
}

// Some Amplify internals (and older usage patterns) expect a nested `Auth.Cognito` object
// that contains the Cognito-specific config (including loginWith). Provide a minimal
// `Cognito` object here to remain compatible.
(authConfig as any).Cognito = {
  userPoolId,
  userPoolClientId: userPoolWebClientId,
  userPoolWebClientId,
  loginWith,
  // Mirror oauth under Cognito for compatibility too (if present)
  ...(authConfig.oauth ? { oauth: authConfig.oauth } : {}),
};

// Configure Amplify with the Auth settings using the composed `authConfig`
// (this ensures region, user pool IDs, client IDs and OAuth config are all consistent)
// Add a debug log in development so we can inspect the final Auth config used by Amplify
if (import.meta.env.DEV) {
  // eslint-disable-next-line no-console
  console.debug('[Auth config]', JSON.parse(JSON.stringify(authConfig)));
}
Amplify.configure({ Auth: authConfig });

export default Amplify;
