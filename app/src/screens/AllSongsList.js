import React, {useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {allSongsData} from '../store/actions/albums';

export const AllSongsList = () => {
  // const dispatch = useDispatch();
  // dispatch(allSongsData());
  const {
    allTracksIds,
    allTracksTitles,
    allTracksAuthors,
    allTracksDuration,
  } = useSelector((state) => state.albums);

  const SongsList = () => {
    return allTracksIds ? (
      <View>
        {allTracksIds.map((value) => {
          let index = allTracksIds.indexOf(value);
          return (
            <TouchableOpacity
              style={styles.wrapper}
              key={value}
              onPress={() => {
                console.log('track pressed');
              }}>
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
      </View>
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
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
  },
  songInfo: {width: '80%'},
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
  },
});
