import React from 'react';
import {TouchableOpacity, Image} from 'react-native';

// back button
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
