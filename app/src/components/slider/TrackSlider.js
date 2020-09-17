import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Slider} from 'react-native-elements';
import {useSelector, useDispatch} from 'react-redux';
import TrackPlayer from 'react-native-track-player';
import {updateStorage} from '../../store/actions/player';

export const TrackSlider = ({}) => {
  const {
    trackPlayerInit,
    formattedDurMillis,
    trackId,
    firstTrackId,
    tracksDuration,
    audioLoaded,
    trackPositionInterval,
  } = useSelector((state) => state.player);
  const dispatch = useDispatch();

  var currentTime = 0;
  var formattedCurrentTime;

  // called when user ended sliding track position
  const handleTrackPosition = async (value) => {
    try {
      if (audioLoaded) {
        await TrackPlayer.seekTo(value).then(() => {
          currentTime = value;
        });
      }
    } catch (e) {
      console.log('Error from handleTrackPosition()', e);
    }
  };

  const trackPosition = async () => {
    if (audioLoaded) {
      let position = await TrackPlayer.getPosition();
      // millis in correct format for user
      var time;

      var seconds = currentTime;
      var minutes = Math.floor(seconds / 60);

      seconds = Math.floor(seconds % 60);
      seconds = seconds >= 10 ? seconds : '0' + seconds;

      currentTime === undefined
        ? (time = '00:00')
        : (time = '0' + minutes + ':' + seconds);

      currentTime = position;
      dispatch(updateStorage({formattedCurrentTime: time}));
    }
  };

  var intervalForPosition = setInterval(() => {
    if (trackPositionInterval) {
      clearInterval(intervalForPosition, console.log('Interval cleared2'));
    } else {
      trackPosition();
    }
  }, 1000);

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
        value={currentTime}
      />
      <View style={styles.sliderDuration}>
        <Text>{formattedCurrentTime}</Text>
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
