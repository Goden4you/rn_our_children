import React, {useEffect, useState} from 'react';
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
  Keyboard,
} from 'react-native';
import {SearchBar, Button} from 'react-native-elements';
import {useDispatch, useSelector} from 'react-redux';
import Highlighter from 'react-native-highlight-words';

import {GoToSettings} from '../navigation/goSettings';
import {fetchAllSongsData} from '../store/actions/albums';
import {
  countOfLoadedTracks,
  onTrackPressed,
  putLastSearches,
  removeLastSearches,
  takeLastSearches,
} from '../utils/utils';
import {hidePlayer} from '../store/actions/player';

let state = {
  search: '',
  searchRes: [],
  albumsDesc: [],
  curAlbumId: 0,
  hidden: false,
  firstAlbumId: 0,
};
let dispatch;

const SearchTracks = () => {
  let prevAlbumId = 0;
  let index = -1;
  let firstAlbumIdInRes = 0;
  return (
    <ScrollView style={state.hidden ? styles.hidden : styles.scrollWrap}>
      {state.searchRes[0].map((tracksData) => {
        return tracksData.map((track) => {
          if (prevAlbumId !== track.albumId) {
            if (prevAlbumId === 0) {
              firstAlbumIdInRes = track.albumId;
            }
            index++;
            prevAlbumId = track.albumId;
          }
          return (
            <TouchableOpacity
              style={styles.wrapper}
              key={track.id}
              onPress={() => {
                let desc = state.albumsDesc[track.albumId - state.firstAlbumId];
                desc = desc.toString().substring(0, 2);
                desc = parseInt(desc, 10);
                state.isTracksLoading
                  ? countOfLoadedTracks({loadedNum: state.loadedTracksCount})
                  : onTrackPressed({
                      trackId: track.songFileId,
                      albumIdProps: track.albumId,
                      curAlbumId: state.curAlbumId,
                      albumImage:
                        state.searchRes[2][track.albumId - firstAlbumIdInRes],
                      songsCount: desc,
                      dispatch,
                    });
              }}>
              <Image
                source={{uri: state.searchRes[2][index]}}
                style={styles.photo}
              />
              <View style={styles.songInfoWrap}>
                <Highlighter
                  highlightStyle={styles.hlStyle}
                  style={styles.songTitle}
                  searchWords={[state.search]}
                  textToHighlight={track.title}
                />
                <Highlighter
                  highlightStyle={styles.hlStyle}
                  style={styles.songAuthor}
                  searchWords={[state.search]}
                  textToHighlight={
                    track.author + ' | ' + state.searchRes[1][index]
                  }
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
  );
};

export const SearchScreen = () => {
  dispatch = useDispatch();

  const [search, setSearch] = useState('');
  const [searchRes, setSearchRes] = useState([]);
  const [inputs, setInputs] = useState([]);

  const allData = useSelector((statement) => statement.albums.allData);
  const {albumsTitles, albumsIds, albumsPhotos, albumsDesc} = useSelector(
    (statement) => statement.albums.allAlbums,
  );
  const curAlbumId = useSelector((statement) => statement.player.curAlbumId);
  const hidden = useSelector((statement) => statement.player.hidden);
  const isTracksLoading = useSelector(
    (statem) => statem.player.isTracksLoading,
  );
  const loadedTracksCount = useSelector(
    (statem) => statem.player.loadedTracksCount,
  );

  state = {
    ...state,
    albumsDesc,
    curAlbumId,
    hidden,
    firstAlbumId: albumsIds[0],
    isTracksLoading,
    loadedTracksCount,
  };

  useEffect(() => {
    Keyboard.addListener('keyboardDidShow', () => {
      dispatch(hidePlayer(true));
    });

    Keyboard.addListener('keyboardDidHide', () => {
      dispatch(hidePlayer(false));
    });

    return async function cleaUp() {
      Keyboard.removeAllListeners();
    };
  }, []);

  const updateSearch = (value) => {
    if (allData.toString() !== '') {
      const albumsCount = 8;
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

      state = {
        ...state,
        search: value,
      };
      setSearch(value);
      if (value !== '') {
        setSearchRes([res, titles, photos]);
        state = {
          ...state,
          searchRes: [res, titles, photos],
        };
      } else {
        setSearchRes([]);
        state = {
          ...state,
          searchRes: [],
        };
      }
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
      state = {
        ...state,
        search: '',
      };
      dispatch(fetchAllSongsData());
    }
  };

  const takeInputs = async () => {
    let response = await takeLastSearches();

    if (response) {
      setInputs(JSON.parse(response));
    }
  };

  if (inputs.toString() === '') {
    takeInputs();
  }

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
        showCancel={true}
        cancelButtonProps={{color: '#f47928'}}
        cancelButtonTitle="Отмена"
        clearIcon={Platform.OS === 'android' ? true : false}
        searchIcon={Platform.OS === 'android' ? true : false}
        placeholder="Название"
        onChangeText={(value) => updateSearch(value)}
        value={search}
        containerStyle={styles.searchWrap}
        inputContainerStyle={styles.input}
        onClear={() => {
          putLastSearches(inputs);
          setSearchRes([]);
          setSearch('');
          state = {
            ...state,
            search: '',
            searchRes: [],
          };
        }}
        onBlur={() => {
          saveLastInput(search);
        }}
      />
      <ResOrLast />
      {searchRes.toString() !== '' ? (
        <SearchTracks />
      ) : (
        <ScrollView style={styles.scrollWrap}>
          {inputs.toString() !== ''
            ? inputs.reverse().map((input) => {
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
      )}
    </View>
  );
};

let phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainWrap: {
    backgroundColor: '#fff',
    height: phoneHeight < 800 ? phoneHeight - 100 : phoneHeight - 140,
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
    height: phoneHeight < 800 ? 80 : 100,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: phoneHeight < 800 ? 'center' : 'flex-end',
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
    height: Platform.OS === 'android' ? phoneHeight - 290 : '68%',
    backgroundColor: '#fff',
  },
  hidden: {
    height: '100%',
    backgroundColor: '#fff',
  },
  hlStyle: {
    color: '#f47928',
  },
});
