import {
  LOAD_ALBUMS,
  TOGGLE_ALBUM,
  ALBUM_CHANGED,
  VERY_FIRST_LAST_TRACK,
} from '../types';

const initialState = {
  allAlbums: [],
  currentAlbum: [],
  isAlbumChanged: false,
  veryFirstTrackId: 0,
  veryLastTrackId: 0,
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
    case VERY_FIRST_LAST_TRACK:
      return {
        ...state,
        veryFirstTrackId: action.first,
        veryLastTrackId: action.last,
      };
    default:
      return state;
  }
};
