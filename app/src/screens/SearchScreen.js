import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import {SearchBar, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import Highlighter from 'react-native-highlight-words';

import {GoToSettings} from '../navigation/goSettings';
import {allSongsData} from '../store/actions/albums';
import {
  onTrackPressed,
  putLastSearches,
  removeLastSearches,
  takeLastSearches,
} from '../utils/utils';

export const SearchScreen = ({navigation}) => {
  const [search, setSearch] = useState('');
  const [searchRes, setSearchRes] = useState([]);
  const [inputs, setInputs] = useState([]);
  const dispatch = useDispatch();
  const [albumId, setPrevAlbumId] = useState();

  const {allData} = useSelector((state) => state.albums);
  const {albumsTitles, albumsIds, albumsPhotos} = useSelector(
    (state) => state.albums.allAlbums,
  );

  const takeInputs = async () => {
    let response = await takeLastSearches();

    if (response) {
      setInputs(JSON.parse(response));
    }
  };

  if (inputs.toString() === '') {
    takeInputs();
  }

  const updateSearch = (value) => {
    // console.log('allData -', allData !== '');
    if (allData.toString() !== '') {
      const albumsCount = 7;
      let res = [];
      let photos = [];
      let titles = [];
      let j = 0;

      for (let i = 0; i < albumsCount; i++) {
        let trackData = allData[i].filter(
          ({title, author}) =>
            title
              .toLowerCase()
              .includes(value.toLowerCase().replace(/ё/g, 'е')) ||
            author.toLowerCase().includes(value.toLowerCase()),
        );
        if (trackData.toString() !== '') {
          res[j] = trackData;
          let index = albumsIds.indexOf(trackData[0].albumId);
          titles[i] = albumsTitles[index];
          photos[i] = albumsPhotos[index];
          j++;
        }
      }
      photos = photos.filter((x) => {
        return x !== undefined;
      });
      titles = titles.filter((x) => {
        return x !== undefined;
      });
      setSearch(value);
      value !== '' ? setSearchRes([res, titles, photos]) : setSearchRes([]);
    } else {
      Alert.alert(
        'Данные загружаются',
        'Пожалуйста, подождите...',
        [
          {
            text: 'Ок',
          },
        ],
        {cancelable: false},
      );
      setSearch('');
      dispatch(allSongsData());
    }
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
          onPress={() => {
            removeLastSearches();
            setInputs([]);
          }}
        />
      </View>
    );
  };

  const SearchTracks = () => {
    let prevAlbumId = 0;
    let index = -1;
    let firstAlbumId = 0;
    return searchRes.toString() !== '' ? (
      <ScrollView style={styles.scrollWrap}>
        {searchRes[0].map((tracksData) => {
          return tracksData.map((track) => {
            if (prevAlbumId !== track.albumId) {
              if (prevAlbumId === 0) {
                firstAlbumId = track.albumId;
              }
              index++;
              prevAlbumId = track.albumId;
            }
            return (
              <TouchableOpacity
                style={styles.wrapper}
                key={track.id}
                onPress={() => {
                  const resAlbumId = onTrackPressed(
                    track.songFileId,
                    track.albumId,
                    albumId,
                    searchRes[2][track.albumId - firstAlbumId],
                    dispatch,
                  );
                  setPrevAlbumId(resAlbumId);
                }}>
                <Image
                  source={{uri: searchRes[2][index]}}
                  style={styles.photo}
                />
                <View style={styles.songInfoWrap}>
                  <Highlighter
                    highlightStyle={styles.hlStyle}
                    style={styles.songTitle}
                    searchWords={[search]}
                    textToHighlight={track.title}
                  />
                  <Highlighter
                    highlightStyle={styles.hlStyle}
                    style={styles.songAuthor}
                    searchWords={[search]}
                    textToHighlight={track.author + ' | ' + searchRes[1][index]}
                  />
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
      <ScrollView style={styles.scrollWrap}>
        {inputs.toString() !== ''
          ? inputs.map((input) => {
              return (
                <TouchableOpacity
                  style={styles.wrapper}
                  onPress={() => updateSearch(input)}
                  key={inputs.indexOf(input)}>
                  <Text style={styles.lastSearchText}>{input}</Text>
                </TouchableOpacity>
              );
            })
          : null}
      </ScrollView>
    );
  };

  const saveLastInput = (value) => {
    if (value !== '') {
      let length = inputs.length;
      let allInputs = inputs;
      allInputs[length] = value;
      let uniqInputs = allInputs.filter((item, pos) => {
        return allInputs.indexOf(item) === pos;
      });
      setInputs(uniqInputs);
    }
  };

  return (
    <View style={styles.mainWrap}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Поиск</Text>
        <GoToSettings />
      </View>
      <SearchBar
        platform={Platform.OS}
        placeholder="Название"
        onChangeText={(value) => updateSearch(value)}
        value={search}
        showLoading={true}
        containerStyle={styles.searchWrap}
        inputContainerStyle={styles.input}
        onClear={() => {
          putLastSearches(inputs);
          setSearch('');
          setSearchRes([]);
        }}
        onBlur={() => {
          saveLastInput(search);
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
    borderBottomWidth: 1,
    borderColor: '#e5e5e5',
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: '27%',
  },
  searchWrap: {
    backgroundColor: null,
    borderBottomWidth: 0,
    borderTopWidth: 0,
    paddingHorizontal: 10,
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
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  lastSearchText: {
    color: '#f47928',
    fontSize: 16,
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
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    paddingBottom: 10,
  },
  scrollWrap: {
    height: phoneHeight - 307,
    backgroundColor: '#fff',
  },
  hlStyle: {
    color: '#f47928',
  },
});
