import React from 'react';
import {View, TouchableOpacity, Image, StyleSheet} from 'react-native';
import {ControlsButtons} from '../controlPanel/ControlsButtons';
import {FileInfo} from '../musicInfo/FileInfo';
import {useSelector, useDispatch} from 'react-redux';
import {updateStorage} from '../../store/actions/player';

export const MinimazedPlayer = ({albumImage, trackPlayerInit}) => {
  const {trackPlayerInit, albumImage} = useSelector((state) => state.player);
  const dispatch = useDispatch();
  return (
    <View style={styles.containerMinimazed}>
      <TouchableOpacity
        style={styles.imageAndInfo}
        onPress={
          () =>
            trackPlayerInit ? dispatch(updateStorage({minimazed: false})) : null // open modal, if track was loaded
        }>
        <Image
          style={styles.albumCoverMinimazed}
          source={
            trackPlayerInit
              ? {
                  uri: albumImage,
                }
              : require('../../../../images/osya/none/ndCopy.png') // TODO избавиться от ../
          }
        />
        <FileInfo />
      </TouchableOpacity>
      <ControlsButtons />
    </View>
  );
};

const styles = StyleSheet.create({
  containerMinimazed: {
    height: 80,
    width: '100%',
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    bottom: 0,
    borderTopColor: 'rgb(244,121,40)',
    borderTopWidth: 1,
  },
  imageAndInfo: {
    flexDirection: 'row',
    width: 240,
    height: '100%',
    alignItems: 'center',
  },
  albumCoverMinimazed: {
    height: 60,
    width: 60,
    resizeMode: 'contain',
  },
  controls: {
    flexDirection: 'row',
  },
  controlMinimazed: {
    margin: 5,
    width: 25,
  },
  sliderDurationMinimazed: {
    display: 'none',
  },
  sliderWrapMinimazed: {
    display: 'none',
  },
});
