import React, {useEffect} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';
import {
  isTrackPlaying,
  handlePrevNext,
  isQueueEnded,
  needMoveToNextAlbum,
} from '../../store/actions/player';
import {albumChanged, updateAlbumImage} from '../../store/actions/albums';

var state = {};
var dispatch;

export const handlePlayPause = async () => {
  if (state.audioLoaded) {
    state.isPlaying ? TrackPlayer.pause() : TrackPlayer.play();
    dispatch(isTrackPlaying(!state.isPlaying));
  }
};

export const handlePreviousTrack = async () => {
  console.log('audio loaded? -', state.audioLoaded);
  if (state.audioLoaded) {
    let {trackId} = state;
    if (JSON.parse(trackId) - 1 >= state.firstTrackId) {
      trackId -= 1;
      state = {
        ...state,
        trackId,
        currentTime: 0,
        formattedCurrentTime: '00:00',
        pressed: false,
      };

      TrackPlayer.skipToPrevious().then(() => {
        state = {
          ...state,
          audioLoaded: true,
          isPlaying: true,
        };

        dispatch(handlePrevNext(trackId));
      });
    } else {
      TrackPlayer.seekTo(0);
    }
  }
};

export const handleNextTrack = async () => {
  if (state.audioLoaded) {
    let {trackId, lastTrackId, veryLastTrackId, veryFirstTrackId} = state;

    if (trackId === veryLastTrackId) {
      TrackPlayer.pause();
      state = {
        ...state,
        isPlaying: false,
      };
      dispatch(isTrackPlaying(false));
      return;
    }

    if (trackId !== veryFirstTrackId - 1) {
      if (trackId + 1 <= lastTrackId) {
        trackId += 1;
        state = {
          ...state,
          trackId,
          currentTime: 0,
          formattedCurrentTime: '00:00',
          pressed: false,
        };

        TrackPlayer.skipToNext().then(() => {
          state = {
            ...state,
            audioLoaded: true,
            isPlaying: true,
          };
          console.log('trackId from handleNext - ', trackId);
          dispatch(handlePrevNext(trackId));
        });
      } else {
        TrackPlayer.stop();
        dispatch(needMoveToNextAlbum(true));
        console.log('move to next album prop true set');
        trackId = parseInt(trackId, 10) + 2;

        state = {
          ...state,
          currentTime: 0,
          audioLoaded: false,
          formattedCurrentTime: '00:00',
          pressed: false,
        };
        dispatch(handlePrevNext(trackId));
        moveNextAlbum();
      }
    }
  }
};

function moveNextAlbum() {
  let albumId = state.curAlbumId;
  let albumDesc = state.curAlbumDesc;
  let albumsIds = state.allAlbumsIds;

  // albumDesc = albumDesc.toString().substring(0, 2);
  // albumDesc = parseInt(albumDesc, 10);

  switch (albumId) {
    case parseInt(albumsIds[0], 10):
      albumId = albumsIds[1];
      break;
    case parseInt(albumsIds[1], 10):
      albumDesc += 3;
      albumId = albumsIds[2];
      break;
    case parseInt(albumsIds[2], 10):
      albumDesc += 2;
      albumId = albumsIds[3];
      break;
    case parseInt(albumsIds[3], 10):
      albumDesc -= 4;
      albumId = albumsIds[4];
      break;
    case parseInt(albumsIds[4], 10):
      albumId = albumsIds[5];
      break;
    case parseInt(albumsIds[5], 10):
      albumDesc += 4;
      albumId = albumsIds[6];
      break;
    case parseInt(albumsIds[6], 10):
      return;
    default:
      break;
  }
  state = {
    ...state,
    albumImage: state.albumsPhotos[albumId - parseInt(albumsIds[0], 10)],
  };
  dispatch(updateAlbumImage(state.albumImage));
  dispatch(albumChanged(true, albumDesc, albumId));
}

export const ControlsButtons = () => {
  dispatch = useDispatch();

  useEffect(() => {
    setInterval(() => {
      if (state.queueEnded) {
        handleNextTrack();
        dispatch(isQueueEnded(false));
      }
    }, 500);
  }, []);

  const {
    audioLoaded,
    isPlaying,
    trackId,
    queueEnded,
    curAlbumId,
    curAlbumDesc,
  } = useSelector((statement) => statement.player);
  const {firstTrackId, lastTrackId, albumImage} = useSelector(
    (statement) => statement.albums.currentAlbum,
  );
  const {veryFirstTrackId, veryLastTrackId, allAlbums} = useSelector(
    (statement) => statement.albums,
  );
  state = {
    ...state,
    audioLoaded,
    isPlaying,
    trackId,
    firstTrackId,
    lastTrackId,
    albumImage,
    veryFirstTrackId,
    veryLastTrackId,
    queueEnded,
    curAlbumId,
    curAlbumDesc,
    allAlbumsIds: allAlbums.albumsIds,
    albumsPhotos: allAlbums.albumsPhotos,
  };
  return (
    <View style={styles.controls}>
      <TouchableOpacity style={styles.control} onPress={handlePreviousTrack}>
        <Image
          source={require('../../../../images/icons/playerControl/prevHit/prevHitCopy.png')}
          style={styles.controlImage}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.control} onPress={handlePlayPause}>
        {state.isPlaying ? (
          <Image
            source={require('../../../../images/icons/playerControl/pauseHit/pauseHitCopy.png')}
            style={styles.controlImage}
          />
        ) : (
          <Image
            source={require('../../../../images/icons/playerControl/playHit/playHitCopy.png')}
            style={styles.controlImage}
          />
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.control} onPress={handleNextTrack}>
        <Image
          source={require('../../../../images/icons/playerControl/nextHit/nextHitCopy.png')}
          style={styles.controlImage}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '43%',
  },
  control: {
    padding: '4%',
    width: '23%',
  },
  controlImage: {
    width: '100%',
    resizeMode: 'contain',
  },
});
