/* eslint-disable react-native/no-inline-styles */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

export class AppSettings extends React.Component {
  state = {
    loadedMusic: 0,
  };

  componentDidMount() {
    this.getLoadedMusicSize();
  }

  async getLoadedMusicSize() {
    try {
      const fs = RNFetchBlob.fs;
      await fs.stat(fs.dirs.CacheDir + '/loaded_tracks/').then((res) => {
        console.log('Total size -', res);
      });
    } catch (e) {
      console.log(e);
    }
  }

  // async deleteLoadedMusic() {
  //   await FileSystem.deleteAsync(FileSystem.cacheDirectory + 'loaded_tracks/');
  //   this.setState({
  //     loadedMusic: 0,
  //   });
  //   await FileSystem.makeDirectoryAsync(
  //     FileSystem.cacheDirectory + 'loaded_tracks/',
  //   );
  // }

  render() {
    return (
      <View>
        <View style={styles.info}>
          <Text
            style={{
              fontSize: 18,
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
          <TouchableOpacity style={styles.btn}>
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
            onPress={() =>
              this.props.navigation.reset({
                index: 0,
                routes: [{name: 'Albums'}],
              })
            }>
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
