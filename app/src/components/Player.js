import React, {useEffect} from 'react';
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
  initPlayer,
  loadTrack,
  trackLoadingError,
  updateStorage,
} from '../store/actions/player';

const API_PATH = 'https://childrensproject.ocs.ru/api/v1/files/';

var dispatch;
var selector;

var state = {
  currentIndex: 0,
  volume: 1.0,
  isBuffering: true,
  currentTime: 0,
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
};

function setupPlayer() {
  TrackPlayer.setupPlayer().then(() => {
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
  });

  TrackPlayer.addEventListener('playback-queue-ended', async () => {
    if (state.isPlaying && state.needUpdate2) {
      state = {
        ...state,
        trackId: state.lastTrackId,
        isQueueEnded: true,
      };
      await TrackPlayer.reset();
      this.handleNextTrack();
      console.log('queue ended');
    }
  });

  TrackPlayer.addEventListener('playback-track-changed', async () => {
    if (state.isPlaying && !state.isQueueEnded && !state.pressed) {
      await TrackPlayer.getCurrentTrack().then((res) => {
        state = {
          ...state,
          trackId: parseInt(res, 10),
        };
        useDispatch(updateStorage({trackId: parseInt(res, 10)}));
        let interval = setInterval(async () => {
          if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
            console.log('ready to play');
            clearInterval(interval);
            setTimeout(async () => {
              await TrackPlayer.play();
            }, 1000);
          }
        }, 250);
      });
    }
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

const getStoreToState = () => {
  const {
    albumImage,
    tracksTitles,
    tracksAauthors,
    tracksDuration,
    tracksIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  } = selector((statement) => statement.albums.currentAlbum);

  let trackId = selector((statement) => statement.player.currentTrack);

  state = {
    ...state,
    tracksTitles,
    tracksAauthors,
    tracksDuration,
    tracksIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
    albumImage,
    trackId,
  };

  loadAudio(true);
};

async function loadAudio(currentTrack) {
  const {
    isPlaying,
    trackId,
    pressed,
    trackPlayerInit,
    trackList,
    firstTrackId,
    lastTrackId,
  } = state;

  try {
    let j = 0; // for array of objects
    var track = [];
    for (let i = firstTrackId; i <= lastTrackId; i++) {
      var path = RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + i + '.mp3';

      await RNFetchBlob.fs.exists(path).then(async (res) => {
        if (res) {
          await RNFetchBlob.fs.readFile(path).then((uri) => {
            console.log(uri);
            track[j] = {
              id: i.toString(),
              url: uri,
              artist: trackList.authors[i - firstTrackId].toString(),
              title: trackList.titles[i - firstTrackId].toString(),
            };
          });
        } else {
          track[j] = {
            id: i.toString(),
            url: 'https://childrensproject.ocs.ru/api/v1/files/' + i,
            artist: trackList.authors[i - firstTrackId].toString(),
            title: trackList.titles[i - firstTrackId].toString(),
          };
        }
        j++;
      });
    }
    await TrackPlayer.add(track);

    state = {
      ...state,
      audioLoaded: true,
      isPlaying: pressed ? true : isPlaying,
      isQueueEnded: false,
      needUpdate2: true,
    };

    dispatch(loadTrack(pressed, isPlaying));
    dispatch(updateStorage({trackPositionInterval: false}));

    if (currentTrack) {
      await TrackPlayer.skip(trackId.toString());
    }

    if (!trackPlayerInit) {
      dispatch(initPlayer());
      state = {...state, trackPlayerInit: true};
    }

    checkForLoad();
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
        await fetch(API_PATH + trackId).then(async (data) => {
          let fileSize = data.headers.get('Content-Length');
          let totalSize = parseInt(fileSize, 10) + loadedMusicSize;

          dispatch(updateStorage({totalSize}));
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
    state = {
      ...state,
      needUpdate: false, // this is to prevent double call of this function
      pressed: true,
      canPlayerRender: true,
    };

    await AsyncStorage.setItem(
      'pressedd',
      JSON.stringify(false),
      () => (state = {...state, needUpdate: true}),
    );

    let trackId = selector((statement) => statement.player.trackId);
    state = {
      ...state,
      trackId,
    };

    if (!state.trackPlayerInit) {
      setTimeout(async () => {
        await TrackPlayer.skip(trackId).then(() => {
          let interval = setInterval(async () => {
            if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
              clearInterval(interval);
              setTimeout(async () => {
                await TrackPlayer.play().then(
                  () =>
                    (state = {
                      ...state,
                      isPlaying: true,
                    }),
                );
              }, 1000);
            }
          }, 250);
        });
      }, 1500);
    } else {
      await TrackPlayer.skip(trackId.toString()).then(() => {
        let interval = setInterval(async () => {
          if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
            console.log('ready to play 2');
            clearInterval(interval);
            setTimeout(async () => {
              await TrackPlayer.play().then(
                () =>
                  (state = {
                    ...state,
                    isPlaying: true,
                  }),
              );
            }, 1000);
          }
        }, 250);
      });
    }
    dispatch(updateStorage({isPlaying: true}));
    checkForLoad();
  }
}

// cheking to put data of new album in store
async function isAlbumImageChanged(error, result) {
  if (error) {
    console.log('Error from isAlbumImageChanged()', error);
  }
  if (JSON.parse(result) !== state.albumImage && state.canPlayerRender) {
    console.log('album image', result);
    state = {
      ...state,
      audioLoaded: false,
      trackPlayerInit: false,
      albumImage: JSON.parse(result), // this is needed to prevent double call of this function
    };
    await TrackPlayer.reset();
    getStoreToState(); // put store in state
  }
}

// callback function to check can player render or not
async function canPlayerRender(err, res) {
  if (err) {
    console.log('Error from canPlayerRender()', err);
  }
  if (JSON.parse(res) !== state.canPlayerRender) {
    if (JSON.parse(res) === false) {
      if (state.audioLoaded) {
        await TrackPlayer.reset();
      }
      await AsyncStorage.setItem('can_player_render', JSON.stringify(true));
      state = {
        ...state,
        isPlaying: false,
        audioLoaded: false,
        albumImage: null,
        playbackInstance: null,
        trackPlayerInit: false,
        canPlayerRender: false,
        loadedMusicSize: 0,
      };
      dispatch(updateStorage(state));
    }
  }
}

export const Player = () => {
  dispatch = useDispatch();
  selector = useSelector();
  useEffect(() => {
    setupPlayer();
    checkForDir();
    setInterval(async () => {
      await AsyncStorage.getItem('album_image', (err, res) => {
        isAlbumImageChanged(err, res);
      });
      await AsyncStorage.getItem('pressedd', (err, res) => isPressed(err, res));
      await AsyncStorage.getItem('can_player_render', (err, res) =>
        canPlayerRender(err, res),
      );
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
            dispatch(updateStorage({trackId: id}));
          });
        }
      }
    });
  });

  const {albumImage} = useSelector(
    (statement) => statement.albums.currentAlbum,
  );
  if (albumImage !== null) {
    getStoreToState();
  }

  AsyncStorage.setItem('move_to_next_album', JSON.stringify(false)); // dropping back moving to next album

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
              dispatch(updateStorage({minimazed: true}));
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
