import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEYS = {
    MY_LOCATIONS: 'my_locations',
    MY_ACTIVITIES: 'my_activities',
};

const IMAGE_MAP: Record<number, any> = {
  1: require('@/assets/images/myst-locs/lake-loop.png'),
  2: require('@/assets/images/myst-locs/kehoe-track.png'),
  3: require('@/assets/images/myst-locs/sph.png'),
  4: require('@/assets/images/myst-locs/acredale.png'),
  5: require('@/assets/images/myst-locs/mckeldin.png'),
};

const MYSTERY_LOCATIONS = [
<<<<<<< Updated upstream
    { id: 1, latitude: 38.987305, longitude: -76.924149, name: 'Lake Loop',    image: '@/assets/images/myst-locs/lake-loop.png' },
    { id: 2, latitude: 38.988015, longitude: -76.949653, name: 'Kehoe Track',  image: '@/assets/images/myst-locs/kehoe-track.png' },
=======
    { key: 1, id: 1, latitude: 38.987305, longitude: -76.924149, name: 'Misty Hollow Loop',         image: require('@/assets/images/myst-locs/lake-loop.png'),      date: '', timeStamp: '' },
    { key: 2, id: 2, latitude: 38.988015, longitude: -76.949653, name: 'Crimson Stride Circle',     image: require('@/assets/images/myst-locs/kehoe-track.png'),    date: '', timeStamp: '' },
    { key: 3, id: 3, latitude: 38.993379, longitude: -76.942130, name: 'Shadowy Pulse Hang',        image: require('@/assets/images/myst-locs/sph.png'),            date: '', timeStamp: '' },
    { key: 4, id: 4, latitude: 38.998737, longitude: -76.932851, name: 'Golden Acre Grove',         image: require('@/assets/images/myst-locs/acredale.png'),       date: '', timeStamp: '' },
    { key: 5, id: 5, latitude: 38.986017, longitude: -76.942550, name: 'Whispering Field Plaza',    image: require('@/assets/images/myst-locs/mckeldin.png'),       date: '', timeStamp: '' },
>>>>>>> Stashed changes
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
    getMyLocs: async () => [],
    addLocation: async () => null,
    addActivity: async () => null,
    resetProgress: async () => null,
    checkInRadius: () => [],
    IMAGE_MAP: null
});

export function MystLocProvider({ children }) {
    const [myLocs, setMyLocs] = useState([]);
    const [myActivities, setMyActivities] = useState([]);
    const [newLocs, setNewLocs] = useState([]);

    // Load persisted data on mount
    useEffect(() => {
        (async () => {
            const [locs, activities] = await Promise.all([
                loadFromStorage(STORAGE_KEYS.MY_LOCATIONS),
                loadFromStorage(STORAGE_KEYS.MY_ACTIVITIES),
            ]);
            setMyActivities(activities);
            const raw = await loadFromStorage(STORAGE_KEYS.MY_LOCATIONS);
            const withImages = raw.map(loc => ({ ...loc, image: IMAGE_MAP[loc.id] }));
            setMyLocs(withImages);
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

    // Adds one location or an array of locations, then persists
<<<<<<< Updated upstream
    async function addLocation(newLocation) {
=======
    async function addLocation(newLocation: any, timestamp) {
>>>>>>> Stashed changes
        setMyLocs(prev => {
            const incoming = Array.isArray(newLocation) ? newLocation : [newLocation];
            // Avoid duplicates by id
            const existingIds = new Set(prev.map(l => l.id));
            const toAdd = incoming.filter(l => !existingIds.has(l.id));
<<<<<<< Updated upstream
            const updated = [...prev, ...toAdd];
            saveToStorage(STORAGE_KEYS.MY_LOCATIONS, updated); // fire-and-forget inside setState
            return updated;
=======
            const foundDate = new Date(Date.now()).toDateString().toUpperCase();
            const toAddDate = toAdd.map(i => ({ ...i, date: foundDate, timeStamp: timestamp }));
            const updated = [...prev, ...toAddDate];
            const toSave = updated.map(({ image, ...rest }) => rest); // strip image before serializing
            saveToStorage(STORAGE_KEYS.MY_LOCATIONS, toSave);
            return updated; // keep image in memory
//             const toAddDate = toAdd.map(i => ({ ...i, date: foundDate, timeStamp: timestamp}));
//             const updated = [...prev, ...toAddDate];
//             saveToStorage(STORAGE_KEYS.MY_LOCATIONS, updated); // fire-and-forget inside setState            
//             return updated;
>>>>>>> Stashed changes
        });
    }

    // Appends a new activity and persists
    async function addActivity(newActivity) {
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
    function checkInRadius(routePoints) {
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
            addLocation,
            addActivity,
            resetProgress,
            checkInRadius,
            IMAGE_MAP,
        }}>
            {children}
        </MystLocContext.Provider>
    );
}

export function useMystLoc() {
    return useContext(MystLocContext);
}