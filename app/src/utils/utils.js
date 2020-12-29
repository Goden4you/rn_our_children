import React from 'react';
import {Alert} from 'react-native';
import {Dimensions} from 'react-native';
import {View, Text, StyleSheet} from 'react-native';
import {Platform} from 'react-native';
import Orientation from 'react-native-orientation';
import RNFetchBlob from 'rn-fetch-blob';

import {updateAlbumImage, albumChanged} from '../store/actions/albums';
import {orientationChanged} from '../store/actions/general';
import {updatePressed, updateTrackId} from '../store/actions/player';

let fs = RNFetchBlob.fs;

export const calcSongsDesc = (data) => {
  let albumsDesc = [];
  for (let i = 0; i <= 7; i++) {
    if (data[i].songsCount % 10 === 2) {
      albumsDesc[i] = data[i].songsCount + ' песни';
    } else if (data[i].songsCount % 10 === 4) {
      albumsDesc[i] = data[i].songsCount + ' песни';
    } else {
      albumsDesc[i] = data[i].songsCount + ' песен';
    }
  }
  return albumsDesc;
};

export const songsDescToInt = (desc) => {
  let songsCount = [];
  for (let i = 0; i <= 7; i++) {
    songsCount[i] = desc[i].toString().substring(0, 2);
    songsCount[i] = parseInt(songsCount[i], 10);
  }
  return songsCount;
};

export const takeAlbumsPhotos = async () => {
  let path =
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/albums_photos/'
      : fs.dirs.CacheDir + '/albums_photos';
  let allPhotosPath = await fs.exists(path);
  if (!allPhotosPath) {
    return;
  }
  let photos = await fs.readFile(path);

  return photos;
};

export const takeAlbumsData = async () => {
  let path =
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/albums_data/'
      : fs.dirs.CacheDir + '/albums_data';
  let res = await fs.exists(path);
  if (!res) {
    return;
  }
  let data = await fs.readFile(path);

  return data;
};

export const takeCurAlbumData = async (id) => {
  let path = fs.dirs.CacheDir + '/cur_album_data/' + id;
  let res = await fs.exists(path);

  let path2 = fs.dirs.CacheDir + '/cur_album_data/';
  let res2 = await fs.exists(path2);

  if (!res2 && !res) {
    fs.mkdir(path2);
  }

  if (!res) {
    return;
  }
  let data = await fs.readFile(path, 'utf8');
  return data;
};

export const takeAllSongsData = async () => {
  let path =
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/all_songs_data/'
      : fs.dirs.CacheDir + '/all_songs_data';
  let res = await fs.exists(path);
  if (!res) {
    return;
  }
  let data = await fs.readFile(path);
  return data;
};

export const takeLastSearches = async () => {
  let path =
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/last_searches/'
      : fs.dirs.CacheDir + '/last_searches';
  let res = await fs.exists(path);
  if (!res) {
    return;
  }
  let data = await fs.readFile(path);
  return data;
};

export const makeCurAlbumDirectory = async (id) => {
  const res = await fs.exists(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/albums/'
      : fs.dirs.CacheDir + '/albums',
  );
  if (!res) {
    await fs.mkdir(
      Platform.OS === 'android'
        ? fs.dirs.CacheDir + '/albums/'
        : fs.dirs.CacheDir + '/albums',
    );
  }
};

export const makeLoadedTracksDir = async () => {
  const res = await fs.exists(
    Platform.OS === 'android'
      ? fs.dirs.DocumentDir + '/loaded_tracks/'
      : fs.dirs.DocumentDir + '/loaded_tracks',
  );
  if (!res) {
    await fs.mkdir(
      Platform.OS === 'android'
        ? fs.dirs.DocumentDir + '/loaded_tracks/'
        : fs.dirs.DocumentDir + '/loaded_tracks',
    );
  }
};

export const putAlbumsData = async (data) => {
  await fs.writeFile(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/albums_data/'
      : fs.dirs.CacheDir + '/albums_data',
    JSON.stringify(data),
  );
};

export const putAlbumsPhotos = async (photos) => {
  await fs.createFile(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/albums_photos/'
      : fs.dirs.CacheDir + '/albums_photos',
    JSON.stringify(photos),
  );
};

export const putCurAlbumData = async (props) => {
  console.log('id to write - ', [props[1]]);
  await fs.createFile(
    fs.dirs.CacheDir + '/cur_album_data/' + props[1],
    JSON.stringify(props[0]),
    'utf8',
  );
};

export const putAllSongsData = async (data) => {
  await fs.createFile(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/all_songs_data/'
      : fs.dirs.CacheDir + '/all_songs_data',
    JSON.stringify(data),
  );
};

export const putLastSearches = async (searches) => {
  await fs.writeFile(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/last_searches/'
      : fs.dirs.CacheDir + '/last_searches',
    JSON.stringify(searches),
  );
};

export const onTrackPressed = ({
  trackId,
  albumIdProps,
  curAlbumId,
  albumImage,
  songsCount,
  dispatch,
}) => {
  if (albumIdProps !== curAlbumId) {
    dispatch(albumChanged(true, songsCount, albumIdProps));
    dispatch(updateAlbumImage(albumImage));
  }

  dispatch(updatePressed(true));
  dispatch(updateTrackId(trackId));
  return albumIdProps;
};

export const removeLastSearches = async () => {
  await fs.unlink(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/last_searches/'
      : fs.dirs.CacheDir + '/last_searches',
  );
};

export const onOrientationChanged = (dispatch) => {
  Orientation.getOrientation((err, orien) => {
    if (err) {
      console.log(err);
    }
    dispatch(orientationChanged(orien));
  });
};

export const putLoadedSize = async (size) => {
  await fs.writeFile(
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/loaded_size/'
      : fs.dirs.CacheDir + '/loaded_size',
    JSON.stringify(size),
  );
};

export const takeLoadedSize = async () => {
  let path =
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/loaded_size/'
      : fs.dirs.CacheDir + '/loaded_size';
  let res = await fs.exists(path);
  if (!res) {
    return 0;
  }
  let size = await fs.readFile(path);
  return size;
};

export const countOfLoadedTracks = ({loadedNum}) => {
  Alert.alert(
    'Загрузка данных...',
    'Кол-во загруженных песен: ' + loadedNum,
    [
      {
        text: 'Ок',
      },
    ],
    {cancelable: true},
  );
};
