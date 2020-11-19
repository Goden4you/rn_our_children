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
  allData: [],
  lastInputs: [],
  settingsVisibility: false,
  isAlbumLoading: true,
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
      return !action.songsCount
        ? (state = {...state, isAlbumChanged: action.isAlbumChanged})
        : (state = {
            ...state,
            isAlbumChanged: action.isAlbumChanged,
            songsCount: action.songsCount,
            albumId: action.albumId,
          });
    case VERY_FIRST_LAST_TRACK:
      return (state = {
        ...state,
        veryFirstTrackId: action.first,
        veryLastTrackId: action.last,
      });
    case ALL_SONGS_DATA:
      return (state = {
        ...state,
        allData: action.allData,
      });
    case LAST_INPUTS:
      return (state = {
        ...state,
        lastInputs: action.inputs,
      });
    case IS_SETTINGS_VISIBLE:
      return (state = {
        ...state,
        settingsVisibility: action.payload,
      });
    case IS_ALBUM_LOADING:
      return (state = {
        ...state,
        isAlbumLoading: action.payload,
      });
    default:
      return state;
  }
};
