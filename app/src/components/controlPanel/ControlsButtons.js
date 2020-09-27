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
import {albumChanged} from '../../store/actions/albums';

var state = {};
var dispatch;

const handlePlayPause = async () => {
  if (state.audioLoaded) {
    const {isPlaying} = state;

    isPlaying ? await TrackPlayer.pause() : await TrackPlayer.play();

    state = {
      ...state,
      isPlaying: !isPlaying,
      trackPositionInterval: true,
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
          if (
            (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
            TrackPlayer.STATE_PAUSED
          ) {
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
                  trackPositionInterval: true,
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
    let {trackId, lastTrackId} = state;

    if (trackId === 33954) {
      // TODO херня, нужно переписать
      console.log('all tracks ended');
      TrackPlayer.pause();
      return;
    }

    if (trackId !== 33799) {
      // TODO херня, нужно переписать
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
            if (
              (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
              TrackPlayer.STATE_PAUSED
            ) {
              console.log('ready to play');
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
                  trackPositionInterval: true,
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
        // dispatch(isQueueEnded(true));

        // setTimeout(async () => {
        // dispatch(albumChanged(true));
        // await AsyncStorage.setItem(
        //   'album_image',
        //   JSON.stringify(state.albumImage),
        // );
        // }, 3000);

        setTimeout(
          async () =>
            await AsyncStorage.setItem(
              'move_to_next_album',
              JSON.stringify(false),
            ),
          1500,
        );
      }
    }
  }
};

const setupListeners = async () => {
  TrackPlayer.addEventListener('remote-pause', () => {
    handlePlayPause();
  });

  TrackPlayer.addEventListener('remote-play', () => {
    handlePlayPause();
  });

  TrackPlayer.addEventListener('remote-next', () => {
    handleNextTrack();
  });

  TrackPlayer.addEventListener('remote-previous', () => {
    handlePreviousTrack();
  });
};

export const ControlsButtons = () => {
  dispatch = useDispatch();

  useEffect(() => {
    console.log('use effect called from ControlsButtons');
    setupListeners();
  }, []);

  const {audioLoaded, isPlaying, trackId, queueEnded} = useSelector(
    (statement) => statement.player,
  );
  const {firstTrackId, lastTrackId, albumImage} = useSelector(
    (statement) => statement.albums.currentAlbum,
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
