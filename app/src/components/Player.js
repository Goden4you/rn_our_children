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
  Platform,
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import MusicControl from 'react-native-music-control';
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
  isTracksLoading,
  updateLoadedTracksCount,
} from '../store/actions/player';
import {albumChanged} from '../store/actions/albums';
import store from '../store';
import {makeLoadedTracksDir, takeLoadedSize} from '../utils/utils';
import {Dimensions} from 'react-native';

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
  deleteMusicPressed: false,
  tracks: [],
  indexForTrack: 0,
  isTracksLoading: false,
  isAlertVisible: false,
  lastFetchedTrackId: 0,
  firstStart: false,
  currentTrack: false,
};

const API_PATH = 'https://childrensproject.ocs.ru/api/v1/files/';

async function setupPlayer() {
  TrackPlayer.setupPlayer();
  const androidCapabilities = {
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_SKIP,
      TrackPlayer.CAPABILITY_SEEK_TO,
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_SET_RATING,
    ],
    stopWithApp: false,
  };
  const iphoneCapabilities = {
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_SKIP,
      TrackPlayer.CAPABILITY_SET_RATING,
    ],
    stopWithApp: false,
  };
  TrackPlayer.updateOptions(
    Platform.OS === 'android' ? androidCapabilities : iphoneCapabilities,
  );

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
        const {tracksTitles, tracksAuthors, albumImage, firstTrackId} = state;
        let id = await TrackPlayer.getCurrentTrack();
        state = {
          ...state,
          trackId: parseInt(id, 10),
        };
        id = state.trackId;
        const dur = state.tracksDurationMillis[id - firstTrackId] / 1000;
        dispatch(updateTrackId(parseInt(id, 10)));

        MusicControl.setNowPlaying({
          title: tracksTitles[id - firstTrackId].toString(),
          artist: tracksAuthors[id - firstTrackId].toString(),
          artwork: albumImage,
          duration: dur,
        });

        // let started = false;
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
        dispatch(updateAudioLoaded(true));
      }, 1500);
    } catch (_) {}
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
    if (state.isTracksLoading) {
      console.log('lastFetchedTrackId', state.lastFetchedTrackId);
      addTracksToQueue({
        trackId: state.lastFetchedTrackId + 1,
        currentTrack: state.currentTrack,
        firstStart: state.firstStart,
      });
    }
  });
  SplashScreen.hide();

  dispatch(needMoveToNextAlbum(false));
  state = {
    ...state,
    trackPlayerInit: true,
  };
}

const addTracksToQueue = async ({trackId, currentTrack, firstStart}) => {
  const {
    tracksAuthors,
    tracksTitles,
    firstTrackId,
    lastTrackId,
    indexForTrack,
    tracks,
    pressed,
  } = state;

  try {
    if (trackId > lastTrackId) {
      TrackPlayer.add(tracks);

      if (currentTrack) {
        TrackPlayer.skip(state.trackId.toString());
        TrackPlayer.updateMetadataForTrack(state.trackId.toString(), {
          artist: tracksAuthors[state.trackId - firstTrackId].toString(),
          title: tracksTitles[state.trackId - firstTrackId].toString(),
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
        tracks: [],
        indexForTrack: 0,
        audioLoaded: true,
        isPlaying: !firstStart,
        isQueueEnded: false,
        needUpdate2: true,
        isTracksLoading: false,
        isAlertVisible: false,
      };
      dispatch(isTracksLoading(false));
      dispatch(updateLoadedTracksCount(0));

      dispatch(loadTrack(pressed, state.isPlaying));
      return;
    }
    let path =
      RNFetchBlob.fs.dirs.DocumentDir + '/loaded_tracks/' + trackId + '.mp3';
    const exist = await RNFetchBlob.fs.exists(path);
    if (exist) {
      // RNFetchBlob.config({
      //   path: path,
      // })
      //   .fetch('GET', API_PATH + trackId)
      //   .then(() => {
      const dur = state.tracksDurationMillis[trackId - firstTrackId] / 1000;
      const image = state.albumImage;
      tracks[indexForTrack] = {
        id: trackId.toString(),
        url: 'file://' + path,
        artist: tracksAuthors[trackId - firstTrackId].toString(),
        title: tracksTitles[trackId - firstTrackId].toString(),
        duration: dur,
        artwork: image,
      };
      state = {
        ...state,
        tracks,
        indexForTrack: indexForTrack + 1,
        currentTrack,
        firstStart,
        lastFetchedTrackId: trackId,
      };
      dispatch(updateLoadedTracksCount(state.indexForTrack));
      addTracksToQueue({trackId: trackId + 1, currentTrack, firstStart});
      // });
      fetchTrackSize({trackId});
    } else {
      const dur = state.tracksDurationMillis[trackId - firstTrackId] / 1000;
      const image = state.albumImage;
      tracks[indexForTrack] = {
        id: trackId.toString(),
        url: 'https://childrensproject.ocs.ru/api/v1/files/' + trackId,
        artist: tracksAuthors[trackId - firstTrackId].toString(),
        title: tracksTitles[trackId - firstTrackId].toString(),
        duration: dur,
        artwork: image,
      };
      state = {
        ...state,
        tracks,
        indexForTrack: indexForTrack + 1,
        currentTrack,
        firstStart,
        lastFetchedTrackId: trackId,
      };
      addTracksToQueue({trackId: trackId + 1, currentTrack, firstStart});
      dispatch(updateLoadedTracksCount(state.indexForTrack));

      fetchTrackSize({trackId});
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
};

async function loadAudio(currentTrack, firstStart) {
  const {trackId, firstTrackId} = state;

  try {
    if (trackId !== 0 && trackId !== undefined && trackId !== null) {
      addTracksToQueue({trackId: firstTrackId, currentTrack, firstStart});
      dispatch(isTracksLoading(true));
      state = {
        ...state,
        isTracksLoading: true,
        isAlertVisible: true,
      };
    }
  } catch (_) {}
}

async function fetchTrackSize({trackId}) {
  let {loadedMusicSize, deleteMusicPressed} = state;
  if (deleteMusicPressed) {
    loadedMusicSize = 0;
  }
  await fetch(API_PATH + trackId).then((data) => {
    let fileSize = data.headers.get('Content-Length');
    let totalSize = parseInt(fileSize, 10) + loadedMusicSize;
    dispatch(updateLoadedSize(totalSize));
    state = {...state, loadedMusicSize: totalSize};
  });
}

function isPressed() {
  state = {
    ...state,
    pressed: true,
  };
  dispatch(updatePressed(false));
  if (!state.isTracksLoading) {
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
}

function isAlbumImageChanged(move) {
  state = {
    ...state,
    audioLoaded: false,
    needUpdate2: false,
  };
  TrackPlayer.reset();
  dispatch(albumChanged(false));
  dispatch(updateAudioLoaded(false));
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
  const audioLoaded = useSelector((statement) => statement.player.audioLoaded);
  const deleteMusicPressed = useSelector(
    (statement) => statement.player.deleteMusicPressed,
  );

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
    deleteMusicPressed,
    isAlbumLoading,
    audioLoaded,
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

const phoneHeight = Dimensions.get('window').height;

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
    height: phoneHeight < 800 ? '80%' : '60%',
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
