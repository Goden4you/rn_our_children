import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';
import {updateLoadedSize} from '../store/actions/player';

var state = {
  loadedMusic: 0,
  deleted: false,
};
var dispatch;

async function deleteLoadedMusic() {
  if (state.loadedMusic !== 0) {
    RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/');
    dispatch(updateLoadedSize(0));
    await AsyncStorage.setItem('can_player_render', JSON.stringify(false));
  }
}

export const AppSettings = () => {
  const {loadedSize} = useSelector((statement) => statement.player);
  console.log('loaded size = ', loadedSize);
  let size = (loadedSize / 1000000).toFixed(2);

  dispatch = useDispatch();

  useEffect(() => {
    return async function cleanup() {
      await AsyncStorage.setItem('loaded_size', JSON.stringify(loadedSize));
    };
  });

  return (
    <View>
      <View style={styles.info}>
        <Text style={styles.loadedMusic}>Загруженная музыка</Text>
        <Text
          style={{
            ...styles.loadedMusic,
            ...styles.sizeColor,
          }}>
          {size} Мб
        </Text>
      </View>
      <View style={styles.btnWrap}>
        <TouchableOpacity style={styles.btn} onPress={deleteLoadedMusic}>
          <Text
            style={{
              ...styles.loadedMusic,
              ...styles.btnText,
            }}>
            Удалить загрузки
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 30,
  },
  info: {
    flexDirection: 'row',
    margin: 22,
    justifyContent: 'space-between',
  },
  btnWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: {
    color: '#fff',
  },
  btn: {
    borderRadius: 7.5,
    backgroundColor: '#f47928',
    marginBottom: 16,
    width: 220,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadedMusic: {
    fontSize: 18,
  },
  sizeColor: {
    color: '#939598',
  },
});
