import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEYS = {
    MY_LOCATIONS: 'my_locations',
    MY_ACTIVITIES: 'my_activities',
};

const MYSTERY_LOCATIONS = [
    { id: 1, latitude: 38.987305, longitude: -76.924149, name: 'Lake Loop',    image: '@/assets/images/myst-locs/lake-loop.png' },
    { id: 2, latitude: 38.988015, longitude: -76.949653, name: 'Kehoe Track',  image: '@/assets/images/myst-locs/kehoe-track.png' },
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

    // Adds one location or an array of locations, then persists
    async function addLocation(newLocation) {
        setMyLocs(prev => {
            const incoming = Array.isArray(newLocation) ? newLocation : [newLocation];
            // Avoid duplicates by id
            const existingIds = new Set(prev.map(l => l.id));
            const toAdd = incoming.filter(l => !existingIds.has(l.id));
            const updated = [...prev, ...toAdd];
            saveToStorage(STORAGE_KEYS.MY_LOCATIONS, updated); // fire-and-forget inside setState
            return updated;
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
        }}>
            {children}
        </MystLocContext.Provider>
    );
}

export function useMystLoc() {
    return useContext(MystLocContext);
}