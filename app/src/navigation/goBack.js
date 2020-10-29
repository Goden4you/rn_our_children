import React from 'react';
import {TouchableOpacity, Image} from 'react-native';

export const Back = ({navigation}) => {
  return (
    <TouchableOpacity
      style={{marginLeft: 45}}
      onPress={() => navigation.goBack()}>
      <Image
        source={require('../../../images/icons/back/drawable-hdpi/back.png')}
      />
    </TouchableOpacity>
  );
};
