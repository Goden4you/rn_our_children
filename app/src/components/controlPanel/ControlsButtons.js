import React, {useEffect} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';
import {
  isTrackPlaying,
  handlePrevNext,
  isQueueEnded,
} from '../../store/actions/player';

var state = {};
var dispatch;

const handlePlayPause = async () => {
  if (state.audioLoaded) {
    const {isPlaying} = state;

    isPlaying ? TrackPlayer.pause() : TrackPlayer.play();

    state = {
      ...state,
      isPlaying: !isPlaying,
    };

    dispatch(isTrackPlaying(!isPlaying));
  }
};

const handlePreviousTrack = async () => {
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
        let interval = setInterval(async () => {
          if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
            clearInterval(interval);

            await AsyncStorage.setItem(
              'track_id',
              JSON.stringify(state.trackId),
            );
            setTimeout(() => {
              TrackPlayer.play().then(() => {
                state = {
                  ...state,
                  audioLoaded: true,
                  isPlaying: true,
                };

                dispatch(handlePrevNext(trackId));
              });
            }, 1000);
          }
        }, 250);
      });
    } else {
      TrackPlayer.seekTo(0);
    }
  }
};

const handleNextTrack = async () => {
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
      console.log('last track', lastTrackId);
      console.log('track id', trackId);
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
          console.log('skipped to next - ', trackId);
          let interval = setInterval(async () => {
            if ((await TrackPlayer.getState()) === TrackPlayer.STATE_READY) {
              clearInterval(interval);

              await AsyncStorage.setItem(
                'track_id',
                JSON.stringify(state.trackId),
              );
              TrackPlayer.play().then(() => {
                state = {
                  ...state,
                  audioLoaded: true,
                  isPlaying: true,
                };

                dispatch(handlePrevNext(trackId));
              });
            }
          }, 250);
        });
      } else {
        await AsyncStorage.setItem(
          'move_to_next_album',
          JSON.stringify(true),
          () => console.log('move to next album prop true set'),
        );
        await AsyncStorage.setItem(
          'track_id',
          JSON.stringify(parseInt(trackId, 10) + 2),
        );

        trackId = parseInt(trackId, 10) + 2;

        state = {
          ...state,
          currentTime: 0,
          audioLoaded: false,
          formattedCurrentTime: '00:00',
          pressed: false,
        };

        dispatch(handlePrevNext(trackId));
      }
    }
  }
};

export const ControlsButtons = () => {
  dispatch = useDispatch();

  const {audioLoaded, isPlaying, trackId, queueEnded} = useSelector(
    (statement) => statement.player,
  );
  const {firstTrackId, lastTrackId, albumImage} = useSelector(
    (statement) => statement.albums.currentAlbum,
  );
  const {veryFirstTrackId, veryLastTrackId} = useSelector(
    (statement) => statement.albums,
  );
  if (queueEnded) {
    handleNextTrack();
    dispatch(isQueueEnded(false));
  }
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
  },
  control: {
    margin: 10,
    // width: '10%',
  },
  controlImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
});
