import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import MenuPage from '../../screens/MenuPage';
import TrendingPage from '../../screens/TrendingPage';
import ProfilePage from '../../screens/ProfilePage';
import LoginPage from '../../screens/LoginPage';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <Stack.Navigator initialRouteName="Menu" component={MenuPage}>
        <Stack.Screen name="Menu" component={MenuPage} />
        <Stack.Screen name="Trending" component={TrendingPage} />
        <Stack.Screen name="Profile" component={ProfilePage} />
        <Stack.Screen name="Login" component={LoginPage} />
      </Stack.Navigator>
  );
}