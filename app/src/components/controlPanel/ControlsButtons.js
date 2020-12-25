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
  if (state.audioLoaded) {
    let {trackId} = state;
    if (JSON.parse(trackId) - 1 >= state.firstTrackId) {
      trackId -= 1;
      state = {
        ...state,
        trackId,
        audioLoaded: false,
      };

      dispatch(handlePrevNext(trackId));
      TrackPlayer.skipToPrevious().then(() => {
        setTimeout(() => {
          state = {
            ...state,
            audioLoaded: true,
            isPlaying: true,
          };
        }, 250);
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
        };

        TrackPlayer.skipToNext().then(() => {
          state = {
            ...state,
            audioLoaded: true,
            isPlaying: true,
          };
          dispatch(handlePrevNext(trackId));
        });
      } else {
        TrackPlayer.stop();
        dispatch(needMoveToNextAlbum(true));
        console.log('move to next album prop true set');
        trackId = parseInt(trackId, 10) + 2;

        state = {
          ...state,
          audioLoaded: false,
        };
        dispatch(handlePrevNext(trackId));
        moveNextAlbum();
      }
    }
  }
};

function moveNextAlbum() {
  let albumsIds = state.allAlbumsIds;
  let firstAlbumId = albumsIds[0];
  let albumId = albumsIds[state.curAlbumId - firstAlbumId + 1];
  let albumDesc = state.allAlbumsDesc[albumId - firstAlbumId];
  albumDesc = albumDesc.toString().substring(0, 2);
  albumDesc = parseInt(albumDesc, 10);
  state = {
    ...state,
    albumImage: state.albumsPhotos[albumId - firstAlbumId],
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
    allAlbumsDesc: allAlbums.albumsDesc,
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
