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

import {fetchAllSongsData} from '../store/actions/albums';
import {countOfLoadedTracks, onTrackPressed} from '../utils/utils';
import {GoToSettings} from '../navigation/goSettings';

let state = {
  allData: [],
  curAlbumId: 0,
  albumsPhotos: [],
  albumsTitles: [],
  albumsDesc: [],
};
let dispatch;

const SongsList = () => {
  let prevAlbumId = 0;
  let firstAlbumId = 0;
  if (state.allData.toString() !== '' && state.albumsPhotos) {
    return (
      <ScrollView style={styles.scrollWrap} scrollEventThrottle={16}>
        {state.allData.map((allTracks) => {
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
                  let desc = state.albumsDesc[track.albumId - firstAlbumId];
                  desc = desc.toString().substring(0, 2);
                  desc = parseInt(desc, 10);
                  state.isTracksLoading
                    ? countOfLoadedTracks({loadedNum: state.loadedTracksCount})
                    : onTrackPressed({
                        trackId: track.songFileId,
                        albumIdProps: track.albumId,
                        curAlbumId: state.curAlbumId,
                        albumImage:
                          state.albumsPhotos[track.albumId - firstAlbumId],
                        songsCount: desc,
                        dispatch,
                      });
                }}>
                <Image
                  source={{
                    uri: state.albumsPhotos[track.albumId - firstAlbumId],
                  }}
                  style={styles.photo}
                />
                <View style={styles.songInfoWrap}>
                  <Text style={styles.songTitle}>{track.title}</Text>
                  <View style={styles.songInfo}>
                    <Text style={styles.songAuthor}>
                      {track.author +
                        ' | ' +
                        state.albumsTitles[track.albumId - firstAlbumId]}
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
    );
  } else {
    return (
      <View style={styles.loading}>
        <Text>Пожалуйста, подождите...</Text>
      </View>
    );
  }
};

export const AllSongsList = () => {
  dispatch = useDispatch();

  const allData = useSelector((statem) => statem.albums.allData);
  const curAlbumId = useSelector((statem) => statem.player.curAlbumId);
  const {albumsPhotos, albumsTitles, albumsDesc} = useSelector(
    (statem) => statem.albums.allAlbums,
  );
  const isTracksLoading = useSelector(
    (statem) => statem.player.isTracksLoading,
  );
  const loadedTracksCount = useSelector(
    (statem) => statem.player.loadedTracksCount,
  );

  state = {
    ...state,
    allData,
    curAlbumId,
    albumsPhotos,
    albumsTitles,
    albumsDesc,
    isTracksLoading,
    loadedTracksCount,
  };

  useEffect(() => {
    dispatch(fetchAllSongsData());
  }, []);

  return (
    <View style={styles.mainWrapPortrait}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Все песни</Text>
        <GoToSettings />
      </View>
      <SongsList />
    </View>
  );
};

const phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  mainWrapPortrait: {
    width: '100%',
    height: phoneHeight < 800 ? phoneHeight - 100 : phoneHeight - 140,
  },
  header: {
    backgroundColor: 'rgb(109,207,246)',
    height: phoneHeight < 800 ? 80 : 100,
    paddingRight: 20,
    paddingBottom: phoneHeight < 800 ? 0 : 20,
    paddingTop: phoneHeight < 800 ? 20 : 0,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: phoneHeight < 800 ? 'center' : 'flex-end',
  },
  headerText: {
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    marginRight: '20%',
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
