import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import {SearchBar, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';

import {allSongsData} from '../store/actions/albums';
import {onTrackPressed} from '../utils/utils';

export const SearchScreen = () => {
  const [search, setSearch] = useState('');
  const [searchRes, setSearchRes] = useState([]);
  const dispatch = useDispatch();

  const {allTracksTitles, allData} = useSelector((state) => state.albums);
  const {albumsTitles, albumsIds, albumsPhotos} = useSelector(
    (state) => state.albums.allAlbums,
  );

  allTracksTitles ? null : dispatch(allSongsData());

  const updateSearch = (value) => {
    console.log('search - ', value);

    const albumsCount = 7;
    let res = [];
    let photos = [];
    let titles = [];
    let j = 0;

    for (let i = 0; i < albumsCount; i++) {
      let trackData = allData[i].filter(
        ({title, author}) =>
          title.toLowerCase().includes(value.toLowerCase()) ||
          author.toLowerCase().includes(value.toLowerCase()),
      );
      if (trackData.toString() !== '') {
        res[j] = trackData;
        let index = albumsIds.indexOf(trackData[0].albumId);
        console.log('HERE', trackData[0].albumId);
        titles[i] = albumsTitles[index];
        photos[i] = albumsPhotos[index];
        j++;
      }
    }
    setSearch(value);
    value !== '' ? setSearchRes([res, titles, photos]) : setSearchRes([]);
  };

  const ResOrLast = () => {
    return search !== '' ? (
      <View style={styles.resSearch}>
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
    let prevAlbumId = 0;
    let index = -1;
    return searchRes.toString() !== '' ? (
      <ScrollView style={styles.scrollWrap}>
        {searchRes[0].map((tracksData) => {
          return tracksData.map((track) => {
            if (prevAlbumId !== track.albumId) {
              index++;
              prevAlbumId = track.albumId;
            }
            return (
              <TouchableOpacity
                style={styles.wrapper}
                key={track.id}
                onPress={() => {
                  console.log('track pressed');
                }}>
                <Image
                  source={{uri: searchRes[2][index]}}
                  style={styles.photo}
                />
                <View style={styles.songInfoWrap}>
                  <Text style={styles.songTitle}>{track.title}</Text>
                  <Text style={styles.songAuthor}>
                    {track.author + ' | ' + searchRes[1][index]}
                  </Text>
                </View>
                <View>
                  <Text style={styles.songDuration}>{track.duration}</Text>
                </View>
              </TouchableOpacity>
            );
          });
        })}
      </ScrollView>
    ) : (
      <View style={styles.scrollWrap} />
    );
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
        onClear={() => {
          setSearch('');
          setSearchRes([]);
        }}
      />
      <ResOrLast />
      <SearchTracks />
    </View>
  );
};

let phoneHeight = Dimensions.get('window').height;

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
  photo: {
    width: 50,
    height: 50,
  },
  resSearch: {
    paddingLeft: 10,
  },
  scrollWrap: {
    height: phoneHeight - 307,
    backgroundColor: '#fff',
  },
});
