import axios from 'axios';

const API_ALL_ALBUMS = 'https://childrensproject.ocs.ru/api/v1/albums';
const API_ALL_ALBUMS_PHOTOS = 'https://childrensproject.ocs.ru/api/v1/files';

const allAlbumsInstance = axios.create({
  baseURL: API_ALL_ALBUMS,
});

const allAlbumsPhotosInstace = axios.create({
  baseURL: API_ALL_ALBUMS_PHOTOS,
});

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

  static getAllAlbums(url, config) {
    return Api.getAllAlbumsInstance().get(url, config);
  }

  static getAllAlbumsPhotos(url, config) {
    return Api.getAllAlbumsPhotosInstance().get(url, config);
  }

  static getAlbumsSongs(url, config) {
    return Api.getAlbumSongsInstance().get(url, config);
  }

  static getListOfAllAlbumsData() {
    return Api.getAllAlbums('/');
  }

  static getListOfAllAlbumsPhotos(id) {
    return Api.getAllAlbumsPhotos(`/${id}`);
  }

  static getListOfAlbumsSongs(id) {
    console.log('id from api -', id);
    return Api.getAlbumsSongs(`/${id}`);
  }
}

export default Api;
