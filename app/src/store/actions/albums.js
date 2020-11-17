import {
  LOAD_ALBUMS,
  TOGGLE_ALBUM,
  ALBUM_CHANGED,
  VERY_FIRST_LAST_TRACK,
  OPEN_ALBUM,
  UPDATE_ALBUM_IMAGE,
  OPEN_ALBUM_SCREEN,
  ALL_SONGS_DATA,
  LAST_INPUTS,
  IS_SETTINGS_VISIBLE,
  IS_ALBUM_LOADING,
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

export const albumChanged = (bool, desc, albumId) => {
  if (desc) {
    let songsCount = desc.toString().substring(0, 2);
    songsCount = parseInt(songsCount, 10);
    return {
      type: ALBUM_CHANGED,
      isAlbumChanged: bool,
      songsCount,
      albumId,
    };
  } else {
    return {
      type: ALBUM_CHANGED,
      isAlbumChanged: bool,
    };
  }
};

export const firstLastTrackId = (first, last) => {
  return {
    type: VERY_FIRST_LAST_TRACK,
    first,
    last,
  };
};

export const allSongsData = (allData) => {
  return {
    type: ALL_SONGS_DATA,
    allData,
  };
};

export const lastInput = (input) => {
  return {
    type: LAST_INPUTS,
    input,
  };
};

export const isSettingsVisible = (bool) => {
  return {
    type: IS_SETTINGS_VISIBLE,
    payload: bool,
  };
};

export const isAlbumDataLoading = (bool) => {
  return {
    type: IS_ALBUM_LOADING,
    payload: bool,
  };
};
