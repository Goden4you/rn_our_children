import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {isSettingsVisible} from '../store/actions/albums';

export const Back = ({navigation, isFromAlbum}) => {
  const dispatch = useDispatch();
  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={() =>
        isFromAlbum ? navigation.goBack() : dispatch(isSettingsVisible(false))
      }>
      <Image
        source={require('../../../images/icons/back/drawable-hdpi/back.png')}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 45,
  },
});
