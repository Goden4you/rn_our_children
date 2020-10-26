import React, {useEffect, useState} from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Text,
  Image,
  StyleSheet,
  ImageBackground,
  Dimensions,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {
  albumChanged,
  openAlbumScreen,
  updateAlbumImage,
} from '../store/actions/albums';
import {updatePressed, updateTrackId} from '../store/actions/player';
import store from '../store';

var phoneHeight = Dimensions.get('window').height;
var statement = {
  albumId: 0,
  albumsIds: [],
  albumImage: null,
  albumDesc: '',
  albumsPhotos: [],
};

var dispatch;

async function putTrackIdInStore(value) {
  dispatch(updatePressed(true));
  dispatch(updateTrackId(value));
}

async function onTrackPressed(trackId, albumIdProps) {
  if (
    albumIdProps !== statement.albumId ||
    statement.currentTracksIds !== statement.openedTracksIds
  ) {
    console.log('on track pressed called');
    statement = {
      ...statement,
      albumId: albumIdProps,
    };
    dispatch(updateAlbumImage(statement.albumImage));
    dispatch(albumChanged(true));
  }

  putTrackIdInStore(trackId);
}

function needMoveToNextAlbum() {
  let albumId = statement.albumId;
  let albumDesc = statement.albumDesc;
  let albumsIds = statement.albumsIds;

  albumDesc = albumDesc.toString().substring(0, 2);
  albumDesc = parseInt(albumDesc, 10);

  switch (albumId) {
    case parseInt(albumsIds[0], 10):
      albumId = albumsIds[1];
      break;
    case parseInt(albumsIds[1], 10):
      albumDesc += 3;
      albumId = albumsIds[2];
      break;
    case parseInt(albumsIds[2], 10):
      albumDesc += 2;
      albumId = albumsIds[3];
      break;
    case parseInt(albumsIds[3], 10):
      albumDesc -= 4;
      albumId = albumsIds[4];
      break;
    case parseInt(albumsIds[4], 10):
      albumId = albumsIds[5];
      break;
    case parseInt(albumsIds[5], 10):
      albumDesc += 4;
      albumId = albumsIds[6];
      break;
    case parseInt(albumsIds[6], 10):
      console.log(7);
      return;
    default:
      break;
  }
  statement = {
    ...statement,
    albumImage: statement.albumsPhotos[albumId - parseInt(albumsIds[0], 10)],
  };
  dispatch(updateAlbumImage(statement.albumImage));
  dispatch(openAlbumScreen(albumDesc, albumId));
  dispatch(albumChanged(true));
}

export const AlbumScreen = ({navigation, route}) => {
  const {
    albumTitleProps,
    albumDescProps,
    albumImageProps,
    albumIdProps,
    albumsPhotosProps,
    albumsIdsProps,
  } = route.params;

  dispatch = useDispatch();

  const [isReady, setIsReady] = useState(false);
  const {tracksIds, tracksTitles, tracksAuthors, tracksDuration} = useSelector(
    (state) => state.albums.openedAlbum,
  );
  const currentAlbum = useSelector((state) => state.albums.currentAlbum);
  const {moveToNextAlbum} = useSelector((state) => state.player);
  statement = {...statement, moveToNextAlbum};

  useEffect(() => {
    if (albumImageProps !== statement.albumImage) {
      const unsubscribe = store.subscribe(() => store.getState());
      unsubscribe();
      statement = {
        ...statement,
        albumImage: albumImageProps,
        albumsPhotos: albumsPhotosProps,
        albumDesc: albumDescProps,
        albumsIds: albumsIdsProps,
        currentTracksIds: currentAlbum.tracksIds,
        openedTracksIds: tracksIds,
      };
      console.log('use effect from AlbumScreen called');
      dispatch(openAlbumScreen(albumDescProps, albumIdProps));
    }
    setInterval(() => {
      if (statement.moveToNextAlbum) {
        needMoveToNextAlbum();
      }
    }, 500);
    let time;

    tracksIds ? (time = 500) : (time = 1500);

    setTimeout(() => {
      setIsReady(true);
    }, time);
  }, [
    isReady,
    albumDescProps,
    albumImageProps,
    albumsPhotosProps,
    albumIdProps,
    albumsIdsProps,
    tracksIds,
    currentAlbum,
  ]);

  if (tracksIds) {
    return (
      <View style={styles.container}>
        <ScrollView
          onScroll={(event) =>
            event.nativeEvent.contentOffset.y > 170
              ? navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(244,121,40)',
                    height: 80,
                  },
                  headerTitle: `${albumTitleProps}`,
                })
              : navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(109,207,246)',
                    height: 80,
                  },
                  headerTitle: '',
                })
          }
          scrollEventThrottle={16}>
          <ImageBackground
            source={require('../../../images/blur/drawable-mdpi/layer_1.png')}
            style={styles.backgroundImage}>
            <TouchableOpacity style={styles.albumWrap}>
              <Image
                source={{
                  uri: albumImageProps,
                }}
                style={styles.albumImage}
              />
              <View>
                <Text style={styles.albumTitle}>{albumTitleProps}</Text>
                <Text style={styles.albumDesc}>{albumDescProps}</Text>
              </View>
            </TouchableOpacity>
          </ImageBackground>
          <View style={styles.songsWrap}>
            <View>
              {tracksIds.map((value) => {
                let index = tracksIds.indexOf(value);
                return (
                  <TouchableOpacity
                    style={styles.wrapper}
                    key={value}
                    onPress={() => {
                      onTrackPressed(value, albumIdProps);
                    }}>
                    <View style={styles.songInfo}>
                      <Text style={styles.songTitle}>
                        {tracksTitles[index]}
                      </Text>
                      <Text style={styles.songAuthor}>
                        {tracksAuthors[index]}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.songDuration}>
                        {tracksDuration[index]}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  } else {
    return <View />;
  }
};

var phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  backgroundImage: {
    resizeMode: 'cover',
  },
  container: {
    height: phoneHeight - 180,
  },
  albumWrap: {
    padding: 25,
    flexDirection: 'row',
  },
  albumImage: {
    width: 120,
    height: 120,
    marginRight: 20,
  },
  albumTitle: {
    fontFamily: 'HouschkaPro-DemiBold',
    color: 'rgb(244,121,40)',
    fontSize: 33,
  },
  albumDesc: {
    fontSize: 24,
    fontFamily: 'HouschkaPro-Light',
  },
  songsWrap: {
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  wrapper: {
    paddingVertical: 13,
    height: 'auto',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
