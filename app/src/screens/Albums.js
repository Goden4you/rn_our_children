import React, {useEffect} from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import SplashScreen from 'react-native-splash-screen';
import {isAlbumDataLoading} from '../store/actions/albums';
import Orientation from 'react-native-orientation';
import {Dimensions} from 'react-native';

var osyaSrc = [
  require('../../../images/osya/1/osya1.png'),
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
  const dispatch = useDispatch();

  useEffect(() => {
    SplashScreen.hide();
    Orientation.lockToPortrait();
  }, []);

  if (allAlbums.albumsPhotos) {
    return (
      <View style={styles.containerPortrait}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          onScroll={(event) =>
            event.nativeEvent.contentOffset.y > 220
              ? navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(244,121,40)',
                    height: phoneHeight < 800 ? 80 : 100,
                  },
                })
              : navigation.setOptions({
                  headerStyle: {
                    backgroundColor: 'rgb(109,207,246)',
                    height: phoneHeight < 800 ? 80 : 100,
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
                    dispatch(isAlbumDataLoading(true));
                    navigation.navigate('AlbumScreen', {
                      albumTitleProps: allAlbums.albumsTitles[index],
                      albumDescProps: allAlbums.albumsDesc[index],
                      albumImageProps: allAlbums.albumsPhotos[index],
                      albumIdProps: allAlbums.albumsIds[index],
                    });
                  }}>
                  <Image
                    source={{
                      uri: allAlbums.albumsPhotos[index],
                      cache: 'force-cache',
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
    return (
      <View style={styles.loading}>
        <Text>Пожалуйста, подождите...</Text>
      </View>
    );
  }
};

const phoneHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
  containerPortrait: {
    paddingLeft: 25,
    paddingRight: 30,
    height: phoneHeight < 800 ? phoneHeight - 180 : phoneHeight - 230,
    backgroundColor: '#fff',
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
    paddingVertical: 20,
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
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    backgroundColor: '#fff',
  },
});
