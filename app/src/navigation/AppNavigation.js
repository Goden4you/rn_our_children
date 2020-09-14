import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';

import {Back} from './goBack';
import {GoToSettings} from './goSettings';
import {Albums} from '../screens/Albums';
import {AppSettings} from '../screens/AppSettings';
import {AlbumScreen} from '../screens/AlbumScreen';

// creating new stack
const MainStack = createStackNavigator();

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <MainStack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#f47928',
            height: 80,
          },
          headerTitleStyle: {
            // fontFamily: 'HouschkaPro-Bold',
            color: '#fff',
          },
          headerTitleAlign: 'center',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        }}
        initialRouteName="Albums">
        <MainStack.Screen
          name="Albums"
          component={Albums}
          options={({navigation}) => ({
            headerTitle: 'Альбомы',
            headerStyle: {
              backgroundColor: 'rgb(109,207,246)',
              height: 80,
            },
            headerRightContainerStyle: {
              paddingBottom: 5,
            },
            headerRight: () => <GoToSettings navigation={navigation} />,
            headerLeft: null,
          })}
        />

        <MainStack.Screen
          name="AlbumScreen"
          component={AlbumScreen}
          options={({navigation}) => ({
            headerTitle: '',
            headerStyle: {
              backgroundColor: 'rgb(109,207,246)',
              height: 80,
            },
            headerLeftContainerStyle: {
              paddingBottom: 5,
            },
            headerRightContainerStyle: {
              paddingBottom: 5,
            },
            headerLeft: () => <Back navigation={navigation} />,
            headerRight: () => <GoToSettings navigation={navigation} />,
          })}
        />

        <MainStack.Screen
          name="AppSettings"
          component={AppSettings}
          options={({navigation}) => ({
            headerTitle: 'Настройки',
            headerLeft: () => <Back navigation={navigation} />,
          })}
        />
      </MainStack.Navigator>
    </NavigationContainer>
  );
};
