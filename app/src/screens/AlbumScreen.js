import React, {useEffect, useReducer} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import Orientation from 'react-native-orientation';

import {openAlbumScreen} from '../store/actions/albums';
import store from '../store';
import {onTrackPressed} from '../utils/utils';

var statement = {
  albumImage: null,
  orientation: 'PORTRAIT',
};

var dispatch;

export const AlbumScreen = ({navigation, route}) => {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const {
    albumTitleProps,
    albumDescProps,
    albumImageProps,
    albumIdProps,
  } = route.params;

  dispatch = useDispatch();

  const onOrientationChanged = () => {
    Orientation.getOrientation((err, orientation) => {
      if (err) {
        console.log(err);
      }
      statement = {
        ...statement,
        orientation,
      };
    });
    setTimeout(() => {
      forceUpdate();
    }, 250);
  };

  const {tracksIds, tracksTitles, tracksAuthors, tracksDuration} = useSelector(
    (state) => state.albums.openedAlbum,
  );
  const {isAlbumLoading, songsCount} = useSelector((state) => state.albums);
  const {moveToNextAlbum, curAlbumId} = useSelector((state) => state.player);
  statement = {...statement, moveToNextAlbum};

  useEffect(() => {
    if (albumImageProps !== statement.albumImage) {
      dispatch(openAlbumScreen(albumDescProps, albumIdProps));
      const unsubscribe = store.subscribe(() => store.getState());
      unsubscribe();
      Orientation.addOrientationListener(onOrientationChanged);
      statement = {
        ...statement,
        albumImage: albumImageProps,
      };
    }
  }, [albumImageProps, albumIdProps, albumDescProps]);

  if (!isAlbumLoading) {
    return (
      <View>
        <ScrollView
          onScroll={(event) =>
            event.nativeEvent.contentOffset.y > 170
              ? navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(244,121,40)',
                    height: 80,
                  },
                  headerTitle: `${albumTitleProps}`,
                })
              : navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(109,207,246)',
                    height: 80,
                  },
                  headerTitle: '',
                })
          }
          scrollEventThrottle={16}
          style={
            statement.orientation === 'PORTRAIT'
              ? styles.containerPortrait
              : styles.containerLandscape
          }>
          <ImageBackground
            source={require('../../../images/blur/drawable-mdpi/layer_1.png')}
            style={styles.backgroundImage}>
            <TouchableOpacity style={styles.albumWrap}>
              <Image
                source={{
                  uri: albumImageProps,
                }}
                style={styles.albumImage}
              />
              <View>
                <Text style={styles.albumTitle}>{albumTitleProps}</Text>
                <Text style={styles.albumDesc}>{albumDescProps}</Text>
              </View>
            </TouchableOpacity>
          </ImageBackground>
          <View style={styles.songsWrap}>
            <View>
              {tracksIds.map((value) => {
                let index = tracksIds.indexOf(value);
                return (
                  <TouchableOpacity
                    style={styles.wrapper}
                    key={value}
                    onPress={() => {
                      onTrackPressed({
                        trackId: value,
                        albumIdProps,
                        curAlbumId,
                        albumImage: albumImageProps,
                        songsCount,
                        dispatch,
                      });
                    }}>
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle}>
                        {tracksTitles[index]}
                      </Text>
                      <Text style={styles.songAuthor}>
                        {tracksAuthors[index]}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.songDuration}>
                        {tracksDuration[index]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  } else {
    return (
      <View style={styles.loading}>
        <Text>Пожалуйста, подождите...</Text>
      </View>
    );
  }
};

let phoneHeight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
  backgroundImage: {
    resizeMode: 'cover',
  },
  containerPortrait: {
    height: phoneHeight - 255,
    backgroundColor: '#fff',
  },
  containerLandscape: {
    height: '76%',
    backgroundColor: '#fff',
  },
  albumWrap: {
    padding: 25,
    flexDirection: 'row',
  },
  albumImage: {
    width: 120,
    height: 120,
    marginRight: 20,
  },
  albumTitle: {
    fontFamily: 'HouschkaPro-DemiBold',
    color: 'rgb(244,121,40)',
    fontSize: 33,
  },
  albumDesc: {
    fontSize: 24,
    fontFamily: 'HouschkaPro-Light',
  },
  songsWrap: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  wrapper: {
    paddingVertical: 13,
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songInfo: {width: '80%'},
  songTitle: {
    fontSize: 24,
    fontFamily: 'HouschkaPro-Medium',
  },
  songAuthor: {
    fontSize: 20,
    color: 'rgb(147, 149, 152)',
    fontFamily: 'HouschkaPro-Medium',
  },
  songDuration: {
    fontSize: 16,
    fontFamily: 'HouschkaPro-Medium',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#fff',
  },
});
