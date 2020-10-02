import axios from 'axios';

const API_ALL_ALBUMS = 'https://childrensproject.ocs.ru/api/v1/albums';
const API_ALL_ALBUMS_PHOTOS = 'https://childrensproject.ocs.ru/api/v1/files/';

const allAlbumsInstance = axios.create({
  baseURL: API_ALL_ALBUMS,
});

const allAlbumsPhotosInstace = axios.create({
  baseURL: API_ALL_ALBUMS_PHOTOS,
});

// TODO change url for current album
const albumSongsInstance = axios.create({
  baseURL: API_ALL_ALBUMS,
});

class Api {
  static getAllAlbumsInstance() {
    return allAlbumsInstance;
  }

  static getAllAlbumsPhotosInstance() {
    return allAlbumsPhotosInstace;
  }

  static getAlbumSongsInstance() {
    return albumSongsInstance;
  }

  // next section
  static getAllAlbums(url, config) {
    return Api.getAllAlbumsInstance().get(url, config);
  }

  static getAllAlbumsPhotos(url, config) {
    return Api.getAllAlbumsPhotosInstance().get(url, config);
  }

  static getAlbumsSongs(url, config) {
    return Api.getAlbumSongsInstance().get(url, config);
  }

  // next section
  static getListOfAllAlbumsData() {
    return Api.getAllAlbums('', {}); // TODO add params
  }

  static getListOfAllAlbumsPhotos() {
    return Api.getAllAlbumsPhotos('', {}); // TODO add params
  }

  static getListOfAlbumsSongs() {
    return Api.getAlbumsSongs('', {}); // TODO add params
  }
}

export default Api;
