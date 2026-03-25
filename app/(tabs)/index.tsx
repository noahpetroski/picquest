import { Button, FlatList, ScrollView, TouchableOpacity, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';
import React, { useState, useEffect, act } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Redirect } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { mysteryLocations, checkInRadius, getNewLocs, addLocation, useMystLoc } from '@/context/MystLocContext';

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

  const {athlete, authenticated, fetchFromStrava} = useStrava();

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

  function getTrend(stat) {
    let curr = 1/ stats?.recent_run_totals?.count;
    let last = 1/ stats?.recent_run_totals?.count;
    let change;
    if (stat == 'mile') {
      curr *= stats?.recent_run_totals?.distance;
      last *= stats?.ytd_run_totals?.distance;
    } else if (stat == 'time') {
      curr *= stats?.recent_run_totals?.elapsed_time;
      last *= stats?.ytd_run_totals?.elapsed_time;
    } else { // switch to objs when i implement them
      curr *= stats?.recent_run_totals?.achievement_count;
      last *= stats?.ytd_run_totals?.achievement_count;
    }
    let trend = curr-last;
    let ret = "";
    if (trend > 0) {
      change = 'green';
      ret = `↗`;
    } else if (trend < 0) {
      change = 'red';
      ret =`↘`;
    } else {
      change = 'white';
      ret = `→`;
    }
    if (stat == 'mile') {
      return [change, ret];
    } else if (stat == "time") {
      return [change, ret];
    } else {
      return [change, ret];
    }
  }

  const getColor = (stat) => {
    let res = getTrend(stat);
    return res[0];
  }

  function getArrow(stat) {
    let res = getTrend(stat);
    return res[1];
  }

  if (!authenticated) {
    return <Redirect href="/welcome" />;
  }

  const {mysteryLocations, checkInRadius, newLocs, addLocation} = useMystLoc();

  const activityComp = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);}} style={[styles.stats, {marginBottom: 10}]}>
          <View>
            <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
            </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  return (
    <SafeAreaView style={[{backgroundColor: colors.background}]}>
      <ScrollView showsVerticalScrollIndicator={false}>
          <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
            <Text style={[styles.head, {color: colors.text}]}>Welcome Back, {athlete?.firstname}</Text> 
            <Image source={{ uri: athlete?.profile}} style={styles.image}></Image>
            <View style={styles.stats}>
              <Text style={[styles.sectHead, {color: colors.text}]}>THIS WEEK:</Text>
              <View style={styles.row}>
                <Text style={[styles.sectBody]}>{"MILEAGE\nACTIVE TIME\nOBJECTS COLLECTED"}</Text>
                <Text style={[styles.sectBody, {textAlign: 'right', flex: 1, color: colors.text}]}>{`${meterToMile(stats?.recent_run_totals?.distance)} MI\n${secsToMin(stats?.recent_run_totals?.elapsed_time)} MIN\n 10`}</Text>
                <View>
                  <Text style={[styles.sectBody, {color: getColor('mile')}]}>{getArrow('mile')}</Text>
                  <Text style={[styles.sectBody, {color: getColor('time')}]}>{getArrow('time')}</Text>
                  <Text style={[styles.sectBody, {color: getColor('obj')}]}>{getArrow('obj')}</Text>
                </View>
              </View>
            </View>
            <View style={styles.row}>
              <TouchableOpacity style={styles.halfbox} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)}}>
                <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>COLLECTION</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.halfbox} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft)}}>
                <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>MY MAP</Text>
              </TouchableOpacity>
            </View>
            <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
              <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={newLocs} renderItem={activityComp} keyExtractor={item => item.id} />
            </View>
            <Text></Text>
            <View style={styles.tabBarSpacer}>
            </View>
          </Animated.View>
        </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  tabBarSpacer : {
    height: 10,
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
