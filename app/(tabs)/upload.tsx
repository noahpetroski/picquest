import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Text, FlatList, TextInput, useColorScheme, View } from 'react-native';
import { useStrava } from '@/context/StravaContext';
import { mysteryLocations, checkInRadius } from '@/context/MystLocContext';
import polyline from '@mapbox/polyline';
import MapView, { Polyline } from 'react-native-maps';
import Collapsible from 'react-native-collapsible';
import Animated, { FadeInDown, FadeIn, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

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


  // Use Strava API Context
  const {athlete, fetchFromStrava} = useStrava();

  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadActivities = async () => {
      // const acts = await fetchFromStrava(`athlete/activities`);
      const acts = await fetchFromStrava(`/athletes/${athlete?.id}/activities`);
      setActivities(acts);
    };

    if (athlete?.id) {
      loadActivities();
    }
  }, [athlete]);

  const [selectedActivity, selectActivity] = useState(null);
  const [currCoords, setCoords] = useState([]);
  
  const pickActivity= async (item) => {
    setCoords([]);
    selectActivity(item);
    const itemPolyline = item.map.summary_polyline;
    const decoded = polyline.decode(itemPolyline).map(([lat, lng]) => ({latitude: lat, longitude: lng,}));
    setCoords(decoded);
  };


  // Mystery Locations
  // const {mysteryLocations, checkInRadius} = useMystLoc();
  const [dropdownState, setDropdownState] = useState(false);


  //Animations
  


  // Map Stuff
  const [status, setStatus] = useState("none");

  function meterToMile(meters) {
    return (meters/1609).toFixed(2);
  }

  function convertDate(isoInput) {
    let date = new Date(isoInput);
    return date.toLocaleString();
  }

  function formatSeconds(secs) {
    let hours = Math.floor(secs/3600);
    let minutes = Math.floor((secs%3600)/60);
    let seconds = secs%60;

    return `${hours>0? String(hours).padStart(2, '0') + ':' : ''}${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  const activityComp = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); pickActivity(item)}} style={[styles.stats, {marginBottom: 10}]}>
          <View>
            <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
            <Text style={[{fontWeight: 300, color: colors.text}]}>{`${meterToMile(item.distance)} mi`}</Text>
            <Text style={[{fontWeight: 300, color: colors.text}]}>{convertDate(item.start_date)}</Text>
            </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }
  
    return (
      <SafeAreaView style={[{backgroundColor: colors.background}]}>
            <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
              {selectedActivity != null ?
                <Animated.View style={[{width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}]} entering={FadeIn.duration(1000)}>
                  <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Upload Activity</Text>
                  {currCoords.length != 0 ?
                    <MapView
                      style={styles.mapPreview}
                      region={currCoords.length > 0 ? {
                        latitude: currCoords[0].latitude,
                        longitude: currCoords[0].longitude,
                        latitudeDelta: 0.05,
                        longitudeDelta: 0.05,
                      } : undefined}> 
                      {currCoords.length > 0 && (
                      <Polyline
                        coordinates={currCoords} 
                        strokeColor="rgb(233, 192, 9)"
                        strokeWidth={3}
                      />
                    )}
                    </MapView>
                  :
                    <View style={styles.mapPreview}>
                      <Text style={[styles.textStyle, {color: colors.text}]}>No map preview available</Text>
                    </View>
                  }
                  <Text style={[styles.textStyle, {fontWeight: 600, fontSize: 20, color: colors.text}]}>{selectedActivity?.name}</Text>
                  <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 19, color: colors.text}]}>{`${meterToMile(selectedActivity.distance)} MI    |    ${formatSeconds(selectedActivity.elapsed_time)}    |    ${selectedActivity.total_elevation_gain} FT`}</Text>
                  <View style={[{width: '90%', backgroundColor: 'gray', opacity: 0.5, height: 1, marginTop: 10, marginBottom: 10}]}></View>
                  <TouchableOpacity onPress={() => setDropdownState(!dropdownState)} style={[styles.dropdownbtn]}>
                    <Text style={styles.buttonText}>Mystery Locations   ▼</Text>
                  </TouchableOpacity>
                  <Collapsible collapsed={dropdownState}>
                    <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 15, color: colors.text}]}>{`Lake Loop hit? ${checkInRadius(mysteryLocations[0], currCoords)}`}</Text>
                    <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 15, color: colors.text}]}>{`Kehoe hit? ${checkInRadius(mysteryLocations[1], currCoords)}`}</Text>
                  </Collapsible>
                  <TouchableOpacity onPress={() => selectActivity(null)} style={[styles.button]}>
                    <Text style={styles.buttonText}>Upload</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => selectActivity(null)} style={[styles.button, {backgroundColor: 'gray'}]}>
                    <Text style={styles.buttonText}>Cancel Upload</Text>
                  </TouchableOpacity>
                </Animated.View>
                :
                <View style={[{width: '100%', gap: 10}]}>
                  <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Upload Activity</Text>
                  <Text style={[styles.textStyle, {color: colors.text}]}>Select one of your recent activities.</Text>
                  <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
                    <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={activities} renderItem={activityComp} keyExtractor={item => item.id} />
                  </View>
                </View>
              }
          </Animated.View>
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
    width: '100%',
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
    backgroundColor: 'rgba(80, 119, 142, 1)',
    borderRadius: 10,
    padding: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 17,
  },
  dropdownbtn: {

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
