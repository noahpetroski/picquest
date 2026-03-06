import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { Button, Image, Pressable, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Text, FlatList, TextInput, useColorScheme, View } from 'react-native';
import { useStrava } from '@/.expo/context/StravaContext';

export default function TabTwoScreen() {

  // Style Settings
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

  const [selectedActivity, selectActivity] = useState(null);

  // Map Stuff
  const [status, setStatus] = useState("none");

  function meterToMile(meters) {
    return (meters/1609).toFixed(2);
  }

  const activityComp = ({ item }) => {
    return (
      <TouchableOpacity onPress={() => selectActivity(item)} style={[styles.stats, {marginBottom: 10}]}>
        <View>
          <Text style={[{color: colors.text}]}>{item.name}</Text>
          <Text style={[{color: colors.text}]}>{`${meterToMile(item.distance)} mi`}</Text>
          <Text style={[{color: colors.text}]}>{item.start_date}</Text>
          </View>
      </TouchableOpacity>
    )
  }
  
    return (
      <SafeAreaView style={[{backgroundColor: colors.background}]}>
          {authenticated?
            <View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
              {selectedActivity != null ?
                <View style={[{width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}]}>
                  <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Upload Activity</Text>
                  <View style={styles.mapPreview}>
                  </View>
                  <Text style={[styles.textStyle, {color: colors.text}]}>{selectedActivity?.name}</Text>
                  <TouchableOpacity onPress={() => selectActivity(null)} style={[styles.button]}>
                    <Text style={styles.buttonText}>Cancel Upload</Text>
                  </TouchableOpacity>
                </View>
                :
                <View style={[{width: '100%', gap: 10}]}>
                  <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Upload Activity</Text>
                  <Text style={[styles.textStyle, {color: colors.text}]}>Select one of your recent activities.</Text>
                  <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
                    <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={activities} renderItem={activityComp} keyExtractor={item => item.id} />
                  </View>
                </View>
              }
          </View>
          :
          <View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
            <View style={[{height: 70}]}></View>
            <Image style={[{width: '100%', height: 220, resizeMode: 'contain',}]} source={pqLogoSrc}></Image>
            <Text style={[styles.head, {color: colors.text}]}>Welcome to PicQuest!</Text> 
            <Text style={[styles.body, {color: colors.text}]}>Please log in to your Strava account to begin.</Text> 
            <TouchableOpacity onPress={() => promptAsync()} style={styles.button}><Text style={styles.buttonText}>CONNECT STRAVA</Text></TouchableOpacity>
          </View>

          }
      </SafeAreaView>
    );
}

const styles = StyleSheet.create({
  body: {
    flexDirection: 'column',
    margin: 20,
    gap: 15,
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
  stats: {
    backgroundColor: '#3A3A3A',
    width: '100%',
    borderRadius: 30,
    padding: 20,
  },
  head: {
    fontSize: 30,
    fontFamily: 'Radio Canada Big',
    fontWeight: 600,
    textAlign: 'center',
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
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    width: 200
  },
  textStyle: {
    fontFamily: 'Radio Canada Big',
  }
})
