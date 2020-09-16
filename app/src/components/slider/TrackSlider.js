import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Slider} from 'react-native-elements';
import {useSelector} from 'react-redux';

export const TrackSlider = ({}) => {
  const {
    trackPlayerInit,
    formattedDurMillis,
    trackId,
    firstTrackId,
    formattedCurrentTime,
    tracksDuration,
    currentTime,
  } = useSelector((state) => state.player.trackLoaded);
  return (
    <View style={styles.sliderWrap}>
      <Slider
        minimumValue={0}
        maximumValue={
          trackPlayerInit
            ? formattedDurMillis[trackId - firstTrackId] // TODO redux
            : 0
        }
        minimumTrackTintColor={'rgb(244,121,40)'}
        onSlidingComplete={(value) => {
          this.handleTrackPosition(value); // TODO хрен знает как
        }}
        thumbTintColor="rgb(244,121,40)"
        step={1}
        value={currentTime} // TODO redux
      />
      <View style={styles.sliderDuration}>
        <Text>
          {
            formattedCurrentTime // TODO redux
          }
        </Text>
        <Text>
          {trackPlayerInit // TODO redux
            ? tracksDuration[ // TODO redux
                trackId - firstTrackId // TODO redux
              ]
            : '00:00'}
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
