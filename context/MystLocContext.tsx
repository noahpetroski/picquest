import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';
import { StravaProvider, useStrava } from '@/context/StravaContext';

const STORAGE_KEYS = {
    MY_LOCATIONS: 'my_locations',
    MY_ACTIVITIES: 'my_activities',
};

const MYSTERY_LOCATIONS = [
    { id: 1, latitude: 38.987305, longitude: -76.924149, name: 'Misty Hollow Loop',    image: require('@/assets/images/myst-locs/lake-loop.png'),   date: '' },
    { id: 2, latitude: 38.988015, longitude: -76.949653, name: 'Crimson Stride Circle',  image: require('@/assets/images/myst-locs/kehoe-track.png'), date: '' },
    { id: 3, latitude: 38.993379, longitude: -76.942130, name: 'Shadowy Pulse Hang', image: require('@/assets/images/myst-locs/sph.png'),          date: '' },
    { id: 4, latitude: 38.998737, longitude: -76.932851, name: 'Golden Acre Grove',     image: require('@/assets/images/myst-locs/acredale.png'),     date: '' },
    { id: 5, latitude: 38.986017, longitude: -76.942550, name: 'Whispering Field Plaza',     image: require('@/assets/images/myst-locs/mckeldin.png'),     date: '' },
];
  

const CHECK_IN_RADIUS = 0.000395; // ~50 meters

// --- Helpers ---

async function loadFromStorage(key) {
    try {
        const raw = await AsyncStorage.getItem(key);
        return raw ? JSON.parse(raw) : [];
    } catch (error) {
        console.error(`Error loading "${key}" from storage:`, error);
        return [];
    }
}

async function saveToStorage(key, value) {
    try {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error saving "${key}" to storage:`, error);
    }
}

// --- Context ---

const MystLocContext = createContext({
    mysteryLocations: MYSTERY_LOCATIONS,
    newLocs: [],
    myLocs: [],
    myActivities: [],
    getMyLocs: async () => [],
    addLocation: async () => null,
    addActivity: async () => null,
    resetProgress: async () => null,
    checkInRadius: () => [],
});

export function MystLocProvider({ children }) {
    const {athlete, fetchFromStrava} = useStrava();
    const [myLocs, setMyLocs] = useState([]);
    const [newLocs, setNewLocs] = useState([]);
    const [myActivities, setMyActivities] = useState([]);

    // Load persisted data on mount
    useEffect(() => {
        (async () => {
            const [locs, activities] = await Promise.all([
                loadFromStorage(STORAGE_KEYS.MY_LOCATIONS),
                loadFromStorage(STORAGE_KEYS.MY_ACTIVITIES),
            ]);
            setMyLocs(locs);
            setMyActivities(activities);
        })();
    }, []);

    // Keep newLocs in sync whenever myLocs changes
    useEffect(() => {
        const discoveredIds = new Set(myLocs.map(l => l.id));
        setNewLocs(MYSTERY_LOCATIONS.filter(l => !discoveredIds.has(l.id)));
    }, [myLocs]);

    // Returns a snapshot of saved locations
    function getMyLocs() {
        return myLocs;
    }

    function getMyActivities() {
        return myActivities;
    }

    // Adds one location or an array of locations, then persists
    async function addLocation(newLocation: any) {
        setMyLocs(prev => {
            const incoming = Array.isArray(newLocation) ? newLocation : [newLocation];
            // Avoid duplicates by id
            const existingIds = new Set(prev.map(l => l.id));
            const toAdd = incoming.filter(l => !existingIds.has(l.id));
            const foundDate = new Date(Date.now()).toDateString().toUpperCase();
            const toAddDate = toAdd.map(i => ({ ...i, date: foundDate}));
            const updated = [...prev, ...toAddDate];
            saveToStorage(STORAGE_KEYS.MY_LOCATIONS, updated); // fire-and-forget inside setState            
            return updated;
        });
    }

    // Appends a new activity and persists
    async function addActivity(newActivity: any) {
        setMyActivities(prev => {
            const updated = [...prev, newActivity];
            saveToStorage(STORAGE_KEYS.MY_ACTIVITIES, updated);
            return updated;
        });
    }

    // Clears all progress from state and storage
    async function resetProgress() {
        await Promise.all([
            saveToStorage(STORAGE_KEYS.MY_LOCATIONS, []),
            saveToStorage(STORAGE_KEYS.MY_ACTIVITIES, []),
        ]);
        setMyLocs([]);
        setMyActivities([]);
    }

    // Checks whether any route points fall within the radius of undiscovered locations
    function checkInRadius(routePoints: any) {
        const found = [];
        for (const { latitude: lat, longitude: lon } of routePoints) {
            for (const point of newLocs) {
                if (
                    lat >= point.latitude - CHECK_IN_RADIUS &&
                    lat <= point.latitude + CHECK_IN_RADIUS &&
                    lon >= point.longitude - CHECK_IN_RADIUS &&
                    lon <= point.longitude + CHECK_IN_RADIUS &&
                    !found.includes(point)
                ) {
                    found.push(point);
                }
            }
        }
        return found;
    }

    return (
        <MystLocContext.Provider value={{
            mysteryLocations: MYSTERY_LOCATIONS,
            newLocs,
            getMyLocs,
            myLocs,
            myActivities,
            addLocation,
            addActivity,
            resetProgress,
            checkInRadius,
        }}>
            {children}
        </MystLocContext.Provider>
    );
}

export function useMystLoc() {
    return useContext(MystLocContext);
}