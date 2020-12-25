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
  updateAudioLoaded,
} from '../store/actions/player';
import {albumChanged} from '../store/actions/albums';
import store from '../store';
import {makeLoadedTracksDir, takeLoadedSize} from '../utils/utils';

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
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
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
        dispatch(updateTrackId(parseInt(id, 10)));

        let interval = setInterval(async () => {
          const playerState = await TrackPlayer.getState();
          if (playerState === TrackPlayer.STATE_READY && state.isPlaying) {
            clearInterval(interval);
            TrackPlayer.play();
          } else if (
            playerState === TrackPlayer.STATE_PLAYING ||
            playerState === TrackPlayer.STATE_PAUSED
          ) {
            clearInterval(interval);
            TrackPlayer.play();
          }
        }, 500);
      }
      setTimeout(() => {
        dispatch(updateAudioLoaded());
      }, 800);
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

  AppState.addEventListener('change', async (res) => {
    if (AppState.currentState === 'active') {
      if (state.audioLoaded) {
        await TrackPlayer.getCurrentTrack().then((id) => {
          state = {
            ...state,
            trackId: parseInt(id, 10),
          };
          dispatch(updateTrackId(parseInt(id, 10)));
        });
      }
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
      for (let i = firstTrackId; i <= lastTrackId; i++) {
        var path =
          RNFetchBlob.fs.dirs.DocumentDir + '/loaded_tracks/' + i + '.mp3';
        const res = await RNFetchBlob.fs.exists(path);
        const dur = state.tracksDurationMillis[i - firstTrackId] / 1000;
        console.log('dur in loadAudio -', dur);
        const image = state.albumImage;
        if (res) {
          await RNFetchBlob.fs.readFile(path).then(() => {
            path = 'file://' + path;
            track[j] = {
              id: i.toString(),
              url: path,
              artist: tracksAuthors[i - firstTrackId].toString(),
              title: tracksTitles[i - firstTrackId].toString(),
              duration: Math.round(dur),
              artwork: image,
            };
          });
        } else {
          track[j] = {
            id: i.toString(),
            url: 'https://childrensproject.ocs.ru/api/v1/files/' + i,
            artist: tracksAuthors[i - firstTrackId].toString(),
            title: tracksTitles[i - firstTrackId].toString(),
            duration: Math.round(dur),
            artwork: image,
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
      RNFetchBlob.fs.dirs.DocumentDir + '/loaded_tracks/' + trackId + '.mp3';
    await RNFetchBlob.fs.exists(path).then(async (exist) => {
      if (!exist) {
        RNFetchBlob.config({
          path: path,
        }).fetch('GET', API_PATH + trackId);
        await fetch(API_PATH + trackId).then((data) => {
          let fileSize = data.headers.get('Content-Length');
          let totalSize = parseInt(fileSize, 10) + loadedMusicSize;
          dispatch(updateLoadedSize(totalSize));
          state = {...state, loadedMusicSize: totalSize};
        });
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
      if (
        (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
        TrackPlayer.STATE_PAUSED
      ) {
        clearInterval(interval);
        TrackPlayer.play();
        state = {
          ...state,
          isPlaying: true,
          pressed: false,
        };
      }
    }, 250);
  }
  dispatch(updatePressed(false));
  dispatch(isTrackPlaying(true));
}

function isAlbumImageChanged(move) {
  state = {
    ...state,
    audioLoaded: false,
    needUpdate2: false,
  };
  TrackPlayer.reset();
  dispatch(albumChanged(false));
  if (move) {
    dispatch(needMoveToNextAlbum(false));
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
  let size = await takeLoadedSize();
  size = JSON.parse(size);
  dispatch(updateLoadedSize(size));
  state = {
    ...state,
    loadedMusicSize: size,
  };
};

export const Player = () => {
  dispatch = useDispatch();

  const {
    tracksTitles,
    tracksAuthors,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  } = useSelector((statement) => statement.albums.currentAlbum);
  const {albumsPhotos} = useSelector((statement) => statement.albums.allAlbums);
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
    tracksDurationMillis,
    albumsPhotos,
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
