import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {
  createStackNavigator,
  CardStyleInterpolators,
} from '@react-navigation/stack';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';

import {Back} from './goBack';
import {GoToSettings} from './goSettings';
import {Albums} from '../screens/Albums';
import {AlbumScreen} from '../screens/AlbumScreen';
import {AllSongsList} from '../screens/AllSongsList';
import {SearchScreen} from '../screens/SearchScreen';
import {Image, StyleSheet} from 'react-native';
import {Dimensions} from 'react-native';

const MainStack = createStackNavigator();
const TabStack = createBottomTabNavigator();
const phoneHeight = Dimensions.get('window').height;

function AlbumsStackScreens() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: 'rgb(109,207,246)',
          height: phoneHeight < 800 ? 80 : 100,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          color: '#fff',
          fontSize: 22,
          paddingBottom: phoneHeight < 800 ? 0 : 15,
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
          headerRightContainerStyle: {
            paddingBottom: phoneHeight < 800 ? 0 : 15,
            paddingRight: 20,
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
          headerLeftContainerStyle: {
            paddingBottom: phoneHeight < 800 ? 0 : 15,
          },
          headerRightContainerStyle: {
            paddingBottom: phoneHeight < 800 ? 0 : 15,
            paddingRight: 20,
          },
          headerLeft: () => <Back navigation={navigation} isFromAlbum={true} />,
          headerRight: () => <GoToSettings navigation={navigation} />,
        })}
      />
    </MainStack.Navigator>
  );
}

export const AppNavigation = () => {
  return (
    <NavigationContainer>
      <TabStack.Navigator
        initialRouteName="AlbumsStack"
        screenOptions={({route}) => ({
          tabBarIcon: () => {
            let iconName;
            if (route.name === 'AlbumsStack') {
              iconName = require('../../../images/icons/albums/drawable-mdpi/group.png');
            } else if (route.name === 'AllSongsList') {
              iconName = require('../../../images/icons/allSongs/drawable-mdpi/group.png');
            } else {
              iconName = require('../../../images/icons/search/drawable-mdpi/group.png');
            }
            return (
              <Image
                source={iconName}
                style={styles.bottomIcons}
                resizeMode="contain"
              />
            );
          },
        })}
        tabBarOptions={{
          activeTintColor: 'red',
          activeBackgroundColor: '#f59122',
          inactiveBackgroundColor: '#f47928',
          showLabel: false,
          keyboardHidesTabBar: true,
        }}>
        <TabStack.Screen name="AlbumsStack" component={AlbumsStackScreens} />
        <TabStack.Screen name="AllSongsList" component={AllSongsList} />
        <TabStack.Screen name="SearchScreen" component={SearchScreen} />
      </TabStack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  bottomIcons: {
    resizeMode: 'contain',
    width: 25,
    // height: '100%',
  },
});
