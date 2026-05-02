import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet } from 'react-native'

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MystLocProvider } from '@/context/MystLocContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <MystLocProvider>
      <Tabs
          screenOptions={{
            tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarButton: HapticTab,
          }}>
          <Tabs.Screen
            name="index"
            options={{
              tabBarShowLabel: false,
              tabBarIconStyle: {marginTop: 15},
              tabBarIcon: ({ color }) => <IconSymbol size={35} name="house.fill" color={color} />,
            }}
          />
          <Tabs.Screen
            name="upload"
            options={{
              tabBarShowLabel: false,
              tabBarIconStyle: {backgroundColor: '#67A09F', width: 70, height: 70, borderRadius: 35, display: 'flex', justifyContent: 'center', alignItems: 'center', bottom: 6},
              tabBarIcon: () => <IconSymbol size={45} name="plus" color={'white'} />,
            }}
          />
          <Tabs.Screen
            name="settings"
            options={{
              tabBarShowLabel: false,
              tabBarIconStyle: {marginTop: 15},
              tabBarIcon: ({ color }) => <IconSymbol size={35} name="gear" color={color} />,
            }}
          />
        </Tabs>
    </MystLocProvider>  
    );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    marginLeft: '2.5%',
    bottom: 20,
    borderRadius: 35,
    width: '95%',
    height: 70,
    borderTopWidth: 0, // removes default top border
    elevation: 0, // removes Android shadow line
    backgroundColor:'rgba(0,0,0,0.8)', // important!
  },
  background: {
    flex: 1,
    borderRadius: 25,
    backgroundColor: 'rgba(0,0,0,0.6)', // semi-transparent black
  },
});