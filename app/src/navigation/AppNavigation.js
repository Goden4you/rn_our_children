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
import {AppSettings} from '../screens/AppSettings';
import {AlbumScreen} from '../screens/AlbumScreen';
import {AllSongsList} from '../screens/AllSongsList';
import {SearchScreen} from '../screens/SearchScreen';
import {Dimensions, Image, StyleSheet} from 'react-native';

const MainStack = createStackNavigator();
const TabStack = createBottomTabNavigator();

function AlbumsStackScreens() {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#f47928',
          height: 80,
        },
        headerTitleStyle: {
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
        }}>
        <TabStack.Screen name="AlbumsStack" component={AlbumsStackScreens} />
        <TabStack.Screen name="AllSongsList" component={AllSongsList} />
        <TabStack.Screen name="SearchScreen" component={SearchScreen} />
      </TabStack.Navigator>
    </NavigationContainer>
  );
};

let phoneWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  bottomIcons: {
    resizeMode: 'contain',
    width: 0.06 * phoneWidth,
    height: '100%',
  },
});
