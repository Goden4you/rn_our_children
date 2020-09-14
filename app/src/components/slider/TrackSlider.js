import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {Slider} from 'react-native-elements';

export const TrackSlider = ({}) => {
  return (
    <View style={styles.sliderWrap}>
      <Slider
        minimumValue={0}
        maximumValue={
          this.state.trackPlayerInit // TODO redux
            ? this.state.formattedDurMillis[ // TODO redux
                this.state.trackId - this.state.firstTrackId // TODO redux
              ]
            : 0
        }
        minimumTrackTintColor={'rgb(244,121,40)'}
        onSlidingComplete={(value) => {
          this.handleTrackPosition(value); // TODO хрен знает как
        }}
        thumbTintColor="rgb(244,121,40)"
        step={1}
        value={this.state.currentTime} // TODO redux
      />
      <View style={styles.sliderDuration}>
        <Text>
          {
            this.state.formattedCurrentTime // TODO redux
          }
        </Text>
        <Text>
          {this.state.trackPlayerInit // TODO redux
            ? this.state.tracksDuration[ // TODO redux
                this.state.trackId - this.state.firstTrackId // TODO redux
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
