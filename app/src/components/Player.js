import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  AppState,
  Text,
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
} from '../store/actions/player';
import {albumChanged} from '../store/actions/albums';

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

function setupPlayer() {
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
      // this.handleNextTrack(); // TODO
      console.log('queue ended');
    }
  });

  TrackPlayer.addEventListener('playback-track-changed', async () => {
    if (state.isPlaying && !state.isQueueEnded && !state.pressed) {
      let trackId = await TrackPlayer.getCurrentTrack();
      state = {
        ...state,
        trackId,
      };
      dispatch(updateTrackId(trackId));

      await AsyncStorage.setItem('track_id', JSON.stringify(trackId));
      let interval = setInterval(async () => {
        if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
          console.log('ready to play');
          clearInterval(interval);
          setTimeout(() => {
            TrackPlayer.play();
          }, 1000);
        }
      }, 250);
    }
    checkForLoad();
  });

  SplashScreen.hide();
}

async function checkForDir() {
  let fs = RNFetchBlob.fs;
  await fs.exists(fs.dirs.CacheDir + '/loaded_tracks/').then(async (res) => {
    if (!res) {
      await fs.mkdir(fs.dirs.CacheDir + '/loaded_tracks/');
    }
    console.log('Is dir for loaded tracks exist? -', res);
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
    if (trackId !== 0 && trackId !== undefined) {
      console.log('track id ', trackId);
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

// TODO по хорошему нужно вынести в отдельный файл
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
      needUpdate: false, // this is to prevent double call of this function
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
      console.log('track id from async storage', res);
      dispatch(updateTrackId(JSON.parse(res)));
    });

    if (!state.audioLoaded) {
      console.log('вызвана поеботень, trackId = ', state.trackId);
      loadAudio();
      setTimeout(async () => {
        TrackPlayer.skip(state.trackId.toString());
        let interval = setInterval(async () => {
          if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
            clearInterval(interval);
            setTimeout(() => {
              TrackPlayer.play();
              state = {
                ...state,
                isPlaying: true,
              };
            }, 1000);
          }
        }, 250);
      }, 1500);
    } else {
      TrackPlayer.skip(state.trackId.toString());
      let interval = setInterval(async () => {
        if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
          console.log('ready to play 2');
          clearInterval(interval);
          setTimeout(() => {
            TrackPlayer.play();
            state = {
              ...state,
              isPlaying: true,
            };
          }, 1000);
        }
      }, 250);
    }
    dispatch(isTrackPlaying(true));
    checkForLoad();
  }
}

// cheking to put data of new album in store
function isAlbumImageChanged(error, result) {
  if (error) {
    console.log('Error from isAlbumImageChanged()', error);
  }
  if (state.isAlbumChanged && state.canPlayerRender) {
    console.log('isAlbumImageChanged called');
    state = {
      ...state,
      audioLoaded: false,
      // trackPlayerInit: false,
      albumImage: JSON.parse(result),
    };
    dispatch(albumChanged(false));
    TrackPlayer.reset();
  }
}

export const Player = () => {
  dispatch = useDispatch();
  if (!state.trackPlayerInit) {
    setupPlayer();
    dispatch(loadPlayer());
    state = {
      ...state,
      trackPlayerInit: true,
      minimazed: true,
    };
  }

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
      console.log(res);
      if (AppState.currentState === 'active') {
        console.log('Screen now active');
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
  }, []);

  const {
    albumImage,
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksIds,
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
    tracksIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
    trackId,
    minimazed,
    albumImage,
    isAlbumChanged,
  };

  console.log('Player called');

  // TODO
  // AsyncStorage.setItem('move_to_next_album', JSON.stringify(false)); // dropping back moving to next album

  // TODO Данные в минимизированный плеер, инфу о файле, слайдер пойдут через редакс

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
        </View>
        <ControlsButtons />
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
