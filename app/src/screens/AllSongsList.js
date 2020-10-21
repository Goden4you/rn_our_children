import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

export const AllSongsList = () => {
  const allTracksIds = null;
  const allTracksTitles = [];
  const allTracksAuthors = [];
  const allTracksDuration = [];

  const SongsList = () => {
    return allTracksIds !== null ? (
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
      <View>
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
});
