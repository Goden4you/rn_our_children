import React, {useEffect, useState} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import {useDispatch, useSelector} from 'react-redux';
import {firstLastTrackId, loadAlbums} from '../store/actions/albums';
import SplashScreen from 'react-native-splash-screen';
import * as selectors from '../store/selectors';
import store from '../store';
// import {} from '../sagas/albumsSaga';

var albumsTitles = [];
var albumsDesc = [];
var albumsIds = [];
var albumsPhotos = [];
var isAlbumsFetched = false;
var isPhotosFetched = false;
var dispatch;

var osyaSrc = [
  require('../../../images/osya/1/osya1.png'),
  require('../../../images/osya/2/osya2.png'),
  require('../../../images/osya/3/osya3.png'),
  require('../../../images/osya/4/osya4.png'),
  require('../../../images/osya/5/osya5.png'),
  require('../../../images/osya/6/osya6.png'),
  require('../../../images/osya/7/osya7.png'),
];

// TODO move fetch to api folder
async function fetchAlbums() {
  const response = await fetch(
    'https://childrensproject.ocs.ru/api/v1/albums',
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );
  const data = await response.json();
  const parsedData = JSON.parse(JSON.stringify(data));

  for (let i = 0; i < 7; i++) {
    albumsTitles[i] = parsedData[i].title;
  }

  for (let i = 0; i < 7; i++) {
    albumsIds[i] = parsedData[i].id;
  }

  isAlbumsFetched = true;

  fetchAlbumsPhotos();
}

// TODO move fetch to api folder
async function fetchAlbumsPhotos() {
  var j = 0;
  let fs = RNFetchBlob.fs;
  const path = fs.dirs.CacheDir + '/albums_photos/';
  await fs.exists(path + albumsIds[0]).then(async (res) => {
    if (res) {
      for (
        let i = parseInt(albumsIds[0], 10);
        i <= parseInt(albumsIds[6], 10);
        i++
      ) {
        await fs.readFile(path + i).then((data) => {
          albumsPhotos[j] = data;
          j++;
        });
      }
    } else {
      try {
        for (
          let i = parseInt(albumsIds[0], 10);
          i <= parseInt(albumsIds[6], 10);
          i++
        ) {
          const response = await fetch(
            'https://childrensproject.ocs.ru/api/v1/albums/' + i,
            {
              method: 'GET',
              headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              },
            },
          );

          const data = await response.json();
          const parsedData = JSON.parse(JSON.stringify(data));

          albumsPhotos[j] =
            'https://childrensproject.ocs.ru/api/v1/files/' +
            parsedData[0].artworkFileId;

          await fs.writeFile(
            fs.dirs.CacheDir + '/albums_photos/' + i,
            'https://childrensproject.ocs.ru/api/v1/files/' +
              parsedData[0].artworkFileId,
          );

          j++;
        }
      } catch (e) {}
    }
  });

  isPhotosFetched = true;
  console.log('Albums photos fetched.');
  fetchFirstLastTrack();
}

async function fetchFirstLastTrack() {
  const response = await fetch(
    'https://childrensproject.ocs.ru/api/v1/albums/' + albumsIds[0],
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );
  const data = await response.json();
  const parsedData = JSON.parse(JSON.stringify(data));
  const veryFirstTrackId = parsedData[0].songFileId;

  const response2 = await fetch(
    'https://childrensproject.ocs.ru/api/v1/albums/' + albumsIds[6],
    {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    },
  );
  const data2 = await response2.json();
  const parsedData2 = JSON.parse(JSON.stringify(data2));
  const veryLastTrackId = parsedData2[parsedData2.length - 1].songFileId;

  dispatch(firstLastTrackId(veryFirstTrackId, veryLastTrackId));
}

async function makeDirectory() {
  let fs = RNFetchBlob.fs;
  const res = await fs.exists(fs.dirs.CacheDir + '/albums_photos/');
  if (!res) {
    await fs.mkdir(fs.dirs.CacheDir + '/albums_photos/');
  }
}

export const Albums = ({navigation}) => {
  const [isReady, setIsReady] = useState(false);

  dispatch = useDispatch();

  useEffect(() => {
    makeDirectory();

    setTimeout(() => {
      setIsReady(true);
    }, 3000);
  }, [isReady]);

  const allAlbums = useSelector((state) => state.albums.allAlbums);
  if (isReady) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(event) =>
            event.nativeEvent.contentOffset.y > 220
              ? navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(244,121,40)',
                    height: 80,
                  },
                })
              : navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(109,207,246)',
                    height: 80,
                  },
                })
          }
          scrollEventThrottle={16}>
          {allAlbums.albumsPhotos.map((value) => {
            let index = allAlbums.albumsPhotos.indexOf(value);
            return (
              <View style={styles.albumWrap} key={index + 1000}>
                <TouchableOpacity
                  style={styles.albumImageWrap}
                  onPress={() => {
                    navigation.navigate('AlbumScreen', {
                      albumTitleProps: allAlbums.albumsTitles[index],
                      albumDescProps: allAlbums.albumsDesc[index],
                      albumImageProps: allAlbums.albumsPhotos[index],
                      albumIdProps: allAlbums.albumsIds[index],
                      albumsPhotosProps: allAlbums.albumsPhotos,
                      albumsIdsProps: allAlbums.albumsIds,
                    });
                  }}>
                  <Image
                    source={{
                      uri: allAlbums.albumsPhotos[index],
                    }}
                    style={styles.albumImage}
                  />
                </TouchableOpacity>
                <View style={styles.albumInfo}>
                  <View>
                    <Text style={styles.albumTitle}>
                      {allAlbums.albumsTitles[index]}
                    </Text>
                    <Text style={styles.albumDesc}>
                      {allAlbums.albumsDesc[index]}
                    </Text>
                  </View>
                  <View>
                    <Image source={osyaSrc[index]} />
                  </View>
                </View>
              </View>
            );
          })}
        </ScrollView>
      </View>
    );
  } else {
    return <View />;
  }
};

var phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  container: {
    paddingVertical: 25,
    marginLeft: 25,
    marginRight: 30,
    height: phoneHeight - 160,
  },
  albumImageWrap: {
    width: 200,
    height: 200,
    marginRight: '5%',
  },
  albumImage: {
    width: '100%',
    height: '100%',
  },
  albumWrap: {
    marginBottom: 31,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  albumInfo: {
    justifyContent: 'space-between',
  },
  albumTitle: {
    color: 'rgb(244,121,40)',
    fontSize: 33,
  },
  albumDesc: {
    fontSize: 22,
  },
});
