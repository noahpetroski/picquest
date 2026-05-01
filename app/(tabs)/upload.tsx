<<<<<<< Updated upstream
import { useFonts } from 'expo-font';
import React, { useEffect, useState } from 'react';
import { SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Text, FlatList, TextInput, useColorScheme, View } from 'react-native';
import { useStrava } from '@/context/StravaContext';
=======
import { IconSymbol } from '@/components/ui/icon-symbol';
>>>>>>> Stashed changes
import { useMystLoc } from '@/context/MystLocContext';
import { useStrava } from '@/context/StravaContext';
import polyline from '@mapbox/polyline';
<<<<<<< Updated upstream
import MapView, { Polyline } from 'react-native-maps';
import Collapsible from 'react-native-collapsible';
import Animated, { FadeInDown, FadeIn, FadeInUp } from 'react-native-reanimated';
=======
import { useFonts } from 'expo-font';
>>>>>>> Stashed changes
import * as Haptics from 'expo-haptics';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import Animated, { FadeIn, FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

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
  const {athlete, fetchFromStrava, sendPQ} = useStrava();

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
  const [foundSpots, setFoundSpots] = useState([]);
  const [showMysterySpot, setShowMysterySpot] = useState(false);
  
  const pickActivity= async (item) => {
    setCoords([]);
    selectActivity(item);
    const itemPolyline = item.map.summary_polyline;
    const decoded = polyline.decode(itemPolyline).map(([lat, lng]) => ({latitude: lat, longitude: lng,}));
    setCoords(decoded);
    // setFoundSpots(checkInRadius(currCoords));
    setFoundSpots(checkInRadius(decoded));
<<<<<<< Updated upstream
    console.log(foundSpots);
=======
    setShowMysterySpot(false);
>>>>>>> Stashed changes
  };


  // Mystery Locations
  const {mysteryLocations, checkInRadius, newLocs, addLocation, addActivity} = useMystLoc();
  const [dropdownState, setDropdownState] = useState(false);


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

  function retSpotNames(list) {
    let result = "";
    for (let i = 0; i < list.length; i++) {
      if (result != "") {
        result+=", ";
      }
      result+=list[i].name;
    }
    return result;
  }

<<<<<<< Updated upstream
=======
  // Animation
  const fadeInAnim = useSharedValue(0);
  const floatInAnim = useSharedValue(20);
  const floatInAnimN = useSharedValue(-20);
  const v1Src = require('@/assets/images/m-vec1.png');
  const v2Src = require('@/assets/images/m-vec2.png');
  const quest = require('@/assets/images/question.png');

  useEffect(() => {
    fadeInAnim.value = withTiming(1, { duration: 2000 });
    floatInAnim.value = withTiming(0, { duration: 2000 });
    floatInAnimN.value = withTiming(0, { duration: 2000 });
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: fadeInAnim.value,
  }));

  const floatStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatInAnim.value }],
  }));

  const floatStyleN = useAnimatedStyle(() => ({
    transform: [{ translateX: floatInAnimN.value }],
  }));

  const FoundSpotIcon = ({ item, index }) => {
    return (
      <Animated.View style={styles.foundLoc} entering={FadeInDown.delay(index*100)}>
        <Animated.Image style={[{width: 70, height: 70, borderRadius: 35}]} source={item.image} />
        <Text style={[{fontFamily: 'Radio Canada Big', fontWeight: 500, color: colors.text}]}>{`${item.name}`}</Text>
      </Animated.View>
    );
  } 

function MysterySpotReveal() {
  const isVisible = useSharedValue(false);
  const revealOpacity = useSharedValue(0);
  const questOpacity = useSharedValue(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      isVisible.value = true;
      revealOpacity.value = withTiming(1, { duration: 800 });
      questOpacity.value = withTiming(0, { duration: 400 });
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const revealStyle = useAnimatedStyle(() => ({
    opacity: revealOpacity.value,
  }));

  const questStyle = useAnimatedStyle(() => ({
    opacity: questOpacity.value,
  }));

  return (
    <Animated.View style={[{height: '100%'}]} entering={FadeInDown.duration(1000)}>
      <Animated.Image style={[fadeStyle, floatStyle, {position: 'absolute', objectFit: 'contain', flex: 1, maxWidth: '100%', maxHeight: '100%', bottom: 0, right: 100, opacity: fadeInAnim, transform: [{translateX: floatInAnimN}, {translateY: floatInAnim}, {rotate: '-10deg'}]}]} source={v1Src} />
      <Animated.Image style={[fadeStyle, floatStyleN, {position: 'absolute', objectFit: 'contain', flex: 1, maxWidth: '120%', maxHeight: '120%', bottom: 0, right: 0, opacity: fadeInAnim, transform: [{translateX: floatInAnim}, {translateY: floatInAnim}]}]} source={v2Src} />

      {/* Question marks — always rendered, fade out after timer */}
      <Animated.View style={[questStyle, { position: 'absolute', width: '100%', height: '100%' }]}>
        
        <Animated.Image style={[{position: 'absolute', objectFit: 'contain', flex: 1, maxWidth: '30%', maxHeight: '120%', top: -100, left: '38%', transform: [{translateX: floatInAnim}, {translateY: floatInAnim}]}]} source={quest} />
        <Animated.Image style={[{position: 'absolute', objectFit: 'contain', flex: 1, maxWidth: '20%', maxHeight: '120%', top: 0, left: '10%', transform: [{translateX: floatInAnim}, {translateY: floatInAnim}, {rotate: '-20deg'}]}]} source={quest} />
        <Animated.Image style={[{position: 'absolute', objectFit: 'contain', flex: 1, maxWidth: '14%', maxHeight: '120%', top: 70, left: '70%', transform: [{translateX: floatInAnim}, {translateY: floatInAnim}, {rotate: '10deg'}]}]} source={quest} />
      </Animated.View>

      <View style={[styles.body, {height: '100%'}]}>
        <Animated.View style={[{opacity: fadeInAnim, transform: [{translateY: floatInAnim}]}]}>
          <Text style={[styles.head, {color: colors.text}]}>Discoveries</Text>
          {/* Discovered text — fades in after timer */}
          <Animated.View style={[revealStyle]}>
            <View style={[{height: 100}]}></View>
            {foundSpots.length == 0 ?
              <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 15, color: colors.text, textAlign: 'center'}]}>No spots found.</Text>
              :
              <View>
                <FlatList scrollEnabled={true} style={[{width: '100%', maxHeight: 300}]} data={foundSpots} renderItem={FoundSpotIcon} keyExtractor={item => item.id} />
              </View>
            }
          </Animated.View>
        </Animated.View>
        <Animated.View style={[fadeStyle, floatStyle, {width: '100%', opacity: fadeInAnim, transform: [{translateY: floatInAnim}]}]}>
          {/* Continue button — fades in after timer */}
          <Animated.View style={[revealStyle]}>
            <TouchableOpacity
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setMysteryWindow("closed"); setShowMysterySpot(true);}}
              style={styles.button2}
            >
              <Text style={styles.buttonText2}>Continue</Text>
            </TouchableOpacity>
          </Animated.View>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

>>>>>>> Stashed changes
  const activityComp = ({ item, index }) => {
    const notOtherTypes = ['Run', 'Walk', 'TrailRun', 'Walk', 'Ride', 'Run'];
    return (
<<<<<<< Updated upstream
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); pickActivity(item)}} style={[styles.stats, {marginBottom: 10}]}>
          <View>
            <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
            <Text style={[{fontWeight: 300, color: colors.text}]}>{`${meterToMile(item.distance)} mi`}</Text>
            <Text style={[{fontWeight: 300, color: colors.text}]}>{convertDate(item.start_date)}</Text>
            </View>
=======
      <Animated.View style={[{width: '100%'}]} entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); pickActivity(item)}} style={[styles.stats, {width: '100%', marginBottom: 10, display: 'flex', flexDirection: 'row'}]}>
          <View style={[{display: 'flex', width: '100%', flexDirection: 'row', gap: 10}]}>
            <View style={[{display: 'flex', flexDirection: 'column', flex: 1}]}>
              <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
              <Text style={[{fontWeight: 300, color: colors.text}]}>{`${meterToMile(item.distance)} mi`}</Text>
              <Text style={[{fontWeight: 300, color: colors.text}]}>{convertDate(item.start_date)}</Text>
            </View>
            <View style={[{display: 'flex', justifyContent: 'center', alignItems: 'flex-end'}]}>
              {(item.sport_type == 'Run' || item.sport_type == 'TrailRun') && <IconSymbol size={35} name="figure.run" color={colorScheme == 'dark' ? "#7ACDCB" : "#67A09F"} />}
              {(item.sport_type == 'Walk' || item.sport_type == 'Hike') && <IconSymbol size={35} name="figure.walk" color={colorScheme == 'dark' ? "#7ACDCB" : "#67A09F"} />}
              {(item.sport_type == 'Ride' || item.sport_type == 'MountainBikeRide') && <IconSymbol size={35} name="figure.outdoor.cycle" color={colorScheme == 'dark' ? "#7ACDCB" : "#67A09F"} />}
              {!notOtherTypes.includes(item.sport_type) && <IconSymbol size={35} name="heart.badge.bolt" color={colorScheme == 'dark' ? "#7ACDCB" : "#67A09F"} />}

            </View>
          </View>
>>>>>>> Stashed changes
        </TouchableOpacity>
      </Animated.View>
    )
  }
  
    const addToDescription = async (activity, numSpots) => {
      if (sendPQ && numSpots > 0) {
        const act = await fetchFromStrava(`/athletes/${athlete?.id}`);
        const newDesc = (act.description || '') +  `\n\n--- ${numSpots} new location${numSpots > 1 ? 's' : ''} found with PicQuest ---`;

        await fetchFromStrava(`/activities/${activity.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: newDesc }),
        });
      }
    };

    return (
      <SafeAreaView style={[{backgroundColor: colors.background}]}>
<<<<<<< Updated upstream
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
=======
        <ScrollView style={{height: '100%'}}>
            {mysteryWindow == "closed" ?
              <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
                {selectedActivity != null ?
                  <Animated.View style={[{width: '100%', display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center'}]} entering={FadeIn.duration(1000)}>
                    <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Add Activity</Text>
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
                          <View>
                          <Polyline
                            coordinates={currCoords} 
                            strokeColor="rgb(187, 155, 86)"
                            strokeWidth={3}
                          />
                          {showMysterySpot && (foundSpots.map((item) => 
                            (<Marker key={item.key} coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.name}>
                            <Image source={item.image} style={{width:50, height:50, borderRadius: 25, borderColor: 'white', borderWidth: 2}} />
                          </Marker>)
                          ))}
                          </View>
                      )}
                      </MapView>
                    :
                      <View style={styles.mapPreview}>
                        <Text style={[styles.textStyle, {color: colors.text}]}>No map preview available</Text>
                      </View>
                    }
                    
                    <Text style={[styles.textStyle, {fontWeight: 600, fontSize: 20, color: colors.text}]}>{selectedActivity?.name}</Text>
                    <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 19, color: colors.text}]}>{`${meterToMile(selectedActivity.distance)} MI    |    ${formatSeconds(selectedActivity.elapsed_time)}    |    ${selectedActivity.total_elevation_gain} FT`}</Text>
                    <TouchableOpacity onPress={() => {setMysteryWindow("open");}} style={[styles.dropdownbtn]}>
                      <Text style={styles.buttonText}>Mystery Locations</Text>
                    </TouchableOpacity>
                    <View style={[{width: '90%', backgroundColor: 'gray', opacity: 0.5, height: 1, marginTop: 10, marginBottom: 10}]}></View>
                    {/* <TouchableOpacity onPress={() => setDropdownState(!dropdownState)} style={[styles.dropdownbtn]}> */}
                    <TouchableOpacity onPress={() => {addActivity(selectedActivity); addLocation(foundSpots, selectedActivity.start_date); selectActivity(null); addToDescription(selectedActivity, foundSpots.length);}} style={[styles.button]}>
                      <Text style={styles.buttonText}>Add</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => selectActivity(null)} style={[styles.button, {backgroundColor: 'rgba(100, 100, 100, 0.25)'}]}>
                      <Text style={styles.buttonText}>Cancel Add</Text>
                    </TouchableOpacity>
                  </Animated.View>
                  :
                  <View style={[{width: '100%', gap: 10, marginBottom: 50}]}>
                    <Text style={[styles.textStyle, styles.head, {color: colors.text}]}>Add Activity</Text>
                    <Text style={[styles.textStyle, {color: colors.text}]}>Select one of your recent activities.</Text>
                    <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
                      <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={newActivities} renderItem={activityComp} keyExtractor={item => item.id} />
>>>>>>> Stashed changes
                    </View>
                  }
                  <Text style={[styles.textStyle, {fontWeight: 600, fontSize: 20, color: colors.text}]}>{selectedActivity?.name}</Text>
                  <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 19, color: colors.text}]}>{`${meterToMile(selectedActivity.distance)} MI    |    ${formatSeconds(selectedActivity.elapsed_time)}    |    ${selectedActivity.total_elevation_gain} FT`}</Text>
                  <View style={[{width: '90%', backgroundColor: 'gray', opacity: 0.5, height: 1, marginTop: 10, marginBottom: 10}]}></View>
                  <TouchableOpacity onPress={() => setDropdownState(!dropdownState)} style={[styles.dropdownbtn]}>
                    <Text style={styles.buttonText}>Mystery Locations   ▼</Text>
                  </TouchableOpacity>
                  <Collapsible collapsed={dropdownState}>
                    <Text style={[styles.textStyle, {fontWeight: 100, fontSize: 15, color: colors.text}]}>{`${foundSpots.length == 0 ? "No spots found." : "Found Spots: " + retSpotNames(foundSpots)}`}</Text>
                  </Collapsible>
                  <TouchableOpacity onPress={() => {addActivity(selectedActivity); addLocation(foundSpots); selectActivity(null)}} style={[styles.button]}>
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
<<<<<<< Updated upstream
                </View>
              }
          </Animated.View>
=======
                }
            </Animated.View>
            : <MysterySpotReveal></MysterySpotReveal>
          }
          </ScrollView>
>>>>>>> Stashed changes
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
    backgroundColor: 'rgba(96, 96, 96, 0.4)',
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
    backgroundColor: 'rgba(94, 141, 140, 1)',
    borderRadius: 20,
    padding: 10,
    width: '100%',
    margin: 10,
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
