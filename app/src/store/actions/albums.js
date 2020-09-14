import {LOAD_ALBUMS} from '../types';

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
