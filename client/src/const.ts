export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const getApiBaseUrl = () => {
  const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL as
    | string
    | undefined;
  const normalizedConfiguredBaseUrl = configuredBaseUrl?.trim().replace(/\/$/, "");

  if (normalizedConfiguredBaseUrl) {
    return normalizedConfiguredBaseUrl;
  }

  return window.location.origin;
};

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL;
  const appId = import.meta.env.VITE_APP_ID;
  const redirectUri = `${getApiBaseUrl()}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${oauthPortalUrl}/app-auth`);
  url.searchParams.set("appId", appId);
  url.searchParams.set("redirectUri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set("type", "signIn");

  return url.toString();
};
