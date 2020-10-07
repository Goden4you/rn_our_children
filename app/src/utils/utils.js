import RNFetchBlob from 'rn-fetch-blob';

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

export const takeAlbumsPhotos = async () => {
  let path = fs.dirs.CacheDir + '/albums_photos/';
  let allPhotosPath = await fs.exists(path);
  if (!allPhotosPath) {
    await fs.mkdir(path);
    return [];
  }
  let photos = await fs.readFile(path);

  return photos;
};

export const takeAlbumsData = async () => {
  let path = fs.dirs.CacheDir + '/albums_data/';
  let res = await fs.exists(path);
  if (!res) {
    await fs.mkdir(path);
    return [];
  }
  let data = await fs.readFile(path);

  return data;
};

export const takeCurAlbumData = async (id) => {
  let path = fs.dirs.CacheDir + '/cur_album_data/' + id;
  let res = await fs.exists(path);
  if (!res) {
    await fs.mkdir(path);
    return [];
  }
  let data = await fs.readFile(path);
  return data;
};

export const makeCurAlbumDirectory = async (id) => {
  const res = await fs.exists(fs.dirs.CacheDir + '/albums/' + id);
  if (!res) {
    console.log('dir created for album', id);
    await fs.mkdir(fs.dirs.CacheDir + '/albums/' + id);
  }
};

export const makeLoadedTracksDir = async () => {
  const res = await fs.exists(fs.dirs.CacheDir + '/loaded_tracks/');
  if (!res) {
    await fs.mkdir(fs.dirs.CacheDir + '/loaded_tracks/');
  }
};

export const putAlbumsData = async (data) => {
  await fs.writeFile(fs.dirs.CacheDir + '/albums_data/', data);
};

export const putAlbumsPhotos = async (photos) => {
  await fs.writeFile(fs.dirs.CacheDir + '/albums_photos/', photos);
};

export const putCurAlbumData = async (data, id) => {
  await fs.writeFile(fs.dirs.CacheDir + '/cur_album_data/' + id, data);
};

export const checkTrackInCache = async (trackId, loadedMusicSize) => {
  const API_PATH = 'https://childrensproject.ocs.ru/api/v1/files/';
  const path =
    RNFetchBlob.fs.dirs.CacheDir + '/loaded_tracks/' + trackId + '.mp3';
  let res = await RNFetchBlob.fs.exists(path);
  let totalSize = 0;
  if (!res) {
    await fetch(API_PATH + trackId).then((data) => {
      let fileSize = data.headers.get('Content-Length');
      totalSize = parseInt(fileSize, 10) + loadedMusicSize;
    });
    await RNFetchBlob.fs.writeFile(path, API_PATH + trackId);
    return totalSize;
  }
};
