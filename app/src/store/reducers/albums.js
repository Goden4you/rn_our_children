import {
  LOAD_ALBUMS,
  TOGGLE_ALBUM,
  ALBUM_CHANGED,
  VERY_FIRST_LAST_TRACK,
  OPEN_ALBUM,
  UPDATE_ALBUM_IMAGE,
  OPEN_ALBUM_SCREEN,
} from '../types';

const initialState = {
  allAlbums: [],
  currentAlbum: [],
  openedAlbum: [],
  currentAlbumImage: null,
  songsCount: 0,
  albumId: 0,
  isAlbumChanged: false,
  veryFirstTrackId: 0,
  veryLastTrackId: 0,
};

export const albumsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALBUMS:
      return (state = {...state, allAlbums: action.payload});
    case TOGGLE_ALBUM:
      return (state = {
        ...state,
        currentAlbum: action.payload,
      });
    case OPEN_ALBUM:
      return (state = {
        ...state,
        openedAlbum: action.payload,
      });
    case OPEN_ALBUM_SCREEN:
      return (state = {
        ...state,
        songsCount: action.songsCount,
        albumId: action.albumId,
      });
    case UPDATE_ALBUM_IMAGE:
      return (state = {...state, currentAlbumImage: action.image});
    case ALBUM_CHANGED:
      return (state = {...state, isAlbumChanged: action.isAlbumChanged});
    case VERY_FIRST_LAST_TRACK:
      return (state = {
        ...state,
        veryFirstTrackId: action.first,
        veryLastTrackId: action.last,
      });
    default:
      return state;
  }
};
