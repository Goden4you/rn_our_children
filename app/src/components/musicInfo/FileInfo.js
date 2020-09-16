import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

// TODO данные взять из редакса

export const FileInfo = ({}) => {
  const {
    trackPlayerInit,
    minimazed,
    tracksTitles,
    tracksAuthors,
    trackId,
    firstTrackId,
  } = useSelector((state) => state.player.trackLoaded);
  return trackPlayerInit ? (
    <View style={minimazed ? styles.trackInfoMinimazed : styles.trackInfo}>
      <Text
        style={
          minimazed
            ? [styles.largeTextMinimazed, styles.trackInfoTextMinimazed]
            : [styles.largeText, styles.trackInfoText]
        }>
        {tracksTitles[trackId - firstTrackId]}
      </Text>
      <Text
        style={
          minimazed
            ? [styles.smallTextMinimazed, styles.trackInfoTextMinimazed]
            : [styles.smallText, styles.trackInfoText]
        }>
        {tracksAuthors[trackId - firstTrackId]}
      </Text>
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  trackInfoMinimazed: {
    width: '70%',
    paddingLeft: 10,
    textAlign: 'left',
  },
  trackInfo: {
    padding: 20,
    width: '100%',
  },
  trackInfoText: {
    textAlign: 'center',
    flexWrap: 'wrap',
    fontFamily: 'HouschkaPro-Medium',
  },
  trackInfoTextMinimazed: {
    textAlign: 'left',
    flexWrap: 'wrap',
    fontFamily: 'HouschkaPro-Medium',
  },
  largeTextMinimazed: {
    fontSize: 18,
  },
  smallTextMinimazed: {
    fontSize: 14,
    color: 'rgb(147, 149, 152)',
  },
  largeText: {
    fontSize: 22,
  },
  smallText: {
    fontSize: 16,
    color: 'rgb(147, 149, 152)',
  },
});
