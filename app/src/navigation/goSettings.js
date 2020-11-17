import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';
import {useDispatch} from 'react-redux';
import {isSettingsVisible} from '../store/actions/albums';

export const GoToSettings = () => {
  const dispatch = useDispatch();
  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={() => dispatch(isSettingsVisible(true))}>
      <Image source={require('../../../images/icons/settings/settings.png')} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginRight: 20,
  },
});
