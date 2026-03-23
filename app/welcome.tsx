import React from 'react';
import { TouchableOpacity, StyleSheet, Text, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';

import { useStrava } from '@/context/StravaContext';

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
        'Radio Canada Big':require('../assets/fonts/Radio_Canada_Big/RadioCanadaBig.ttf')
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

  const {request, promptAsync} = useStrava();

  const pqLogoSrc = require('@/assets/images/PQ-white.png');
  const v1Src = require('@/assets/images/welcome-1.png');
  const v2Src = require('@/assets/images/welcome-2.png');

  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
        <Image style={[{position: 'absolute', flex: 1}]} source={v1Src}></Image>
        <Image style={[{position: 'absolute', flex: 1}]} source={v2Src}></Image>
        <View style={[styles.body, {height: '100%'}]}>
            <View style={[{height: 70}]}></View>
            <Image style={[{width: '100%', height: 220, resizeMode: 'contain',}]} source={pqLogoSrc}></Image>
            <Text style={[styles.head, {color: colors.text}]}>Welcome to PicQuest</Text> 
            <Text style={[styles.body, {color: colors.text}]}>Please log in to your Strava account to begin.</Text> 
            <View style={styles.spacer}></View>
            <TouchableOpacity onPress={() => {if (!request) {console.log("Request not ready yet");return;}
  promptAsync();
}} style={styles.button}><Text style={styles.buttonText}>CONNECT STRAVA</Text></TouchableOpacity>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)', // semi-transparent black
  },
  spacer: {
    height: 40,
  },
  button: {
    width: '100%',
    margin: 10,
    backgroundColor: 'rgba(80, 119, 142, 0)',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    flexDirection: 'column',
    fontFamily: 'Radio Canada Big',
    margin: 20,
    gap: 15,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  head: {
    fontSize: 30,
    fontWeight: 600,
    fontFamily: 'Radio Canada Big',
    textAlign: 'center'
  },
});
