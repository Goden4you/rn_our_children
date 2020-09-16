import {LOAD_PLAYER, UPDATE_TRACK_ID} from '../types';

const initialState = {
  withoutTrack: [],
  trackLoaded: [],
  currentTrack: 0,
};

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PLAYER:
      return {...state, withoutTrack: action.payload};
    case LOAD_AUDIO:
      return {...state, trackLoaded: action.payload};
    case UPDATE_TRACK_ID:
      return {...state, currentTrack: action.payload};
    default:
      return state;
  }
};
