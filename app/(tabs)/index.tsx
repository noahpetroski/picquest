import { Button, ScrollView, TouchableOpacity, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';
import React, { useState, useEffect, act } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Redirect } from 'expo-router';

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

  const pqLogoSrc = require('@/assets/images/PQ-white.png');
  const [mileTColor, setMTColor] = useState('white');
  const [activeTColor, setATColor] = useState('white');
  const [objTColor, setOTColor] = useState('white');

  function getTrend(stat) {
    let curr = 1/ stats?.recent_run_totals?.count;
    let last = 1/ stats?.recent_run_totals?.count;
    let change;
    if (stat == 'mile') {
      curr *= stats?.recent_run_totals?.distance;
      last *= stats?.ytd_run_totals?.distance;
      change = mileTColor;
    } else if (stat == 'time') {
      curr *= stats?.recent_run_totals?.elapsed_time;
      last *= stats?.ytd_run_totals?.elapsed_time;
      change = activeTColor;
    } else { // switch to objs when i implement them
      curr *= stats?.recent_run_totals?.achievement_count;
      last *= stats?.ytd_run_totals?.achievement_count;
      change = objTColor;
    }
    let trend = curr-last
    if (trend > 0) {
      change = 'green';
      return `↗`;
    } else if (trend < 0) {
      change = 'red';
      return `↘`;
    } else {
      change = 'white';
      return `→`;
    }
  }

  if (!authenticated) {
    return <Redirect href="/welcome" />;
  }

  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
          <View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]}>
            <Text style={[styles.head, {color: colors.text}]}>Welcome Back, {athlete?.firstname}</Text> 
            <Image source={{ uri: athlete?.profile}} style={styles.image}></Image>
            <View style={styles.stats}>
              <Text style={[styles.sectHead, {color: colors.text}]}>THIS WEEK:</Text>
              <View style={styles.row}>
                <Text style={[styles.sectBody]}>{"MILEAGE\nACTIVE TIME\nOBJECTS COLLECTED"}</Text>
                <Text style={[styles.sectBody, {textAlign: 'right', flex: 1, color: colors.text}]}>{`${meterToMile(stats?.recent_run_totals?.distance)} MI\n${secsToMin(stats?.recent_run_totals?.elapsed_time)} MIN\n 10`}</Text>
                <View>
                  <Text style={[styles.sectBody, {color: mileTColor}]}>{getTrend('mile')}</Text>
                  <Text style={[styles.sectBody, {color: activeTColor}]}>{getTrend('active')}</Text>
                  <Text style={[styles.sectBody, {color: objTColor}]}>{getTrend('obj')}</Text>
                </View>
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
          </View>
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
