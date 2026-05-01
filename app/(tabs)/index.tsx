<<<<<<< Updated upstream
import { Button, FlatList, ScrollView, TouchableOpacity, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image} from 'react-native';
import { useFonts } from'expo-font';
import React, { useState, useEffect, act, useRef } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Redirect } from 'expo-router';
import Animated, { FadeInDown, SlideInRight, ZoomIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
=======
>>>>>>> Stashed changes
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMystLoc } from '@/context/MystLocContext';
import { useStrava } from '@/context/StravaContext';
import { useFonts } from 'expo-font';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
<<<<<<< Updated upstream
import polyline from '@mapbox/polyline';
import MapView, { Marker } from 'react-native-maps';
=======
import React, { useEffect, useState } from 'react';
import { Dimensions, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View, RefreshControl} from 'react-native';
import Animated, { FadeInDown, interpolate, SlideInDown, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import MapView, { Circle, Marker } from 'react-native-maps';
import { runOnJS } from 'react-native-worklets';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream

  const [screenSetting, setScreen] = useState('stats');

=======
  const [thisWeekMileage, setThisWeekMile] = useState(0);
  const [thisWeekTime, setThisWeekTime] = useState(0);
  const [thisWeekObjects, setThisWeekObjects] = useState(0);

  const [screenSetting, setScreen] = useState('stats');

  const {mysteryLocations, myLocs, myActivities, newLocs, addLocation, IMAGE_MAP} = useMystLoc();

>>>>>>> Stashed changes
  useEffect(() => {

    const loadStats = async () => {
      const stats = await fetchFromStrava(`/athletes/${athlete?.id}/stats`);
      setStats(stats);
    };

    if (athlete?.id) {
      loadStats();
<<<<<<< Updated upstream
=======
      let thisLast = getThisWeekLastWeek();
      setThisWeekMile(thisLast.thisWeek[0]);
      setThisWeekTime(thisLast.thisWeek[1]);
      setThisWeekObjects(thisLast.thisWeek[2]);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
=======
  function getThisWeekLastWeek()  {
    const acts = myActivities;
    let thisWeek = [0, 0, 0];
    let lastWeek = [0, 0, 0];
    const thisWeekStart = new Date(Date.now());
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekStart = new Date(Date.now());
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    acts.forEach((act, index) => {
      let actDate = new Date(act?.start_date);
      if (actDate >= thisWeekStart) {
        thisWeek[0]+=act.distance;
        thisWeek[1]+=act.moving_time;
      } else if (actDate < thisWeekStart && actDate >= lastWeekStart) {
        lastWeek[0]+=act.distance;
        lastWeek[1]+=act.moving_time;
      }
    });
    myLocs.forEach((loc) => {
      let locDate = new Date(loc.timeStamp);
      if (locDate >= thisWeekStart) {
        thisWeek[2]+=1;
      } else if (locDate < thisWeekStart && locDate >= lastWeekStart) {
        lastWeek[2]+=1;
      }
    })
    return {thisWeek, lastWeek};
  }

>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      curr *= stats?.recent_run_totals?.achievement_count;
      last *= stats?.ytd_run_totals?.achievement_count;
    }
    let trend = curr-last;
    let ret = "";
=======
      change = thisWeek[2] - lastWeek[2];
    }
    let trend = change;
    let ret;
>>>>>>> Stashed changes
    if (trend > 0) {
      ret = <IconSymbol size={20} name="arrow.up.right" color="green" />;
    } else if (trend < 0) {
      ret = <IconSymbol size={20} name="arrow.down.left" color="red" />;
    } else {
      ret = ret = <IconSymbol size={20} name="arrow.right" color='rgb(80, 119, 142)' />;;
    }
    return ret;
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

<<<<<<< Updated upstream
  const locationComp = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);}} style={[styles.stats, {marginBottom: 10}]}>
          <View>
            <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
            <Text style={[{fontWeight: 200, color: colors.text}]}>{getDistanceAway(item)} mi away</Text>
=======
  const [selectedLocation, selectNewLocation] = useState(null);
  const [locationRadius, setLocationRadius] = useState(0);

  const locationComp = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); selectNewLocation(item); setLocationRadius(parseFloat(getDistanceAway(item))/0.000621371); console.log(locationRadius)}} style={[styles.locationList, {marginBottom: 10}]}>
          {selectedLocation == item ? 
            <View style={[{display: 'flex', flexDirection: 'row', gap: 10}]}>
              <Image style={[{width: 200, height: 200, borderRadius: 20}]} source={item.image}/>
              <View style={[{display: 'flex', flexDirection: 'column', maxWidth: 100}]}>
                <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
                <Text style={[{fontWeight: 200, color: colors.text}]}>{getDistanceAway(item)} mi away</Text>
              </View>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
        snapToInterval={imageWidth}>
          {myLocs.map((item, index) => (<CarouselItem item={item} key={index}></CarouselItem>))}
=======
        pagingEnabled={false}
        snapToInterval={C_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: sidePadding}}
        >
          {(myLocs.toReversed()).map((item, index) => (<CarouselItem item={item} index={index} scrollX={scrollX} key={index}></CarouselItem>))}
>>>>>>> Stashed changes
      </Animated.ScrollView>
    )
  }

  function StatsView() {
    const [activityDropdown, setActivityDropdown] = useState(false);
    const itemImage = require(`@/assets/images/myst-locs/kehoe-track.png`);
    return (
      <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(1000)}>
        <Text style={[styles.head, {color: colors.text}]}>Welcome Back, {athlete?.firstname}</Text> 
        <Image source={{ uri: athlete?.profile}} style={styles.image}></Image>
        <View style={styles.stats}>
          <Text style={[styles.sectHead, {color: colors.text}]}>THIS WEEK:</Text>
          <View style={styles.row}>
            <Text style={[styles.sectBody]}>{"MILEAGE\nACTIVE TIME\nDISCOVERIES"}</Text>
<<<<<<< Updated upstream
            <Text style={[styles.sectBody, {textAlign: 'right', flex: 1, color: colors.text}]}>{`${meterToMile(stats?.recent_run_totals?.distance)} MI\n${secsToMin(stats?.recent_run_totals?.elapsed_time)} MIN\n ${myLocs.length}`}</Text>
            <View>
              <Text style={[styles.sectBody, {color: getColor('mile')}]}>{getArrow('mile')}</Text>
              <Text style={[styles.sectBody, {color: getColor('time')}]}>{getArrow('time')}</Text>
              <Text style={[styles.sectBody, {color: getColor('obj')}]}>{getArrow('obj')}</Text>
=======
            <View style={[{display: 'flex', flexDirection: 'column', flex: 1}]}>
              <View style={[{display: 'flex', flexDirection: 'row', alignItems: 'center'}]}>
                <Text style={[styles.sectBody, {marginRight: 5, textAlign: 'right', flex: 1, color: colors.text}]}>{`${meterToMile(thisWeekMileage)} MI`}</Text>
                {getTrend('mile')}
              </View>
              <View style={[{display: 'flex', flexDirection: 'row', alignItems: 'center'}]}>
                <Text style={[styles.sectBody, {marginRight: 5, textAlign: 'right', flex: 1, color: colors.text}]}>{`${secsToMin(thisWeekTime)} MIN`}</Text>
                {getTrend('time')}
              </View>
              <View style={[{display: 'flex', flexDirection: 'row', alignItems: 'center'}]}>
                <Text style={[styles.sectBody, {marginRight: 5, textAlign: 'right', flex: 1, color: colors.text}]}>{`${thisWeekObjects}`}</Text>
                {getTrend('obj')}
              </View>
>>>>>>> Stashed changes
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.halfbox} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('collection')}}>
            <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>COLLECTION</Text>
            {myLocs.length > 0 ?
              <Image style={styles.mapSmallPreview} source={IMAGE_MAP[myLocs[myLocs.length - 1].id]}></Image>
              :
              <View style={[styles.mapSmallPreview, styles.noLocs]}><Text style={[{color: 'gray', textAlign: 'center'}]}>No locations yet!</Text></View>
            }
            <Text style={[{color: 'gray', textAlign: 'center', padding: 10}]}>{myLocs.length} OBJECTS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.halfbox} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('map-all')}}>
            <Text style={[styles.sectHead, {color: colors.text, textAlign: 'center'}]}>MY MAP</Text>
            <MapView
            style={styles.mapSmallPreview}
            scrollEnabled={false}
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
        {(myActivities.length > 0) &&
        <View style={[{width: '100%'}]}>
          <TouchableOpacity style={styles.activityLog} onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setActivityDropdown(!activityDropdown);}}>
            <View style={[{display: 'flex', flexDirection: 'row', alignItems:'center'}]}>
              <Text style={[styles.sectHead, {color: colors.text, flex: 1,paddingHorizontal: 8}]}>ACTIVITY LOG</Text>
              <IconSymbol size={22} name="chevron.down" color="white"/>
            </View>
            {activityDropdown && <View style={[{display: 'flex', flexDirection: 'column', gap: 8}]}>
              <View style={[{display: 'flex', flexDirection: 'row', gap: 8}]}>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
              </View>
              <View style={[{display: 'flex', flexDirection: 'row', gap: 8}]}>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
                <View style={styles.calendarSquare}></View>
              </View>
            </View>}
          </TouchableOpacity>
        </View>
        }
        <View style={[styles.tabBarSpacer]}>
        </View>
      </Animated.View>
    );
  }

  function CollectionView() {
    return (
      <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%', padding: 5}]} entering={FadeInDown.duration(1000)}>
        <View style={[{width: '100%', marginTop: 0}]}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('stats')}><IconSymbol size={25} name="chevron.left" color="white" /></TouchableOpacity>
          <Text style={[styles.head, {color: colors.text,}]}>My Collection</Text>
        </View>
<<<<<<< Updated upstream
        <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
          {myLocs.length > 0 ? <LocationsScroll></LocationsScroll> : <Text style={[{color: 'grey', fontSize: 16, textAlign: 'center'}]}>No locations yet! Try the discover button to look for new ones!</Text>}
=======
        <View style={[{display: 'flex', flexDirection: 'column', flex: 1, marginBottom: 0, paddingBottom: 0}]}>
          {myLocs.length > 0 ? <LocationsScroll></LocationsScroll> : <Text style={[styles.bodyEl, {color: 'grey', maxWidth: 350, fontSize: 16, textAlign: 'center'}]}>No locations yet! Try the discover button to look for new ones!</Text>}
        </View>
        <View style={[styles.body, styles.bodyEl]}>
          <TouchableOpacity style={[styles.button, {backgroundColor: 'rgba(94, 141, 140, 1)'}]} onPress={() => setScreen('map')}><Text style={styles.buttonText}>Discover New</Text></TouchableOpacity>
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
=======
          <Circle
            center={myLocation}
            radius={locationRadius} // 1 kilometer
            strokeColor="rgba(187, 155, 86, 1)"
            fillColor="rgba(187, 155, 86, 0.5)"
          />
>>>>>>> Stashed changes
        </MapView>
        <View style={[{display: 'flex', flexDirection: 'column', width: '100%'}]}>
          <Text style={styles.sectBody}>Locations near you:</Text>
          <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={newLocs} renderItem={locationComp} keyExtractor={item => item.id} />
        </View>
      </Animated.View>
    );

  }

  function MyMapLocationsView() {
    return (
      <Animated.View style={[styles.bodyFull, {backgroundColor: colors.background, height: '100%'}]} entering={FadeInDown.duration(700)}>
        <View style={[{width: '100%', marginTop: 0}]}>
          <TouchableOpacity style={styles.backButtonTop} onPress={() => setScreen('stats')}><IconSymbol size={25} name="chevron.left" color="white" /></TouchableOpacity>
        </View>
        <View style={StyleSheet.absoluteFillObject}>
          <MapView
            style={[StyleSheet.absoluteFillObject]}
            region={myLocation ? {
              latitude: myLocation.latitude,
              longitude: myLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            } : undefined}> 
            <Marker
              coordinate={myLocation} 
              title="My Location"
            />
            {myLocs.map((item) => 
            (<Marker key={item.key} coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.name}>
                      <Image source={item.image} style={{width:50, height:50, borderRadius: 25, borderColor: 'white', borderWidth: 2}} />
              </Marker>))}
          </MapView>
        </View>
      </Animated.View>
    );

  }

  return (
<<<<<<< Updated upstream
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
=======
  <SafeAreaView style={[{ backgroundColor: colors.background, height: '100%', width: '100%' }]}>
    <ScrollView showsVerticalScrollIndicator={false}>
      <StatsView />
    </ScrollView>

    {/* Modal overlay views */}
    {screenSetting !== 'stats' && (
      <Animated.View
        entering={SlideInDown.duration(800)}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: colors.background,
          zIndex: screenSetting !== 'stats' ? 10 : -1,
          opacity: screenSetting !== 'stats' ? 1 : 0,
          height: '100%',
          margin: 0,
          padding: 0,
        }}
      >
        {screenSetting === 'map-all' ? (
          <MyMapLocationsView />
        ) : (
          <ScrollView showsVerticalScrollIndicator={false} style={{ height: '100%', borderRadius: 20, marginTop: 30 }}>
            {screenSetting === 'collection' && <CollectionView />}
            {screenSetting === 'map' && <MyMapView />}
          </ScrollView>
        )}
      </Animated.View>
    )}
  </SafeAreaView>
);
>>>>>>> Stashed changes
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
  activityLog: {
    backgroundColor: 'rgba(96, 96, 96, 0.4)',
    borderRadius: 30,
    width: '100%',
    padding: 15,
    alignItems: 'center',
    gap: 10,
  },
  noLocs: {
    borderStyle: 'dashed',
    borderColor: '#7a7a7a',
    borderWidth: 1,
    padding: 15,
  },
  calendarSquare: {
    backgroundColor: 'gray',
    width: 40,
    height: 40,
    borderRadius: 10,
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
    minHeight: 50,
    flexGrow: 1,
  },
  backButtonTop: {
    width: 40,
    height: 40,
    marginTop: 30,
    marginLeft: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 30,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 20,
  },
  mapPreview: {
    width: '100%',
    height: 300,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullMapPreview: {
    flex: 1,
    width: '100%',
    height: '100%',
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapSmallPreview: {
    width: '100%',
    height: 100,
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
<<<<<<< Updated upstream
=======
  bodyFull: {
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Radio Canada Big',
    //marginTop: 10,
    gap: 15,
    alignItems: 'center',
  },
  bodyEl: {
    paddingLeft: 10,
    paddingRight: 10,
    width:'100%',
  },
>>>>>>> Stashed changes
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
    // backgroundColor: '#3A3A3A',
    width: '100%',
    borderRadius: 30,
    padding: 10,
  },
  locationListContainer: {
    padding: 10,
  },
  locationList: {
    backgroundColor: 'rgba(96, 96, 96, 0.4)',
    width: '100%',
    borderRadius: 30,
    padding: 20,
  },
  sectHead: {
    fontSize: 16,
    lineHeight: 35,
    fontWeight: 500,
  },
  sectBody: {
    color: '#BEBEBE',
    fontSize: 16,
    lineHeight: 25,
  },
  halfbox: {
    backgroundColor: 'rgba(96, 96, 96, 0.4)',
    flex: 1,
    height: 200,
    borderRadius: 30,
    padding: 20,
  }
});
