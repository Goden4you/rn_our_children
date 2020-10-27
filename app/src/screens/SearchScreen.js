import React, {useState} from 'react';
import {View, Text} from 'react-native';
import {SearchBar} from 'react-native-elements';

export const SearchScreen = () => {
  const {search, setSearch} = useState();

  const updateSearch = (search) => {
    setSearch(search);
  };

  return (
    <View>
      <SearchBar
        placeholder="Type Here..."
        onChangeText={() => updateSearch(search)}
        value={search}
      />
    </View>
  );
};
