import {Platform} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';

import {
  updateAlbumImage,
  albumChanged,
  openAlbumScreen,
} from '../store/actions/albums';
import {updatePressed, updateTrackId} from '../store/actions/player';

let fs = RNFetchBlob.fs;

export const calcSongsDesc = (data) => {
  let albumsDesc = [];
  for (let i = 0; i < 7; i++) {
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
  for (let i = 0; i < 7; i++) {
    songsCount[i] = desc[i].toString().substring(0, 2);
    songsCount[i] = parseInt(songsCount[i], 10);
  }
  return songsCount;
};

export const takeAlbumsPhotos = async () => {
  let path =
    Platform.OS === 'android'
      ? fs.dirs.CacheDir + '/albums_photos/'
      : fs.dirs.DocumentDir + '/albums_photos/';
  let allPhotosPath = await fs.exists(path);
  if (!allPhotosPath) {
    return;
  }
  let photos = await fs.readFile(path);

  return photos;
};

export const takeAlbumsData = async () => {
  let path = fs.dirs.CacheDir + '/albums_data/';
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
  if (!res) {
    return;
  }
  let data = await fs.readFile(path);
  return data;
};

export const takeAllSongsData = async () => {
  let path = fs.dirs.CacheDir + '/all_songs_data/';
  let res = await fs.exists(path);
  if (!res) {
    return;
  }
  let data = await fs.readFile(path);
  return data;
};

export const takeLastSearches = async () => {
  let path = fs.dirs.CacheDir + '/last_searches/';
  let res = await fs.exists(path);
  if (!res) {
    return;
  }
  let data = await fs.readFile(path);
  return data;
};

export const makeCurAlbumDirectory = async (id) => {
  const res = await fs.exists(fs.dirs.CacheDir + '/albums/');
  if (!res) {
    await fs.mkdir(fs.dirs.CacheDir + '/albums/');
  }
};

export const makeLoadedTracksDir = async () => {
  const res = await fs.exists(fs.dirs.CacheDir + '/loaded_tracks/');
  if (!res) {
    await fs.mkdir(fs.dirs.CacheDir + '/loaded_tracks/');
  }
};

export const putAlbumsData = async (data) => {
  await fs.writeFile(fs.dirs.CacheDir + '/albums_data/', JSON.stringify(data));
};

export const putAlbumsPhotos = async (photos) => {
  await fs.writeFile(
    fs.dirs.DocumentDir + '/albums_photos/',
    JSON.stringify(photos),
  );
};

export const putCurAlbumData = async (data, id) => {
  await fs.writeFile(
    fs.dirs.CacheDir + '/cur_album_data/' + id,
    JSON.stringify(data),
  );
};

export const putAllSongsData = async (data) => {
  await fs.writeFile(
    fs.dirs.CacheDir + '/all_songs_data/',
    JSON.stringify(data),
  );
};

export const putLastSearches = async (searches) => {
  await fs.writeFile(
    fs.dirs.CacheDir + '/last_searches/',
    JSON.stringify(searches),
  );
};

export const onTrackPressed = (
  trackId,
  albumIdProps,
  albumId,
  albumImage,
  dispatch,
  curTracksIds,
  opTracksIds,
) => {
  if (albumIdProps !== albumId || curTracksIds !== opTracksIds) {
    albumId = albumIdProps;
    dispatch(openAlbumScreen(19, albumIdProps));
    dispatch(updateAlbumImage(albumImage));
    dispatch(albumChanged(true));
  }

  dispatch(updatePressed(true));
  dispatch(updateTrackId(trackId));

  return albumId;
};

export const removeLastSearches = async () => {
  await fs.unlink(fs.dirs.CacheDir + '/last_searches/');
};
