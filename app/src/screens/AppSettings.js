import React, {useEffect} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {updateLoadedSize} from '../store/actions/player';
import {Back} from '../navigation/goBack';
import store from '../store';
import {putLoadedSize} from '../utils/utils';

var statement = {
  loadedMusic: 0,
  deleted: false,
};
var dispatch;

async function deleteLoadedMusic() {
  if (statement.loadedMusic !== 0) {
    RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.DocumentDir + '/loaded_tracks/');
    dispatch(updateLoadedSize(0));
  }
}

export const AppSettings = () => {
  const loadedSize = useSelector((state) => state.player.loadedSize);
  const settingsVisibility = useSelector(
    (state) => state.albums.settingsVisibility,
  );
  let size = (loadedSize / 1000000).toFixed(2);
  statement = {
    ...statement,
    loadedMusic: size,
  };

  dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = store.subscribe(() => store.getState());
    unsubscribe();
    return async function cleanup() {
      putLoadedSize(loadedSize);
    };
  }, [loadedSize]);

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={settingsVisibility}
      gestureEnabled={true}
      gestureDirection="horizontal">
      <View style={styles.container}>
        <View style={styles.header}>
          <Back isFromAlbum={false} />
          <Text style={styles.headerText}>Настройки</Text>
        </View>
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
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: 'rgb(109,207,246)',
    height: '12%',
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: '17%',
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
