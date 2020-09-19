import {LOAD_ALBUMS, TOGGLE_ALBUM} from '../types';

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
