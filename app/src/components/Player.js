import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  AppState,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-community/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import {MinimazedPlayer} from './minimazedPlayer/MinimazedPlayer';
import {FileInfo} from './musicInfo/FileInfo';
import {TrackSlider} from './slider/TrackSlider';
import {ControlsButtons} from './controlPanel/ControlsButtons';
import {useSelector, useDispatch} from 'react-redux';
import {
  loadTrack,
  trackLoadingError,
  loadPlayer,
  updateTrackId,
  updateLoadedSize,
  isTrackPlaying,
  isMinimazed,
  isQueueEnded,
} from '../store/actions/player';
import {albumChanged, toggleAlbum} from '../store/actions/albums';

const API_PATH = 'https://childrensproject.ocs.ru/api/v1/files/';

var dispatch;
var state = {
  currentIndex: 0,
  minimazed: true,
  volume: 1.0,
  isBuffering: true,
  needUpdate: true,
  needUpdate3: true,
  audioLoaded: false,
  pressed: false,
  interval: 0,
  canPlayerRender: true,
  formattedDurMillis: [],
  loadedMusicSize: 0,
  isQueueEnded: false,
  needUpdate2: true,
  albumImage: null,
};

async function setupPlayer() {
  TrackPlayer.setupPlayer();
  console.log('Player created');
  TrackPlayer.updateOptions({
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
    ],
  });

  TrackPlayer.addEventListener('playback-queue-ended', () => {
    if (state.isPlaying && state.needUpdate2) {
      state = {
        ...state,
        trackId: state.lastTrackId,
        isQueueEnded: true,
        needUpdate2: false,
      };
      TrackPlayer.reset();
      dispatch(isQueueEnded(true));
      console.log('queue ended');
    }
  });

  TrackPlayer.addEventListener('playback-track-changed', async () => {
    try {
      if (
        state.isPlaying &&
        !state.isQueueEnded &&
        !state.pressed &&
        state.audioLoaded
      ) {
        let id = await TrackPlayer.getCurrentTrack();
        state = {
          ...state,
          trackId: parseInt(id, 10),
        };
        console.log('playback track changed, trackId =', state.trackId);
        dispatch(updateTrackId(id));

        await AsyncStorage.setItem('track_id', JSON.stringify(id));
        let interval = setInterval(async () => {
          if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
            console.log('ready to play');
            clearInterval(interval);
            // setTimeout(() => {
            TrackPlayer.play();
            // }, 1000);
          }
        }, 500);
      }
      checkForLoad();
    } catch (e) {
      console.log(e);
    }
  });

  await AsyncStorage.setItem('move_to_next_album', JSON.stringify(false));

  SplashScreen.hide();
}

async function checkForDir() {
  let fs = RNFetchBlob.fs;
  await fs.exists(fs.dirs.CacheDir + '/loaded_tracks/').then(async (res) => {
    if (!res) {
      await fs.mkdir(fs.dirs.CacheDir + '/loaded_tracks/');
    }
  });
}

async function loadAudio(currentTrack) {
  const {
    isPlaying,
    trackId,
    pressed,
    tracksAuthors,
    tracksTitles,
    firstTrackId,
    lastTrackId,
  } = state;

  try {
    console.log('track if from loadAudio - ', trackId);
    if (trackId !== 0 && trackId !== undefined && trackId !== null) {
      console.log('loadAudio started');
      console.log('firstTrackId - ', firstTrackId);
      console.log('lastTrackId - ', lastTrackId);
      let j = 0; // for array of objects
      var track = [];
      for (let i = firstTrackId; i <= lastTrackId; i++) {
        var path =
          RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + i + '.mp3';

        await RNFetchBlob.fs.exists(path).then(async (res) => {
          if (res) {
            await RNFetchBlob.fs.readFile(path).then((uri) => {
              track[j] = {
                id: i.toString(),
                url: uri,
                artist: tracksAuthors[i - firstTrackId].toString(),
                title: tracksTitles[i - firstTrackId].toString(),
              };
            });
          } else {
            track[j] = {
              id: i.toString(),
              url: 'https://childrensproject.ocs.ru/api/v1/files/' + i,
              artist: tracksAuthors[i - firstTrackId].toString(),
              title: tracksTitles[i - firstTrackId].toString(),
            };
          }
          j++;
        });
      }
      TrackPlayer.add(track);

      state = {
        ...state,
        audioLoaded: true,
        isPlaying: pressed ? true : isPlaying,
        isQueueEnded: false,
        needUpdate2: true,
      };

      dispatch(loadTrack(pressed, isPlaying));

      if (currentTrack) {
        TrackPlayer.skip(trackId.toString());
        let interval = setInterval(async () => {
          if (
            (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
            TrackPlayer.STATE_PAUSED
          ) {
            TrackPlayer.play();
            clearInterval(interval);
          }
        }, 250);

        console.log('skipped to next from loadAudio');
      }
    }
  } catch (e) {
    console.log('failed to load audio', e);
    console.log('track id in faile', trackId);
    Alert.alert(
      'Ошибка',
      'Не удалось загрузить музыку, попробуйте позже',
      [
        {
          text: 'Ок',
          onPress: () => console.log('Ok button pressed'),
        },
      ],
      {cancelable: false},
    );
    dispatch(trackLoadingError());
    state = {
      ...state,
      isPlaying: false,
      trackPlayerInit: false,
    };
  }
}

async function checkForLoad() {
  try {
    let {trackId, loadedMusicSize} = state;
    var path =
      RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + trackId + '.mp3';
    await RNFetchBlob.fs.exists(path).then(async (exist) => {
      console.log('Track exists? -', exist);
      if (!exist) {
        await fetch(API_PATH + trackId).then((data) => {
          let fileSize = data.headers.get('Content-Length');
          let totalSize = parseInt(fileSize, 10) + loadedMusicSize;
          dispatch(updateLoadedSize(totalSize));
          state = {...state, loadedMusicSize: totalSize};
        });
        await RNFetchBlob.fs.writeFile(path, API_PATH + trackId);
        console.log('New Track Now In Cache');
      }
    });
  } catch (e) {
    console.log(e);
  }
}

// called every second and checking if track in AlbumScreen was pressed
async function isPressed(error, result) {
  if (error) {
    console.log('Error from isPressed()', error);
  }
  if (result === JSON.stringify(true) && state.needUpdate) {
    console.log('isPressed called');
    state = {
      ...state,
      needUpdate: false,
      pressed: true,
    };

    await AsyncStorage.setItem('pressedd', JSON.stringify(false));

    await AsyncStorage.getItem('track_id', (err, res) => {
      if (err) {
        return;
      }
      state = {
        ...state,
        trackId: JSON.parse(res),
        needUpdate: true,
      };
      dispatch(updateTrackId(JSON.parse(res)));
    });

    if (!state.audioLoaded) {
      loadAudio();
      // setTimeout(async () => {
      TrackPlayer.skip(state.trackId.toString());
      let interval = setInterval(async () => {
        if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
          clearInterval(interval);
          // setTimeout(() => {
          TrackPlayer.play();
          state = {
            ...state,
            isPlaying: true,
            pressed: false,
          };
          // }, 1000);
        }
      }, 250);
      // }, 1500);
    } else {
      TrackPlayer.skip(state.trackId.toString());
      let interval = setInterval(async () => {
        if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
          console.log('ready to play 2');
          clearInterval(interval);
          // setTimeout(() => {
          TrackPlayer.play();
          state = {
            ...state,
            isPlaying: true,
            pressed: false,
          };
          // }, 1000);
        }
      }, 250);
    }
    dispatch(isTrackPlaying(true));
    checkForLoad();
  }
}

// cheking to put data of new album in store
async function isAlbumImageChanged(error, result) {
  if (error) {
    console.log('Error from isAlbumImageChanged()', error);
  }
  if (state.isAlbumChanged && state.canPlayerRender) {
    console.log('isAlbumImageChanged called');
    state = {
      ...state,
      audioLoaded: false,
      needUpdate2: false,
      // isQueueEnded: true,
      // trackPlayerInit: false,
      // albumImage: JSON.parse(result),
    };
    dispatch(albumChanged(false));
    TrackPlayer.reset();
    console.log('pressed - ', state.pressed);
    if (!state.pressed) {
      loadAudio(true);
    }
  }
}

const componentUnmounted = async () => {
  const {
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
    trackId,
  } = state;
  console.log('unmounted function called');
  await AsyncStorage.multiSet([
    ['tracks_titles', JSON.stringify(tracksTitles)],
    ['tracks_authors', JSON.stringify(tracksAuthors)],
    ['tracks_duration', JSON.stringify(tracksDuration)],
    ['tracks_duration_millis', JSON.stringify(tracksDurationMillis)],
    ['first_track_id', JSON.stringify(firstTrackId)],
    ['last_track_id', JSON.stringify(lastTrackId)],
    ['track_id', JSON.stringify(trackId)],
  ]);
  TrackPlayer.stop();
  TrackPlayer.destroy();
};

const componentMounted = async () => {
  await AsyncStorage.multiGet(
    [
      'album_image',
      'tracks_titles',
      'tracks_authors',
      'tracks_duration',
      'tracks_duration_millis',
      'first_track_id',
      'last_track_id',
      'track_id',
      'loaded_size',
    ],
    (err, stores) => {
      if (err) {
        console.log(err);
      }
      console.log('stores - ', stores[1][1]);
      if (stores[1][1] !== null && stores[1][1] !== undefined) {
        console.log('mounted component called');
        dispatch(
          toggleAlbum(
            JSON.parse(stores[0][1]),
            JSON.parse(stores[1][1]),
            JSON.parse(stores[2][1]),
            JSON.parse(stores[3][1]),
            null,
            JSON.parse(stores[4][1]),
            JSON.parse(stores[5][1]),
            JSON.parse(stores[6][1]),
            true,
          ),
        );
        dispatch(updateTrackId(JSON.parse(stores[7][1])));
        state = {
          ...state,
          trackId: JSON.parse(stores[7][1]),
        };
        loadAudio(true);
        dispatch(updateLoadedSize(stores[8][1]));
      }
    },
  );
};

export const Player = () => {
  const [update, setUpdate] = useState(false);
  dispatch = useDispatch();
  if (!state.trackPlayerInit) {
    componentMounted();
    setupPlayer();
    dispatch(loadPlayer());
    state = {
      ...state,
      trackPlayerInit: true,
      minimazed: true,
      update,
    };
    setInterval(() => {
      setUpdate(true);
    }, 1000);
  }

  const {
    albumImage,
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  } = useSelector((statement) => statement.albums.currentAlbum);
  const {isAlbumChanged} = useSelector((statement) => statement.albums);

  const {trackId, minimazed} = useSelector((statement) => statement.player);
  state = {
    ...state,
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
    trackId,
    minimazed,
    albumImage,
    isAlbumChanged,
  };

  useEffect(() => {
    checkForDir();
    loadAudio();
    setInterval(async () => {
      await AsyncStorage.getItem('album_image', (err, res) =>
        isAlbumImageChanged(err, res),
      );
      await AsyncStorage.getItem('pressedd', (err, res) => isPressed(err, res));
    }, 1000);

    AppState.addEventListener('change', async (res) => {
      if (AppState.currentState === 'active') {
        if (state.trackPlayerInit) {
          await TrackPlayer.getCurrentTrack().then((id) => {
            state = {
              ...state,
              trackId: id,
            };
            dispatch(updateTrackId(id));
          });
        }
      }
    });

    return function cleanup() {
      componentUnmounted();
    };
  }, []);

  return (
    <View style={styles.container}>
      <MinimazedPlayer />
      <Modal
        animationType="slide"
        transparent={true}
        visible={!state.minimazed}
        gestureEnabled={true}
        gestureDirection="vertical">
        <View style={styles.container}>
          <TouchableOpacity
            style={{paddingBottom: 30}}
            onPress={() => {
              state = {
                ...state,
                minimazed: true,
              };
              dispatch(isMinimazed(true));
            }}>
            <Image source={require('../../../images/icons/hide/hide.png')} />
          </TouchableOpacity>
          <Image
            style={styles.albumCover}
            source={
              state.trackPlayerInit
                ? {
                    uri: state.albumImage,
                  }
                : require('../../../images/splash_phone/drawable-mdpi/vector_smart_object.png')
            }
          />
          <TrackSlider />
          <FileInfo />
          <ControlsButtons />
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageAndInfo: {
    flexDirection: 'row',
    width: 240,
    height: '100%',
    alignItems: 'center',
  },
  albumCover: {
    width: 350,
    height: 350,
  },
});
