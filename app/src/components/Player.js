import React, {useEffect} from 'react';
import {
  StyleSheet,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Alert,
  AppState,
  Linking,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import AsyncStorage from '@react-native-community/async-storage';
import SplashScreen from 'react-native-splash-screen';
import RNFetchBlob from 'rn-fetch-blob';

import {MinimazedPlayer} from './minimazedPlayer/MinimazedPlayer';
import {FileInfo} from './musicInfo/FileInfo';
import {TrackSlider} from './slider/TrackSlider';
import {ControlsButtons} from './controlPanel/ControlsButtons';
import {useSelector, useDispatch} from 'react-redux';
import {
  loadTrack,
  trackLoadingError,
  updateTrackId,
  updateLoadedSize,
  isTrackPlaying,
  isMinimazed,
  isQueueEnded,
  updatePressed,
  needMoveToNextAlbum,
} from '../store/actions/player';
import {albumChanged} from '../store/actions/albums';
import store from '../store';
import {makeLoadedTracksDir} from '../utils/utils';

var dispatch;
var state = {
  minimazed: true,
  audioLoaded: false,
  pressed: false,
  loadedMusicSize: 0,
  isQueueEnded: false,
  needUpdate2: false,
  albumImage: null,
  isPlaying: false,
};

const API_PATH = 'https://childrensproject.ocs.ru/api/v1/files/';

async function setupPlayer() {
  TrackPlayer.setupPlayer();
  TrackPlayer.updateOptions({
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_SKIP,
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
        console.log('trackId from listener - ', parseInt(id, 10));
        dispatch(updateTrackId(parseInt(id, 10)));

        let interval = setInterval(async () => {
          if (
            (await TrackPlayer.getState()) === TrackPlayer.STATE_READY &&
            state.isPlaying
          ) {
            clearInterval(interval);
            TrackPlayer.play();
          } else if (
            (await TrackPlayer.getState()) === TrackPlayer.STATE_PLAYING
          ) {
            clearInterval(interval);
          }
        }, 500);
      }
      checkForLoad();
    } catch (e) {
      console.log(e);
    }
  });

  Linking.addEventListener('url', (data) => {
    if (data.url === 'trackplayer://notification.click') {
      Linking.openURL(data.url);
    }
  });
  SplashScreen.hide();

  dispatch(needMoveToNextAlbum(false));
  state = {
    ...state,
    trackPlayerInit: true,
  };
}

async function loadAudio(currentTrack, firstStart) {
  const {
    trackId,
    pressed,
    tracksAuthors,
    tracksTitles,
    firstTrackId,
    lastTrackId,
  } = state;

  try {
    if (trackId !== 0 && trackId !== undefined && trackId !== null) {
      console.log('loadAudio started', trackId);
      let j = 0;
      var track = [];
      console.log('firstTrackId - ', firstTrackId);
      console.log('lastTrackId - ', lastTrackId);
      for (let i = firstTrackId; i <= lastTrackId; i++) {
        var path =
          RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + i + '.mp3';

        const res = await RNFetchBlob.fs.exists(path);
        if (res) {
          console.log('read from cache');
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
      }

      TrackPlayer.add(track);

      if (currentTrack) {
        TrackPlayer.skip(trackId.toString());
        TrackPlayer.updateMetadataForTrack(trackId.toString(), {
          artist: tracksAuthors[trackId - firstTrackId].toString(),
          title: tracksTitles[trackId - firstTrackId].toString(),
        });
        if (!firstStart) {
          TrackPlayer.play();
        }
        state = {
          ...state,
          pressed: false,
        };
      }

      state = {
        ...state,
        audioLoaded: true,
        isPlaying: !firstStart,
        isQueueEnded: false,
        needUpdate2: true,
      };
      dispatch(loadTrack(pressed, state.isPlaying));
    }
  } catch (e) {
    Alert.alert(
      'Ошибка',
      'Не удалось загрузить музыку',
      [
        {
          text: 'Ок',
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
      if (!exist) {
        await fetch(API_PATH + trackId).then((data) => {
          let fileSize = data.headers.get('Content-Length');
          let totalSize = parseInt(fileSize, 10) + loadedMusicSize;
          console.log('total size 1-', totalSize);
          dispatch(updateLoadedSize(totalSize));
          state = {...state, loadedMusicSize: totalSize};
        });
        await RNFetchBlob.fs.writeFile(path, API_PATH + trackId);
      }
    });
  } catch (e) {
    console.log(e);
  }
}

function isPressed() {
  console.log('isPressed called');
  state = {
    ...state,
    pressed: true,
  };

  if (!state.audioLoaded) {
    console.log('loadAudio called from isPressed');
    let interval = setInterval(() => {
      if (
        !state.isAlbumLoading &&
        state.trackId >= state.firstTrackId &&
        state.trackId <= state.lastTrackId
      ) {
        clearInterval(interval);
        loadAudio(true, false);
      }
    }, 250);
  } else {
    TrackPlayer.skip(state.trackId.toString());
    let interval = setInterval(async () => {
      if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
        clearInterval(interval);
        console.log('skipped from isPressed');
        TrackPlayer.play();
        state = {
          ...state,
          isPlaying: true,
          pressed: false,
        };
        console.log('set isPlaying from isPressed');
      }
    }, 250);
  }
  dispatch(updatePressed(false));
  dispatch(isTrackPlaying(true));
  checkForLoad();
}

function isAlbumImageChanged(move) {
  console.log('isAlbumImageChanged called');
  state = {
    ...state,
    audioLoaded: false,
    needUpdate2: false,
  };
  TrackPlayer.reset();
  dispatch(albumChanged(false));
  if (move) {
    dispatch(needMoveToNextAlbum(false));
    setTimeout(() => {
      console.log('loadAudio called from album changed');
      loadAudio(true, false);
    }, 1000);
  }
}

const componentUnmounted = async () => {
  state = {};
  TrackPlayer.stop();
  TrackPlayer.destroy();
  AppState.removeEventListener('change');
  Linking.removeEventListener('url');
};

const componentMounted = async () => {
  setupPlayer();
  makeLoadedTracksDir();
  let size = await AsyncStorage.getItem('loaded_size');
  size = JSON.parse(size);
  dispatch(updateLoadedSize(size));
  state = {
    ...state,
    loadedMusicSize: size,
  };
  console.log(state);
};

export const Player = () => {
  dispatch = useDispatch();

  const {
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  } = useSelector((statement) => statement.albums.currentAlbum);
  const currentAlbumImage = useSelector(
    (statement) => statement.albums.currentAlbumImage,
  );
  const isAlbumChanged = useSelector(
    (statement) => statement.albums.isAlbumChanged,
  );
  const isAlbumLoading = useSelector(
    (statement) => statement.albums.isAlbumLoading,
  );
  const trackId = useSelector((statement) => statement.player.trackId);
  const minimazed = useSelector((statement) => statement.player.minimazed);
  const moveToNextAlbum = useSelector(
    (statement) => statement.player.moveToNextAlbum,
  );
  const pressed = useSelector((statement) => statement.player.pressed);

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
    albumImage: currentAlbumImage,
    isAlbumChanged,
    moveToNextAlbum,
    pressed,
    isAlbumLoading,
  };

  useEffect(() => {
    componentMounted();
    state.firstTrackId ? loadAudio(true, true) : null;
    const unsubscribe = store.subscribe(() => store.getState());
    unsubscribe();

    setInterval(() => {
      if (state.isAlbumChanged === true) {
        isAlbumImageChanged(state.moveToNextAlbum);
      }
      if (state.pressed) {
        isPressed();
      }
    }, 250);

    AppState.addEventListener('change', async (res) => {
      if (AppState.currentState === 'active') {
        if (state.audioLoaded) {
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
          <View style={styles.imgBtnWrap}>
            <TouchableOpacity
              style={styles.closeBtn}
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
          </View>
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
  albumCover: {
    width: '80%',
    height: '80%',
  },
  closeBtn: {paddingBottom: 30},
  imgBtnWrap: {
    top: 10,
    width: '100%',
    height: '60%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
