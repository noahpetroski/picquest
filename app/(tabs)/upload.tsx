import { Button, Platform, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView } from 'react-native';
import { useFonts } from'expo-font';
import { AppleMaps, GoogleMaps } from 'expo-maps';
import React, { useState } from 'react';
import * as MediaLibrary from 'expo-media-library';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { File, Paths } from 'expo-file-system';
import { DOMParser } from 'xmldom';
import * as WebBrowser from 'expo-web-browser';


export default function TabTwoScreen() {
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
  
    const [status, setStatus] = useState("none");
    const [latInp, setLatInp] = useState("none");
    const [lonInp, setLonInp] = useState("none");
    let currentFile;
  
    const updLat = (event) => {
      setLatInp(event.target.value);
    }
  
    const updLon = (event) => {
      setLonInp(event.target.value);
    }
  
    const selectFile = async () => {
      // const {status} = await MediaLibrary.requestPermissionsAsync();

      // if (status == 'granted') {
        currentFile = await DocumentPicker.getDocumentAsync({
        type: "/*/",
      });
  
      if (!currentFile.canceled) {
        setStatus(currentFile.assets[0].name);
      }
      // }

    }
  
  
    return (
      <SafeAreaView style={[{backgroundColor: colors.background}]}>
          <ScrollView contentContainerStyle={[styles.body, {backgroundColor: colors.background}]}>
            <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Upload Activity</Text>
            <View style={styles.mapPreview}>
            </View>
            <View style={styles.button}><Button onPress={selectFile} title="Select a file to upload"/></View>
            <TextInput style={[styles.textBox, {color: colors.text}]} keyboardType='decimal-pad' onChange={updLat} placeholder="Latitude Coordinate"/>
            <TextInput style={[styles.textBox, {color: colors.text}]} keyboardType='decimal-pad' onChange={updLon} placeholder="Longitude Coordinate"/>
            <Text style={[styles.textStyle, {color: colors.text}]}>current file: {status}</Text>
            <Text style={[styles.textStyle, {color: colors.text}]}>Checking with ({latInp}, {lonInp})</Text>
            <View style={styles.button}><Button title="SUBMIT"/></View>
        </ScrollView>
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
