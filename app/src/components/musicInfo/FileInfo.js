import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {useSelector} from 'react-redux';

export const FileInfo = () => {
  const {trackPlayerInit, minimazed, trackId} = useSelector(
    (state) => state.player,
  );
  const {tracksTitles, tracksAuthors, firstTrackId} = useSelector(
    (state) => state.albums.currentAlbum,
  );
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
    paddingLeft: 10,
    paddingRight: '15%',
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
