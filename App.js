import 'react-native-gesture-handler';
import React from 'react';
import {AppNavigation} from './app/src/navigation/AppNavigation';
import {View, StyleSheet} from 'react-native';
import {Player} from './app/src/components/Player';
import {Provider} from 'react-redux';
import store from './app/src/store';

function App() {
  console.log('something');
  return (
    <Provider store={store}>
      <View style={styles.container}>
        <AppNavigation />
        <View style={styles.player}>
          <Player />
        </View>
      </View>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  player: {
    height: 80,
    backgroundColor: '#000',
  },
});

export default App;
