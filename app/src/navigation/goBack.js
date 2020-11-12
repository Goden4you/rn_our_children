import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';

export const Back = ({navigation}) => {
  return (
    <TouchableOpacity
      style={styles.wrap}
      onPress={
        () =>
          // route
          navigation.navigate('SearchScreen')
        // : navigation.goBack()
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
