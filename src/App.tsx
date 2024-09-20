import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import PhotoGallery from './screens/PhotoGallery';
import PhotoView from './screens/PhotoView';

export type RootStackParamList = {
  Gallery: undefined;
  PhotoView: { photoUrl: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Gallery">
        <Stack.Screen name="Gallery" component={PhotoGallery} />
        <Stack.Screen
          name="PhotoView"
          component={PhotoView}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;