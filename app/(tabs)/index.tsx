import { Button, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';

import React, { useState } from 'react';



export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
        'Radio Canada Big':require('../../assets/fonts/Radio_Canada_Big/RadioCanadaBig.ttf')
  });

  const lightColors = {
    background: 'white',
    text: 'black'
  }

  const darkColors = {
    background: 'black',
    text: 'white'
  }
  const colorScheme = useColorScheme();
  const colors = colorScheme == 'dark' ? darkColors : lightColors;


  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
      <ScrollView contentContainerStyle={[styles.body, {backgroundColor: colors.background}]}>
        <Text style={[styles.head, {color: colors.text}]}>Welcome Back, Noah</Text>
        <Image source={{ uri: 'https://media.istockphoto.com/id/1840438197/vector/vector-cute-kawaii-pastel-cloud-flat-cartoon-background.jpg?s=612x612&w=0&k=20&c=mf_mIFgxbniVbMtLmey29e1w4SeianYh-rWnnjWVjyE='}} style={styles.image}></Image>
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
