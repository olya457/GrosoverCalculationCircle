import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RootStackParamList } from './types';

import LoaderScreen from '../screens/LoaderScreen';
import OnboardScreen from '../screens/OnboardScreen';
import HomeScreen from '../screens/HomeScreen';
import LevelsScreen from '../screens/LevelsScreen';
import PlayScreen from '../screens/PlayScreen';
import WallpapersScreen from '../screens/WallpapersScreen';
import FactsSavedScreen from '../screens/FactsSavedScreen';
import SavedScreen from '../screens/SavedScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  return (
    <Stack.Navigator initialRouteName="Loader" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Loader" component={LoaderScreen} />
      <Stack.Screen name="Onboard" component={OnboardScreen} />
      <Stack.Screen name="Home" component={HomeScreen} />

      <Stack.Screen name="Levels" component={LevelsScreen} />
      <Stack.Screen name="Play" component={PlayScreen} />

      <Stack.Screen name="Wallpapers" component={WallpapersScreen} />
      <Stack.Screen name="FactsSaved" component={FactsSavedScreen} />
      <Stack.Screen name="Saved" component={SavedScreen} />
    </Stack.Navigator>
  );
}
