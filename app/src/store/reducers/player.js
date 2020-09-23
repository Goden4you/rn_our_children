import {
  LOAD_PLAYER,
  UPDATE_TRACK_ID,
  LOAD_AUDIO,
  UPDATE_STORAGE,
  TRACK_LOADING_ERROR,
  UPDATE_LOADED_SIZE,
  IS_TRACK_PLAYING,
  IS_MINIMAZED,
} from '../types';

const initialState = {};

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PLAYER:
      return {...state, state: action.payload};
    case LOAD_AUDIO:
      return {
        ...state,
        audioLoaded: action.audioLoaded,
        isPlaying: action.isPlaying,
        trackPositionInterval: action.trackPositionInterval,
        trackPlayerInit: action.trackPlayerInit,
        formattedCurrentTime: action.formattedCurrentTime,
      };
    case UPDATE_TRACK_ID:
      return {...state, trackId: action.payload};
    case TRACK_LOADING_ERROR:
      return {
        ...state,
        isPlaying: action.isPlaying,
        trackPlayerInit: action.trackPlayerInit,
      };
    case UPDATE_LOADED_SIZE:
      return {
        ...state,
        loadedSize: action.payload,
      };
    case IS_TRACK_PLAYING:
      return {
        ...state,
        isPlaying: action.isPlaying,
      };
    case IS_MINIMAZED:
      return {
        ...state,
        minimazed: action.minimazed,
      };
    default:
      return state;
  }
};
