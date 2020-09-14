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
  image,
  titles,
  authors,
  duration,
  ids,
  durationMillis,
  firstTrackId,
  lastTrackId,
) => {
  const albumTracks = {
    image,
    titles,
    authors,
    duration,
    ids,
    durationMillis,
    firstTrackId,
    lastTrackId,
  };

  return {
    type: TOGGLE_ALBUM,
    payload: albumTracks,
  };
};
