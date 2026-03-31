import { Button, ScrollView, StyleSheet, TouchableOpacity, Text, TextInput, useColorScheme, View, SafeAreaView, Image, Alert} from 'react-native';
import { useFonts } from'expo-font';

import React, { useState } from 'react';
import { useStrava } from '@/context/StravaContext';
import { useMystLoc } from '@/context/MystLocContext';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

// auth code: 51ddb1cd07ff831802f44d705754b709aa13e1c5
// client id: 205554
//https://www.strava.com/oauth/token?client_id=205554&client_secret=cb6edc6c9b489dc707db3106474c6a08b2ac52ff&code=51ddb1cd07ff831802f44d705754b709aa13e1c5&grant_type=authorization_code
//https://www.strava.com/oauth/token?client_id=205554&client_secret=cb6edc6c9b489dc707db3106474c6a08b2ac52ff&code=51ddb1cd07ff831802f44d705754b709aa13e1c5&grant_type=authorization_code
export default function SettingsScreen() {
  // Style
  const pqLogoSrc = require('@/assets/images/PQ-white.png');
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

  const {athlete, logout} = useStrava();
  const {resetProgress} = useMystLoc();

  const resetAlert = () => {
    Alert.alert(
      'Are you sure you want to erase all information?',
      'This will delete all activities, discoveries, and progress stored in PicQuest. Your profile will still be available.',
      [{text: 'Cancel'}, {text: 'Yes', onPress: () => resetProgress()}]
    );
  }


  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
        <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
          <Text style={[styles.head, {color: colors.text}]}>Settings</Text>
          <View style={[styles.stats, styles.row]}>
            <Image source={{ uri: athlete?.profile}} style={styles.image}></Image> 
            <View style={[{display: 'flex', justifyContent:'center'}]}>
              <Text style={[styles.h2, {color:colors.text}]}>{`${athlete?.firstname} ${athlete?.lastname}`}</Text>
              <Text style={{color:colors.text}}>Connected with your Strava account</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.button, {backgroundColor: 'gray'}]} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); resetAlert()}}><Text style={styles.buttonText}>Reset Progress</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); logout()}}><Text style={styles.buttonText}>Sign Out</Text></TouchableOpacity>
        </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    width: '100%',
    margin: 10,
    backgroundColor: 'rgba(80, 119, 142, 1)',
    borderRadius: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
  },
  body: {
    flexDirection: 'column',
    fontFamily: 'Radio Canada Big',
    margin: 20,
    gap: 5,
    alignItems: 'center'
  },
  row: {
    flexDirection: 'row',
    margin: 10,
    gap: 10,
    width: '100%',
  },
  head: {
    fontSize: 30,
    fontWeight: 600,
    fontFamily: 'Radio Canada Big',
    textAlign: 'center'
  },
  h2: {
    fontSize: 20,
  },
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    width: 200
  },
  stats: {
    backgroundColor: '#3A3A3A',
    width: '100%',
    padding: 20,
    gap: 5,
    borderRadius: 50,
    paddingLeft: 20,
    paddingRight: 30,
  },
  halfbox: {
    backgroundColor: 'gray',
    flex: 1,
    height: 200,
    borderRadius: 30,
  }
});
