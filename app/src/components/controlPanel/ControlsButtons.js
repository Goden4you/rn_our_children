import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import {updateStorage} from '../../store/actions/player';

var state = {};

export const ControlsButtons = ({TrackPlayer}) => {
  const dispatch = useDispatch();
  const handlePlayPause = async () => {
    if (state.audioLoaded) {
      const {isPlaying} = state;

      isPlaying
        ? await TrackPlayer.pause().then(console.log('paused from handle'))
        : await TrackPlayer.play().then(console.log('playing from handle'));

      var intervalForPosition = setInterval(() => {
        if (!isPlaying) {
          clearInterval(
            intervalForPosition,
            console.log('Interval for position cleared'),
          );
        } else {
          this.trackPosition();
        }
      }, 1000);

      state = {
        ...state,
        isPlaying: !isPlaying,
        trackPositionInterval: true,
      };

      dispatch(updateStorage(state));
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
          audioLoaded: true,
          currentTime: 0,
          formattedCurrentTime: '00:00',
          pressed: false,
          trackPositionInterval: true,
        };

        dispatch(updateStorage(state));

        await TrackPlayer.skipToPrevious().then(() => {
          console.log('skipped to - ', trackId);
          let interval = setInterval(async () => {
            if (
              (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
              TrackPlayer.STATE_PAUSED
            ) {
              console.log('ready to play');
              clearInterval(interval);
              // setTimeout(async () => {
              await TrackPlayer.play().then(() => {
                state = {
                  ...state,
                  isPlaying: true,
                };
                dispatch(updateStorage(state));
              });
              // }, 1000);
            }
          }, 250);
        });
      } else {
        await TrackPlayer.seekTo(0);
      }
    }
  };

  const handleNextTrack = async () => {
    if (state.audioLoaded) {
      let {trackId, lastTrackId} = state;

      if (trackId === 33954) {
        // TODO херня, нужно переписать
        console.log('all tracks ended');
        await TrackPlayer.pause();
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

          await TrackPlayer.skipToNext().then(() => {
            console.log('skipped to next - ', trackId);
            let interval = setInterval(async () => {
              if (
                (await TrackPlayer.getState()) === TrackPlayer.STATE_READY ||
                TrackPlayer.STATE_PAUSED
              ) {
                console.log('ready to play');
                clearInterval(interval);
                setTimeout(async () => {
                  await TrackPlayer.play().then(() => {
                    state = {
                      ...state,
                      audioLoaded: true,
                      isPlaying: true,
                      trackPositionInterval: true,
                    };

                    dispatch(updateStorage(state));
                  });
                }, 1000);
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

          state = {
            ...state,
            currentTime: 0,
            audioLoaded: false,
            formattedCurrentTime: '00:00',
            pressed: false,
            needUpdate2: false,
          };

          dispatch(updateStorage(state));

          setTimeout(async () => {
            console.log('isAlbumImageChanged from handle');
            await AsyncStorage.setItem(
              'album_image',
              JSON.stringify(state.albumImage),
            );
          }, 3000);

          setTimeout(
            async () =>
              await AsyncStorage.setItem(
                'move_to_next_album',
                JSON.stringify(false),
              ),
            2000,
          );
        }
      }
    }
  };

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

  const {
    audioLoaded,
    isPlaying,
    trackId,
    firstTrackId,
    lastTrackId,
    albumImage,
  } = useSelector((statement) => statement.player.state);
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
      <TouchableOpacity style={styles.control}>
        <Image
          source={require('../../../../images/icons/playerControl/prevHit/prevHitCopy.png')}
          style={styles.controlImage}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.control}>
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
      <TouchableOpacity style={styles.control}>
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
