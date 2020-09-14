import {LOAD_ALBUMS, TOGGLE_ALBUM} from '../types';

const initialState = {
  allAlbums: [],
  currentAlbum: [],
};

export const albumsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALBUMS:
      return {...state, allAlbums: action.payload};
    case TOGGLE_ALBUM:
      return {...state, currentAlbum: action.payload};
    default:
      return state;
  }
};
