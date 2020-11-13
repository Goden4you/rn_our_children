import {useNavigation} from '@react-navigation/native';
import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';

// settings button
export const GoToSettings = ({navigation, name}) => {
  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={() => navigation.navigate('AppSettings', {name})}>
      <Image source={require('../../../images/icons/settings/settings.png')} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginRight: 20,
  },
});
