import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Slider} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';
import {updateTime} from '../../store/actions/player';

var state = {
  currentTime: 0,
  formattedCurrentTime: '00:00',
};
var dispatch;

const handleTrackPosition = async (value) => {
  try {
    if (state.audioLoaded) {
      TrackPlayer.seekTo(value).then(() => {
        state = {
          ...state,
          currentTime: value,
        };

        dispatch(updateTime(value));
      });
    }
  } catch (e) {
    console.log('Error from handleTrackPosition()', e);
  }
};

const trackPosition = async () => {
  if (state.audioLoaded) {
    let position = await TrackPlayer.getPosition();
    var time;

    var seconds = state.currentTime;
    var minutes = Math.floor(seconds / 60);

    seconds = Math.floor(seconds % 60);
    seconds = seconds >= 10 ? seconds : '0' + seconds;

    state.currentTime === undefined
      ? (time = '00:00')
      : (time = '0' + minutes + ':' + seconds);

    state = {
      ...state,
      currentTime: position,
      formattedCurrentTime: time,
    };
    dispatch(updateTime(position));
  }
};

setInterval(() => {
  trackPosition();
}, 1000);

export const TrackSlider = () => {
  const trackPlayerInit = useSelector(
    (statement) => statement.player.trackPlayerInit,
  );
  const trackId = useSelector((statement) => statement.player.trackId);
  const audioLoaded = useSelector((statement) => statement.player.audioLoaded);
  const currentTime = useSelector((statement) => statement.player.currentTime);

  const {tracksDurationMillis, firstTrackId, tracksDuration} = useSelector(
    (statement) => statement.albums.currentAlbum,
  );

  let dur = tracksDurationMillis.map((value) => (value /= 1000));

  state = {
    ...state,
    audioLoaded,
    currentTime,
    formattedDurMillis: dur,
  };

  dispatch = useDispatch();

  return (
    <View style={styles.sliderWrap}>
      <Slider
        minimumValue={0}
        maximumValue={
          trackPlayerInit ? state.formattedDurMillis[trackId - firstTrackId] : 0
        }
        minimumTrackTintColor={'rgb(244,121,40)'}
        onSlidingComplete={(value) => {
          handleTrackPosition(value);
        }}
        thumbTintColor="rgb(244,121,40)"
        step={1}
        value={state.currentTime}
      />
      <View style={styles.sliderDuration}>
        <Text>{state.formattedCurrentTime}</Text>
        <Text>
          {trackPlayerInit ? tracksDuration[trackId - firstTrackId] : '00:00'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sliderDuration: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sliderWrap: {
    width: '90%',
  },
});
