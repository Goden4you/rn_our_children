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
import {useDispatch} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import {toggleAlbum, albumChanged} from '../store/actions/albums';
import {updateTrackId} from '../store/actions/player';

var phoneHeight = Dimensions.get('window').height;
var state = {
  tracksTitles: [],
  tracksAuthors: [],
  tracksDuration: [],
  tracksIds: [],
  tracksDurationMillis: [],
  albumId: 0,
  albumImage: null,
  albumDesc: '',
  firstTrackId: 0,
  lastTrackId: 0,
  albumsPhotos: [],
  canRender: false,
};

var dispatch;

async function fetchSongs(desc, id) {
  let songsCount = desc.toString().substring(0, 2);
  songsCount = parseInt(songsCount, 10);
  let {
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
    canRender,
    albumId,
  } = state;
  await fetch('https://childrensproject.ocs.ru/api/v1/albums/' + id, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    const data = await response.json();
    const parsedData = JSON.parse(JSON.stringify(data));

    for (let i = 0; i < songsCount; i++) {
      tracksTitles[i] = parsedData[i].title;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksAuthors[i] = parsedData[i].author;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksDuration[i] = parsedData[i].duration;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksIds[i] = parsedData[i].songFileId;
    }

    for (let i = 0; i < songsCount; i++) {
      tracksDurationMillis[i] = parsedData[i].durationInMilliseconds;
    }
    firstTrackId = parsedData[0].songFileId;
    lastTrackId = parsedData[songsCount - 1].songFileId;
    canRender = true;

    state = {
      tracksTitles,
      tracksAuthors,
      tracksDuration,
      tracksIds,
      tracksDurationMillis,
      firstTrackId,
      lastTrackId,
      canRender,
    };

    console.log('Songs fetched');
    // if (needUpdate) {
    //   needUpdate = false;
    //   putPropsInStore();
    // }

    intervalToMove = setInterval(async () => {
      await AsyncStorage.getItem('move_to_next_album', (err, res) => {
        if (err) {
          console.log(err);
        }
        JSON.parse(res) ? moveToNextAlbum(albumId) : null;
      });
    }, 1000);
  });
}

async function putPressedTrackIdInStore(value) {
  await AsyncStorage.setItem('pressedd', JSON.stringify(true));
  await AsyncStorage.setItem('track_id', JSON.stringify(value));
  dispatch(updateTrackId(value));
}

var intervalToMove = 0;

const putPropsInStore = async (isAlbumChanged, albumImageProps) => {
  dispatch(
    toggleAlbum(
      albumImageProps,
      state.tracksTitles,
      state.tracksAuthors,
      state.tracksDuration,
      state.tracksIds,
      state.tracksDurationMillis,
      state.firstTrackId,
      state.lastTrackId,
      isAlbumChanged,
    ),
  );
  console.log('album image from putPropsInStore - ', albumImageProps);
  await AsyncStorage.setItem('album_image', JSON.stringify(albumImageProps));
  console.log('putPropsInStore form ALBUMSCREEN called');
};

async function onTrackPressed(trackId, albumIdProps, albumImageProps) {
  if (albumIdProps !== state.albumId) {
    state = {
      ...state,
      albumId: albumIdProps,
    };
    putPropsInStore(true, albumImageProps);
    dispatch(albumChanged(true));
  }

  putPressedTrackIdInStore(trackId);
}

function moveToNextAlbum(albumIdProps) {
  clearInterval(intervalToMove, console.log('intervalToMove cleared'));

  state = {
    ...state,
    canRender: false,
  };

  let songsCount = 0;
  switch (albumIdProps) {
    case 30184:
      console.log('album id props', albumIdProps);
      songsCount = state.albumDesc;
      break;
    case 30185:
      console.log('album id props', albumIdProps);
      songsCount = state.albumDesc + 3;
      break;
    case 30186:
      console.log('album id props', albumIdProps);
      songsCount = state.albumDesc + 2;
      break;
    case 30187:
      console.log('album id props', albumIdProps);
      songsCount = state.albumDesc - 4;
      break;
    case 30188:
      console.log('album id props', albumIdProps);
      songsCount = state.albumDesc;
      break;
    case 30189:
      console.log('album id props', albumIdProps);
      songsCount = state.albumDesc + 4;
      break;
    case 30190:
      return;
    default:
      console.log('album id props', albumIdProps);
      break;
  }
  console.log('last track pressed');
  state = {
    ...state,
    albumImage: state.albumsPhotos[albumIdProps - 30183],
  };
  fetchSongs(songsCount, albumIdProps + 1);
}

export const AlbumScreen = ({navigation, route}) => {
  const {
    albumTitleProps,
    albumDescProps,
    albumImageProps,
    albumIdProps,
    albumsPhotosProps,
  } = route.params;

  dispatch = useDispatch();

  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (albumImageProps !== state.albumImage) {
      state = {
        ...state,
        canRender: false,
        albumImage: albumImageProps,
        albumsPhotos: albumsPhotosProps,
        albumDesc: albumDescProps,
      };

      fetchSongs(albumDescProps, albumIdProps);

      let interval = setInterval(() => {
        if (state.canRender) {
          clearInterval(interval);
          setIsReady(true);
          console.log('album screen ready');
        }
      }, 250);
    } else {
      setIsReady(true);
    }
  }, [
    isReady,
    albumDescProps,
    albumImageProps,
    albumIdProps,
    albumsPhotosProps,
  ]);

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
              {state.tracksIds.map((value) => {
                let index = state.tracksIds.indexOf(value);
                return (
                  <TouchableOpacity
                    style={styles.wrapper}
                    key={value}
                    onPress={() => {
                      onTrackPressed(value, albumIdProps, albumImageProps);
                    }}>
                    <View style={{width: '80%'}}>
                      <Text style={styles.songTitle}>
                        {state.tracksTitles[index]}
                      </Text>
                      <Text style={styles.songAuthor}>
                        {state.tracksAuthors[index]}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.songDuration}>
                        {state.tracksDuration[index]}
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
    height: phoneHeight - 160,
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
