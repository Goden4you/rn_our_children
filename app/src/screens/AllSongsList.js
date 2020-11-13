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
import {onTrackPressed} from '../utils/utils';
import {GoToSettings} from '../navigation/goSettings';

let statement = {
  tapAlbumId: 0,
};

export const AllSongsList = ({navigation}) => {
  const dispatch = useDispatch();

  const {allData} = useSelector((state) => state.albums);
  const {albumsPhotos, albumsTitles} = useSelector(
    (state) => state.albums.allAlbums,
  );

  useEffect(() => {
    dispatch(allSongsData());
    const unsubscribe = store.subscribe(() => store.getState());
    unsubscribe();
  }, [dispatch]);

  const SongsList = () => {
    let prevAlbumId = 0;
    let firstAlbumId = 0;
    return allData ? (
      <ScrollView style={styles.scrollWrap}>
        {allData.map((allTracks) => {
          return allTracks.map((track) => {
            if (prevAlbumId !== track.albumId) {
              if (prevAlbumId === 0) {
                firstAlbumId = track.albumId;
              }
              prevAlbumId = track.albumId;
            }
            return (
              <TouchableOpacity
                style={styles.wrapper}
                key={track.id}
                onPress={() => {
                  const result = onTrackPressed(
                    track.songFileId,
                    track.albumId,
                    statement.curAlbumId,
                    albumsPhotos[track.albumId - firstAlbumId],
                    dispatch,
                    null,
                    null,
                  );
                  statement = {
                    ...statement,
                    curAlbumId: result,
                  };
                }}>
                <Image
                  source={{uri: albumsPhotos[track.albumId - firstAlbumId]}}
                  style={styles.photo}
                />
                <View style={styles.songInfoWrap}>
                  <Text style={styles.songTitle}>{track.title}</Text>
                  <View style={styles.songInfo}>
                    <Text style={styles.songAuthor}>
                      {track.author +
                        ' | ' +
                        albumsTitles[track.albumId - firstAlbumId]}
                    </Text>
                  </View>
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
      <View style={styles.loading}>
        <Text>Пожалуйста, подождите...</Text>
      </View>
    );
  };

  return (
    <View style={styles.mainWrap}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Все песни</Text>
        <GoToSettings navigation={navigation} name={'AllSongsList'} />
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: '22%',
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
