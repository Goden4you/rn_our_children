import React, {useEffect} from 'react';
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

import {isAlbumDataLoading, openAlbumScreen} from '../store/actions/albums';
import store from '../store';
import {onTrackPressed} from '../utils/utils';

var dispatch;

let statement = {
  albumImage: null,
};

export const AlbumScreen = ({navigation, route}) => {
  const {
    albumTitleProps,
    albumDescProps,
    albumImageProps,
    albumIdProps,
  } = route.params;

  dispatch = useDispatch();

  const {tracksIds, tracksTitles, tracksAuthors, tracksDuration} = useSelector(
    (state) => state.albums.openedAlbum,
  );
  const isAlbumLoading = useSelector((state) => state.albums.isAlbumLoading);
  const songsCount = useSelector((state) => state.albums.songsCount);
  const curAlbumId = useSelector((state) => state.player.curAlbumId);

  useEffect(() => {
    if (albumImageProps !== statement.albumImage) {
      dispatch(openAlbumScreen(albumDescProps, albumIdProps));
      const unsubscribe = store.subscribe(() => store.getState());
      unsubscribe();

      statement = {
        ...statement,
        albumImage: albumImageProps,
      };
    } else {
      dispatch(isAlbumDataLoading(false));
    }
  }, [albumImageProps, albumIdProps, albumDescProps]);

  if (!isAlbumLoading) {
    console.log('album screen updated');
    return (
      <View>
        <ScrollView
          onScroll={(event) =>
            event.nativeEvent.contentOffset.y > 170
              ? navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(244,121,40)',
                    height: phoneHeight < 800 ? 80 : 100,
                  },
                  headerTitle: `${albumTitleProps}`,
                })
              : navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(109,207,246)',
                    height: phoneHeight < 800 ? 80 : 100,
                  },
                  headerTitle: '',
                })
          }
          scrollEventThrottle={16}
          style={styles.containerPortrait}>
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
                      console.log('from album, ', typeof albumIdProps);
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

const phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  backgroundImage: {
    resizeMode: 'cover',
  },
  containerPortrait: {
    height: phoneHeight < 800 ? phoneHeight - 180 : phoneHeight - 240,
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
