import { Button, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';
import React, { useState, useEffect } from 'react';
import { StravaProvider, useStrava } from '@/.expo/context/StravaContext';

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

  const {athlete, authenticated, fetchFromStrava, request, promptAsync} = useStrava();

  const [stats, setStats] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      const stats = await fetchFromStrava(`/athletes/${athlete?.id}/stats`);
      setStats(stats);
    };

    if (athlete?.id) {
      loadStats();
    }
  }, [athlete]);

  function meterToMile(meters) {
    return (meters/1609).toFixed(2);
  }

  function secsToMin(secs) {
    return (secs/60).toFixed(0);
  }

  // function getArrowString() {
  //   let res = "";
  //   let distTrend = stats?.recent_run_totals?.distance.compareTo(stats?.recent_run_totals?.distance;
  //   if ())
  // }

  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
        {authenticated? 
          <ScrollView contentContainerStyle={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
            <Text style={[styles.head, {color: colors.text}]}>Welcome Back, {athlete?.firstname}</Text> 
            <Image source={{ uri: 'https://media.istockphoto.com/id/1840438197/vector/vector-cute-kawaii-pastel-cloud-flat-cartoon-background.jpg?s=612x612&w=0&k=20&c=mf_mIFgxbniVbMtLmey29e1w4SeianYh-rWnnjWVjyE='}} style={styles.image}></Image>
            <View style={styles.stats}>
              <Text style={[styles.sectHead, {color: colors.text}]}>THIS WEEK:</Text>
              <View style={styles.row}>
                <Text style={[styles.sectBody]}>{"MILEAGE\nACTIVE TIME\nOBJECTS COLLECTED"}</Text>
                <Text style={[styles.sectBody, {textAlign: 'right', flex: 1}]}>{`${meterToMile(stats?.recent_run_totals?.distance)} MI\n${secsToMin(stats?.recent_run_totals?.elapsed_time)} MIN\n 10`}</Text>
                <Text style={[styles.sectBody, {color: colors.text}]}>{`↗\n→\n↘`}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <View style={styles.halfbox}>
                <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>COLLECTION</Text>
              </View>
              <View style={styles.halfbox}>
                <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>MY MAP</Text>
              </View>
            </View>
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
  image: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  button: {
    width: '100%',
    margin: 10
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
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    width: 200
  },
  stats: {
    backgroundColor: '#3A3A3A',
    width: '100%',
    borderRadius: 30,
    padding: 20,
  },
  sectHead: {
    fontSize: 16,
    lineHeight: 33,
  },
  sectBody: {
    color: '#BEBEBE',
    fontSize: 16,
    lineHeight: 25,
  },
  halfbox: {
    backgroundColor: '#3A3A3A',
    flex: 1,
    height: 200,
    borderRadius: 30,
    padding: 20,
  }
});
