import React, {useEffect} from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';
import {isTrackPlaying, handlePrevNext} from '../../store/actions/player';

var state = {};
var dispatch;

const handlePlayPause = async () => {
  if (state.audioLoaded) {
    const {isPlaying} = state;
    console.log('isPlaying from handlePlayPause - ', isPlaying);

    isPlaying
      ? TrackPlayer.pause().then(console.log('paused from handle'))
      : TrackPlayer.play().then(console.log('playing from handle'));

    var intervalForPosition = setInterval(() => {
      if (!isPlaying) {
        clearInterval(
          intervalForPosition,
          console.log('Interval for position cleared'),
        );
      } else {
        // this.trackPosition();
      }
    }, 1000);

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
        console.log('skipped to - ', trackId);
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
        await AsyncStorage.setItem(
          'move_to_next_album',
          JSON.stringify(true),
          () => console.log('move to next album prop true set'),
        );
        await AsyncStorage.setItem(
          'track_id',
          JSON.stringify(parseInt(trackId, 10) + 2),
        );

        trackId += 2;

        state = {
          ...state,
          currentTime: 0,
          audioLoaded: false,
          formattedCurrentTime: '00:00',
          pressed: false,
          needUpdate2: false,
          trackId,
        };

        dispatch(handlePrevNext(trackId));

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
    setupListeners();
  }, []);

  const {audioLoaded, isPlaying, trackId, minimazed} = useSelector(
    (statement) => statement.player,
  );
  const {firstTrackId, lastTrackId, albumImage} = useSelector(
    (statement) => statement.albums.currentAlbum,
  );
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
    <View style={minimazed ? styles.controlsMinimazed : styles.controls}>
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
    marginBottom: '10%',
  },
  controlsMinimazed: {
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
