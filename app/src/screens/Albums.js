import React from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {useSelector} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';

var osyaSrc = [
  require('../../../images/osya/1/osya1.png'),
  require('../../../images/osya/2/osya2.png'),
  require('../../../images/osya/3/osya3.png'),
  require('../../../images/osya/4/osya4.png'),
  require('../../../images/osya/5/osya5.png'),
  require('../../../images/osya/6/osya6.png'),
  require('../../../images/osya/7/osya7.png'),
];

export const Albums = ({navigation}) => {
  const allAlbums = useSelector((state) => state.albums.allAlbums);
  SplashScreen.hide();
  if (allAlbums.albumsPhotos) {
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
