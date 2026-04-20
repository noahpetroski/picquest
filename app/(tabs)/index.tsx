import { Button, FlatList, ScrollView, TouchableOpacity, StyleSheet, Text, TextInput, useColorScheme, View, SafeAreaView, Image, Dimensions} from 'react-native';
import { useFonts } from'expo-font';
import React, { useState, useEffect, act, useRef } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';
import { Redirect } from 'expo-router';
import Animated, { FadeInDown, SlideInRight, ZoomIn, useSharedValue, useAnimatedScrollHandler, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMystLoc } from '@/context/MystLocContext';
import * as Location from 'expo-location';
// import polyline from '@mapbox/polyline';
import MapView, { Marker, Polygon } from 'react-native-maps';
import { runOnJS, scheduleOnRN } from 'react-native-worklets';
import { ExpandingDot } from 'react-native-animated-pagination-dots';

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
  const [thisWeekMileage, setThisWeekMile] = useState(0);
  const [thisWeekTime, setThisWeekTime] = useState(0);

  const [screenSetting, setScreen] = useState('stats');

  const {mysteryLocations, myLocs, myActivities, newLocs, addLocation} = useMystLoc();

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
    return {thisWeek, lastWeek};
  }

  function getTrend(stat) {
    const {thisWeek, lastWeek} = getThisWeekLastWeek();
    let change;
    if (stat == 'mile') {
      change = thisWeek[0] - lastWeek[0];
    } else if (stat == 'time') {
      change = thisWeek[1] - lastWeek[1];
    } else { // switch to objs when i implement them
      change = 0;
    }
    let trend = change;
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

  const [myLocation, setMyLocation] = useState({latitude: 38.985969, longitude: -76.942562});

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

  const [selectedLocation, selectNewLocation] = useState(null);
  const [polygonCoords, setPolygonCoords] = useState<{ latitude: number; longitude: number }[]>([]);
  // add ability to look at picture of location when searching
  // add pagination

  function getMapPolygon(radius) {
    let numCoords = 20;
    let newCoords = [];
    const angle = 2 * Math.PI / numCoords;
    for (let i = 0; i < numCoords; i++) {
      let newLat = myLocation.latitude + (radius * Math.cos(i * angle));
      let newLon = myLocation.longitude + (radius * Math.sin(i * angle));
      newCoords.push({latitude: newLat, longitude: newLon});
    }
    setPolygonCoords(newCoords);
  }

  const locationComp = ({ item, index }) => {
    return (
      <Animated.View entering={FadeInDown.delay(index*100)}>
        <TouchableOpacity onPress={() => {Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid); selectNewLocation(item); getMapPolygon(getDistanceAway(item));}} style={[styles.stats, {marginBottom: 10}]}>
          {selectedLocation == item ? 
            <View>
              <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
              <Text style={[{fontWeight: 200, color: colors.text}]}>{getDistanceAway(item)} mi away</Text>
            </View>
          :
            <View style={[{display: 'flex', flexDirection: 'row'}]}>
              <Image source={item.image}/>
              <View style={[{display: 'flex', flexDirection: 'column'}]}>
                <Text style={[{fontWeight: 500, color: colors.text}]}>{item.name}</Text>
                <Text style={[{fontWeight: 200, color: colors.text}]}>{getDistanceAway(item)} mi away</Text>
              </View>
            </View>
          }
        </TouchableOpacity>
      </Animated.View>
    )
  }

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
        {item?.image && (<Image style={styles.carouselImage} source={item.image} resizeMode="cover"/>)}
        <View style={styles.carouselTextContainer}>
          <Text style={[{color: colors.text, fontFamily: 'Radio Canada Big', fontSize: 20}]}>{item.name}</Text>
          <Text style={styles.sectBody}>ACQUIRED {item.date}</Text>
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
          {myLocs.map((item, index) => (<CarouselItem item={item} index={index} scrollX={scrollX} key={index}></CarouselItem>))}
          {/* <ExpandingDot 
          data={myLocs}
          expandingDotWidth={30}
          scrollX={scrollX.value}
          inActiveDotOpacity={0.6}
          dotStyle={{
              width: 10,
              height: 10,
              backgroundColor: '#347af0',
              borderRadius: 5,
              marginHorizontal: 5
          }}
          containerStyle={{
              top: 30,
          }}/> */}
      </Animated.ScrollView>
    )
  }

  function StatsView() {
    const itemImage = require(`@/assets/images/myst-locs/kehoe-track.png`);
    return (
      <Animated.View style={[styles.body, {backgroundColor: colors.background, height: '100%', margin: 15}]} entering={FadeInDown.duration(1000)}>
        <Text style={[styles.head, {color: colors.text}]}>Welcome Back, {athlete?.firstname}</Text> 
        <Image source={{ uri: athlete?.profile}} style={styles.image}></Image>
        <View style={styles.stats}>
          <Text style={[styles.sectHead, {color: colors.text}]}>THIS WEEK:</Text>
          <View style={styles.row}>
            <Text style={[styles.sectBody]}>{"MILEAGE\nACTIVE TIME\nDISCOVERIES"}</Text>
            <Text style={[styles.sectBody, {textAlign: 'right', flex: 1, color: colors.text}]}>{`${meterToMile(thisWeekMileage)} MI\n${secsToMin(thisWeekTime)} MIN\n ${myLocs.length}`}</Text>
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
        <View style={[{display: 'flex', flexDirection: 'column', flex: 1, marginBottom: 0, paddingBottom: 0}]}>
          {myLocs.length > 0 ? <LocationsScroll></LocationsScroll> : <Text style={[styles.bodyEl, {color: 'grey', maxWidth: 350, fontSize: 16, textAlign: 'center'}]}>No locations yet! Try the discover button to look for new ones!</Text>}
        </View>
        <View style={[styles.body, styles.bodyEl]}>
          <TouchableOpacity style={styles.button} onPress={() => setScreen('map')}><Text style={styles.buttonText}>Discover New</Text></TouchableOpacity>
        </View>
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
          <Polygon
            coordinates={polygonCoords}
            fillColor="rgba(100, 200, 200, 0.5)" // Semi-transparent fill
            strokeColor="#000" // Border color
            strokeWidth={2}
          />
        </MapView>
        <View style={[styles.bodyEl, {display: 'flex', flexDirection: 'column'}]}>
          <Text style={[styles.sectBody, {marginBottom: 10}]}>Locations near you:</Text>
          <FlatList scrollEnabled={false} style={[{width: '100%'}]} data={newLocs} renderItem={locationComp} keyExtractor={item => item.id} />
        </View>
      </Animated.View>
    );

  }

  return (
    <SafeAreaView style={[{backgroundColor: colors.background, height: '100%', width: '100%'},]}>
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
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Radio Canada Big',
    marginTop: 10,
    gap: 15,
    alignItems: 'center',
  },
  bodyEl: {
    paddingLeft: 10,
    paddingRight: 10,
    width:'100%',
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
