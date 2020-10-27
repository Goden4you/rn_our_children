import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import {SearchBar, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {allSongsData} from '../store/actions/albums';
import {onTrackPressed, takeAllSongsData} from '../utils/utils';

export const SearchScreen = () => {
  const [search, setSearch] = useState('');
  const [searchRes, setSearchRes] = useState([]);
  const dispatch = useDispatch();

  const {allTracksTitles, allData} = useSelector((state) => state.albums);

  allTracksTitles ? null : dispatch(allSongsData());

  const updateSearch = (value) => {
    console.log('search - ', value);

    let flag = false;
    let i = 0;
    let res = [];

    while (!flag) {
      res = allData[i].filter(
        ({title, author}) =>
          title.toLowerCase().includes(value.toLowerCase()) ||
          author.toLowerCase().includes(value.toLowerCase()),
      );
      console.log('res -', res);
      if (res.toString() !== '' || i === 6) {
        console.log('find', i);
        flag = true;
      } else {
        i++;
      }
    }

    // const some = allData.filter((album) => {
    //   let res = album.filter(
    //     ({title, author}) =>
    //       title.toLowerCase().includes(value.toLowerCase()) ||
    //       author.toLowerCase().includes(value.toLowerCase()),
    //   );
    //   console.log('album 0 ', res);
    // if (res) {
    //   return res;
    // }
    // });
    // const title = allTracksTitles.filter((elem) =>
    //   elem.toLowerCase().includes(value.toLowerCase()),
    // );
    // const author = allTracksAuthors.filter((elem) =>
    //   elem.toLowerCase().includes(value.toLowerCase()),
    // );
    setSearch(value);
    setSearchRes(res);
  };

  const ResOrLast = () => {
    return search !== '' ? (
      <View>
        <Text style={styles.resOrLast}>Результаты</Text>
      </View>
    ) : (
      <View style={styles.lastSearch}>
        <Text style={styles.resOrLast}>Недавние</Text>
        <Button
          title="Очистить"
          buttonStyle={styles.btn}
          titleStyle={styles.btnTitle}
        />
      </View>
    );
  };

  const SearchTracks = () => {
    return searchRes ? (
      <ScrollView>
        {searchRes.map((track) => {
          return (
            <TouchableOpacity
              style={styles.wrapper}
              onPress={() => {
                // const result = onTrackPressed(
                //   value,
                //   albumId,
                //   statement.curAlbumId,
                //   photo,
                //   dispatch,
                //   null,
                //   null,
                // );
                // statement = {
                //   ...statement,
                //   curAlbumId: result,
                // };
                console.log('track pressed');
              }}>
              {/* <Image source={{uri: photo}} style={styles.photo} /> */}
              <View style={styles.songInfoWrap}>
                <Text style={styles.songTitle}>{track.title}</Text>
                <Text style={styles.songAuthor}>
                  {track.author + ' | 2019'}
                </Text>
              </View>
              <View>
                <Text style={styles.songDuration}>{track.duration}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    ) : null;
  };

  return (
    <View style={styles.mainWrap}>
      <View style={styles.header}>
        <Text>Поиск</Text>
      </View>
      <SearchBar
        placeholder="Название"
        onChangeText={(value) => updateSearch(value)}
        value={search}
        showLoading={true}
        containerStyle={styles.searchWrap}
        inputContainerStyle={styles.input}
        onClear={() => setSearch('')}
      />
      <ResOrLast />
      <SearchTracks />
    </View>
  );
};

const styles = StyleSheet.create({
  mainWrap: {
    backgroundColor: '#fff',
  },
  wrapper: {
    paddingVertical: 13,
    paddingHorizontal: 10,
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songInfoWrap: {width: '70%'},
  songTitle: {
    fontSize: 22,
    fontFamily: 'HouschkaPro-Medium',
  },
  songAuthor: {
    fontSize: 18,
    color: 'rgb(147, 149, 152)',
    fontFamily: 'HouschkaPro-Medium',
  },
  songDuration: {
    fontSize: 14,
    fontFamily: 'HouschkaPro-Medium',
  },
  header: {
    backgroundColor: 'rgb(109,207,246)',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchWrap: {
    backgroundColor: null,
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  input: {
    backgroundColor: null,
    borderWidth: 1,
    borderRadius: 15,
    borderBottomWidth: 1,
  },
  lastSearch: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  resOrLast: {
    fontSize: 20,
    fontFamily: 'HouschkaPro-DemiBold',
  },
  btn: {
    backgroundColor: null,
    padding: 0,
  },
  btnTitle: {
    color: '#f47928',
    fontFamily: 'HouschkaPro-Medium',
  },
});
