
import { useFonts } from'expo-font';
import React, { useState, useEffect, act, useRef } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Redirect } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMystLoc } from '@/context/MystLocContext';
import * as Location from 'expo-location';
import polyline from '@mapbox/polyline';
import { Dimensions, FlatList, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, useColorScheme, View, RefreshControl} from 'react-native';
import Animated, { FadeInDown, interpolate, SlideInDown, SlideInRight, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import MapView, { Circle, Marker } from 'react-native-maps';
import { runOnJS } from 'react-native-worklets';

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Radio Canada Big': require('../../assets/fonts/Radio_Canada_Big/RadioCanadaBig.ttf')
  });

  const lightColors = { background: 'white', text: 'black' };
  const darkColors = { background: '#2C2C2C', text: 'white' };
  const colorScheme = useColorScheme();
  const colors = colorScheme == 'dark' ? darkColors : lightColors;

  const { athlete, authenticated, fetchFromStrava } = useStrava();

  const [stats, setStats] = useState([]);

  const [thisWeekMileage, setThisWeekMile] = useState(0);
  const [thisWeekTime, setThisWeekTime] = useState(0);
  const [thisWeekObjects, setThisWeekObjects] = useState(0);

  const [screenSetting, setScreen] = useState('stats');
  const {mysteryLocations, myLocs, myActivities, newLocs, addLocation, IMAGE_MAP} = useMystLoc();


  const [myLocation, setMyLocation] = useState({ latitude: 38.985969, longitude: -76.942562 });
  const [selectedLocation, selectNewLocation] = useState(null);
  const [locationRadius, setLocationRadius] = useState(0);


  useEffect(() => {
    const loadStats = async () => {
      const stats = await fetchFromStrava(`/athletes/${athlete?.id}/stats`);
      setStats(stats);
    };
    if (athlete?.id) {
      loadStats();
      let thisLast = getThisWeekLastWeek();
      setThisWeekMile(thisLast.thisWeek[0]);
      setThisWeekTime(thisLast.thisWeek[1]);
      setThisWeekObjects(thisLast.thisWeek[2]);
    }
  }, [athlete]);

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let location = await Location.getCurrentPositionAsync({});
      setMyLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    };
    getLocation();
  }, []);

  function meterToMile(meters) {
    return (meters / 1609).toFixed(2);
  }

  function secsToMin(secs) {
    let min = Math.floor(secs / 60);
    let result = "";
    if (min > 60) {
      result = `${(min / 60).toFixed(0)} HR, `;
      min = min % 60;
    }
    return result + min;
  }

  function getThisWeekLastWeek() {
    const acts = myActivities;
    let thisWeek = [0, 0, 0];
    let lastWeek = [0, 0, 0];
    const thisWeekStart = new Date(Date.now());
    thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekStart = new Date(Date.now());
    lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    acts.forEach((act) => {
      let actDate = new Date(act?.start_date);
      if (actDate >= thisWeekStart) {
        thisWeek[0] += act.distance;
        thisWeek[1] += act.moving_time;
      } else if (actDate < thisWeekStart && actDate >= lastWeekStart) {
        lastWeek[0] += act.distance;
        lastWeek[1] += act.moving_time;
      }
    });
    myLocs.forEach((loc) => {
      let locDate = new Date(loc.timeStamp);
      if (locDate >= thisWeekStart) {
        thisWeek[2] += 1;
      } else if (locDate < thisWeekStart && locDate >= lastWeekStart) {
        lastWeek[2] += 1;
      }
    });
    return { thisWeek, lastWeek };
  }

  function getTrend(stat) {
    const { thisWeek, lastWeek } = getThisWeekLastWeek();
    let change;
    if (stat == 'mile') change = thisWeek[0] - lastWeek[0];
    else if (stat == 'time') change = thisWeek[1] - lastWeek[1];
    else change = thisWeek[2] - lastWeek[2];

    if (change > 0) return <IconSymbol size={20} name="arrow.up.right" color="green" />;
    if (change < 0) return <IconSymbol size={20} name="arrow.down.left" color="red" />;
    return <IconSymbol size={20} name="arrow.right" color='rgb(80, 119, 142)' />;
  }

  function getDistanceAway(item) {
    let dLat = myLocation.latitude - item.latitude;
    let dLon = myLocation.longitude - item.longitude;
    let csq = (69 * dLat) ** 2 + (69 * dLon) ** 2;
    return Math.sqrt(csq).toFixed(2);
  }

  const locationComp = ({ item, index }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); selectNewLocation(item); setLocationRadius(parseFloat(getDistanceAway(item)) / 0.000621371); }}
        style={[styles.locationList, { marginBottom: 10 }]}
      >
        {selectedLocation == item ?
          <View style={{ display: 'flex', flexDirection: 'row', gap: 10 }}>
            <Image style={{ width: 200, height: 200, borderRadius: 20 }} source={item.image} />
            <View style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <Text style={{ fontWeight: '500', color: colors.text }}>{item.name}</Text>
              <Text style={{ fontWeight: '200', color: colors.text }}>{getDistanceAway(item)} mi away</Text>
            </View>
            
          </View>
          :
          <View style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Text style={{ fontWeight: '500', color: colors.text }}>{item.name}</Text>
            <Text style={{ fontWeight: '200', color: colors.text }}>{getDistanceAway(item)} mi away</Text>
          </View>
        }
      </TouchableOpacity>
    </Animated.View>
  );

  const { width: SCREEN_WIDTH } = Dimensions.get('window');
  const C_ITEM_WIDTH = SCREEN_WIDTH * 0.8;
  const C_MARGIN = 5;
  const C_WIDTH = C_ITEM_WIDTH + C_MARGIN * 2;

  const CarouselItem = ({item, index, scrollX}) => {
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{scale: interpolate(scrollX.value, [(index-1)*C_WIDTH, index*C_WIDTH, (index+1)*C_WIDTH], [0.85, 1, 0.85], 'clamp')}]
    }));

    return (
       <Animated.View style={[{ marginHorizontal: C_MARGIN}, animatedStyle]}>
        {item?.id && (<Image style={styles.carouselImage} source={IMAGE_MAP[item.id]} resizeMode="cover"/>)}
        <View style={styles.carouselTextContainer}>
          <Text style={[{color: colors.text, fontFamily: 'Radio Canada Big', fontSize: 20}]}>{item.name}</Text>
          <Text style={styles.sectBody}>FOUND {item.date}</Text>
        </View>
      </Animated.View>
    );
  }

  function LocationsScroll() {
    const scrollX = useSharedValue<number>(0);
    const currentIndex = useSharedValue<number>(0);

    const sidePadding = (SCREEN_WIDTH - C_ITEM_WIDTH) / 2;

    function triggerHaptic() {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    };

    const scrollHandler = useAnimatedScrollHandler(e => {
      scrollX.value = e.contentOffset.x;
      const newIndex = Math.round(scrollX.value / C_WIDTH);
      if (newIndex !== currentIndex.value) {
        currentIndex.value = newIndex;
        runOnJS(triggerHaptic)();
      }
    });

    return (
      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        horizontal 
        showsHorizontalScrollIndicator={false}
        pagingEnabled={false}
        snapToInterval={C_WIDTH}
        decelerationRate="fast"
        contentContainerStyle={{ paddingHorizontal: sidePadding}}
        >
          {(myLocs.toReversed()).map((item, index) => (<CarouselItem item={item} index={index} scrollX={scrollX} key={index}></CarouselItem>))}
      </Animated.ScrollView>
    )
  }

  function StatsView() {
    const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);
    return (
      <Animated.View style={[styles.body, { backgroundColor: colors.background, height: '100%', margin: 15 }]} entering={FadeInDown.duration(1000)}>
        <Text style={[styles.head, { color: colors.text }]}>Welcome Back, {athlete?.firstname}</Text>
        <Image source={{ uri: athlete?.profile }} style={styles.image} />
        <View style={styles.stats}>
          <Text style={[styles.sectHead, { color: colors.text }]}>THIS WEEK:</Text>
          <View style={styles.row}>
            <Text style={styles.sectBody}>{"MILEAGE\nACTIVE TIME\nDISCOVERIES"}</Text>
            <View style={{ flexDirection: 'column', flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.sectBody, { marginRight: 5, textAlign: 'right', flex: 1, color: colors.text }]}>{`${meterToMile(thisWeekMileage)} MI`}</Text>
                {getTrend('mile')}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.sectBody, { marginRight: 5, textAlign: 'right', flex: 1, color: colors.text }]}>{`${secsToMin(thisWeekTime)} MIN`}</Text>
                {getTrend('time')}
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.sectBody, { marginRight: 5, textAlign: 'right', flex: 1, color: colors.text }]}>{`${thisWeekObjects}`}</Text>
                {getTrend('obj')}
              </View>
            </View>
          </View>
        </View>
        <View style={styles.row}>
          <TouchableOpacity style={styles.halfbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('collection'); }}>
            <Text style={[styles.sectHead, { color: colors.text, textAlign: 'center' }]}>COLLECTION</Text>
            {myLocs.length > 0 ?
              <Image style={styles.collectionThumb} source={IMAGE_MAP[myLocs[myLocs.length - 1].id]} />
              :
              <View style={[styles.noLocs]}>
                <Text style={{ color: 'gray', textAlign: 'center', alignItems: 'center'}}>Nothing found yet!</Text>
              </View>
            }
            <Text style={{ color: 'gray', textAlign: 'center', padding: 10 }}>{myLocs.length} DISCOVERIES</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.halfbox} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('map-all'); }}>
            <Text style={[styles.sectHead, { color: colors.text, textAlign: 'center' }]}>MY MAP</Text>
            <MapView
              style={styles.mapSmallPreview}
              scrollEnabled={false}
              region={myLocation ? {
                latitude: myLocation.latitude,
                longitude: myLocation.longitude,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              } : undefined}
            />
          </TouchableOpacity>
        </View>
       { myActivities.length > 0 && 
        <TouchableOpacity style={styles.activityLog} onPress={() => {setActivityDropdownOpen(!activityDropdownOpen)}}>
            <View style={[{display: 'flex', flexDirection: 'row', alignItems: 'center'}]}>
              <Text style={[styles.sectHead, {color: colors.text, flex: 1}]}>ACTIVITY LOG</Text>
              <IconSymbol size={22} name="chevron.down" color="white" />
            </View>
            {activityDropdownOpen && (
              <View style={[{ display: 'flex', flexDirection: 'column', gap: 8 }]}>
                <View style={[{ display: 'flex', flexDirection: 'row', gap: 8 }]}>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                </View>
                <View style={[{ display: 'flex', flexDirection: 'row', gap: 8 }]}>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                  <View style={styles.calendarSquare}></View>
                </View>
              </View>
            )}
          </TouchableOpacity>
        }
        
        <View style={styles.tabBarSpacer} />
      </Animated.View>
    );
  }

  function CollectionView() {
    return (
      <Animated.View style={[styles.body, { backgroundColor: colors.background, height: '100%', padding: 5 }]} entering={FadeInDown.duration(1000)}>
        <View style={{ width: '100%', marginTop: 0 }}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('stats')}>
            <IconSymbol size={25} name="chevron.left" color="white" />
          </TouchableOpacity>
          <Text style={[styles.head, { color: colors.text }]}>My Collection</Text>
        </View>
        <View style={{ flexDirection: 'column', flex: 1, marginBottom: 0, paddingBottom: 0 }}>
          {myLocs.length > 0
            ? <LocationsScroll />
            : <Text style={[styles.bodyEl, { color: 'grey', maxWidth: 350, fontSize: 16, textAlign: 'center' }]}>No locations yet! Try the discover button to look for new ones!</Text>
          }
        </View>
        <View style={[styles.body, styles.bodyEl]}>
          <TouchableOpacity style={[styles.button, { backgroundColor: 'rgba(94, 141, 140, 1)' }]} onPress={() => setScreen('map')}>
            <Text style={styles.buttonText}>Discover New</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  }

  function MyMapView() {
    return (
      <Animated.View style={[styles.body, { backgroundColor: colors.background, height: '100%' }]} entering={FadeInDown.duration(700)}>
        <View style={{ width: '100%', marginTop: 0 }}>
          <TouchableOpacity style={styles.backButton} onPress={() => setScreen('stats')}>
            <IconSymbol size={25} name="chevron.left" color="white" />
          </TouchableOpacity>
          <Text style={[styles.head, { color: colors.text }]}>Discover Locations</Text>
        </View>
        <MapView
          style={styles.mapPreview}
          region={myLocation ? {
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : undefined}
        >
          <Marker coordinate={myLocation} title="my location" />
          <Circle
            center={myLocation}
            radius={locationRadius}
            strokeColor="rgba(187, 155, 86, 1)"
            fillColor="rgba(187, 155, 86, 0.5)"
          />
        </MapView>
        <View style={[styles.bodyEl, { flexDirection: 'column' }]}>
          <Text style={[styles.sectBody, { marginBottom: 10 }]}>Locations near you:</Text>
          <FlatList scrollEnabled={false} style={{ width: '100%' }} data={newLocs} renderItem={locationComp} keyExtractor={item => item.id} />
          <View style={styles.spacer} />
        </View>
      </Animated.View>
    );
  }

  function MyMapLocationsView() {
    return (
      <View style={StyleSheet.absoluteFillObject}>
        <MapView
          style={StyleSheet.absoluteFillObject}
          region={myLocation ? {
            latitude: myLocation.latitude,
            longitude: myLocation.longitude,
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          } : undefined}
        >
          <Marker coordinate={myLocation} title="My Location" />
          {myLocs.map((item) => (
            <Marker key={item.id} coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.name}>
              <Image source={IMAGE_MAP[item.id]} style={{ width: 50, height: 50, opacity: 1, borderRadius: 25, borderColor: 'white', borderWidth: 2 }} />
            </Marker>
          ))}
        </MapView>
        <SafeAreaView style={{ position: 'absolute', top: 0, left: 0 }}>
          <TouchableOpacity style={styles.backButtonTop} onPress={() => setScreen('stats')}>
            <IconSymbol size={25} name="chevron.left" color="white" />
          </TouchableOpacity>
        </SafeAreaView>
      </View>
    );
  }

  return (
  <View style={[{ backgroundColor: colors.background, height: '100%', width: '100%',}]}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.safeBody}>
        <StatsView />
        <View style={[{height: 60}]}></View>
      </ScrollView>

      {/* Modal overlay views */}
      {screenSetting !== 'stats' && (
        <Animated.View
          entering={SlideInRight.duration(1000)}
          style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: colors.background,
            zIndex: 10,
          }}
        >
          {screenSetting === 'map-all' ? <MyMapLocationsView />
          :
          <ScrollView showsVerticalScrollIndicator={false} style={[styles.safeBody, { height: '100%' }]}>
            {screenSetting === 'collection' && <CollectionView />}
            {screenSetting === 'map' && <MyMapView />}
            <View style={[{height: 40}]}></View>
          </ScrollView>
          }

        </Animated.View>
      )}
    </View>
    );
}

const styles = StyleSheet.create({
  image: {
    width: 150,
    height: 150,
    borderRadius: 100,
  },
  spacer: {
    height: 60,
  },
   carouselImage: {
    height: 400,
    width: 300,
    borderRadius: 20,
  },
  safeBody: {
    marginTop: 40,
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
    borderRadius: 20,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  collectionThumb: {
    height: 100,
    borderRadius: 20,
    width: '100%'
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
  tabBarSpacer: {
    minHeight: 10,
    flexGrow: 1,
  },
  backButtonTop: {
    width: 40,
    height: 40,
    marginTop: 30,
    marginLeft: 10,
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
  mapSmallPreview: {
    width: '100%',
    height: 125,
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
    marginLeft: 10,
    backgroundColor: 'rgba(96, 96, 96, 0.4)',
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
    // margin: 20,
    gap: 15,
    alignItems: 'center',
  },
  bodyEl: {
    paddingLeft: 10,
    paddingRight: 10,
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  head: {
    fontSize: 30,
    fontWeight: '600',
    fontFamily: 'Radio Canada Big',
    textAlign: 'center',
  },
  textBox: {
    borderColor: 'gray',
    borderWidth: 1,
    width: 200,
  },
  stats: {
    width: '100%',
    borderRadius: 30,
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
    lineHeight: 33,
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
  },
});