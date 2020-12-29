import 'react-native-gesture-handler';
import React from 'react';
import {AppNavigation} from './app/src/navigation/AppNavigation';
import {View, StyleSheet} from 'react-native';
import {Player} from './app/src/components/Player';
import {Provider} from 'react-redux';
import store from './app/src/store';
import {AppSettings} from './app/src/screens/AppSettings';
import {Dimensions} from 'react-native';

function App() {
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <AppSettings />
        <AppNavigation />
        <View style={styles.player}>
          <Player />
        </View>
      </View>
    </Provider>
  );
}

const height = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  player: {
    height: 60,
    backgroundColor: '#000',
    position: 'absolute',
    bottom: height < 800 ? 45 : 80,
    zIndex: 9998,
  },
});

export default App;
