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
import {
  albumChanged,
  toggleAlbum,
  updateAlbumImage,
} from '../store/actions/albums';
import store from '../store';

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
  firstRun: true,
  pressed: false,
  interval: 0,
  canPlayerRender: true,
  formattedDurMillis: [],
  loadedMusicSize: 0,
  isQueueEnded: false,
  needUpdate2: false,
  albumImage: null,
  isPlaying: false,
};

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
      console.log('isQueueEnded from playback-queue-ended called');
    }
  });

  TrackPlayer.addEventListener('playback-track-changed', async () => {
    try {
      if (
        state.isPlaying &&
        !state.isQueueEnded &&
        !state.firstRun &&
        state.audioLoaded
      ) {
        let id = await TrackPlayer.getCurrentTrack();
        state = {
          ...state,
          trackId: parseInt(id, 10),
        };
        dispatch(updateTrackId(parseInt(id, 10)));
        console.log('updateTrackId from playback-track-changed called');

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
}

async function checkForDir() {
  let fs = RNFetchBlob.fs;
  const res = await fs.exists(fs.dirs.CacheDir + '/loaded_tracks/');
  if (!res) {
    await fs.mkdir(fs.dirs.CacheDir + '/loaded_tracks/');
  }
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
        // needUpdate2: true,
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

async function isPressed() {
  console.log('isPressed called');
  state = {
    ...state,
    needUpdate: false,
    pressed: true,
  };

  state = {
    ...state,
    needUpdate: true,
  };

  if (!state.audioLoaded) {
    console.log('loadAudio called from isPressed');
    let interval = setInterval(() => {
      if (state.firstTrackId) {
        clearInterval(interval);
        loadAudio(true, false);
      }
    }, 250);
  } else {
    TrackPlayer.skip(state.trackId.toString());
    let interval = setInterval(async () => {
      if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
        console.log('skipped from isPressed');
        TrackPlayer.play();
        clearInterval(interval);
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

async function isAlbumImageChanged(move) {
  console.log('isAlbumImageChanged called');
  state = {
    ...state,
    audioLoaded: false,
    needUpdate2: false,
  };
  dispatch(albumChanged(false));
  TrackPlayer.reset();
  if (move) {
    dispatch(needMoveToNextAlbum(false));
    setTimeout(() => {
      console.log('loadAudio called from album changed');
      loadAudio(true, false);
    }, 1000);
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
  if (tracksTitles) {
    await AsyncStorage.multiSet([
      ['tracks_titles', JSON.stringify(tracksTitles)],
      ['tracks_authors', JSON.stringify(tracksAuthors)],
      ['tracks_duration', JSON.stringify(tracksDuration)],
      ['tracks_duration_millis', JSON.stringify(tracksDurationMillis)],
      ['first_track_id', JSON.stringify(firstTrackId)],
      ['last_track_id', JSON.stringify(lastTrackId)],
      ['track_id', JSON.stringify(trackId)],
    ]);
  }
  TrackPlayer.stop();
  TrackPlayer.destroy();
  AppState.removeEventListener('change');
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
      if (stores[1][1]) {
        dispatch(updateAlbumImage(JSON.parse(stores[0][1])));
        dispatch(
          toggleAlbum(
            JSON.parse(stores[1][1]),
            JSON.parse(stores[2][1]),
            JSON.parse(stores[3][1]),
            null,
            JSON.parse(stores[4][1]),
            JSON.parse(stores[5][1]),
            JSON.parse(stores[6][1]),
          ),
        );
        dispatch(updateTrackId(JSON.parse(stores[7][1])));
        state = {
          ...state,
          trackId: JSON.parse(stores[7][1]),
        };
        dispatch(updateLoadedSize(stores[8][1]));
      }
    },
  );
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
  const {currentAlbumImage, isAlbumChanged} = useSelector(
    (statement) => statement.albums,
  );
  const {trackId, minimazed, moveToNextAlbum, pressed} = useSelector(
    (statement) => statement.player,
  );

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
  };

  useEffect(() => {
    componentMounted();
    setupPlayer();
    state = {
      ...state,
      trackPlayerInit: true,
    };
    checkForDir();
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
  albumCover: {
    width: '80%',
    height: '50%',
  },
});
