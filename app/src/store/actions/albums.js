import {LOAD_ALBUMS, TOGGLE_ALBUM, ALBUM_CHANGED} from '../types';

export const loadAlbums = (
  albumsPhotos,
  albumsTitles,
  albumsDesc,
  albumsIds,
) => {
  const albums = {
    photos: albumsPhotos,
    titles: albumsTitles,
    desc: albumsDesc,
    ids: albumsIds,
  };
  return {
    type: LOAD_ALBUMS,
    payload: albums,
  };
};

export const toggleAlbum = (
  albumImage,
  tracksTitles,
  tracksAuthors,
  tracksDuration,
  albumsIds,
  tracksDurationMillis,
  firstTrackId,
  lastTrackId,
  isAlbumChanged,
) => {
  const albumTracks = {
    albumImage,
    tracksTitles,
    tracksAuthors,
    tracksDuration,
    albumsIds,
    tracksDurationMillis,
    firstTrackId,
    lastTrackId,
  };

  return {
    type: TOGGLE_ALBUM,
    payload: albumTracks,
  };
};

export const albumChanged = (bool) => {
  return {
    type: ALBUM_CHANGED,
    isAlbumChanged: bool,
  };
};
