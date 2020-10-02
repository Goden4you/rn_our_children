import {fromJS, List} from 'immutable';
import {
  LOAD_ALBUMS,
  TOGGLE_ALBUM,
  ALBUM_CHANGED,
  VERY_FIRST_LAST_TRACK,
} from '../types';

const initialState = fromJS({
  allAlbums: [],
  currentAlbum: [],
  isAlbumChanged: false,
  veryFirstTrackId: 0,
  veryLastTrackId: 0,
});

export const albumsReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_ALBUMS:
      return state.set('allAlbums', List(action.payload));
    case TOGGLE_ALBUM:
      return state.set('currentAlbum', List(action.payload));
    case ALBUM_CHANGED:
      return state.set('isAlbumChanged', action.isAlbumChanged);
    case VERY_FIRST_LAST_TRACK:
      return state
        .set('veryFirstTrackId', action.first)
        .set('veryLastTrackId', action.last);
    default:
      return state;
  }
};
