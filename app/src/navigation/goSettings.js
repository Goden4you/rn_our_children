import React from 'react';
import {TouchableOpacity, Image} from 'react-native';

// settings button
export const GoToSettings = ({navigation}) => {
  return (
    <TouchableOpacity
      style={{marginRight: 20}}
      onPress={() => navigation.navigate('AppSettings')}>
      <Image source={require('../../../images/icons/settings/settings.png')} />
    </TouchableOpacity>
  );
};
