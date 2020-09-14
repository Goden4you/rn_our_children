/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import AsyncStorage from '@react-native-community/async-storage';

export class AppSettings extends React.Component {
  state = {
    loadedMusic: 0,
  };

  componentDidMount() {
    this.getLoadedMusicSize();
  }

  async getLoadedMusicSize() {
    try {
      await AsyncStorage.getItem('loaded_tracks_size').then((size) => {
        console.log('size', size);
        if (size) {
          size = JSON.parse(size);
          size /= 1000000;
          this.setState({
            loadedMusic: size.toFixed(1),
          });
        }
      });
      // const fs = RNFetchBlob.fs;
      // await fs.ls(fs.dirs.CacheDir + '/loaded_tracks/').then(async (list) => {
      //   let count = 0;
      //   list.forEach(() => count++);
      //   console.log('loaded songs count - ', count);
      //   console.log('list of loaded songs - ', list);
      //   let size = 0;
      //   for (let i = 0; i < count; i++) {
      //     await fs
      //       .stat(fs.dirs.CacheDir + '/loaded_tracks/' + list[i].toString())
      //       .then((info) => {
      //         size += parseInt(info.size);
      //       });
      //   }
      //   size /= 1000000;
      //   this.setState({
      //     loadedMusic: size.toFixed(1),
      //   });
      // });
    } catch (e) {
      console.log(e);
    }
  }

  async deleteLoadedMusic() {
    if (this.state.loadedMusic !== 0) {
      try {
        RNFetchBlob.fs.unlink(RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/');
        await AsyncStorage.removeItem('loaded_tracks_size');
        await AsyncStorage.setItem('can_player_render', JSON.stringify(false));
        console.log('Dir deleted');
        this.setState({
          loadedMusic: 0,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }

  render() {
    return (
      <View>
        <View style={styles.info}>
          <Text
            style={{
              fontSize: 18,
              // fontFamily:
              //   Platform.OS === 'ios'
              //     ? 'HouschkaPro-Medium'
              //     : 'HouschkaPro-Medium.ttf',
            }}>
            Загруженная музыка
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: '#939598',
            }}>
            {this.state.loadedMusic} Мб
          </Text>
        </View>
        <View style={styles.btnWrap}>
          <TouchableOpacity
            style={styles.btn}
            onPress={this.deleteLoadedMusic.bind(this)}>
            <Text
              style={{
                fontSize: 18,
                color: '#fff',
              }}>
              Удалить загрузки
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => {
              this.props.navigation.reset({
                index: 0,
                routes: [{name: 'Albums'}],
              });
            }}>
            <Text
              style={{
                fontSize: 18,
                color: '#fff',
              }}>
              Сменить пользователя
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
}

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
  btn: {
    borderRadius: 7.5,
    backgroundColor: '#f47928',
    marginBottom: 16,
    width: 220,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
