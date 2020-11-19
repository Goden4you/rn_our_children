import React, {useEffect, useReducer} from 'react';
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
import Orientation from 'react-native-orientation';

let statement = {
  orientation: 'PORTRAIT',
};

export const AllSongsList = () => {
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);
  const dispatch = useDispatch();

  const {allData} = useSelector((state) => state.albums);
  const {curAlbumId} = useSelector((state) => state.player);
  const {albumsPhotos, albumsTitles, albumsDesc} = useSelector(
    (state) => state.albums.allAlbums,
  );

  const onOrientationChanged = () => {
    Orientation.getOrientation((err, orientation) => {
      if (err) {
        console.log(err);
      }
      statement = {
        ...statement,
        orientation,
      };
    });
    setTimeout(() => {
      forceUpdate();
    }, 250);
  };

  useEffect(() => {
    dispatch(allSongsData());
    const unsubscribe = store.subscribe(() => store.getState());
    unsubscribe();
    Orientation.addOrientationListener(onOrientationChanged);
  }, [dispatch]);

  const SongsList = () => {
    let prevAlbumId = 0;
    let firstAlbumId = 0;
    return allData && albumsPhotos ? (
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
                  let desc = albumsDesc[track.albumId - firstAlbumId];
                  desc = desc.toString().substring(0, 2);
                  desc = parseInt(desc, 10);
                  onTrackPressed({
                    trackId: track.songFileId,
                    albumIdProps: track.albumId,
                    curAlbumId,
                    albumImage: albumsPhotos[track.albumId - firstAlbumId],
                    songsCount: desc,
                    dispatch,
                  });
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
    <View
      style={
        statement.orientation === 'PORTRAIT'
          ? styles.mainWrapPortrait
          : styles.mainWrapLandscape
      }>
      <View style={styles.header}>
        <Text style={styles.headerText}>Все песни</Text>
        <GoToSettings />
      </View>
      <SongsList />
    </View>
  );
};

let phoneHeight = Dimensions.get('screen').height;

const styles = StyleSheet.create({
  mainWrapPortrait: {
    width: '100%',
    height: phoneHeight - 175,
  },
  mainWrapLandscape: {
    width: '100%',
    height: '80%',
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
