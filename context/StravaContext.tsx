import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState } from 'react';

const StravaContext = createContext({
  athlete: null,
  authenticated: false,
  fetchFromStrava: async () => null,
  request: null,
  promptAsync: async () => null,
});

// Strava authorization
WebBrowser.maybeCompleteAuthSession();

const CLIENT_ID = '207104';
const CLIENT_SECRET = '0d24a6cd22aef5056cb05e553ef94f1c5ee43401';

const discovery = {
  authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
};

export function StravaProvider({ children }) {
  const [athlete, setAthlete] = useState(null);
  const [authenticated, setAuthentication] = useState(false);

  const loadAthlete = async () => {
    const profile = await fetchFromStrava('/athlete');
    setAthlete(profile);
  }

  useEffect(() => {
  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync('strava_access_token');
    if (token) {
      setAuthentication(true);
      await loadAthlete();
    }
  };

  checkAuth();
}, []);


  // Authorization Setup
  const redirectUri = AuthSession.makeRedirectUri({ scheme: 'picquest' });

  const [request, response, promptAsync] = AuthSession.useAuthRequest(
  {
    clientId: CLIENT_ID,
    redirectUri,
    responseType: 'code',
    extraParams: {
      scope: 'read,activity:read_all',
      approval_prompt: 'auto',
    },
  },
  discovery
);

  useEffect(() => {
  if (request) {
    console.log('Authorized.');
    // console.log(''Auth URL:', request.url');
  }
  }, [request]);

  useEffect(() => {
    console.log("FULL RESPONSE:", response);

    if (response?.type === 'success') {
      const { code } = response.params;
      exchangeCodeForToken(code);
    }
  }, [response]);

  const exchangeCodeForToken = async (code) => {
    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
      }),
    });

    const data = await res.json();
    console.log('Token exchange response:', data);

    if (!data.access_token) {
      console.log('Token exchange failed');
      return;
    }

    // Store tokens securely
    await SecureStore.setItemAsync('strava_access_token', data.access_token);
    await SecureStore.setItemAsync('strava_refresh_token', data.refresh_token);
    await SecureStore.setItemAsync('strava_token_expiry', String(data.expires_at));

    setAuthentication(true);
    await loadAthlete();
  };


  // Handle Token Refresh
  const refreshAccessToken = async () => {
    const refreshToken = await SecureStore.getItemAsync('strava_refresh_token');

    const res = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await res.json();
    await SecureStore.setItemAsync('strava_access_token', data.access_token);
    await SecureStore.setItemAsync('strava_token_expiry', String(data.expires_at));

    return data.access_token;
  };

  const getValidToken = async () => {
    const expiry = await SecureStore.getItemAsync('strava_token_expiry');
    if (!expiry) return null;

    const now = Math.floor(Date.now() / 1000);

    if (now >= Number(expiry) - 300) { // refresh 5 min early
      return await refreshAccessToken();
    }

    return await SecureStore.getItemAsync('strava_access_token');
  };

  const fetchFromStrava = async (endpoint) => {
    const token = await getValidToken();

    if (!token) return null;

    const res = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return res.json();
  };

  // didn't include log out or in stuff?

  return (
    <StravaContext.Provider value={{
      athlete,
      authenticated,
      fetchFromStrava,
      request,
      promptAsync,
    }}>{children}
    </StravaContext.Provider>
  );
}

// // API Calls
// const getAthleteActivities = async () => {
//   const token = await getValidToken();

//   const res = await fetch('https://www.strava.com/api/v3/athlete/activities', {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   return res.json();
// };

export function useStrava() {
  return useContext(StravaContext);
}