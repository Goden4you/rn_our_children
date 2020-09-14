import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';

export const ControlsButtons = ({}) => {
  return (
    <View style={styles.controls}>
      <TouchableOpacity
        style={styles.control}
        onPress={
          this.handlePreviousTrack // TODO redux
        }>
        <Image
          source={require('../../../../images/icons/playerControl/prevHit/prevHitCopy.png')}
          style={styles.controlImage}
        />
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.control}
        onPress={
          this.handlePlayPause // TODO redux
        }>
        {this.state.isPlaying ? ( // TODO redux
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
      <TouchableOpacity
        style={styles.control}
        onPress={
          this.handleNextTrack // TODO redux
        }>
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
    margin: 20,
    // width: '10%',
  },
  controlImage: {
    width: 25,
    height: 25,
    resizeMode: 'contain',
  },
});
