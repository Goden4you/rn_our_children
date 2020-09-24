import {LOAD_ALBUMS, TOGGLE_ALBUM, ALBUM_CHANGED} from '../types';

const initialState = {
  allAlbums: [],
  currentAlbum: [],
  isAlbumChanged: false,
};

export const albumsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALBUMS:
      return {...state, allAlbums: action.payload};
    case TOGGLE_ALBUM:
      return {...state, currentAlbum: action.payload};
    case ALBUM_CHANGED:
      return {
        ...state,
        isAlbumChanged: action.isAlbumChanged,
      };
    default:
      return state;
  }
};
