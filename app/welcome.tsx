import React, {useEffect} from 'react';
import { Animated, TouchableOpacity, StyleSheet, Text, useColorScheme, View, SafeAreaView, Image, useAnimatedValue} from 'react-native';
import { useFonts } from'expo-font';
import * as Haptics from 'expo-haptics';

import { useStrava } from '@/context/StravaContext';

export default function WelcomeScreen() {
  const [fontsLoaded] = useFonts({
        'Radio Canada Big':require('../assets/fonts/Radio_Canada_Big/RadioCanadaBig.ttf')
  });

  const lightColors = { background: '#e3e3e3', text: 'black', gray1: '#c2c2c2', gray2: '#787878', tealHighlight: "#67A09F", mapTeal: "#ffa304", contButton: "white"};
  const darkColors  = { background: '#2C2C2C', text: 'white', gray1: '#404040', gray2: '#898989', tealHighlight: "#7ACDCB", mapTeal: "#ffa304", contButton: "white"};
  const colorScheme = useColorScheme();
  const colors = colorScheme == 'dark' ? darkColors : lightColors;

  const {request, login} = useStrava();

  const pqLogoSrc = colorScheme == 'dark' ? require('@/assets/images/PQ-white.png') : require('@/assets/images/PQ-black.png');
  const v1Src = require('@/assets/images/welcome-1.png');
  const v2Src = require('@/assets/images/welcome-2.png');

  // Animation
  const fadeInAnim = useAnimatedValue(0);
  const floatInAnim = useAnimatedValue(20);
  const floatInAnimN = useAnimatedValue(-20);

  useEffect( () => {
    Animated.timing(fadeInAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [fadeInAnim]);

  useEffect( () => {
    Animated.timing(floatInAnim, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [floatInAnim]);

  useEffect( () => {
    Animated.timing(floatInAnimN, {
      toValue: 0,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  }, [floatInAnimN]);

  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
        <Animated.Image style={[{position: 'absolute', objectFit: 'contain', flex: 1,  maxWidth: '100%', maxHeight: '100%', top: 230, left: 0, opacity: fadeInAnim, transform: [{translateX: floatInAnimN}, {translateY: floatInAnim}]}]} source={v1Src} />
        <Animated.Image style={[{position: 'absolute', objectFit: 'contain', flex: 1, maxWidth: '100%', maxHeight: '100%', top: 260, right: 0, opacity: fadeInAnim, transform: [{translateX: floatInAnim}, {translateY: floatInAnim}]}]} source={v2Src} />

        <View style={[styles.body, {height: '100%'}]}>
            <View style={[{height: 70}]}></View>
            <Animated.Image style={[{width: '100%', height: 220, resizeMode: 'contain', opacity: fadeInAnim, transform: [{translateY: floatInAnim}]}]} source={pqLogoSrc} />
            <Animated.View style={[{opacity:fadeInAnim, transform: [{translateY: floatInAnim}]}]}>
              <Text style={[styles.head, {color: colors.text}]}>Welcome to PicQuest</Text> 
            </Animated.View>
            {/* <Text style={[styles.body, {color: colors.text}]}>Please log in to your Strava account to begin.</Text>  */}
            <View style={styles.spacer}></View>
            <Animated.View style={[{width: '100%', opacity:fadeInAnim, transform: [{translateY: floatInAnim}]}]}>
              <TouchableOpacity onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  if (!request) 
                    {console.log("Request not ready yet"); return;}
                    login(); }} style={styles.button}><Text style={styles.buttonText}>LOGIN WITH STRAVA</Text></TouchableOpacity>
            </Animated.View>
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
    height: 200,
  },
  button: {
    width: '100%',
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(80, 119, 142, 0)',
    borderWidth: 3,
    borderColor: 'white',
    borderRadius: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    textShadowColor: ' rgba(0, 0, 0, 0.1)',
    textShadowOffset: { width: 2, height: 2},
    textShadowRadius: 5,
    textAlign: 'center',
    fontSize: 20,
    fontFamily: 'Radio Canada Big',
    fontWeight: 600,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    flexDirection: 'column',
    fontFamily: 'Radio Canada Big',
    margin: 20,
    gap: 8,
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
