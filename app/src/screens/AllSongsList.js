import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';

import {allSongsData} from '../store/actions/albums';
import store from '../store';
import {songsDescToInt} from '../utils/utils';
import {onTrackPressed} from '../utils/utils';

let statement = {
  tapAlbumId: 0,
};

export const AllSongsList = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(allSongsData());
    const unsubscribe = store.subscribe(() => store.getState());
    unsubscribe();
  }, [dispatch]);

  const {
    allTracksIds,
    allTracksTitles,
    allTracksAuthors,
    allTracksDuration,
    albumId,
  } = useSelector((state) => state.albums);
  const {albumsPhotos, albumsDesc, albumsTitles} = useSelector(
    (state) => state.albums.allAlbums,
  );
  const songsCount = songsDescToInt(albumsDesc);

  let countIndex = 0;
  let prevCount = 0;
  let photo, album;

  const SongsList = () => {
    return allTracksIds ? (
      <ScrollView style={styles.scrollWrap}>
        {allTracksIds.map((value) => {
          let index = allTracksIds.indexOf(value);
          if (songsCount[countIndex] + prevCount > index) {
            photo = albumsPhotos[countIndex];
            album = albumsTitles[countIndex];
          } else {
            prevCount = index;
            countIndex++;
            photo = albumsPhotos[countIndex];
            album = albumsTitles[countIndex];
          }
          return (
            <TouchableOpacity
              style={styles.wrapper}
              key={value}
              onPress={() => {
                const result = onTrackPressed(
                  value,
                  albumId,
                  statement.curAlbumId,
                  photo,
                  dispatch,
                  null,
                  null,
                );
                statement = {
                  ...statement,
                  curAlbumId: result,
                };
              }}>
              <Image source={{uri: photo}} style={styles.photo} />
              <View style={styles.songInfoWrap}>
                <Text style={styles.songTitle}>{allTracksTitles[index]}</Text>
                <View style={styles.songInfo}>
                  <Text style={styles.songAuthor}>
                    {allTracksAuthors[index] + ' | ' + album}
                  </Text>
                </View>
              </View>
              <View>
                <Text style={styles.songDuration}>
                  {allTracksDuration[index]}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    ) : (
      <View style={styles.loading}>
        <Text>Пожалуйста, подождите...</Text>
      </View>
    );
  };

  return (
    <View style={styles.mainWrap}>
      <View style={styles.header}>
        <Text>Все песни</Text>
      </View>
      <SongsList />
    </View>
  );
};

var phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainWrap: {
    width: '100%',
    height: phoneHeight - 132,
  },
  header: {
    backgroundColor: 'rgb(109,207,246)',
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
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
  songInfo: {
    flexDirection: 'row',
  },
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
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#fff',
  },
  photo: {width: 50, height: 50},
  scrollWrap: {
    backgroundColor: '#fff',
  },
});
