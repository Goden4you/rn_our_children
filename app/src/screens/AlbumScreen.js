import React, {useEffect, useState, useCallback} from 'react';
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
import AsyncStorage from '@react-native-community/async-storage';

var phoneHeight = Dimensions.get('window').height;
var tracksTitles = [];
var tracksAuthors = [];
var tracksDuration = [];
var tracksIds = [];
var tracksDurationMillis = [];
var albumId = 0;
var albumImage = null;
var albumDesc = '';
var firstTrackId = 0;
var lastTrackId = 0;
var needUpdate = false;
var albumsPhotos = [];

async function fetchSongs(desc, id) {
  let songsCount = desc.substring(0, 2);
  songsCount = parseInt(songsCount, 10);
  const response = await fetch(
    'https://childrensproject.ocs.ru/api/v1/albums/' + id,
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );

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
  console.log('songs count = ', songsCount);
  lastTrackId = parsedData[songsCount - 1].songFileId;

  console.log('Songs fetched');
  if (needUpdate) {
    needUpdate = false;
    putPropsInStore();
  }
}

async function putPressedTrackIdInStore(trackId) {
  await AsyncStorage.setItem('pressedd', JSON.stringify(true));
  await AsyncStorage.setItem('track_id', JSON.stringify(trackId));
}

async function putPropsInStore() {
  try {
    await AsyncStorage.setItem('album_image', JSON.stringify(albumImage));

    await AsyncStorage.setItem('tracks_titles', JSON.stringify(tracksTitles));

    await AsyncStorage.setItem('tracks_authors', JSON.stringify(tracksAuthors));

    await AsyncStorage.setItem(
      'tracks_duration',
      JSON.stringify(tracksDuration),
    );

    await AsyncStorage.setItem(
      'tracks_duration_millis',
      JSON.stringify(tracksDurationMillis),
    );

    await AsyncStorage.setItem('first_track_id', JSON.stringify(firstTrackId));

    await AsyncStorage.setItem('last_track_id', JSON.stringify(lastTrackId));

    console.log('ALBUM INFO STORED');
  } catch (e) {
    console.log(e);
  }
}

var intervalToMove = 0;

async function onTrackPressed(trackId, albumIdProps) {
  if (albumIdProps !== albumId) {
    putPropsInStore();
    albumId = albumIdProps;
  }

  // if (trackId === lastTrackId) {
  intervalToMove = setInterval(async () => {
    await AsyncStorage.getItem('move_to_next_album', (err, res) => {
      if (err) console.log(err);
      JSON.parse(res) ? moveToNextAlbum(albumIdProps) : null;
    });
  }, 1000);
  // }
  putPressedTrackIdInStore(trackId);
}

function moveToNextAlbum(albumIdProps) {
  clearInterval(intervalToMove, console.log('intervalToMove cleared'));

  let songsCount = 0;
  switch (albumIdProps) {
    case 30177:
      console.log('album id props', albumIdProps);
      songsCount = albumDesc;
      break;
    case 30178:
      console.log('album id props', albumIdProps);
      songsCount = albumDesc + 3;
      break;
    case 30179:
      console.log('album id props', albumIdProps);
      songsCount = albumDesc + 2;
      break;
    case 30180:
      console.log('album id props', albumIdProps);
      songsCount = albumDesc - 4;
      break;
    case 30181:
      console.log('album id props', albumIdProps);
      songsCount = albumDesc;
      break;
    case 30182:
      console.log('album id props', albumIdProps);
      songsCount = albumDesc + 4;
      break;
    case 30183:
      return;
    default:
      console.log('album id props', albumIdProps);
      break;
  }
  console.log('last track pressed');
  needUpdate = true;
  fetchSongs(songsCount, albumIdProps + 1);
  albumImage = albumsPhotos[albumIdProps - 30176];
}

export const AlbumScreen = ({navigation, route}) => {
  const {
    albumTitleProps,
    albumDescProps,
    albumImageProps,
    albumIdProps,
    albumsPhotosProps,
  } = route.params;
  const [isReady, setIsReady] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (albumImageProps !== albumImage) {
      fetchSongs(albumDescProps, albumIdProps);

      albumImage = albumImageProps;
      albumsPhotos = albumsPhotosProps;
      albumDesc = albumDescProps;

      setTimeout(() => {
        setIsReady(true);
        console.log('album screen ready');
      }, 500);
    } else {
      setIsReady(true);
    }
  });

  useCallback(() => {
    putPropsInStore();
    console.log('useCallback called');
  }, []);

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
              {tracksAuthors.map((value) => {
                let key = Math.random();
                let index = tracksAuthors.indexOf(value);
                return (
                  <TouchableOpacity
                    style={styles.wrapper}
                    key={key}
                    onPress={() => {
                      onTrackPressed(tracksIds[index], albumIdProps);
                      // putPressedTrackIdInStore(tracksIds[index]);
                      // pressed = true;
                      // putPropsInStore();
                    }}>
                    <View style={{width: '80%'}}>
                      <Text style={styles.songTitle}>
                        {tracksTitles[index]}
                      </Text>
                      <Text style={styles.songAuthor}>{value}</Text>
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
