import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';

import {allSongsData} from '../store/actions/albums';
import store from '../store';
import {putAlbumsPhotos, songsDescToInt} from '../utils/utils';

export const AllSongsList = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(allSongsData());
    console.log('use effect called');
    const unsubscribe = store.subscribe(() => store.getState());
    unsubscribe();
  }, [dispatch]);

  const {
    allTracksIds,
    allTracksTitles,
    allTracksAuthors,
    allTracksDuration,
  } = useSelector((state) => state.albums);
  let {albumsPhotos, albumsDesc} = useSelector(
    (state) => state.albums.allAlbums,
  );
  const songsCount = songsDescToInt(albumsDesc);
  let countIndex = 0;
  let prevCount = 0;
  let photo;

  const SongsList = () => {
    return allTracksIds ? (
      <ScrollView>
        {allTracksIds.map((value) => {
          let index = allTracksIds.indexOf(value);
          if (songsCount[countIndex] + prevCount <= index) {
            photo = albumsPhotos[countIndex];
          } else {
            console.log('so - ', songsCount[countIndex]);
            prevCount = index - 1;
            photo = albumsPhotos[countIndex];
            countIndex++;
          }
          return (
            <TouchableOpacity
              style={styles.wrapper}
              key={value}
              onPress={() => {
                console.log('track pressed');
              }}>
              <Image source={{uri: photo}} style={styles.photo} />
              <View style={styles.songInfo}>
                <Text style={styles.songTitle}>{allTracksTitles[index]}</Text>
                <Text style={styles.songAuthor}>{allTracksAuthors[index]}</Text>
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
        <Text>Идет загрузка</Text>
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

const styles = StyleSheet.create({
  mainWrap: {
    width: '100%',
    height: '100%',
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
  songInfo: {width: '70%'},
  songTitle: {
    fontSize: 24,
    fontFamily: 'HouschkaPro-Medium',
  },
  songAuthor: {
    fontSize: 20,
    color: 'rgb(147, 149, 152)',
    fontFamily: 'HouschkaPro-Medium',
  },
  songDuration: {
    fontSize: 16,
    fontFamily: 'HouschkaPro-Medium',
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  photo: {width: 50, height: 50},
});
