import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Button, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { useStrava } from '@/.expo/context/StravaContext';

import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';


// // Strava authorization
// WebBrowser.maybeCompleteAuthSession();

// const CLIENT_ID = '207104';
// const CLIENT_SECRET = '0d24a6cd22aef5056cb05e553ef94f1c5ee43401';

// const discovery = {
//   authorizationEndpoint: 'https://www.strava.com/oauth/mobile/authorize',
//   tokenEndpoint: 'https://www.strava.com/oauth/token',
// };

// // OAuth Setup
// export function useStravaAuth() {
//   const redirectUri = AuthSession.makeRedirectUri({ scheme: 'picquest' });

//   const [request, response, promptAsync] = AuthSession.useAuthRequest(
//     {
//       clientId: CLIENT_ID,
//       scopes: ['read'],
//       redirectUri,
//       responseType: 'code',
//     },
//     discovery
//   );

//   useEffect(() => {
//   if (request) {
//     console.log('Auth URL:', request.url);
//   }
//   }, [request]);

//   useEffect(() => {
//     if (response?.type === 'success') {
//       const { code } = response.params;
//       exchangeCodeForToken(code);
//     }
//   }, [response]);

//   const exchangeCodeForToken = async (code) => {
//     const res = await fetch('https://www.strava.com/oauth/token', {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify({
//         client_id: CLIENT_ID,
//         client_secret: CLIENT_SECRET,
//         code,
//         grant_type: 'authorization_code',
//       }),
//     });

//     const data = await res.json();

//     // Store tokens securely
//     await SecureStore.setItem('strava_access_token', data.access_token);
//     await SecureStore.setItem('strava_refresh_token', data.refresh_token);
//     await SecureStore.setItem('strava_token_expiry', String(data.expires_at));
//   };

//   return { request, promptAsync };
// }

// // Token Refresh
// const refreshAccessToken = async () => {
//   const refreshToken = await SecureStore.getItem('strava_refresh_token');

//   const res = await fetch('https://www.strava.com/oauth/token', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({
//       client_id: CLIENT_ID,
//       client_secret: CLIENT_SECRET,
//       refresh_token: refreshToken,
//       grant_type: 'refresh_token',
//     }),
//   });

//   const data = await res.json();
//   await SecureStore.setItem('strava_access_token', data.access_token);
//   await SecureStore.setItem('strava_token_expiry', String(data.expires_at));

//   return data.access_token;
// };

// const getValidToken = async () => {
//   const expiry = await SecureStore.getItem('strava_token_expiry');
//   const now = Math.floor(Date.now() / 1000);

//   if (now >= Number(expiry) - 300) { // refresh 5 min early
//     return await refreshAccessToken();
//   }

//   return await SecureStore.getItem('strava_access_token');
// };

// // API Calls
// const getAthleteActivities = async () => {
//   const token = await getValidToken();

//   const res = await fetch('https://www.strava.com/api/v3/athlete/activities', {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   return res.json();
// };

// const fetchFromStrava = async (endpoint: any) => {
//   const token = await getValidToken();

//   const res = await fetch(`https://www.strava.com/api/v3${endpoint}`, {
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   return res.json();
// };


export default function TabTwoScreen() {

  // Style Settings
  const [fontsLoaded] = useFonts({
    'Radio Canada Big':require('../../assets/fonts/Radio_Canada_Big/RadioCanadaBig.ttf')
  });

  const lightColors = {
    background: 'white',
    text: 'black'
  }

  const darkColors = {
    background: '#2C2C2C',
    text: 'white'
  }
  const colorScheme = useColorScheme();
  const colors = colorScheme == 'dark' ? darkColors : lightColors;

  const {athlete, authenticated, fetchFromStrava, request, promptAsync} = useStrava();

    const [activities, setActivities] = useState([]);
  
    useEffect(() => {
      const loadActivities = async () => {
        const acts = await fetchFromStrava(`/athletes/${athlete?.id}/activities`);
        setActivities(acts);
      };
  
      if (athlete?.id) {
        loadActivities();
      }
    }, [athlete]);

  // user data
  // const [name, setName] = useState();
  // useEffect(() => {
  //   const load = async () => {
  //     const profile = await fetchFromStrava('/athlete');
  //     setName(profile.firstname);
  //   };
  //   load();
  // }, []);

  // Map Stuff
  const [status, setStatus] = useState("none");
  const [latInp, setLatInp] = useState("none");
  const [lonInp, setLonInp] = useState("none");
  let currentFile;

  const updLat = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setLatInp(event.target.value);
  }

  const updLon = (event: { target: { value: React.SetStateAction<string>; }; }) => {
    setLonInp(event.target.value);
  }

    // API Req
    //const {request, promptAsync} = useStravaAuth();
  
    // const selectFile = async () => {
    //   // const {status} = await MediaLibrary.requestPermissionsAsync();

    //   // if (status == 'granted') {
    //     currentFile = await DocumentPicker.getDocumentAsync({
    //     type: "/*/",
    //   });
  
    //   if (!currentFile.canceled) {
    //     setStatus(currentFile.assets[0].name);
    //   }
    //   // }

    // }
  
  
  
    return (
      <SafeAreaView style={[{backgroundColor: colors.background}]}>
          {authenticated?
            <ScrollView contentContainerStyle={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
              <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Upload Activity</Text>
              <View style={styles.mapPreview}>
              </View>
              <Text style={[styles.textStyle, {color: colors.text}]}>{athlete.firstname} connected via Strava.</Text>
          </ScrollView>
          :
          <ScrollView contentContainerStyle={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
            <Text style={[styles.head, {color: colors.text}]}>Welcome to PicQuest!</Text> 
            <Text style={[styles.body, {color: colors.text}]}>Please log in to your Strava account to begin.</Text>
            <View style={styles.button}><Button disabled={!request} onPress={() => promptAsync()} title="Connect Strava"/></View>
          </ScrollView>

          }
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'column',
    margin: 20,
    fontFamily: 'Radio Canada Big',
    alignItems: 'center',
  },
  mapPreview: {
    width: '90%',
    height: 250,
    borderStyle: 'dashed',
    borderColor: '#7a7a7a',
    borderRadius: 30,
    borderWidth: 1,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: {
    fontSize: 30,
    fontFamily: 'Radio Canada Big',
    fontWeight: 600,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    margin: 10
  },
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    width: 200
  },
  textStyle: {
    fontFamily: 'Radio Canada Big',
  }
})
