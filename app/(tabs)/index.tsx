import { Button, FlatList, ScrollView, TouchableOpacity, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';
import React, { useState, useEffect, act, useRef } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Redirect } from 'expo-router';
import Animated, { FadeInDown, SlideInRight, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMystLoc } from '@/context/MystLocContext';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import MapView, { Marker } from 'react-native-maps';

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

  const [screenSetting, setScreen] = useState('stats');

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
    let min = Math.floor(secs/60);
    let result = "";
    if (min > 60) {
      result = `${(min / 60).toFixed(0)} HR, `;
      min = min % 60;
    }
    return result + min;
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

  const {mysteryLocations, myLocs, checkInRadius, getMyLocs, newLocs, addLocation} = useMystLoc();
  const [myLocation, setMyLocation] = useState({latitude: 38.985969, longitude: -76.942562});
  const [myLocations, setMyLocations] = useState([]);

  // const getMyLocsN = async() => {
  //     try {
  //         let currentListString = await SecureStore.getItemAsync('my_locations');
  //         return currentListString ? JSON.parse(currentListString) : [];
  //     } catch (error) {
  //         console.error("Error fetching location: ", error);
  //         return [];
  //     }
  // };

  useEffect (() => {
    const getLocation = async () => {
      let {status} = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation({latitude: location.coords.latitude, longitude: location.coords.longitude});
    };
    getLocation();
  }, []);

  function getDistanceAway(item) {
    let dLat = myLocation.latitude - item.latitude;
    let dLon = myLocation.longitude - item.longitude;
    let csq = (69*dLat)**2 + (69*dLon)**2;
    return Math.sqrt(csq).toFixed(2);
  }

  const locationComp = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);}} style={[styles.stats, {marginBottom: 10}]}>
          <View>
            <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
            <Text style={[{fontWeight: 200, color: colors.text}]}>{getDistanceAway(item)} mi away</Text>
            </View>
        </TouchableOpacity>
      </Animated.View>
    )
  }

  function CarouselItem({item}) {
    // const itemImage = require(`${item.image}`);
    const itemImage = require(`@/assets/images/myst-locs/kehoe-track.png`);
    return (
      <View>
        <Image style={styles.carouselImage} source={itemImage} resizeMode="cover"/>
        <View style={styles.carouselTextContainer}>
          <Text style={[{color: colors.text, fontFamily: 'Radio Canada Big', fontSize: 20}]}>{item.name}</Text>
          <Text style={styles.sectBody}>ACQUIRED 28 MARCH 2025</Text>
        </View>
      </View>
    );
  }

  function LocationsScroll() {
    const scrollRef = useRef<Animated.ScrollView>(null);
    const imageWidth = 300;
    return (
      <Animated.ScrollView 
        ref={scrollRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        snapToInterval={imageWidth}>
          {myLocs.map((item, index) => (<CarouselItem item={item} key={index}></CarouselItem>))}
      </Animated.ScrollView>
    )
  }

  function StatsView() {
    const itemImage = require(`@/assets/images/myst-locs/kehoe-track.png`);
    return (
      <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
        <Text style={[styles.head, {color: colors.text}]}>Welcome Back, {athlete?.firstname}</Text> 
        <Image source={{ uri: athlete?.profile}} style={styles.image}></Image>
        <View style={styles.stats}>
          <Text style={[styles.sectHead, {color: colors.text}]}>THIS WEEK:</Text>
          <View style={styles.row}>
            <Text style={[styles.sectBody]}>{"MILEAGE\nACTIVE TIME\nDISCOVERIES"}</Text>
            <Text style={[styles.sectBody, {textAlign: 'right', flex: 1, color: colors.text}]}>{`${meterToMile(stats?.recent_run_totals?.distance)} MI\n${secsToMin(stats?.recent_run_totals?.elapsed_time)} MIN\n ${myLocs.length}`}</Text>
            <View>
              <Text style={[styles.sectBody, {color: getColor('mile')}]}>{getArrow('mile')}</Text>
              <Text style={[styles.sectBody, {color: getColor('time')}]}>{getArrow('time')}</Text>
              <Text style={[styles.sectBody, {color: getColor('obj')}]}>{getArrow('obj')}</Text>
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.halfbox} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('collection')}}>
            <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>COLLECTION</Text>
            <Image style={styles.mapSmallPreview} source={itemImage}></Image>
          </TouchableOpacity>
          <TouchableOpacity style={styles.halfbox} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('map')}}>
            <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>MY MAP</Text>
            <MapView
            style={styles.mapSmallPreview}
            region={myLocation ? {
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : undefined}> 
            {//<Marker coordinate={myLocation} title="my location"/>
            }
            </MapView>  
          </TouchableOpacity>
        </View>
        <Text></Text>
        <View style={styles.tabBarSpacer}>
        </View>
      </Animated.View>
    );
  }

  function CollectionView() {
    return (
      <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
        <View style={[{width: '100%', marginTop: 0}]}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('stats')}><IconSymbol size={25} name="chevron.left" color="white" /></TouchableOpacity>
          <Text style={[styles.head, {color: colors.text,}]}>My Collection</Text>
        </View>
        <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
          {myLocs.length > 0 ? <LocationsScroll></LocationsScroll> : <Text style={[{color: 'grey', fontSize: 16, textAlign: 'center'}]}>No locations yet! Try the discover button to look for new ones!</Text>}
        </View>
        {/* <TouchableOpacity style={styles.button} onPress={() => {getMyLocs(); console.log(getMyLocs())}}><Text style={styles.buttonText}>Check locs</Text></TouchableOpacity> */}
        <TouchableOpacity style={styles.button} onPress={() => setScreen('map')}><Text style={styles.buttonText}>Discover New</Text></TouchableOpacity>
      </Animated.View>
    );
  }

  function MyMapView() {
    return (
      <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(700)}>
        <View style={[{width: '100%', marginTop: 0}]}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('stats')}><IconSymbol size={25} name="chevron.left" color="white" /></TouchableOpacity>
          <Text style={[styles.head, {color: colors.text,}]}>Discover Locations</Text>
        </View>
        <MapView
          style={styles.mapPreview}
          region={myLocation ? {
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : undefined}> 
          <Marker
            coordinate={myLocation} 
            title="my location"
          />
        </MapView>
        <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
          <Text style={styles.sectBody}>Locations near you:</Text>
          <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={newLocs} renderItem={locationComp} keyExtractor={item => item.id} />
        </View>
      </Animated.View>
    );

  }

  return (
    <SafeAreaView style={[{backgroundColor: colors.background, height: '100%'},]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {screenSetting == 'stats' ?
          <StatsView></StatsView>
        :
          <View style={[{width: '100%'}]}>
            {screenSetting == 'collection' ?
              <CollectionView></CollectionView>
            :
              <MyMapView></MyMapView>
            }
          </View>
        }
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
  carouselImage: {
    height: 400,
    width: 300,
    borderRadius: 20,
  },
  carouselTextContainer: {
    marginTop: 10,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  tabBarSpacer : {
    minHeight: 10,
    flexGrow: 1,
  },
  mapPreview: {
    width: '100%',
    height: 300,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSmallPreview: {
    width: '100%',
    height: 120,
    borderRadius: 20,
  },
  button: {
    width: '100%',
    margin: 10,
    backgroundColor: 'rgba(80, 119, 142, 1)',
    borderRadius: 10,
    padding: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
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
    alignItems: 'center',
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
