import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {ControlsButtons} from '../controlPanel/ControlsButtons';
import {FileInfo} from '../musicInfo/FileInfo';
import {useSelector, useDispatch} from 'react-redux';
import {isMinimazed} from '../../store/actions/player';

export const MinimazedPlayer = () => {
  const currentAlbumImage = useSelector(
    (state) => state.albums.currentAlbumImage,
  );
  const trackPlayerInit = useSelector((state) => state.player.trackPlayerInit);
  const minimazed = useSelector((state) => state.player.minimazed);
  const hidden = useSelector((state) => state.player.hidden);
  const dispatch = useDispatch();

  return minimazed ? (
    <View style={hidden ? styles.hidden : styles.containerMinimazed}>
      <TouchableOpacity
        style={styles.imageAndInfo}
        onPress={() => (trackPlayerInit ? dispatch(isMinimazed(false)) : null)}>
        <Image
          style={styles.albumCoverMinimazed}
          source={
            trackPlayerInit
              ? {
                  uri: currentAlbumImage,
                }
              : require('../../../../images/osya/none/ndCopy.png') // TODO
          }
        />
        <FileInfo />
      </TouchableOpacity>
      <ControlsButtons />
    </View>
  ) : null;
};

const styles = StyleSheet.create({
  containerMinimazed: {
    height: '100%',
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 5,
    bottom: 0,
    borderTopColor: 'rgb(244,121,40)',
    borderTopWidth: 1,
  },
  imageAndInfo: {
    flexDirection: 'row',
    width: '60%',
    height: '100%',
    alignItems: 'center',
  },
  albumCoverMinimazed: {
    height: '100%',
    width: '20%',
    resizeMode: 'contain',
  },
  hidden: {
    display: 'none',
  },
});
