import { Button, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';

import React, { useState } from 'react';

// auth code: 51ddb1cd07ff831802f44d705754b709aa13e1c5
// client id: 205554
//https://www.strava.com/oauth/token?client_id=205554&client_secret=cb6edc6c9b489dc707db3106474c6a08b2ac52ff&code=51ddb1cd07ff831802f44d705754b709aa13e1c5&grant_type=authorization_code
//https://www.strava.com/oauth/token?client_id=205554&client_secret=cb6edc6c9b489dc707db3106474c6a08b2ac52ff&code=51ddb1cd07ff831802f44d705754b709aa13e1c5&grant_type=authorization_code
export default function HomeScreen() {
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


  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
        <Text style={[styles.head, {color: colors.text}]}>Settings</Text>
        <Text style={{color:colors.text}}>Please sign in with your Strava Account.</Text>
        <View style={styles.stats}></View>
        <View style={styles.row}>
          <View style={styles.halfbox}>
          </View>
          <View style={styles.halfbox}>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 200,
    height: 200,
    borderRadius: 100,
    margin: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  body: {
    flexDirection: 'column',
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
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    width: 200
  },
  stats: {
    backgroundColor: 'gray',
    width: '100%',
    height: 200,
    borderRadius: 30
  },
  halfbox: {
    backgroundColor: 'gray',
    flex: 1,
    height: 200,
    borderRadius: 30,
  }
});
