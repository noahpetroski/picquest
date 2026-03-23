import * as AuthSession from 'expo-auth-session';
import * as SecureStore from 'expo-secure-store';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useState } from 'react';

const MystLocContext = createContext({

})


export const mysteryLocations = [
    [38.987305, -76.924149], // Lake Loop
    [38.988015, -76.949653] // Kehoe Track
];

export function checkInRadius(point, routePoints) {
    let found = false;
    const radius = 0.000395; // approx 50 meters (make less?)
    let minLat = point[0] - radius;
    let maxLat = point[0] + radius;
    let minLon = point[1]- radius;
    let maxLon = point[1] + radius;
    for (let i = 0; i < routePoints.length && !found; i++) {
        let lat = routePoints[i].latitude;
        let lon = routePoints[i].longitude;
        if (lat >= minLat && lat <= maxLat && lon >= minLon && lon <= maxLon) {
            found = true;
        }
    }
    return found;
}

export function MystLocProvider() {
    return (
        <MystLocContext.Provider value={{
            mysteryLocations,
            checkInRadius
        }}>
        </MystLocContext.Provider>
    );
}

export function useMystLoc() {
  return useContext(MystLocContext);
}