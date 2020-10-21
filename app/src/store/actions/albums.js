import {
  LOAD_ALBUMS,
  TOGGLE_ALBUM,
  ALBUM_CHANGED,
  VERY_FIRST_LAST_TRACK,
  OPEN_ALBUM,
  UPDATE_ALBUM_IMAGE,
  OPEN_ALBUM_SCREEN,
  ALL_SONGS_DATA,
} from '../types';

export const loadAlbums = (
  albumsPhotos,
  albumsTitles,
  albumsDesc,
  albumsIds,
) => {
  const albums = {
    albumsPhotos: albumsPhotos,
    albumsTitles: albumsTitles,
    albumsDesc: albumsDesc,
    albumsIds: albumsIds,
  };
  return {
    type: LOAD_ALBUMS,
    payload: albums,
  };
};

export const toggleAlbum = (
  tracksTitles,
  tracksAuthors,
  tracksDuration,
  tracksIds,
  tracksDurationMillis,
  firstTrackId,
  lastTrackId,
) => {
  const albumTracks = {
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  };

  return {
    type: TOGGLE_ALBUM,
    payload: albumTracks,
  };
};

export const openAlbum = (
  tracksTitles,
  tracksAuthors,
  tracksDuration,
  tracksIds,
  tracksDurationMillis,
  firstTrackId,
  lastTrackId,
) => {
  const albumTracks = {
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    tracksIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  };
  return {
    type: OPEN_ALBUM,
    payload: albumTracks,
  };
};

export const updateAlbumImage = (image) => {
  return {
    type: UPDATE_ALBUM_IMAGE,
    image,
  };
};

export const openAlbumScreen = (desc, albumId) => {
  let songsCount = desc.toString().substring(0, 2);
  songsCount = parseInt(songsCount, 10);
  return {
    type: OPEN_ALBUM_SCREEN,
    songsCount,
    albumId,
  };
};

export const albumChanged = (bool) => {
  return {
    type: ALBUM_CHANGED,
    isAlbumChanged: bool,
  };
};

export const firstLastTrackId = (first, last) => {
  return {
    type: VERY_FIRST_LAST_TRACK,
    first,
    last,
  };
};

export const allSongsData = () => {
  return {
    type: ALL_SONGS_DATA,
    allSongsCount: 0,
    allTracksTitles: [],
    allTracksAuthors: [],
    allTracksIds: [],
    allTracksDuration: [],
  };
};
