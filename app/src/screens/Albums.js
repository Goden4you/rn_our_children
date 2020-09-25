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
import {loadAlbums} from '../store/actions/albums';

// initializing arrays, where data will be put
var albumsTitles = [];
var albumsDesc = [];
var albumsIds = [];
var albumsPhotos = [];
var isAlbumsFetched = false;
var isPhotosFetched = false;

// images of osya to each album
var osyaSrc = [
  require('../../../images/osya/1/osya1.png'),
  require('../../../images/osya/2/osya2.png'),
  require('../../../images/osya/3/osya3.png'),
  require('../../../images/osya/4/osya4.png'),
  require('../../../images/osya/5/osya5.png'),
  require('../../../images/osya/6/osya6.png'),
  require('../../../images/osya/7/osya7.png'),
];

// fetching albums data to put them in variables
async function fetchAlbums() {
  await fetch('https://childrensproject.ocs.ru/api/v1/albums', {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then(async (response) => {
    const data = await response.json();
    const parsedData = JSON.parse(JSON.stringify(data));
    // console.log("Data downloading completed...", parsedData);

    // put albums TITLES
    for (let i = 0; i < 7; i++) {
      albumsTitles[i] = parsedData[i].title;
    }

    // put albums SONGS COUNT with using cases
    for (let i = 0; i < 7; i++) {
      if (parsedData[i].songsCount % 10 === 2) {
        albumsDesc[i] = parsedData[i].songsCount + ' песни';
      } else if (parsedData[i].songsCount % 10 === 4) {
        albumsDesc[i] = parsedData[i].songsCount + ' песни';
      } else {
        albumsDesc[i] = parsedData[i].songsCount + ' песен';
      }
    }

    // put albums IDs
    for (let i = 0; i < 7; i++) {
      albumsIds[i] = parsedData[i].id;
    }

    isAlbumsFetched = true;

    console.log('Albums data fetched.');

    fetchAlbumsPhotos(); // fetch albums photos
  });
}

// fetching albums photos
async function fetchAlbumsPhotos() {
  var j = 0;
  let fs = RNFetchBlob.fs;
  const path = fs.dirs.CacheDir + '/albums_photos/';
  await fs.exists(path + 1).then(async (res) => {
    console.log('exists? -', res);
    if (res) {
      console.log('Read albums photos from cache');
      for (let i = albumsIds[0]; i < albumsIds[7]; i++) {
        await fs.readFile(path + i).then((data) => {
          albumsPhotos[j] = data;
          j++;
        });
      }
    } else {
      console.log('Read album photos from network');
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

          // put albums PHOTOS in variable
          albumsPhotos[j] =
            'https://childrensproject.ocs.ru/api/v1/files/' +
            parsedData[0].artworkFileId;

          await fs
            .writeFile(
              fs.dirs.CacheDir + '/albums_photos/' + i,
              'https://childrensproject.ocs.ru/api/v1/files/' +
                parsedData[0].artworkFileId,
            )
            .then(() => console.log('Album Photo now in cache'));

          j++;
        }
      } catch (e) {}
    }
  });
  // loop to fetch all album`s data

  isPhotosFetched = true;
  console.log('Albums photos fetched.');
}

async function makeDirectory() {
  let fs = RNFetchBlob.fs;
  await fs.exists(fs.dirs.CacheDir + '/albums_photos/').then(async (res) => {
    if (!res) {
      await fs.mkdir(fs.dirs.CacheDir + '/albums_photos/');
    }
    console.log('Is dir for albums photos exist? - ', res);
  });
}

export const Albums = ({navigation}) => {
  const [isReady, setIsReady] = useState(false); // state to display screen data

  const dispatch = useDispatch();

  useEffect(() => {
    if (albumsIds[2] === undefined) {
      console.log('Albums Screen was unmounted, data loading started.');
      makeDirectory();
      setIsReady(false); // screen can`t be displaying
      fetchAlbums(); // fetch albums info
      let interval = setInterval(() => {
        if (isAlbumsFetched && isPhotosFetched) {
          setIsReady(true);
          clearInterval(interval);
          console.log('Albums now visible');
        }
      }, 250);
    }

    dispatch(loadAlbums(albumsPhotos, albumsTitles, albumsDesc, albumsIds));

    if (!isReady && albumsIds[2]) {
      setIsReady(true);
    }
  }, [isReady, dispatch]);

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
          {albumsPhotos.map((value) => {
            let index = albumsPhotos.indexOf(value);
            return (
              <View style={styles.albumWrap} key={index + 1000}>
                <TouchableOpacity
                  style={styles.albumImage}
                  onPress={() => {
                    navigation.navigate('AlbumScreen', {
                      albumTitleProps: allAlbums.titles[index],
                      albumDescProps: allAlbums.desc[index],
                      albumImageProps: allAlbums.photos[index],
                      albumIdProps: allAlbums.ids[index],
                      albumsPhotosProps: allAlbums.photos,
                    });
                  }}>
                  <Image
                    source={{
                      uri: allAlbums.photos[index],
                    }}
                    style={{width: '100%', height: '100%'}}
                  />
                </TouchableOpacity>
                <View style={styles.albumInfo}>
                  <View>
                    <Text style={styles.albumTitle}>
                      {allAlbums.titles[index]}
                    </Text>
                    <Text style={styles.albumDesc}>
                      {allAlbums.desc[index]}
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
  albumImage: {
    width: 200,
    height: 200,
    marginRight: 15,
  },
  albumWrap: {
    marginBottom: 31,
    flexDirection: 'row',
  },
  albumInfo: {
    justifyContent: 'space-between',
  },
  albumTitle: {
    // fontFamily:
    //   Platform.OS === 'ios'
    //     ? 'HouschkaPro-DemiBold'
    //     : 'HouschkaPro-DemiBold.ttf',
    color: 'rgb(244,121,40)',
    fontSize: 33,
  },
  albumDesc: {
    fontSize: 24,
    // fontFamily:
    //   Platform.OS === 'ios' ? 'HouschkaPro-Light' : 'HouschkaPro-Light.ttf',
  },
});
