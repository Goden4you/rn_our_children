import React, {useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import RNFetchBlob from 'rn-fetch-blob';
import {updateLoadedSize} from '../store/actions/player';
import {Back} from '../navigation/goBack';
import store from '../store';
import {putLoadedSize} from '../utils/utils';
import {handleNextTrack} from '../components/controlPanel/ControlsButtons';
import {Platform} from 'react-native';

var statement = {
  loadedMusic: 0,
  deleted: false,
};
var dispatch;

async function deleteLoadedMusic() {
  if (statement.loadedMusic !== 0) {
    const documentDir = RNFetchBlob.fs.dirs.DocumentDir;
    RNFetchBlob.fs.unlink(
      Platform.OS === 'android'
        ? documentDir + '/loaded_tracks/'
        : documentDir + '/loaded_tracks',
    );
    dispatch(updateLoadedSize(0, true));
    handleNextTrack();
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

const phoneHeight = Dimensions.get('window').height;
console.log('phoneHeight - ', phoneHeight);

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    width: '100%',
    height: '100%',
  },
  header: {
    backgroundColor: 'rgb(109,207,246)',
    height: phoneHeight < 800 ? 80 : 100,
    paddingLeft: 0,
    paddingBottom: phoneHeight < 800 ? 0 : 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: phoneHeight < 800 ? 'center' : 'flex-end',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: '20%',
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
