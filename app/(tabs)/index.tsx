import { useFonts } from 'expo-font';
import React, { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useStrava } from '@/context/StravaContext';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useMystLoc } from '@/context/MystLocContext';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import {
  Dimensions, FlatList, Image, SafeAreaView, ScrollView,
  StyleSheet, Text, TouchableOpacity, useColorScheme, View,
} from 'react-native';
import Animated, {
  FadeIn, FadeInDown, interpolate, SlideInLeft, SlideInRight,
  useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, ZoomIn,
} from 'react-native-reanimated';
import MapView, { Circle, Marker } from 'react-native-maps';
import { runOnJS } from 'react-native-worklets';

// ─── Constants ───────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const C_ITEM_WIDTH = SCREEN_WIDTH * 0.8;
const C_MARGIN = 5;
const C_WIDTH = C_ITEM_WIDTH + C_MARGIN * 2;

const lightColors = { background: 'white', text: 'black', gray1: '#dcdcdc', gray2: '#787878', tealHighlight: "#67A09F"};
const darkColors  = { background: '#2C2C2C', text: 'white', gray1: '#404040', gray2: '#898989', tealHighlight: "#7ACDCB"};

// ─── Pure helpers (no component state needed) ────────────────────────────────

function meterToMile(meters: number) {
  return (meters / 1609).toFixed(2);
}

function secsToMin(secs: number) {
  let min = Math.floor(secs / 60);
  let result = '';
  if (min > 60) {
    result = `${(min / 60).toFixed(0)} HR, `;
    min = min % 60;
  }
  return result + min;
}

function dateFormat(isoDate: string) {
  const info = isoDate.split('-');
  return `${info[1]}/${info[2]}/${info[0]}`;
}

// ─── WalkthroughOverlay ───────────────────────────────────────────────────────

const WALKTHROUGH_STEPS = [
  { title: 'Glad we found you!', body: "Your city is full of secrets. Use photo clues and distance hints to track them down — just sync a Strava activity and start discovering. Here\'s everything you need to know.", image: require('@/assets/images/PQ-white.png') },
  { title: 'Your Stats',         body: 'Check your mileage, active time, and discoveries for the past 7 days.',           image: require('@/assets/images/tutorial/stats.png') },
  { title: 'Collection',         body: 'Look for locations close to you, including pictures of them and an interactive map.',              image: require('@/assets/images/tutorial/collection-1.png') },
  { title: 'Collection: Discover New', body: 'Look for locations close to you, including pictures of them and an interactive map.',     image: require('@/assets/images/tutorial/collection-2.png') },
  { title: 'Your Map',           body: 'View all of your discoveries on a map.',             image: require('@/assets/images/tutorial/map-view.png') },
  { title: 'Activity Log',       body: "See everything you\'ve uploaded to PicQuest.",        image: require('@/assets/images/tutorial/activity-log.png') },
];


const WalkthroughOverlay = memo(() => {
  const [walkthroughStep, setWalkthroughStep] = useState(0);

  useEffect(() => {
    (async () => {
      const seen = await SecureStore.getItemAsync('walkthroughSeen');
      if (!seen) {
        setWalkthroughStep(1);
        await SecureStore.setItemAsync('walkthroughSeen', 'true');
      }
    })();
  }, []);

  if (walkthroughStep === 0 || walkthroughStep > WALKTHROUGH_STEPS.length) return null;
  const step = WALKTHROUGH_STEPS[walkthroughStep - 1];

  return (
    <Animated.View entering={FadeIn.duration(300)} style={overlayStyles.backdrop}>
      <Animated.View entering={FadeInDown.duration(400)} style={[overlayStyles.card]}>
        <Text style={overlayStyles.title}>{step.title}</Text>
        <Text style={overlayStyles.body}>{step.body}</Text>
        <Image style={[{ minWidth: 100, maxWidth: 300, minHeight: 300, maxHeight: 300}]} resizeMode="contain" source={step.image} />
        <View style={overlayStyles.footer}>
          <Text style={{ color: 'gray' }}>{walkthroughStep}/{WALKTHROUGH_STEPS.length}</Text>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setWalkthroughStep(s => s + 1);
            }}
          >
            <Text style={overlayStyles.nextBtn}>
              {walkthroughStep < WALKTHROUGH_STEPS.length ? 'Next →' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Animated.View>
  );
});

const overlayStyles = StyleSheet.create({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)', zIndex: 100,
    justifyContent: 'center', alignItems: 'center',
  },
  card: {
    backgroundColor: '#2C2C2C', borderRadius: 20,
    padding: 25, margin: 20, gap: 12,
  },
  title: { color: 'white', fontFamily: 'Radio Canada Big', fontSize: 22, fontWeight: '600' },
  body:  { color: '#BEBEBE', fontSize: 16, fontFamily: 'Radio Canada Big' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  nextBtn: { color: '#7ACDCB', fontSize: 16, fontFamily: 'Radio Canada Big' },
});

// ─── ImageOverlay ─────────────────────────────────────────────────────────────

interface ImageOverlayProps {
  imageOverlay: any;
  setImageOverlay: (v: any) => void;
  foundActsLog: any[];
  colors: typeof lightColors;
  IMAGE_MAP: Record<string, any>;
  meterToMile: (m: number) => string;
}

const ImageOverlay = memo(({
  imageOverlay, setImageOverlay, foundActsLog, colors, IMAGE_MAP,
}: ImageOverlayProps) => {
  const notOtherTypes = ['Run', 'Walk', 'TrailRun', 'Walk', 'Ride', 'Run'];
  if (imageOverlay == null) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} style={overlayStyles.backdrop}>
      <Animated.View entering={FadeInDown.duration(400)} style={{
        borderRadius: 20, padding: 25, margin: 10, gap: 12, width: '100%', display: 'flex', alignItems: 'center'
      }}>
        {imageOverlay === 'activity-log' ? (
          <Animated.View entering={ZoomIn} style={[{
            backgroundColor: colors.gray1, paddingVertical: 15, borderRadius: 25, width: '100%',
          }]}>
            <View style={[styles.row, {alignItems: 'center', paddingHorizontal: 15, marginBottom: 10}]}>
              <Text style={{ fontSize: 20, color: colors.gray2, flex: 1 }}>
                {foundActsLog[1] ? dateFormat(foundActsLog[1]) : ''}
              </Text>
              <TouchableOpacity
                style={[styles.backButton, {}]}
                onPress={() => setImageOverlay(null)}
              >
                <IconSymbol size={20} name="xmark" color="white" />
              </TouchableOpacity>
            </View>
            {foundActsLog[0]?.map((item: any, index: number) => (
              <View key={index} style={{ paddingHorizontal: 20, borderRadius: 10, width: '100%'}}>
                <Text style={{ fontWeight: '400', fontSize: 18, color: colors.text }}>{item.name}</Text>
                <View style={[styles.row, {alignItems: 'center'}]}>
                  <Text style={{ fontWeight: '200', fontSize: 16, color: colors.text }}>
                    {`${meterToMile(item.distance)} MI`}
                  </Text>
                  {(item.sport_type == 'Run' || item.sport_type == 'TrailRun') && <IconSymbol size={25} name="figure.run" color={colors.tealHighlight} />}
                  {(item.sport_type == 'Walk' || item.sport_type == 'Hike') && <IconSymbol size={25} name="figure.walk" color={colors.tealHighlight} />}
                  {(item.sport_type == 'Ride' || item.sport_type == 'MountainBikeRide') && <IconSymbol size={25} name="figure.outdoor.cycle" color={colors.tealHighlight} />}
                  {!notOtherTypes.includes(item.sport_type) && <IconSymbol size={2} name="heart.badge.bolt" color={colors.tealHighlight} />}
                </View>
                
                <View style={[{marginTop: 5, gap: 5}]}>
                  {item.discoveries?.map((ditem: any, dindex: number) => (
                    <View key={dindex} style={{ flexDirection: 'row', marginLeft: 15, alignItems: 'center', gap:5 }}>
                      <Image
                        source={IMAGE_MAP[ditem.id]}
                        style={{ width: 25, height: 25, borderRadius: 25, borderColor: 'white', borderWidth: 1 }}
                      />
                      <Text style={{ color: colors.gray2 }}>{ditem.name}</Text>
                    </View>
                  ))}
                </View>
                {index < foundActsLog[0].length - 1 && (
                  <View style={{ width: '90%', backgroundColor: 'gray', opacity: 0.5, height: 1, marginTop: 10, marginBottom: 10 }} />
                )}
              </View>
            ))}
          </Animated.View>
        ) : (
          <Animated.View entering={ZoomIn}>
            <TouchableOpacity
              style={[styles.backButton, { position: 'absolute', zIndex: 1, top: 10, right: 10}]}
              onPress={() => setImageOverlay(null)}
            >
              <IconSymbol size={25} name="xmark" color="white" />
            </TouchableOpacity>
            <Image style={{ width: 350, maxHeight: 500, borderRadius: 20 }} source={imageOverlay} />
          </Animated.View>
        )}
      </Animated.View>
    </Animated.View>
  );
});

// ─── CarouselItem ─────────────────────────────────────────────────────────────

interface CarouselItemProps {
  item: any;
  index: number;
  scrollX: any;
  colors: typeof lightColors;
  IMAGE_MAP: Record<string, any>;
}

const CarouselItem = memo(({ item, index, scrollX, colors, IMAGE_MAP }: CarouselItemProps) => {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{
      scale: interpolate(
        scrollX.value,
        [(index - 1) * C_WIDTH, index * C_WIDTH, (index + 1) * C_WIDTH],
        [0.85, 1, 0.85],
        'clamp',
      ),
    }],
  }));

  return (
    <Animated.View style={[{ marginHorizontal: C_MARGIN }, animatedStyle]}>
      {item?.id && (
        <Image style={styles.carouselImage} source={IMAGE_MAP[item.id]} resizeMode="cover" />
      )}
      <View style={styles.carouselTextContainer}>
        <Text style={{ color: colors.text, fontFamily: 'Radio Canada Big', fontSize: 20 }}>{item.name}</Text>
        <Text style={[styles.sectBody, {color: colors.gray2}]}>FOUND {item.date}</Text>
      </View>
    </Animated.View>
  );
});

// ─── LocationsScroll ──────────────────────────────────────────────────────────

interface LocationsScrollProps {
  myLocs: any[];
  colors: typeof lightColors;
  IMAGE_MAP: Record<string, any>;
}

const LocationsScroll = memo(({ myLocs, colors, IMAGE_MAP }: LocationsScrollProps) => {
  const scrollX = useSharedValue<number>(0);
  const currentIndex = useSharedValue<number>(0);
  const sidePadding = (SCREEN_WIDTH - C_ITEM_WIDTH) / 2;

  const triggerHaptic = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

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
      snapToInterval={C_WIDTH}
      decelerationRate="fast"
      contentContainerStyle={{ paddingHorizontal: sidePadding }}
    >
      {[...myLocs].reverse().map((item, index) => (
        <CarouselItem
          key={index}
          item={item}
          index={index}
          scrollX={scrollX}
          colors={colors}
          IMAGE_MAP={IMAGE_MAP}
        />
      ))}
    </Animated.ScrollView>
  );
});

// ─── CalendarSquares ──────────────────────────────────────────────────────────

interface CalendarSquaresProps {
  myActivities: any[];
  colors: typeof lightColors;
  onDayPress: (acts: any[], dateISO: string) => void;
}

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];

const CalendarSquares = memo(({ myActivities, colors, onDayPress }: CalendarSquaresProps) => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth   = new Date(viewYear, viewMonth + 1, 0).getDate();

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  }

  function getActivitiesWithDate(date: string) {
    return myActivities.filter(a => a.start_date.split('T')[0] === date);
  }

  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center' }}>
        <TouchableOpacity style={{ borderRadius: 15, padding: 5 }} onPress={prevMonth}>
          <IconSymbol name="chevron.left" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={{ color: colors.text, fontSize: 15 }}>{MONTH_NAMES[viewMonth]} {viewYear}</Text>
        <TouchableOpacity style={{ borderRadius: 15, padding: 5 }} onPress={nextMonth}>
          <IconSymbol name="chevron.right" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {Array.from({ length: firstDayIndex }).map((_, i) => (
          <View key={`empty-${i}`} style={[styles.calendarSquare, { opacity: 0 }]} />
        ))}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const lookDate    = new Date(viewYear, viewMonth, i + 1);
          const lookDateISO = lookDate.toISOString().split('T')[0];
          const foundActs   = getActivitiesWithDate(lookDateISO);

          return foundActs.length > 0 ? (
            <TouchableOpacity
              key={`day-${i}`}
              onPress={() => onDayPress(foundActs, lookDateISO)}
              style={[styles.calendarSquare, { backgroundColor: '#50778E' }]}
            />
          ) : (
            <View key={`day-${i}`} style={[styles.calendarSquare, { backgroundColor: 'gray' }]} />
          );
        })}
      </View>
    </View>
  );
});

// ─── StatsView ────────────────────────────────────────────────────────────────

interface StatsViewProps {
  athlete: any;
  colors: typeof lightColors;
  thisWeekMileage: number;
  thisWeekTime: number;
  thisWeekObjects: number;
  myLocs: any[];
  myActivities: any[];
  myLocation: { latitude: number; longitude: number };
  IMAGE_MAP: Record<string, any>;
  getTrend: (stat: string) => React.ReactNode;
  setScreen: (s: string) => void;
  setImageOverlay: (v: any) => void;
  setFoundActsLog: (v: any) => void;
}

const StatsView = memo(({
  athlete, colors, thisWeekMileage, thisWeekTime, thisWeekObjects,
  myLocs, myActivities, myLocation, IMAGE_MAP, getTrend, setScreen,
  setImageOverlay, setFoundActsLog,
}: StatsViewProps) => {
  const [activityDropdownOpen, setActivityDropdownOpen] = useState(false);

  const handleDayPress = useCallback((acts: any[], dateISO: string) => {
    setFoundActsLog([acts, dateISO]);
    setImageOverlay('activity-log');
  }, [setFoundActsLog, setImageOverlay]);

  return (
    <Animated.View
      style={[styles.body, { backgroundColor: colors.background, height: '100%', margin: 15 }]}
      entering={FadeInDown.duration(1000)}
    >
      <Text style={[styles.head, { color: colors.text }]}>Welcome, {athlete?.firstname}</Text>
      <Image source={{ uri: athlete?.profile }} style={styles.image} />

      <View style={styles.stats}>
        <Text style={[styles.sectHead, { color: colors.text }]}>THIS WEEK:</Text>
        <View style={styles.row}>
          <Text style={[styles.sectBody, {color: colors.gray2}]}>{'MILEAGE\nACTIVE TIME\nDISCOVERIES'}</Text>
          <View style={{ flexDirection: 'column', flex: 1 }}>
            {[
              { label: `${meterToMile(thisWeekMileage)} MI`, trend: 'mile' },
              { label: `${secsToMin(thisWeekTime)} MIN`,      trend: 'time' },
              { label: `${thisWeekObjects}`,                  trend: 'obj'  },
            ].map(({ label, trend }) => (
              <View key={trend} style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={[styles.sectBody, { marginRight: 5, textAlign: 'right', flex: 1, color: colors.text }]}>
                  {label}
                </Text>
                {getTrend(trend)}
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.halfbox, {backgroundColor: colors.gray1}]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('collection'); }}
        >
          <Text style={[styles.sectHead, { color: colors.text, textAlign: 'center' }]}>COLLECTION</Text>
          {myLocs.length > 0 ? (
            <Image style={styles.collectionThumb} source={IMAGE_MAP[myLocs[myLocs.length - 1].id]} />
          ) : (
            <View style={styles.noLocs}>
              <Text style={{ color: 'gray', textAlign: 'center' }}>Nothing found yet!</Text>
            </View>
          )}
          <Text style={{ color: colors.gray2, textAlign: 'center', padding: 10 }}>
            {myLocs.length} {myLocs.length === 1 ? 'DISCOVERY' : 'DISCOVERIES'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.halfbox, {backgroundColor: colors.gray1}]}
          onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft); setScreen('map-all'); }}
        >
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

      {myActivities.length > 0 && (
        <TouchableOpacity
          style={[styles.activityLog, {backgroundColor: colors.gray1}]}
          onPress={() => setActivityDropdownOpen(o => !o)}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.sectHead, { color: colors.text, flex: 1 }]}>ACTIVITY LOG</Text>
            <IconSymbol size={25} name="chevron.down" color={colors.text} />
          </View>
          {activityDropdownOpen && (
            <CalendarSquares
              myActivities={myActivities}
              colors={colors}
              onDayPress={handleDayPress}
            />
          )}
        </TouchableOpacity>
      )}

      <View style={styles.tabBarSpacer} />
    </Animated.View>
  );
});

// ─── CollectionView ───────────────────────────────────────────────────────────

interface CollectionViewProps {
  colors: typeof lightColors;
  myLocs: any[];
  IMAGE_MAP: Record<string, any>;
  setScreen: (s: string) => void;
}

const CollectionView = memo(({ colors, myLocs, IMAGE_MAP, setScreen }: CollectionViewProps) => (
  <Animated.View
    style={[styles.body, { backgroundColor: colors.background, height: '100%', padding: 5 }]}
    entering={FadeInDown.duration(1000)}
  >
    <View style={{ width: '100%', marginTop: 0 }}>
      <TouchableOpacity style={styles.backButton} onPress={() => setScreen('stats')}>
        <IconSymbol size={25} name="chevron.left" color={"white"} />
      </TouchableOpacity>
      <Text style={[styles.head, { color: colors.text }]}>My Collection</Text>
    </View>
    <View style={{ flexDirection: 'column', flex: 1, marginBottom: 0 }}>
      {myLocs.length > 0 ? (
        <LocationsScroll myLocs={myLocs} colors={colors} IMAGE_MAP={IMAGE_MAP} />
      ) : (
        <Text style={[styles.bodyEl, { color: 'grey', maxWidth: 350, fontSize: 16, textAlign: 'center' }]}>
          No locations yet! Try the discover button to look for new ones!
        </Text>
      )}
    </View>
    <View style={[styles.body, styles.bodyEl]}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: 'rgba(94, 141, 140, 1)' }]}
        onPress={() => setScreen('map')}
      >
        <Text style={styles.buttonText}>Discover New</Text>
      </TouchableOpacity>
    </View>
  </Animated.View>
));

// ─── MyMapView ────────────────────────────────────────────────────────────────

interface MyMapViewProps {
  colors: typeof lightColors;
  myLocation: { latitude: number; longitude: number };
  newLocs: any[];
  setScreen: (s: string) => void;
  setImageOverlay: (v: any) => void;
  getDistanceAway: (item: any) => string;
}

const MyMapView = memo(({
  colors, myLocation, newLocs, setScreen, setImageOverlay, getDistanceAway,
}: MyMapViewProps) => {
  const [locationRadius, setLocationRadius]   = useState(0);
  const [selectedLocation, selectNewLocation] = useState<any>(null);

  const locationComp = useCallback(({ item, index }: { item: any; index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 100)}>
      <TouchableOpacity
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid);
          selectNewLocation(item);
          setLocationRadius(parseFloat(getDistanceAway(item)) / 0.000621371);
        }}
        style={[styles.locationList, { marginBottom: 10, backgroundColor: colors.gray1}]}
      >
        {selectedLocation === item ? (
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={() => setImageOverlay(item.image)}>
              <Image style={{ width: 200, height: 200, borderRadius: 20 }} source={item.image} />
            </TouchableOpacity>
            <View style={{ flexDirection: 'column', flex: 1 }}>
              <Text style={{ fontWeight: '500', color: colors.text }}>{item.name}</Text>
              <Text style={{ fontWeight: '200', color: colors.text }}>{getDistanceAway(item)} mi away</Text>
            </View>
          </View>
        ) : (
          <View style={{ flexDirection: 'column', gap: 10 }}>
            <Text style={{ fontWeight: '500', color: colors.text }}>{item.name}</Text>
            <Text style={{ fontWeight: '200', color: colors.text }}>{getDistanceAway(item)} mi away</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  ), [selectedLocation, colors, getDistanceAway, setImageOverlay]);

  return (
    <Animated.View
      style={[styles.body, { backgroundColor: colors.background, height: '100%' }]}
      entering={FadeInDown.duration(700)}
    >
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
          strokeColor={colors.tealHighlight}
          fillColor="rgba(122, 205, 203, 0.5)"
        />
      </MapView>
      <View style={[styles.bodyEl, { flexDirection: 'column'}]}>
        <Text style={[styles.sectBody, { marginBottom: 10, color: colors.gray2}]}>Locations near you:</Text>
        <FlatList
          scrollEnabled={false}
          style={{ width: '100%' }}
          data={newLocs}
          renderItem={locationComp}
          keyExtractor={item => item.id}
        />
        <View style={styles.spacer} />
      </View>
    </Animated.View>
  );
});

// ─── MyMapLocationsView ───────────────────────────────────────────────────────

interface MyMapLocationsViewProps {
  myLocation: { latitude: number; longitude: number };
  myLocs: any[];
  IMAGE_MAP: Record<string, any>;
  setScreen: (s: string) => void;
}

const MyMapLocationsView = memo(({ myLocation, myLocs, IMAGE_MAP, setScreen }: MyMapLocationsViewProps) => (
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
      {myLocs.map(item => (
        <Marker key={item.id} coordinate={{ latitude: item.latitude, longitude: item.longitude }} title={item.name}>
          <Image
            source={IMAGE_MAP[item.id]}
            style={{ width: 50, height: 50, borderRadius: 25, borderColor: 'white', borderWidth: 2 }}
          />
        </Marker>
      ))}
    </MapView>
    <SafeAreaView style={{ position: 'absolute', top: 0, left: 0 }}>
      <TouchableOpacity style={styles.backButtonTop} onPress={() => setScreen('stats')}>
        <IconSymbol size={25} name="chevron.left" color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  </View>
));

// ─── HomeScreen ───────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const [fontsLoaded] = useFonts({
    'Radio Canada Big': require('../../assets/fonts/Radio_Canada_Big/RadioCanadaBig.ttf'),
  });

  const colorScheme = useColorScheme();
  const colors      = colorScheme === 'dark' ? darkColors : lightColors;

  const { athlete, fetchFromStrava } = useStrava();
  const { myLocs, myActivities, newLocs, IMAGE_MAP } = useMystLoc();

  const [thisWeekMileage, setThisWeekMile]    = useState(0);
  const [thisWeekTime,    setThisWeekTime]    = useState(0);
  const [thisWeekObjects, setThisWeekObjects] = useState(0);

  const [screenSetting, setScreen]      = useState('stats');
  const [imageOverlay,  setImageOverlay] = useState<any>(null);
  const [foundActsLog,  setFoundActsLog] = useState<any[]>([]);

  const [myLocation, setMyLocation] = useState({ latitude: 38.985969, longitude: -76.942562 });

  // ── Data loading ──────────────────────────────────────────────────────────

  useEffect(() => {
    if (!athlete?.id) return;
    (async () => {
      await fetchFromStrava(`/athletes/${athlete.id}/stats`);
    })();
  }, [athlete]);

  useEffect(() => {
    const { thisWeek } = getThisWeekLastWeek();
      setThisWeekMile(thisWeek[0]);
      setThisWeekTime(thisWeek[1]);
      setThisWeekObjects(thisWeek[2]);
  }, [myActivities]);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const location = await Location.getCurrentPositionAsync({});
      setMyLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    })();
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────

  function getThisWeekLastWeek() {
    const thisWeekStart = new Date(Date.now()); thisWeekStart.setDate(thisWeekStart.getDate() - 7);
    const lastWeekStart = new Date(Date.now()); lastWeekStart.setDate(lastWeekStart.getDate() - 14);
    const thisWeek = [0, 0, 0];
    const lastWeek = [0, 0, 0];

    myActivities.forEach(act => {
      const actDate = new Date(act?.start_date);
      if (actDate >= thisWeekStart) {
        thisWeek[0] += act.distance; thisWeek[1] += act.moving_time;
      } else if (actDate < thisWeekStart && actDate >= lastWeekStart) {
        lastWeek[0] += act.distance; lastWeek[1] += act.moving_time;
      }
    });
    myLocs.forEach(loc => {
      const locDate = new Date(loc.timeStamp);
      if (locDate >= thisWeekStart) thisWeek[2] += 1;
      else if (locDate < thisWeekStart && locDate >= lastWeekStart) lastWeek[2] += 1;
    });
    return { thisWeek, lastWeek };
  }

  const getTrend = useCallback((stat: string) => {
    const { thisWeek, lastWeek } = getThisWeekLastWeek();
    let change = 0;
    if (stat === 'mile') change = thisWeek[0] - lastWeek[0];
    else if (stat === 'time') change = thisWeek[1] - lastWeek[1];
    else change = thisWeek[2] - lastWeek[2];

    if (change > 0) return <IconSymbol size={20} name="arrow.up.right" color="green" />;
    if (change < 0) return <IconSymbol size={20} name="arrow.down.right" color="red" />;
    return <IconSymbol size={20} name="arrow.right" color="rgb(80, 119, 142)" />;
  }, [myActivities, myLocs]);

  const getDistanceAway = useCallback((item: any) => {
    const dLat = myLocation.latitude  - item.latitude;
    const dLon = myLocation.longitude - item.longitude;
    return Math.sqrt((69 * dLat) ** 2 + (69 * dLon) ** 2).toFixed(2);
  }, [myLocation]);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View style={{ backgroundColor: colors.background, height: '100%', width: '100%' }}>
      <ScrollView showsVerticalScrollIndicator={false} style={styles.safeBody}>
        <StatsView
          athlete={athlete}
          colors={colors}
          thisWeekMileage={thisWeekMileage}
          thisWeekTime={thisWeekTime}
          thisWeekObjects={thisWeekObjects}
          myLocs={myLocs}
          myActivities={myActivities}
          myLocation={myLocation}
          IMAGE_MAP={IMAGE_MAP}
          getTrend={getTrend}
          setScreen={setScreen}
          setImageOverlay={setImageOverlay}
          setFoundActsLog={setFoundActsLog}
        />
        <View style={{ height: 60 }} />
      </ScrollView>

      {/* These overlays are siblings to ScrollView — they never cause it to remount */}
      <WalkthroughOverlay />

      <ImageOverlay
        imageOverlay={imageOverlay}
        setImageOverlay={setImageOverlay}
        foundActsLog={foundActsLog}
        colors={colors}
        IMAGE_MAP={IMAGE_MAP}
        meterToMile={meterToMile}
      />

      {screenSetting !== 'stats' && (
        <Animated.View
          entering={SlideInRight.duration(1000)}
          exiting={SlideInLeft.duration(1000)}
          style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: colors.background, zIndex: 10,
          }}
        >
          {screenSetting === 'map-all' ? (
            <MyMapLocationsView
              myLocation={myLocation}
              myLocs={myLocs}
              IMAGE_MAP={IMAGE_MAP}
              setScreen={setScreen}
            />
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={[styles.safeBody, { height: '100%' }]}>
              {screenSetting === 'collection' && (
                <CollectionView
                  colors={colors}
                  myLocs={myLocs}
                  IMAGE_MAP={IMAGE_MAP}
                  setScreen={setScreen}
                />
              )}
              {screenSetting === 'map' && (
                <MyMapView
                  colors={colors}
                  myLocation={myLocation}
                  newLocs={newLocs}
                  setScreen={setScreen}
                  setImageOverlay={setImageOverlay}
                  getDistanceAway={getDistanceAway}
                />
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          )}
        </Animated.View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  image: { width: 150, height: 150, borderRadius: 100 },
  spacer: { height: 60 },
  carouselImage: { height: 400, width: 300, borderRadius: 20 },
  safeBody: { marginTop: 40 },
  activityLog: {
    borderRadius: 30, width: '100%',
    padding: 15, paddingHorizontal: 16,
    alignItems: 'center', gap: 10,
  },
  noLocs: {
    borderStyle: 'dashed', borderColor: '#7a7a7a', borderWidth: 1,
    padding: 15, borderRadius: 20, height: 100,
    alignItems: 'center', justifyContent: 'center',
  },
  collectionThumb: { height: 100, borderRadius: 20, width: '100%' },
  calendarSquare:  { width: 40, height: 40, borderRadius: 10 },
  carouselTextContainer: {
    marginTop: 10, flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center', gap: 10,
  },
  tabBarSpacer: { minHeight: 10, flexGrow: 1 },
  backButtonTop: {
    width: 40, height: 40, marginTop: 30, marginLeft: 10,
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, padding: 10,
    backgroundColor: 'rgba(0,0,0,0.4)',
    position: 'absolute', top: 10, left: 10, zIndex: 20,
  },
  mapPreview:      { width: '100%', height: 300, margin: 10, alignItems: 'center', justifyContent: 'center' },
  mapSmallPreview: { width: '100%', height: 125, borderRadius: 20 },
  button:          { width: '100%', margin: 10, backgroundColor: 'rgba(80, 119, 142, 1)', borderRadius: 10, padding: 10 },
  backButton: {
    width: 40, height: 40, marginLeft: 10,
    backgroundColor: 'rgba(96, 96, 96, 0.4)',
    alignItems: 'center', justifyContent: 'center',
    borderRadius: 30, padding: 10,
  },
  buttonText:   { color: 'white', textAlign: 'center', fontSize: 17 },
  body:         { flexDirection: 'column', fontFamily: 'Radio Canada Big', gap: 15, alignItems: 'center' },
  bodyEl:       { paddingLeft: 15, paddingRight: 15, width: '100%' },
  row:          { flexDirection: 'row', gap: 10, width: '100%' },
  head:         { fontSize: 30, fontWeight: '600', fontFamily: 'Radio Canada Big', textAlign: 'center' },
  textBox:      { borderColor: 'gray', borderWidth: 1, width: 200 },
  stats:        { width: '100%', borderRadius: 30, padding: 10 },
  locationList: { width: '100%', borderRadius: 30, padding: 20 },
  sectHead:     { fontSize: 18, lineHeight: 33, fontWeight: '500' },
  sectBody:     { color: '#BEBEBE', fontSize: 16, lineHeight: 25 },
  halfbox: {
    flex: 1, height: 200, borderRadius: 30, padding: 20,
  },
});