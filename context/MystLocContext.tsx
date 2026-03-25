import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';

const MystLocContext = createContext({
    mysteryLocations: [],
    checkInRadius: null,
    newLocs: [],
    addLocation: async () => null,
});

export function MystLocProvider({children}) {
    const mysteryLocations = [
        {id: 1, latitude: 38.987305, longitude: -76.924149, name: 'Lake Loop'}, // Lake Loop
        {id: 2, latitude: 38.988015, longitude: -76.949653, name: 'Kehoe Track'} // Kehoe Track
    ];

    let [newLocs, setNewLocs] = useState([]);

    useEffect(() => {
        getNewLocs();
    }, []);

    const addLocation = async (newLocation) => {
        let currentListString = await SecureStore.getItemAsync('my_locations');
        let currentList = [];
        if (currentListString) {
            currentList = JSON.parse(currentListString);
        } else {
            console.log("nothing stored right now / error");
        }
        currentList.push(newLocation);
        await SecureStore.setItemAsync('my_locations', JSON.stringify(currentList));
    }

    const getNewLocs = async() => {
        let newLocations = [];
        let currentListString = await SecureStore.getItemAsync('my_locations');
        let currentList = [];
        if (currentListString) {
            currentList = JSON.parse(currentListString);
        }

        for (let i=0; i < mysteryLocations.length; i++) {
            if (!currentList.includes(mysteryLocations[i])) {
                newLocations.push(mysteryLocations[i]);
            }
        }
        setNewLocs(newLocations);
    }

    function checkInRadius(routePoints) {
        getNewLocs();
        console.log(newLocs);
        let found = [];
        const radius = 0.000395; // approx 50 meters (make less?)
        for (let i = 0; i < routePoints.length; i++) {
            let lat = routePoints[i].latitude;
            let lon = routePoints[i].longitude;
            for (let j = 0; j < newLocs.length; j++) {
                let point = newLocs[j];
                let minLat = point.latitude - radius;
                let maxLat = point.latitude + radius;
                let minLon = point.longitude - radius;
                let maxLon = point.longitude + radius;
                if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon && !found.includes(point.name)) {
                    found.push(point.name);
                }
            }
        }
        return found;
    }

    return (
        <MystLocContext.Provider value={{
            mysteryLocations,
            checkInRadius,
            newLocs,
            addLocation,
        }}>{children}
        </MystLocContext.Provider>
    );
}

export function useMystLoc() {
  return useContext(MystLocContext);
}