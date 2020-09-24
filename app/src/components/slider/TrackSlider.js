import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Slider} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';
import {updateStorage, updateTime} from '../../store/actions/player';

var state = {
  currentTime: 0,
  formattedCurrentTime: '00:00',
};
var dispatch;

// called when user ended sliding track position
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
    // millis in correct format for user
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

var intervalForPosition = setInterval(() => {
  if (state.trackPositionInterval) {
    clearInterval(intervalForPosition, console.log('Interval cleared2'));
  } else {
    trackPosition();
  }
}, 900);

export const TrackSlider = () => {
  const {
    trackPlayerInit,
    formattedDurMillis,
    trackId,
    firstTrackId,
    tracksDuration,
    audioLoaded,
    trackPositionInterval,
    currentTime,
    formattedCurrentTime,
  } = useSelector((statement) => statement.player);

  state = {
    ...state,
    audioLoaded,
    trackPositionInterval,
    currentTime,
    formattedCurrentTime,
  };

  dispatch = useDispatch();

  return (
    <View style={styles.sliderWrap}>
      <Slider
        minimumValue={0}
        maximumValue={
          trackPlayerInit ? formattedDurMillis[trackId - firstTrackId] : 0
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
