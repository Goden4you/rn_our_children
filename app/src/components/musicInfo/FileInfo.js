import React from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import {useSelector} from 'react-redux';

export const FileInfo = () => {
  const {minimazed, trackId} = useSelector((state) => state.player);
  const {tracksTitles, tracksAuthors, firstTrackId} = useSelector(
    (state) => state.albums.currentAlbum,
  );
  return tracksTitles ? (
    <View style={minimazed ? styles.trackInfoMinimazed : styles.trackInfo}>
      <Text
        numberOfLines={1}
        style={
          minimazed
            ? [styles.largeTextMinimazed, styles.trackInfoTextMinimazed]
            : [styles.largeText, styles.trackInfoText]
        }>
        {tracksTitles[trackId - firstTrackId]}
      </Text>
      <Text
        numberOfLines={minimazed ? 1 : 2}
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

let phoneWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  trackInfoMinimazed: {
    paddingLeft: 5,
    width: '80%',
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
    fontSize: 0.05 * phoneWidth,
  },
  smallTextMinimazed: {
    fontSize: 0.04 * phoneWidth,
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
