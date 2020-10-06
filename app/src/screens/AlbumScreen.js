import React, {useEffect, useState} from 'react';
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
import AsyncStorage from '@react-native-community/async-storage';
import {
  albumChanged,
  openAlbumScreen,
  updateAlbumImage,
} from '../store/actions/albums';
import {updateTrackId} from '../store/actions/player';
import store from '../store';

var phoneHeight = Dimensions.get('window').height;
var statement = {
  tracksTitles: [],
  tracksAuthors: [],
  tracksDuration: [],
  tracksIds: [],
  tracksDurationMillis: [],
  albumId: 0,
  albumsIds: [],
  albumImage: null,
  albumDesc: '',
  firstTrackId: 0,
  lastTrackId: 0,
  albumsPhotos: [],
  canRender: false,
};

var dispatch;

async function putTrackIdInStore(value) {
  await AsyncStorage.setItem('track_id', JSON.stringify(value));
  await AsyncStorage.setItem('pressed', JSON.stringify(true));
  dispatch(updateTrackId(value));
}

var intervalToMove = 0;

async function onTrackPressed(trackId, albumIdProps) {
  if (albumIdProps !== statement.albumId) {
    console.log('on track pressed called');
    statement = {
      ...statement,
      albumId: albumIdProps,
    };
    dispatch(albumChanged(true));
    dispatch(updateAlbumImage(statement.albumImage));
  }

  putTrackIdInStore(trackId);
}

function moveToNextAlbum() {
  clearInterval(intervalToMove, console.log('intervalToMove cleared'));

  statement = {
    ...statement,
    canRender: false,
  };

  let {albumId, albumsIds} = statement;

  let songsCount = 0;
  switch (albumId) {
    case parseInt(albumsIds[0], 10):
      songsCount = statement.albumDesc;
      break;
    case parseInt(albumsIds[1], 10):
      songsCount = statement.albumDesc + 3;
      break;
    case parseInt(albumsIds[2], 10):
      songsCount = statement.albumDesc + 2;
      break;
    case parseInt(albumsIds[3], 10):
      songsCount = statement.albumDesc - 4;
      break;
    case parseInt(albumsIds[4], 10):
      songsCount = statement.albumDesc;
      break;
    case parseInt(albumsIds[5], 10):
      songsCount = statement.albumDesc + 4;
      break;
    case parseInt(albumsIds[6], 10):
      return;
    default:
      break;
  }
  statement = {
    ...statement,
    albumImage:
      statement.albumsPhotos[albumId - parseInt(albumsIds[0], 10) - 1],
  };
  dispatch(albumChanged(true));
}

export const AlbumScreen = ({navigation, route}) => {
  const {
    albumTitleProps,
    albumDescProps,
    albumImageProps,
    albumIdProps,
    albumsPhotosProps,
    albumsIdsProps,
  } = route.params;

  dispatch = useDispatch();

  const [isReady, setIsReady] = useState(false);

  if (statement.albumImage === null) {
    intervalToMove = setInterval(async () => {
      await AsyncStorage.getItem('move_to_next_album', (err, res) => {
        if (err) {
          console.log(err);
        }
        JSON.parse(res) ? moveToNextAlbum(statement.albumId) : null;
      });
    }, 1000);
  }

  useEffect(() => {
    if (albumImageProps !== statement.albumImage) {
      const unsubscribe = store.subscribe(() => store.getState());
      unsubscribe();
      statement = {
        ...statement,
        canRender: false,
        albumImage: albumImageProps,
        albumsPhotos: albumsPhotosProps,
        albumDesc: albumDescProps,
        albumsIds: albumsIdsProps,
      };
      dispatch(openAlbumScreen(albumDescProps, albumIdProps));

      // let interval = setInterval(() => {
      //   if (statement.canRender) {
      //     clearInterval(interval);
    }
    setTimeout(() => {
      setIsReady(true);
    }, 2000);
  }, [
    isReady,
    albumDescProps,
    albumImageProps,
    albumsPhotosProps,
    albumIdProps,
    albumsIdsProps,
  ]);

  const {tracksIds, tracksTitles, tracksAuthors, tracksDuration} = useSelector(
    (state) => state.albums.openedAlbum,
  );

  if (isReady) {
    return (
      <View style={styles.container}>
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
          scrollEventThrottle={16}>
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
                      onTrackPressed(value, albumIdProps);
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
    return <View />;
  }
};

var phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  backgroundImage: {
    resizeMode: 'cover',
  },
  container: {
    height: phoneHeight - 180,
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
});
