import {
  LOAD_PLAYER,
  UPDATE_TRACK_ID,
  LOAD_AUDIO,
  TRACK_LOADING_ERROR,
  UPDATE_LOADED_SIZE,
  IS_TRACK_PLAYING,
  IS_MINIMAZED,
  UPDATE_TIME,
  HANDLE_PREV_NEXT,
  QUEUE_ENDED,
  UPDATE_PRESSED,
} from '../types';

const initialState = {};

export const playerReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOAD_PLAYER:
      return {
        ...state,
        trackPlayerInit: action.trackPlayerInit,
        isPlaying: action.isPlaying,
        trackId: action.trackId,
        minimazed: action.minimazed,
      };
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
        loadedSize: action.size,
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
    case UPDATE_TIME:
      return {
        ...state,
        currentTime: action.currentTime,
      };
    case HANDLE_PREV_NEXT:
      return {
        ...state,
        currentTime: action.currentTime,
        formattedCurrentTime: action.formattedCurrentTime,
        trackId: action.trackId,
        pressed: action.pressed,
        audioLoaded: action.audioLoaded,
        trackPositionInterval: action.trackPositionInterval,
        isPlaying: action.isPlaying,
      };
    case QUEUE_ENDED:
      return {
        ...state,
        queueEnded: action.queueEnded,
      };
    case UPDATE_PRESSED:
      return {
        ...state,
        pressed: action.pressed,
      };
    default:
      return state;
  }
};
